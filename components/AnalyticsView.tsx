import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, PieChart, BarChart as BarChartIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Task, Priority } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; description: string; icon: React.ReactNode; color: string }> = ({ title, value, description, icon, color }) => (
    <div className="glass-card p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 hover:shadow-xl transition-all group">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 transition-transform group-hover:scale-110`}>
                {icon}
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{value}</p>
            </div>
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
);

const AnalyticsView: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    const priorityData = [
        { name: 'Alta', value: tasks.filter(t => t.priority === Priority.High).length, color: '#ef4444' },
        { name: 'Media', value: tasks.filter(t => t.priority === Priority.Medium).length, color: '#f59e0b' },
        { name: 'Bassa', value: tasks.filter(t => t.priority === Priority.Low).length, color: '#10b981' },
    ];

    const completionData = [
        { name: 'Completate', value: completedTasks, color: '#10b981' },
        { name: 'In Sospeso', value: pendingTasks, color: '#64748b' },
    ];

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
      <div className="space-y-10">
        <section className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="text-brand-600" size={28} />
                    Analytics
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Monitora i tuoi progressi e la tua produttività.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Totale Attività" 
                    value={totalTasks} 
                    description="Volume totale di lavoro gestito finora." 
                    icon={<TrendingUp className="text-brand-600" size={24} />}
                    color="bg-brand-500"
                />
                <StatCard 
                    title="Completate" 
                    value={completedTasks} 
                    description="Traguardi raggiunti con successo." 
                    icon={<CheckCircle2 className="text-emerald-600" size={24} />}
                    color="bg-emerald-500"
                />
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="glass-card p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                        <PieChart size={16} />
                        Stato Completamento
                    </h3>
                    <span className="text-2xl font-black text-brand-600 dark:text-brand-400">{completionRate}%</span>
                </div>
                
                <div className="h-64 w-full">
                    {totalTasks > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={completionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {completionData.map((entry, index) => (
                                        <Cell key={`pie-cell-completion-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <AlertCircle size={32} />
                            <p className="text-sm font-medium italic">Nessun dato disponibile</p>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-center gap-6">
                    {completionData.map(item => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{item.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-card p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <BarChartIcon size={16} />
                    Distribuzione Priorità
                </h3>
                
                <div className="h-64 w-full">
                    {totalTasks > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData} layout="vertical" margin={{ left: -20 }}>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', fill: '#94a3b8' }}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`bar-cell-priority-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <AlertCircle size={32} />
                            <p className="text-sm font-medium italic">Nessun dato disponibile</p>
                        </div>
                    )}
                </div>
                
                <div className="space-y-4 pt-4">
                    {priorityData.map(item => (
                        <div key={item.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">{item.name}</span>
                                <span className="text-slate-900 dark:text-white">{item.value}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${totalTasks > 0 ? (item.value / totalTasks) * 100 : 0}%` }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
      </div>
    );
};

export default AnalyticsView;