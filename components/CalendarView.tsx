import React, { useState, useMemo } from 'react';
import { Appointment } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ClockIcon } from './icons/ClockIcon';

interface CalendarViewProps {
    appointments: Appointment[];
    onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
    onDeleteAppointment: (id: string) => void;
}

const toLocalISOString = (date: Date): string => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, onAddAppointment, onDeleteAppointment }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [newAppointmentText, setNewAppointmentText] = useState('');
    const [newAppointmentDate, setNewAppointmentDate] = useState(toLocalISOString(new Date()));
    const [newAppointmentTime, setNewAppointmentTime] = useState('12:00');

    const daysInMonth = useMemo(() => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const days = [];
        while (date.getMonth() === currentDate.getMonth()) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentDate]);
    
    const startingDayOfWeek = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(), [currentDate]); 

    const allAppointmentsByDate = useMemo(() => {
        return appointments.reduce((acc, app) => {
            (acc[app.date] = acc[app.date] || []).push(app);
            acc[app.date].sort((a, b) => a.time.localeCompare(b.time));
            return acc;
        }, {} as Record<string, Appointment[]>);
    }, [appointments]);
    
    const upcomingAppointments = useMemo(() => {
        const todayStr = toLocalISOString(new Date());
        return appointments.filter(app => app.date >= todayStr).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    }, [appointments]);

    const handleAddAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAppointmentText.trim() && newAppointmentDate && newAppointmentTime) {
            onAddAppointment({ text: newAppointmentText.trim(), date: newAppointmentDate, time: newAppointmentTime });
            setNewAppointmentText('');
        }
    };
    
    const changeMonth = (offset: number) => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    const weekDays = ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'];
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Aggiungi Appuntamento</h2>
                <form onSubmit={handleAddAppointment} className="space-y-4">
                    <input type="text" value={newAppointmentText} onChange={e => setNewAppointmentText(e.target.value)} placeholder="Descrizione" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500" required />
                    <div className="flex gap-4">
                        <input type="date" value={newAppointmentDate} onChange={e => setNewAppointmentDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500" required />
                        <input type="time" value={newAppointmentTime} onChange={e => setNewAppointmentTime(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500" required />
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700"><PlusIcon className="w-5 h-5"/> Aggiungi</button>
                </form>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg">&lt;</button>
                    <h2 className="text-xl font-bold capitalize">{currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-slate-500 dark:text-slate-400 text-xs md:text-sm">{weekDays.map(d => <div key={d}>{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {Array(startingDayOfWeek).fill(null).map((_, i) => <div key={`e-${i}`}></div>)}
                    {daysInMonth.map(day => {
                        const dateStr = toLocalISOString(day);
                        const isToday = toLocalISOString(new Date()) === dateStr;
                        return (
                            <div key={dateStr} className={`p-1 md:p-2 border rounded-md min-h-[80px] text-left align-top ${isToday ? 'bg-violet-100 dark:bg-violet-900/50 border-violet-300' : 'border-slate-200 dark:border-slate-700'}`}>
                                <span className={`text-sm font-bold ${isToday ? 'text-violet-600' : 'text-slate-700 dark:text-slate-300'}`}>{day.getDate()}</span>
                                {(allAppointmentsByDate[dateStr] || []).map(app => <div key={app.id} className="text-xs p-1 rounded-md group bg-violet-200 dark:bg-violet-900 text-violet-800 dark:text-violet-200 truncate">{app.text}</div>)}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Prossimi Appuntamenti</h2>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => (
                        <div key={app.id} className="flex items-center gap-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group">
                            <div className="text-center">
                                <p className="font-bold">{new Date(app.date).toLocaleDateString('it-IT', { timeZone: 'UTC', day: '2-digit' })}</p>
                                <p className="text-xs capitalize">{new Date(app.date).toLocaleDateString('it-IT', { timeZone: 'UTC', month: 'short' })}</p>
                            </div>
                            <div className="border-l-2 border-violet-500 pl-4 flex-grow">
                                <p className="font-semibold">{app.text}</p>
                                <div className="flex items-center gap-1 text-sm text-slate-500"><ClockIcon className="w-4 h-4" /><span>{app.time}</span></div>
                            </div>
                            <button onClick={() => onDeleteAppointment(app.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><TrashIcon /></button>
                        </div>
                    )) : <p className="text-center text-slate-500 py-4">Nessun appuntamento in programma.</p>}
                </div>
            </div>
        </div>
    );
};
export default CalendarView;
