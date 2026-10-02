import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Clock, 
  Dumbbell, 
  Flame, 
  X, 
  HelpCircle, 
  Volume2, 
  ChevronRight, 
  Trophy,
  Plus,
  Minus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkoutRoutine, WorkoutExercise, WorkoutSet, ExerciseGuide, CompletedWorkoutLog } from '../types';
import { EXERCISE_GUIDES } from '../data/exercisesData';
import ExerciseDetailModal from './ExerciseDetailModal';
import { playTaskCompleteSound, playTimerEndSound } from '../services/audioService';
import { useLanguage } from '../LanguageContext';

interface ActiveWorkoutSessionProps {
  routine: WorkoutRoutine;
  onFinishWorkout: (log: CompletedWorkoutLog) => void;
  onCancelWorkout: () => void;
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
  routine,
  onFinishWorkout,
  onCancelWorkout
}) => {
  const { language } = useLanguage();

  // Active workout state
  const [exercises, setExercises] = useState<WorkoutExercise[]>(() => JSON.parse(JSON.stringify(routine.exercises)));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rest Timer State
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [restTotalSeconds, setRestTotalSeconds] = useState<number>(90);
  const [inspectingExercise, setInspectingExercise] = useState<ExerciseGuide | null>(null);

  const workoutTimerRef = useRef<any>(null);
  const restTimerRef = useRef<any>(null);

  // Overall workout elapsed timer
  useEffect(() => {
    workoutTimerRef.current = setInterval(() => {
      if (!isPaused) {
        setElapsedSeconds(sec => sec + 1);
      }
    }, 1000);

    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, [isPaused]);

  // Rest countdown timer
  useEffect(() => {
    if (restSecondsLeft !== null && restSecondsLeft > 0) {
      restTimerRef.current = setInterval(() => {
        setRestSecondsLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(restTimerRef.current);
            playTimerEndSound();
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate([200, 100, 200]); } catch {}
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    }

    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [restSecondsLeft]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate live volume (Kg x Reps completed)
  const totalVolumeKg = exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((setAcc, s) => {
      return setAcc + (s.completed ? s.reps * s.weightKg : 0);
    }, 0);
  }, 0);

  const totalCompletedSets = exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter(s => s.completed).length;
  }, 0);

  const totalSetsCount = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  // Update set values
  const handleUpdateSetValue = (exId: string, setId: string, field: 'weightKg' | 'reps', delta: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          const current = s[field];
          const updated = Math.max(0, current + delta);
          return { ...s, [field]: updated };
        })
      };
    }));
  };

  // Toggle set completion and trigger rest timer
  const handleToggleSetCompleted = (exId: string, setId: string, targetRestSec: number = 90) => {
    let nowCompleted = false;

    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          nowCompleted = !s.completed;
          return { ...s, completed: nowCompleted };
        })
      };
    }));

    if (nowCompleted) {
      playTaskCompleteSound();
      // Start rest timer
      setRestTotalSeconds(targetRestSec);
      setRestSecondsLeft(targetRestSec);
    }
  };

  // Finish workout session
  const handleCompleteWorkout = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const log: CompletedWorkoutLog = {
      id: 'log-' + Date.now(),
      routineTitle: routine.title,
      date: new Date().toISOString(),
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      totalVolumeKg,
      exercisesCompleted: exercises.filter(ex => ex.sets.some(s => s.completed)).length,
      totalSets: totalCompletedSets,
    };

    onFinishWorkout(log);
  };

  const handleOpenExerciseGuide = (exerciseId: string) => {
    const found = EXERCISE_GUIDES.find(g => g.id === exerciseId);
    if (found) {
      setInspectingExercise(found);
    }
  };

  return (
    <div className="space-y-6 pb-36 animate-in fade-in duration-300">
      {/* Sticky Active Workout Header */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3.5 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-brand-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
            <Dumbbell size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
              {routine.dayTag}
            </span>
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
              {routine.title}
            </h2>
          </div>
        </div>

        {/* Workout Timer & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            <Clock size={15} className="text-emerald-500 animate-pulse" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            title={isPaused ? 'Riprendi' : 'Pausa'}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>

          <button
            onClick={handleCompleteWorkout}
            className="px-3.5 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-brand-600 text-white font-black text-xs shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Check size={16} />
            <span className="hidden sm:inline">{language === 'en' ? 'Finish Workout' : 'Termina'}</span>
          </button>

          <button
            onClick={onCancelWorkout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
            title="Annulla allenamento"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Live Workout Performance Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {language === 'en' ? 'Volume Lifted' : 'Volume Totale'}
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {totalVolumeKg.toLocaleString()} <span className="text-xs text-emerald-500 font-semibold">kg</span>
          </p>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {language === 'en' ? 'Sets Completed' : 'Serie Completate'}
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {totalCompletedSets} <span className="text-xs text-slate-400 font-semibold">/ {totalSetsCount}</span>
          </p>
        </div>

        <div className="hidden sm:block glass-card p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {language === 'en' ? 'Exercises' : 'Esercizi'}
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {exercises.length} <span className="text-xs text-slate-400 font-semibold">in programma</span>
          </p>
        </div>
      </div>

      {/* List of Workout Exercises */}
      <div className="space-y-4">
        {exercises.map((ex, exIndex) => (
          <div key={ex.id} className="glass-card p-4 sm:p-5 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800/80">
            {/* Exercise Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center justify-center">
                  {exIndex + 1}
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {ex.name}
                  </h3>
                  {ex.notes && (
                    <p className="text-xs text-slate-400 italic">
                      {ex.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Guide trigger button */}
              <button
                type="button"
                onClick={() => handleOpenExerciseGuide(ex.exerciseId)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-500/15 text-slate-600 dark:text-slate-300 hover:text-emerald-500 text-xs font-bold transition-all"
              >
                <HelpCircle size={14} />
                <span className="hidden sm:inline">{language === 'en' ? 'Technique & Form' : 'Vedi Tecnica'}</span>
              </button>
            </div>

            {/* Sets Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
                <div className="col-span-2 text-center">Set</div>
                <div className="col-span-5 text-center">{language === 'en' ? 'Weight (kg)' : 'Carico (Kg)'}</div>
                <div className="col-span-3 text-center">{language === 'en' ? 'Reps' : 'Reps'}</div>
                <div className="col-span-2 text-center">{language === 'en' ? 'Done' : 'Fatto'}</div>
              </div>

              {ex.sets.map((set, setIdx) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl transition-all ${
                    set.completed
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60'
                  }`}
                >
                  {/* Set number */}
                  <div className="col-span-2 text-center font-black text-xs text-slate-600 dark:text-slate-400">
                    #{setIdx + 1}
                  </div>

                  {/* Weight Controls */}
                  <div className="col-span-5 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateSetValue(ex.id, set.id, 'weightKg', -2.5)}
                      className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold active:scale-95 transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white min-w-[36px] text-center">
                      {set.weightKg}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateSetValue(ex.id, set.id, 'weightKg', 2.5)}
                      className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold active:scale-95 transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Reps Controls */}
                  <div className="col-span-3 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateSetValue(ex.id, set.id, 'reps', -1)}
                      className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold active:scale-95 transition-all"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white min-w-[20px] text-center">
                      {set.reps}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateSetValue(ex.id, set.id, 'reps', 1)}
                      className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold active:scale-95 transition-all"
                    >
                      <Plus size={10} />
                    </button>
                  </div>

                  {/* Checkmark Complete Button */}
                  <div className="col-span-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleToggleSetCompleted(ex.id, set.id, ex.targetRestSeconds || 90)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                        set.completed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      <Check size={18} strokeWidth={set.completed ? 3 : 2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Rest Timer Widget (Appears when set is completed) */}
      <AnimatePresence>
        {restSecondsLeft !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40 bg-slate-950/95 border border-emerald-500/40 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl text-white space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-400 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {language === 'en' ? 'Rest Timer' : 'Recupero tra le serie'}
                </span>
              </div>
              <span className="font-mono text-2xl font-black text-white">
                {formatTime(restSecondsLeft)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-brand-400"
                style={{
                  width: `${(restSecondsLeft / restTotalSeconds) * 100}%`
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Quick Adjustment Buttons */}
            <div className="flex items-center justify-between gap-1.5 text-xs font-bold pt-1">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setRestSecondsLeft(prev => (prev || 0) + 15)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  +15s
                </button>
                <button
                  type="button"
                  onClick={() => { setRestTotalSeconds(60); setRestSecondsLeft(60); }}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  60s
                </button>
                <button
                  type="button"
                  onClick={() => { setRestTotalSeconds(90); setRestSecondsLeft(90); }}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  90s
                </button>
                <button
                  type="button"
                  onClick={() => { setRestTotalSeconds(120); setRestSecondsLeft(120); }}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  120s
                </button>
              </div>

              <button
                type="button"
                onClick={() => setRestSecondsLeft(null)}
                className="px-3 py-1 rounded-xl bg-rose-600/30 text-rose-300 hover:bg-rose-600/50"
              >
                {language === 'en' ? 'Skip' : 'Salta'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Detail Modal */}
      {inspectingExercise && (
        <ExerciseDetailModal
          exercise={inspectingExercise}
          onClose={() => setInspectingExercise(null)}
        />
      )}
    </div>
  );
};

export default ActiveWorkoutSession;
