import React from 'react';
import { Task, Priority } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

const CompletionPieChart: React.FC<{ completed: number; pending: number }> = ({ completed, pending }) => {
    const total = completed + pending;
    if (total === 0) return <div className="flex items-center justify-center h-40 text-slate-500">Nessun dato</div>;
    const completedPercentage = (completed / total) * 100;
    const conicGradient = `conic-gradient(#10b981 ${completedPercentage}%, #334155 0)`;

    return (
        <div className="flex items-center gap-4">
            <div style={{ background: conicGradient }} className="w-24 h-24 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                   <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{Math.round(completedPercentage)}%</span>
                </div>
            </div>
            <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-600 dark:text-slate-300">Completate: {completed}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <span className="text-slate-600 dark:text-slate-300">In Sospeso: {pending}</span>
                </div>
            </div>
        </div>
    );
};


const AnalyticsView: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const highPriority = tasks.filter(t => t.priority === Priority.High).length;
    const mediumPriority = tasks.filter(t => t.priority === Priority.Medium).length;
    const lowPriority = tasks.filter(t => t.priority === Priority.Low).length;
  
    return (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg space-y-6">
        <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Panoramica Produttività</h2>
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Totale Attività" value={totalTasks} description="Tutte le attività create" />
                <StatCard title="Completate" value={completedTasks} description="Attività portate a termine" />
            </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Completamento</h3>
             <CompletionPieChart completed={completedTasks} pending={pendingTasks} />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
             <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Distribuzione Priorità</h3>
             <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center">
                    <span>Alta</span>
                    <div className="w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${totalTasks > 0 ? (highPriority / totalTasks) * 100 : 0}%`}}></div>
                    </div>
                    <span>{highPriority}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Media</span>
                    <div className="w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${totalTasks > 0 ? (mediumPriority / totalTasks) * 100 : 0}%`}}></div>
                    </div>
                    <span>{mediumPriority}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span>Bassa</span>
                    <div className="w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${totalTasks > 0 ? (lowPriority / totalTasks) * 100 : 0}%`}}></div>
                    </div>
                    <span>{lowPriority}</span>
                </div>
             </div>
        </div>
      </div>
    );
};

export default AnalyticsView;