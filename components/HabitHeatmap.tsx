import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface HabitHeatmapProps {
  completedCountToday: number;
}

const HabitHeatmap: React.FC<HabitHeatmapProps> = ({ completedCountToday }) => {
  const { language } = useLanguage();

  // Generate the last 28 days (4 weeks x 7 days)
  const days = useMemo(() => {
    const list = [];
    const today = new Date();
    
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const isToday = i === 0;
      
      // Calculate level based on history / current day
      let count = 0;
      if (isToday) {
        count = completedCountToday;
      } else {
        // Pseudo-consistent activity for past days based on day date
        count = (d.getDate() % 4);
      }

      let colorClass = 'bg-slate-100 dark:bg-slate-800/80';
      if (count === 1) colorClass = 'bg-emerald-200 dark:bg-emerald-900/60';
      else if (count === 2 || count === 3) colorClass = 'bg-emerald-400 dark:bg-emerald-600';
      else if (count >= 4) colorClass = 'bg-emerald-600 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]';

      list.push({
        date: d.toLocaleDateString(language === 'en' ? 'en-US' : 'it-IT', { day: 'numeric', month: 'short' }),
        count,
        colorClass,
        isToday
      });
    }
    return list;
  }, [completedCountToday, language]);

  return (
    <div className="glass-card p-5 rounded-[2rem] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-amber-500 animate-pulse" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            {language === 'en' ? 'Activity & Consistency' : 'Costanza & Abitudini'}
          </h4>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {language === 'en' ? 'Last 4 weeks' : 'Ultime 4 settimane'}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-lg ${day.colorClass} transition-all relative group cursor-pointer ${
              day.isToday ? 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-900' : ''
            }`}
            title={`${day.date}: ${day.count} ${language === 'en' ? 'completed' : 'completati'}`}
          >
            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-lg">
              {day.date}: {day.count} {language === 'en' ? 'done' : 'fatti'}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1">
        <span>{language === 'en' ? 'Less' : 'Meno'}</span>
        <div className="flex gap-1 items-center">
          <div className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-200 dark:bg-emerald-900/60" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-400 dark:bg-emerald-600" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-600 dark:bg-emerald-400" />
        </div>
        <span>{language === 'en' ? 'More' : 'Più'}</span>
      </div>
    </div>
  );
};

export default HabitHeatmap;
