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

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, onAddAppointment, onDeleteAppointment }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [newAppointmentText, setNewAppointmentText] = useState('');
    const [newAppointmentDate, setNewAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [newAppointmentTime, setNewAppointmentTime] = useState('12:00');

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

    const appointmentsByDate = useMemo(() => {
        return appointments.reduce((acc, app) => {
            (acc[app.date] = acc[app.date] || []).push(app);
            return acc;
        }, {} as Record<string, Appointment[]>);
    }, [appointments]);
    
    const upcomingAppointments = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison
        return appointments
            .filter(app => new Date(app.date) >= today)
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
            });
            setNewAppointmentText('');
        }
    };
    
    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Aggiungi Appuntamento</h2>
                <form onSubmit={handleAddAppointment} className="space-y-4">
                    <input type="text" value={newAppointmentText} onChange={e => setNewAppointmentText(e.target.value)} placeholder="Descrizione appuntamento" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500" required />
                    <div className="flex gap-4">
                        <input type="date" value={newAppointmentDate} onChange={e => setNewAppointmentDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500" required />
                        <input type="time" value={newAppointmentTime} onChange={e => setNewAppointmentTime(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                        <PlusIcon className="w-5 h-5"/> Aggiungi
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">&lt;</button>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                        {currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-slate-500 dark:text-slate-400 text-sm">
                    {weekDays.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {Array(startingDayOfWeek).fill(null).map((_, index) => <div key={`empty-${index}`} className="border rounded-md border-transparent"></div>)}
                    {daysInMonth.map(day => {
                        const dateStr = day.toISOString().split('T')[0];
                        const dayAppointments = appointmentsByDate[dateStr] || [];
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;
                        return (
                            <div key={day.toString()} className={`p-2 border rounded-md min-h-[100px] text-left align-top ${isToday ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                                <span className={`font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{day.getDate()}</span>
                                <div className="mt-1 space-y-1">
                                    {dayAppointments.sort((a,b) => a.time.localeCompare(b.time)).map(app => (
                                        <div key={app.id} className="text-xs p-1 bg-indigo-200 dark:bg-indigo-900 rounded-md text-indigo-800 dark:text-indigo-200 flex justify-between items-center group">
                                            <span className="truncate"><strong>{app.time.substring(0, 5)}</strong> - {app.text}</span>
                                            <button onClick={() => onDeleteAppointment(app.id)} className="opacity-0 group-hover:opacity-100 text-indigo-500 hover:text-red-500 flex-shrink-0">
                                                <TrashIcon className="w-3 h-3"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Prossimi Appuntamenti</h2>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map(app => (
                            <div key={app.id} className="flex items-center gap-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg group">
                                <div className="flex-shrink-0">
                                    <p className="font-bold text-slate-800 dark:text-slate-100">
                                        {new Date(app.date).toLocaleDateString('it-IT', { day: '2-digit' })}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {new Date(app.date).toLocaleDateString('it-IT', { month: 'short' })}
                                    </p>
                                </div>
                                <div className="border-l-2 border-indigo-500 pl-4 flex-grow">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{app.text}</p>
                                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{app.time.substring(0, 5)}</span>
                                    </div>
                                </div>
                                <button onClick={() => onDeleteAppointment(app.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nessun appuntamento in programma.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CalendarView;