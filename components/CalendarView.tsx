import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, BellOff, Check, Download } from 'lucide-react';
import { Appointment } from '../types';
import { useLanguage } from '../LanguageContext';
import { subscribeToPush, unsubscribeFromPush, isPushEnabled } from '../services/notificationService';
import { exportAppointmentsToICS } from '../services/exportService';

interface CalendarViewProps {
  appointments: Appointment[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onDeleteAppointment: (id: string) => void;
  onUpdateAppointment?: (id: string, updates: Partial<Appointment>) => void;
  userId?: string;
}

const toLocalISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CalendarView: React.FC<CalendarViewProps> = ({ 
  appointments, 
  onAddAppointment, 
  onDeleteAppointment, 
  onUpdateAppointment, 
  userId 
}) => {
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'it-IT';
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(toLocalISOString(new Date()));
  const [newAppointmentText, setNewAppointmentText] = useState('');
  const [newAppointmentTime, setNewAppointmentTime] = useState('12:00');
  const [notifyNew, setNotifyNew] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    isPushEnabled().then(setPushEnabled);
  }, []);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const daysInMonth = useMemo(() => {
    const days = [];
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    return days;
  }, [currentDate, lastDayOfMonth]);
  
  // Starting day: Monday (1) to Sunday (0) for IT; Sunday (0) for EN
  const isMondayFirst = language === 'it';
  const rawStartingDay = firstDayOfMonth.getDay(); 
  const startingDayOfWeek = isMondayFirst ? (rawStartingDay === 0 ? 6 : rawStartingDay - 1) : rawStartingDay;

  const weekDays = isMondayFirst
    ? ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const allAppointmentsByDate = useMemo(() => {
    const events: Record<string, Appointment[]> = {};
    appointments.forEach(app => {
      (events[app.date] = events[app.date] || []).push(app);
    });
    for (const date in events) {
      events[date].sort((a, b) => a.time.localeCompare(b.time));
    }
    return events;
  }, [appointments]);

  // Filter appointments based on selected date
  const selectedDateAppointments = useMemo(() => {
    return allAppointmentsByDate[selectedDate] || [];
  }, [allAppointmentsByDate, selectedDate]);
  
  // Upcoming appointments (from today onward)
  const upcomingAppointments = useMemo(() => {
    const todayStr = toLocalISOString(new Date());
    return appointments
      .filter(app => app.date >= todayStr)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [appointments]);

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAppointmentText.trim() && selectedDate && newAppointmentTime) {
      onAddAppointment({
        text: newAppointmentText.trim(),
        date: selectedDate,
        time: newAppointmentTime,
        notify: notifyNew && pushEnabled,
      });
      setNewAppointmentText('');
      setNotifyNew(false);
    }
  };

  const handleTogglePush = async () => {
    setPushError(null);
    if (!userId) {
      setPushError(language === 'en' ? 'Sign in to enable push notifications.' : 'Accedi per abilitare le notifiche push.');
      return;
    }
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushError(language === 'en' ? 'Push notifications are not supported in this browser.' : 'Le notifiche push non sono supportate in questo browser.');
      return;
    }
    setPushLoading(true);
    if (pushEnabled) {
      await unsubscribeFromPush(userId);
      setPushEnabled(false);
    } else {
      const ok = await subscribeToPush(userId, language);
      if (ok) {
        setPushEnabled(true);
      } else {
        setPushError(language === 'en'
          ? 'Push keys not configured in environment.'
          : 'Chiavi VAPID non configurate nelle variabili d\'ambiente.');
      }
    }
    setPushLoading(false);
  };
  
  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className="space-y-10">
      {/* Top Header & Push Notification toggle */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="text-brand-600" size={26} />
              {t('calendar_title')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              {t('calendar_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            <button
              onClick={() => exportAppointmentsToICS(appointments)}
              disabled={appointments.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-40"
              title="Esporta calendario in formato standard .ICS per Google/Apple/Outlook"
            >
              <Download size={16} />
              <span>{language === 'en' ? 'Export .ICS' : 'Esporta .ICS'}</span>
            </button>

            <button
              onClick={handleTogglePush}
              disabled={pushLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                pushEnabled
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              } disabled:opacity-50`}
            >
              {pushLoading ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : pushEnabled ? (
                <Bell size={16} />
              ) : (
                <BellOff size={16} />
              )}
              {pushEnabled
                ? (language === 'en' ? 'Notifications On' : 'Notifiche Attive')
                : (language === 'en' ? 'Enable Push' : 'Abilita Avvisi')}
            </button>
          </div>
        </div>

        {pushError && (
          <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-200 dark:border-red-900/40">
            {pushError}
          </p>
        )}

        {/* Add Appointment Glass Card */}
        <div className="glass-card p-6 rounded-[2.5rem]">
          <form onSubmit={handleAddAppointment} className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                value={newAppointmentText} 
                onChange={e => setNewAppointmentText(e.target.value)} 
                placeholder={t('calendar_add')} 
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all text-sm" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">{t('tasks_due_date')}</span>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={e => setSelectedDate(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all text-sm" 
                  required 
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Ora</span>
                <input 
                  type="time" 
                  value={newAppointmentTime} 
                  onChange={e => setNewAppointmentTime(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all text-sm" 
                  required 
                />
              </div>
            </div>

            {pushEnabled && (
              <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={notifyNew}
                    onChange={e => setNotifyNew(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-brand-600 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Bell size={14} className={notifyNew ? 'text-brand-600' : 'text-slate-400'} />
                  {language === 'en' ? 'Remind me 15 min before (Push)' : 'Avvisami 15 min prima con notifica push'}
                </span>
              </label>
            )}

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
            >
              <Plus size={18} strokeWidth={3} /> {t('calendar_add')}
            </button>
          </form>
        </div>
      </section>

      {/* Interactive Month Calendar Grid */}
      <section className="glass-card p-6 rounded-[2.5rem] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize">
              {currentDate.toLocaleString(locale, { month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-xs font-medium text-slate-400">
              {t('calendar_select_day')}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button 
              onClick={() => changeMonth(-1)} 
              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => changeMonth(1)} 
              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array(startingDayOfWeek).fill(null).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square rounded-2xl bg-slate-50/20 dark:bg-slate-900/10" />
          ))}

          {daysInMonth.map(day => {
            const dateStr = toLocalISOString(day);
            const dayAppointments = allAppointmentsByDate[dateStr] || [];
            const isToday = toLocalISOString(new Date()) === dateStr;
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square p-1.5 sm:p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-between ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20 scale-105 z-10'
                    : isToday 
                      ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-black'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span className={`text-xs font-black ${isSelected ? 'text-white' : ''}`}>
                  {day.getDate()}
                </span>

                {dayAppointments.length > 0 && (
                  <div className="flex gap-0.5 justify-center pb-0.5">
                    {dayAppointments.slice(0, 3).map((app, idx) => (
                      <div 
                        key={`${app.id}-${idx}`} 
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-500'}`} 
                      />
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/60' : 'bg-slate-400'}`} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>
      
      {/* Selected Day / Upcoming Appointments List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
            {t('calendar_upcoming')}
          </h3>
          <Clock size={16} className="text-slate-400" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="popLayout">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment, index) => {
                const isSelectedDay = appointment.date === selectedDate;
                return (
                  <motion.div 
                    key={appointment.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`glass-card p-4 sm:p-5 rounded-3xl flex items-center gap-4 transition-all ${
                      isSelectedDay ? 'ring-2 ring-brand-500/50 bg-brand-50/30 dark:bg-brand-950/20' : ''
                    }`}
                  >
                    <div className="shrink-0 w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
                      <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                        {appointment.date.split('-')[2]}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mt-0.5">
                        {new Date(appointment.date + 'T00:00:00').toLocaleDateString(locale, { month: 'short' })}
                      </span>
                    </div>

                    <div className="flex-grow min-w-0 space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {appointment.text}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Clock size={13} className="text-brand-500" />
                        <span>{appointment.time.substring(0, 5)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onUpdateAppointment && (
                        <button 
                          onClick={() => onUpdateAppointment(appointment.id, { notify: !appointment.notify })}
                          className={`p-2.5 rounded-xl transition-all ${
                            appointment.notify 
                              ? 'text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20' 
                              : 'text-slate-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800'
                          }`}
                          title={appointment.notify 
                            ? (language === 'en' ? 'Disable reminder' : 'Disattiva promemoria') 
                            : (language === 'en' ? 'Enable reminder' : 'Attiva promemoria')
                          }
                        >
                          {appointment.notify ? <Bell size={16} className="fill-current" /> : <BellOff size={16} />}
                        </button>
                      )}
                      <button 
                        onClick={() => onDeleteAppointment(appointment.id)} 
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title={t('delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 glass-card rounded-[2.5rem] border-dashed border-2 border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-medium text-sm">{t('calendar_empty')}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default CalendarView;
