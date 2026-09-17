import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  Target, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowUpRight, 
  Flame, 
  TrendingUp, 
  Clock, 
  Volume2,
  VolumeX,
  X,
  Coffee,
  Brain,
  Zap,
  Check,
  RotateCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Task, Routine, Appointment, Goal } from '../types';
import { useLanguage } from '../LanguageContext';
import { View } from './BottomNav';
import HabitHeatmap from './HabitHeatmap';
import { planMyDayWithGemini, DayPlanItem } from '../services/geminiService';
import { 
  playTimerEndSound, 
  startAmbientSound, 
  stopAmbientSound 
} from '../services/audioService';

interface DashboardViewProps {
  tasks: Task[];
  routines: Routine[];
  appointments: Appointment[];
  goals: Goal[];
  subtitle: string;
  userName: string;
  onSetView: (view: View) => void;
  onToggleTask: (id: string) => void;
  onRefreshQuote?: () => void;
  isRefreshingQuote?: boolean;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  routines,
  appointments,
  goals,
  subtitle,
  userName,
  onSetView,
  onToggleTask,
  onRefreshQuote,
  isRefreshingQuote = false,
}) => {
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'it-IT';

  // Pomodoro Focus Timer State
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [timerSeconds, setTimerSeconds] = useState(TIMER_DURATIONS.focus);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAmbientActive, setIsAmbientActive] = useState(false);

  // AI Day Planner State
  const [dayPlan, setDayPlan] = useState<DayPlanItem[] | null>(null);
  const [isPlanningDay, setIsPlanningDay] = useState(false);
  const [completedPlanIndices, setCompletedPlanIndices] = useState<number[]>([]);

  // Switch timer mode
  const handleSelectTimerMode = (mode: TimerMode) => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    setTimerSeconds(TIMER_DURATIONS[mode]);
  };

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      playTimerEndSound();
      if (isAmbientActive) {
        stopAmbientSound();
        setIsAmbientActive(false);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, isAmbientActive]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(TIMER_DURATIONS[timerMode]);
  };

  const toggleAmbientSound = () => {
    if (isAmbientActive) {
      stopAmbientSound();
      setIsAmbientActive(false);
    } else {
      startAmbientSound();
      setIsAmbientActive(true);
    }
  };

  // Clean up ambient sound on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Local today string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Tasks due today
  const tasksDueToday = useMemo(() => {
    return tasks.filter(t => t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const completedTodayCount = useMemo(() => {
    return tasks.filter(t => t.completed).length;
  }, [tasks]);

  // Routines progress for today
  const routineStats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    routines.forEach(r => {
      totalTasks += r.tasks.length;
      completedTasks += r.tasks.filter(t => t.completed).length;
    });
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, percentage };
  }, [routines]);

  // Next upcoming appointment
  const nextAppointment = useMemo(() => {
    return appointments
      .filter(a => a.date >= todayStr)
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0] || null;
  }, [appointments, todayStr]);

  // Weekly Productivity Data for Recharts
  const weeklyData = useMemo(() => {
    const days = language === 'en' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
      : ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

    const baseCompleted = Math.max(1, Math.floor(completedTodayCount / 3));
    return days.map((day, idx) => {
      const isToday = idx === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
      return {
        name: day,
        completati: isToday 
          ? (completedTodayCount + routineStats.completedTasks) 
          : Math.max(0, Math.floor((baseCompleted + (idx % 3) * 2))),
      };
    });
  }, [completedTodayCount, routineStats.completedTasks, language]);

  const formattedDate = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Handle Day Planning with Gemini
  const handlePlanDay = async () => {
    setIsPlanningDay(true);
    try {
      const plan = await planMyDayWithGemini(tasks, routines, appointments, language);
      setDayPlan(plan);
      setCompletedPlanIndices([]);
    } catch (e) {
      console.error('Failed to plan day:', e);
    } finally {
      setIsPlanningDay(false);
    }
  };

  const togglePlanItemCompleted = (index: number) => {
    setCompletedPlanIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const getCategoryColor = (cat: DayPlanItem['category']) => {
    switch (cat) {
      case 'focus':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'routine':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'appointment':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'break':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-500/10 via-brand-500/5 to-transparent border border-brand-500/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 capitalize">
              {formattedDate}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('dashboard_welcome')} <span className="text-brand-600 dark:text-brand-400">{userName}</span>
            </h1>
            <div className="flex items-center gap-2 pt-1 group">
              <Sparkles size={18} className="text-brand-500 shrink-0" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "{subtitle}"
              </p>
              {onRefreshQuote && (
                <button
                  type="button"
                  onClick={onRefreshQuote}
                  disabled={isRefreshingQuote}
                  className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all shrink-0 active:scale-95 disabled:opacity-50"
                  title={language === 'en' ? 'Generate new motivational quote' : 'Genera nuova frase motivazionale'}
                >
                  <RotateCw size={13} className={isRefreshingQuote ? 'animate-spin text-brand-500' : ''} />
                </button>
              )}
            </div>

            {/* Smart Day Planner Action Button */}
            <div className="pt-2">
              <button
                onClick={handlePlanDay}
                disabled={isPlanningDay}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-brand-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
              >
                <Sparkles size={16} className={isPlanningDay ? "animate-spin" : ""} />
                <span>
                  {isPlanningDay 
                    ? (language === 'en' ? 'Strategizing day with AI...' : 'Pianificazione IA in corso...')
                    : (language === 'en' ? '✨ Plan My Day with AI' : '✨ Pianifica Giornata con IA')}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm self-start md:self-center shrink-0">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <Flame size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {routineStats.percentage}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('dashboard_routines_summary')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Smart Day Plan Timeline Modal / Panel */}
      <AnimatePresence>
        {dayPlan && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-card p-6 rounded-[2.5rem] border-indigo-500/30 bg-gradient-to-b from-indigo-500/5 to-transparent relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {language === 'en' ? 'AI Time-Blocked Schedule' : 'Pianificazione Oraria Ottimizzata IA'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'en' ? 'Custom agenda tailored to your goals and routines' : 'Agenda a blocchi creata su misura per le tue attività e orari'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlanDay}
                  disabled={isPlanningDay}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                >
                  {language === 'en' ? 'Regenerate' : 'Rigenera'}
                </button>
                <button
                  onClick={() => setDayPlan(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {dayPlan.map((item, idx) => {
                const isCompleted = completedPlanIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => togglePlanItemCompleted(idx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isCompleted 
                        ? 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60' 
                        : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        {item.time}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>

                    <p className={`text-sm font-semibold leading-snug ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.activity}
                    </p>

                    <div className="flex items-center justify-end">
                      <span className={`text-[11px] font-bold flex items-center gap-1 ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {isCompleted ? <Check size={14} /> : <Circle size={14} />}
                        <span>{isCompleted ? (language === 'en' ? 'Done' : 'Fatto') : (language === 'en' ? 'Mark done' : 'Completa')}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Weekly Productivity Chart (Spans 2 cols on desktop) */}
        <div className="md:col-span-2 glass-card p-6 rounded-[2.5rem] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-500" />
                {t('dashboard_stats_weekly')}
              </h3>
              <p className="text-xs font-medium text-slate-400">
                {t('dashboard_stats_weekly_subtitle')}
              </p>
            </div>
            <button 
              onClick={() => onSetView('tasks')}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              {t('nav_tasks')} <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: '#334155', 
                    borderRadius: '1rem',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: '#34d399' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completati" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorProd)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Enhanced Focus / Pomodoro Timer with Audio & Ambient Noise */}
        <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-brand-500" />
              {t('dashboard_focus_timer')}
            </h3>
            
            {/* Ambient Sound Toggle Button */}
            <button
              onClick={toggleAmbientSound}
              title={isAmbientActive ? 'Disattiva rumore marrone' : 'Attiva rumore marrone (focus)'}
              className={`p-1.5 rounded-xl border transition-colors ${
                isAmbientActive 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500' 
                  : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {isAmbientActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          {/* Timer Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-2xl">
            <button
              onClick={() => handleSelectTimerMode('focus')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                timerMode === 'focus' 
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Brain size={12} />
              <span>25m</span>
            </button>
            <button
              onClick={() => handleSelectTimerMode('shortBreak')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                timerMode === 'shortBreak' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Coffee size={12} />
              <span>5m</span>
            </button>
            <button
              onClick={() => handleSelectTimerMode('longBreak')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                timerMode === 'longBreak' 
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Zap size={12} />
              <span>15m</span>
            </button>
          </div>

          <div className="text-center my-3 space-y-1">
            <div className="text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {formatTimer(timerSeconds)}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {timerSeconds === 0 
                ? t('dashboard_focus_done') 
                : timerMode === 'focus' 
                  ? t('dashboard_focus_session') 
                  : (language === 'en' ? 'Rest and recharge' : 'Pausa e recupero')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimer}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-md shadow-brand-500/20 active:scale-95 transition-all text-xs uppercase tracking-wider"
            >
              {isTimerRunning ? (
                <>
                  <Pause size={16} /> {t('dashboard_focus_pause')}
                </>
              ) : (
                <>
                  <Play size={16} /> {t('dashboard_focus_start')}
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title={t('dashboard_focus_reset')}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Card 3: Tasks Due Today */}
        <div className="md:col-span-2 glass-card p-6 rounded-[2.5rem] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-brand-500" />
              {t('dashboard_due_today')}
            </h3>
            <button 
              onClick={() => onSetView('tasks')}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              {t('nav_tasks')} <ArrowUpRight size={14} />
            </button>
          </div>

          {tasksDueToday.length > 0 ? (
            <div className="space-y-2">
              {tasksDueToday.slice(0, 3).map(task => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button 
                      onClick={() => onToggleTask(task.id)}
                      className={task.completed ? 'text-brand-600' : 'text-slate-300 hover:text-brand-400'}
                    >
                      {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <span className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.text}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shrink-0">
                    {task.priority}
                  </span>
                </div>
              ))}
              {tasksDueToday.length > 3 && (
                <p className="text-xs text-center font-bold text-slate-400 pt-1">
                  +{tasksDueToday.length - 3} altre attività in scadenza oggi
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-sm font-medium">
              {t('dashboard_due_today_empty')}
            </div>
          )}
        </div>

        {/* Card 4: Next Appointment & Active Goals */}
        <div className="glass-card p-6 rounded-[2.5rem] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon size={18} className="text-brand-500" />
                {t('dashboard_next_appointment')}
              </h3>
              <button 
                onClick={() => onSetView('calendar')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <ArrowUpRight size={14} />
              </button>
            </div>

            {nextAppointment ? (
              <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-900/30">
                <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {nextAppointment.text}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 mt-1">
                  <Clock size={12} />
                  <span>{nextAppointment.date} • {nextAppointment.time.substring(0, 5)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium py-2">
                {t('dashboard_no_appointment')}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target size={14} className="text-brand-500" />
                {t('nav_goals')}
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {goals.filter(g => g.completed).length}/{goals.length}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${goals.length > 0 ? (goals.filter(g => g.completed).length / goals.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Habit Consistency Heatmap */}
      <section>
        <HabitHeatmap completedCountToday={completedTodayCount} />
      </section>
    </div>
  );
};

export default DashboardView;
