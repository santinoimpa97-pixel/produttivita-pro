
import React, { useState, useMemo } from 'react';
import { Task, Priority } from '../types.ts';

type TimeFilter = '7d' | '30d' | 'all';

const StatCard: React.FC<{ title: string; value: string | number; description?: string }> = ({ title, value, description }) => (
    <div className="bg-slate-100 dark:bg-slate-800/70 p-4 rounded-lg shadow-inner">
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{title}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
);

const DonutChart: React.FC<{ data: { label: string, value: number, color: string }[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-40 text-slate-500">Nessun dato</div>;
    const conicGradient = `conic-gradient(${data.reduce((acc, item, i) => {
        const percentage = (item.value / total) * 100;
        const start = acc.cumulative;
        acc.cumulative += percentage;
        acc.str += `${i > 0 ? ',' : ''} ${item.color} ${start}% ${acc.cumulative}%`;
        return acc;
    }, { str: '', cumulative: 0 }).str})`;
    return (
        <div className="flex flex-col md:flex-row items-center gap-4">
            <div style={{ background: conicGradient }} className="w-32 h-32 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center"><span className="text-xl font-bold">{total}</span></div>
            </div>
            <div className="space-y-1 text-sm">{data.map(item => <div key={item.label} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div><span>{item.label}: {item.value}</span></div>)}</div>
        </div>
    );
};

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex justify-between items-end gap-2 h-40">
            {data.map(item => (
                <div key={item.label} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-violet-600 rounded-t-md" style={{ height: `${(item.value / maxValue) * 100}%` }}></div>
                    <span className="text-xs mt-1 text-slate-500 dark:text-slate-400">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

const AnalyticsView: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');

    const filteredTasks = useMemo(() => {
        if (timeFilter === 'all') return tasks;
        const days = timeFilter === '7d' ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return tasks.filter(t => new Date(t.createdAt) >= startDate);
    }, [tasks, timeFilter]);
    
    const completionStreak = useMemo(() => {
        const dates = new Set(tasks.filter(t => t.completed && t.completedAt).map(t => new Date(t.completedAt!).toDateString()));
        if (dates.size === 0) return 0;
        let streak = 0; let day = new Date();
        while(dates.has(day.toDateString())) { streak++; day.setDate(day.getDate() - 1); }
        return streak;
    }, [tasks]);
    
    const completionTrend = useMemo(() => {
        const days = timeFilter === '7d' ? 7 : 30;
        const trendMap = new Map<string, number>();
        for (let i = 0; i < days; i++) {
            const date = new Date(); date.setDate(date.getDate() - i);
            trendMap.set(date.toISOString().split('T')[0], 0);
        }
        tasks.forEach(t => {
            if (t.completed && t.completedAt) {
                const key = new Date(t.completedAt).toISOString().split('T')[0];
                if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) || 0) + 1);
            }
        });
        return Array.from(trendMap.entries()).map(([dateStr, value]) => ({ label: new Date(dateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }), value, date: new Date(dateStr) })).sort((a,b) => a.date.getTime() - b.date.getTime()).map(({label, value}) => ({label, value}));
    }, [tasks, timeFilter]);
  
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold">Statistiche</h2>
                 <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex text-sm">
                     <button onClick={() => setTimeFilter('7d')} className={`px-3 py-1 rounded-md ${timeFilter === '7d' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>7g</button>
                     <button onClick={() => setTimeFilter('30d')} className={`px-3 py-1 rounded-md ${timeFilter === '30d' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>30g</button>
                     <button onClick={() => setTimeFilter('all')} className={`px-3 py-1 rounded-md ${timeFilter === 'all' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>Tutto</button>
                 </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Completate" value={filteredTasks.filter(t => t.completed).length} description={`su ${filteredTasks.length} totali`} />
                <StatCard title="Streak" value={`${completionStreak} gg`} description="Giorni di fila produttivi" />
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Focus per Priorità</h3>
            <DonutChart data={[
                { label: 'Alta', value: filteredTasks.filter(t => t.priority === Priority.High).length, color: '#ef4444' },
                { label: 'Media', value: filteredTasks.filter(t => t.priority === Priority.Medium).length, color: '#f59e0b' },
                { label: 'Bassa', value: filteredTasks.filter(t => t.priority === Priority.Low).length, color: '#10b981' },
            ]} />
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Trend Completamento</h3>
            <BarChart data={completionTrend} />
        </div>
      </div>
    );
};
export default AnalyticsView;
