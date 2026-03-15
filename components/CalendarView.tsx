import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, BellOff } from 'lucide-react';
import { Appointment } from '../types';
import { useLanguage } from '../LanguageContext';
import { subscribeToPush, unsubscribeFromPush, isPushEnabled } from '../services/notificationService';

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

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, onAddAppointment, onDeleteAppointment, onUpdateAppointment, userId }) => {
    const { t, language } = useLanguage();
    const locale = language === 'en' ? 'en-US' : 'it-IT';
    const [currentDate, setCurrentDate] = useState(new Date());
    const [newAppointmentText, setNewAppointmentText] = useState('');
    const [newAppointmentDate, setNewAppointmentDate] = useState(toLocalISOString(new Date()));
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
    
    const startingDayOfWeek = firstDayOfMonth.getDay(); 

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
        if (newAppointmentText.trim() && newAppointmentDate && newAppointmentTime) {
            onAddAppointment({
                text: newAppointmentText.trim(),
                date: newAppointmentDate,
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
            setPushError(language === 'en' ? 'You must be logged in to enable notifications.' : 'Devi essere loggato per abilitare le notifiche.');
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
                    ? 'Could not enable notifications. Make sure VAPID keys are configured on Vercel.'
                    : 'Impossibile abilitare le notifiche. Verifica che le chiavi VAPID siano configurate su Vercel.');
            }
        }
        setPushLoading(false);
    };
    
    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const weekDays = language === 'en'
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        : ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    
    return (
        <div className="space-y-10">
            <section className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <CalendarIcon className="text-brand-600" size={28} />
                            {t('calendar_title')}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('calendar_subtitle')}</p>
                    </div>
                    {/* Global push notification toggle */}
                    <button
                        onClick={handleTogglePush}
                        disabled={pushLoading}
                        title={pushEnabled ? (language === 'en' ? 'Disable notifications' : 'Disabilita notifiche') : (language === 'en' ? 'Enable notifications' : 'Abilita notifiche')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                            pushEnabled
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        } disabled:opacity-50`}
                    >
                        {pushLoading
                            ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            : (pushEnabled ? <Bell size={16} /> : <BellOff size={16} />)
                        }
                        {pushEnabled
                            ? (language === 'en' ? 'Notifications On' : 'Notifiche Attive')
                            : (language === 'en' ? 'Enable Alerts' : 'Abilita Avvisi')
                        }
                    </button>
                </div>
                {pushError && (
                    <p className="text-xs font-bold text-red-500 mt-1">{pushError}</p>
                )}

                <div className="glass-card p-6 rounded-[2.5rem] shadow-xl shadow-brand-500/5">
                    <form onSubmit={handleAddAppointment} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                <Bell size={18} />
                            </div>
                            <input 
                                type="text" 
                                value={newAppointmentText} 
                                onChange={e => setNewAppointmentText(e.target.value)} 
                                placeholder={t('calendar_add')} 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all" 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                                type="date" 
                                value={newAppointmentDate} 
                                onChange={e => setNewAppointmentDate(e.target.value)} 
                                className="w-full min-w-0 appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all" 
                                required 
                            />
                            <input 
                                type="time" 
                                value={newAppointmentTime} 
                                onChange={e => setNewAppointmentTime(e.target.value)} 
                                className="w-full min-w-0 appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all" 
                                required 
                            />
                        </div>
                        {/* Remind me toggle — only if push is enabled */}
                        {pushEnabled && (
                            <label className="flex items-center gap-3 cursor-pointer select-none">
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
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-400">
                                    <Bell size={14} className={notifyNew ? 'text-brand-600' : 'text-slate-400'} />
                                    {language === 'en' ? 'Remind me 15 min before' : 'Ricordamelo 15 min prima'}
                                </div>
                            </label>
                        )}
                        <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs">
                            <Plus size={20} strokeWidth={3} /> {t('calendar_add')}
                        </button>
                    </form>
                </div>
            </section>

            <section className="glass-card p-6 rounded-[2.5rem] shadow-xl shadow-brand-500/5 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize">
                        {currentDate.toLocaleString(locale, { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button onClick={() => changeMonth(-1)} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"><ChevronLeft size={20} /></button>
                        <button onClick={() => changeMonth(1)} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"><ChevronRight size={20} /></button>
                    </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center mb-4">
                    {weekDays.map(day => (
                        <div key={day} className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {Array(startingDayOfWeek).fill(null).map((_, index) => (
                        <div key={`empty-start-${index}`} className="aspect-square rounded-2xl bg-slate-50/30 dark:bg-slate-900/10"></div>
                    ))}
                    {daysInMonth.map(day => {
                        const dateStr = toLocalISOString(day);
                        const dayAppointments = allAppointmentsByDate[dateStr] || [];
                        const isToday = toLocalISOString(new Date()) === dateStr;
                        return (
                            <div 
                                key={day.toString()} 
                                className={`aspect-square p-2 rounded-2xl border-2 transition-all relative group/day ${
                                    isToday 
                                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800' 
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                            >
                                <span className={`text-sm font-black ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {day.getDate()}
                                </span>
                                {dayAppointments.length > 0 && (
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                                        {dayAppointments.slice(0, 3).map((app, appIndex) => (
                                            <div key={`${app.id}-${appIndex}`} className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(var(--brand-500-rgb),0.5)]" />
                                        ))}
                                        {dayAppointments.length > 3 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                        )}
                                    </div>
                                )}
                                
                                {/* Tooltip-like popover on hover for mobile/desktop could be added here */}
                            </div>
                        )
                    })}
                </div>
            </section>
            
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('calendar_add')}</h3>
                    <Clock size={16} className="text-slate-400" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map((appointment, index) => (
                                <motion.div 
                                    key={appointment.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card p-5 rounded-3xl border border-slate-100 dark:border-slate-800/50 flex items-center gap-6 group"
                                >
                                    <div className="flex-shrink-0 w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
                                        <span className="text-xl font-black text-slate-900 dark:text-white">
                                            {new Date(appointment.date).toLocaleDateString(locale, { timeZone: 'UTC', day: '2-digit' })}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                                            {new Date(appointment.date).toLocaleDateString(locale, { timeZone: 'UTC', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex-grow space-y-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{appointment.text}</h4>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                                            <Clock size={14} className="text-brand-500" />
                                            <span>{appointment.time.substring(0, 5)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        {onUpdateAppointment && appointment.notify !== undefined && (
                                            <button 
                                                onClick={() => onUpdateAppointment(appointment.id, { notify: !appointment.notify })}
                                                className={`p-2.5 rounded-xl transition-all ${
                                                    appointment.notify 
                                                        ? 'text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/40' 
                                                        : 'text-slate-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'
                                                }`}
                                                title={appointment.notify ? 'Disattiva promemoria' : 'Attiva promemoria'}
                                            >
                                                {appointment.notify ? <Bell size={18} fill="currentColor" /> : <BellOff size={18} />}
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => onDeleteAppointment(appointment.id)} 
                                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 glass-card rounded-[2.5rem] border-dashed border-2 border-slate-200 dark:border-slate-800">
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('calendar_empty')}</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
};

export default CalendarView;
