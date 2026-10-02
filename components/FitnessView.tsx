import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Play, 
  Flame, 
  Plus, 
  Search, 
  Clock, 
  Layers, 
  Sparkles, 
  Calendar, 
  Trophy, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Activity,
  History,
  BookOpen
} from 'lucide-react';
import { 
  WorkoutRoutine, 
  WorkoutExercise, 
  ExerciseGuide, 
  MuscleGroup, 
  CompletedWorkoutLog 
} from '../types';
import { EXERCISE_GUIDES, STARTER_ROUTINES } from '../data/exercisesData';
import ExerciseDetailModal from './ExerciseDetailModal';
import { useLanguage } from '../LanguageContext';

interface FitnessViewProps {
  onStartWorkout: (routine: WorkoutRoutine) => void;
  workoutLogs: CompletedWorkoutLog[];
  onDeleteLog?: (id: string) => void;
}

type TabType = 'routines' | 'exercises' | 'history';

const ROUTINES_STORAGE_KEY = 'produttivita_gym_routines_v1';

export const FitnessView: React.FC<FitnessViewProps> = ({
  onStartWorkout,
  workoutLogs,
  onDeleteLog
}) => {
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('routines');
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    try {
      const saved = localStorage.getItem(ROUTINES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse gym routines from storage', e);
    }
    return STARTER_ROUTINES;
  });

  // Save custom routines whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines));
    } catch (e) {
      console.error('Failed to save gym routines', e);
    }
  }, [routines]);

  // Exercise modal state
  const [selectedExercise, setSelectedExercise] = useState<ExerciseGuide | null>(null);

  // Exercise library filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');

  // Expanded routine preview
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(routines[0]?.id || null);

  // Modal to create custom routine
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineTag, setNewRoutineTag] = useState('');
  const [newRoutineDesc, setNewRoutineDesc] = useState('');
  const [newRoutineSelectedExIds, setNewRoutineSelectedExIds] = useState<string[]>([]);

  // Filtered exercises for the library tab
  const filteredExercises = useMemo(() => {
    return EXERCISE_GUIDES.filter(ex => {
      const matchesMuscle = selectedMuscle === 'all' || ex.muscleGroup === selectedMuscle;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        ex.name.toLowerCase().includes(query) || 
        ex.nameEn.toLowerCase().includes(query) ||
        ex.primaryMuscles.some(m => m.toLowerCase().includes(query));
      return matchesMuscle && matchesSearch;
    });
  }, [selectedMuscle, searchQuery]);

  // Overall fitness statistics
  const stats = useMemo(() => {
    const totalWorkouts = workoutLogs.length;
    const totalVolumeKg = workoutLogs.reduce((acc, log) => acc + (log.totalVolumeKg || 0), 0);
    const totalDurationMin = workoutLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);
    const totalSetsCompleted = workoutLogs.reduce((acc, log) => acc + (log.totalSets || 0), 0);

    // This week's workouts
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = workoutLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startOfWeek;
    }).length;

    return {
      totalWorkouts,
      totalVolumeKg,
      totalDurationMin,
      totalSetsCompleted,
      workoutsThisWeek
    };
  }, [workoutLogs]);

  // Muscle filter buttons
  const muscleFilters: { id: MuscleGroup | 'all'; label: string; count: number }[] = [
    { id: 'all', label: language === 'en' ? 'All' : 'Tutti', count: EXERCISE_GUIDES.length },
    { id: 'chest', label: language === 'en' ? 'Chest' : 'Petto', count: EXERCISE_GUIDES.filter(e => e.muscleGroup === 'chest').length },
    { id: 'back', label: language === 'en' ? 'Back' : 'Dorso', count: EXERCISE_GUIDES.filter(e => e.muscleGroup === 'back').length },
    { id: 'legs', label: language === 'en' ? 'Legs' : 'Gambe', count: EXERCISE_GUIDES.filter(e => e.muscleGroup === 'legs').length },
    { id: 'shoulders', label: language === 'en' ? 'Shoulders' : 'Spalle', count: EXERCISE_GUIDES.filter(e => e.muscleGroup === 'shoulders').length },
    { id: 'arms', label: language === 'en' ? 'Arms' : 'Braccia', count: EXERCISE_GUIDES.filter(e => e.muscleGroup === 'arms').length },
    { id: 'core', label: language === 'en' ? 'Core' : 'Addome', count: EXERCISE_GUIDES.filter(e => e.muscleGroup === 'core').length },
  ];

  // Helper to open exercise guide by ID
  const handleOpenExerciseById = (exerciseId: string) => {
    const guide = EXERCISE_GUIDES.find(e => e.id === exerciseId);
    if (guide) setSelectedExercise(guide);
  };

  // Helper to create a new routine
  const handleCreateRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineTitle.trim()) return;

    const chosenExercises: WorkoutExercise[] = newRoutineSelectedExIds.map((exId, index) => {
      const guide = EXERCISE_GUIDES.find(g => g.id === exId);
      return {
        id: `we-custom-${Date.now()}-${index}`,
        exerciseId: exId,
        name: guide ? (language === 'en' ? guide.nameEn : guide.name) : 'Esercizio',
        muscleGroup: guide?.muscleGroup || 'chest',
        targetRestSeconds: 90,
        sets: [
          { id: `s-${Date.now()}-1`, setNumber: 1, reps: 10, weightKg: 10, completed: false },
          { id: `s-${Date.now()}-2`, setNumber: 2, reps: 10, weightKg: 10, completed: false },
          { id: `s-${Date.now()}-3`, setNumber: 3, reps: 10, weightKg: 10, completed: false },
        ]
      };
    });

    const newRoutine: WorkoutRoutine = {
      id: `routine-${Date.now()}`,
      title: newRoutineTitle.trim(),
      dayTag: newRoutineTag.trim() || 'Custom',
      description: newRoutineDesc.trim() || (language === 'en' ? 'Personal routine' : 'Scheda personalizzata'),
      estimatedDurationMin: Math.max(30, chosenExercises.length * 8),
      exercises: chosenExercises.length > 0 ? chosenExercises : STARTER_ROUTINES[0].exercises
    };

    setRoutines(prev => [newRoutine, ...prev]);
    setIsCreatingRoutine(false);
    setNewRoutineTitle('');
    setNewRoutineTag('');
    setNewRoutineDesc('');
    setNewRoutineSelectedExIds([]);
  };

  const handleResetToDefaultRoutines = () => {
    if (window.confirm(language === 'en' ? 'Reset routines to starter templates?' : 'Ripristinare le schede predefinite per principianti?')) {
      setRoutines(STARTER_ROUTINES);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/20 border border-emerald-500/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black tracking-wide text-emerald-100 uppercase">
              <Dumbbell size={13} className="text-emerald-300" />
              <span>{language === 'en' ? 'Fitness & Gym Companion' : 'Palestra & Fitness Tracker'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {language === 'en' ? 'Build Strength, Track Every Set' : 'Costruisci Forza, Traccia Ogni Serie'}
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-xl font-medium">
              {language === 'en' 
                ? 'Anatomical muscle guides, live workout tracking with rest timers, and progressive overload for beginners.' 
                : 'Guide visive muscolari, tracker serie/ripetizioni con timer di recupero e carichi progressivi ideali per chi inizia.'}
            </p>
          </div>

          {/* Quick CTA to start next routine */}
          {routines.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onStartWorkout(routines[0])}
              className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-emerald-50 font-black text-sm shadow-xl shadow-slate-950/30 shrink-0 group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                <Play size={16} fill="currentColor" />
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {language === 'en' ? 'Quick Start' : 'Avvio Rapido'}
                </div>
                <div className="text-slate-900 font-extrabold">
                  {routines[0].dayTag}
                </div>
              </div>
            </motion.button>
          )}
        </div>

        {/* Quick Stats bar inside hero */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
              {language === 'en' ? 'This Week' : 'Questa Settimana'}
            </div>
            <div className="text-xl font-black text-white mt-0.5 flex items-center gap-1.5">
              <Flame size={18} className="text-amber-400" />
              <span>{stats.workoutsThisWeek} {language === 'en' ? 'sessions' : 'allenamenti'}</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
              {language === 'en' ? 'Total Workouts' : 'Totale Sessioni'}
            </div>
            <div className="text-xl font-black text-white mt-0.5 flex items-center gap-1.5">
              <Trophy size={18} className="text-yellow-400" />
              <span>{stats.totalWorkouts}</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
              {language === 'en' ? 'Volume Lifted' : 'Volume Sollevato'}
            </div>
            <div className="text-xl font-black text-white mt-0.5 flex items-center gap-1.5">
              <Activity size={18} className="text-emerald-300" />
              <span>{stats.totalVolumeKg.toLocaleString()} kg</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
              {language === 'en' ? 'Total Time' : 'Tempo Totale'}
            </div>
            <div className="text-xl font-black text-white mt-0.5 flex items-center gap-1.5">
              <Clock size={18} className="text-sky-300" />
              <span>{stats.totalDurationMin} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => setActiveTab('routines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'routines'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers size={15} />
            <span>{language === 'en' ? 'Routines & Cards' : 'Schede & Allenamenti'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {routines.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'exercises'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen size={15} />
            <span>{language === 'en' ? 'Exercises & 3D Anatomy' : 'Esercizi & Anatomia'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {EXERCISE_GUIDES.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History size={15} />
            <span>{language === 'en' ? 'Workout Log' : 'Storico Sessioni'}</span>
            {workoutLogs.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {workoutLogs.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'routines' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingRoutine(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">{language === 'en' ? 'New Routine' : 'Nuova Scheda'}</span>
            </button>
            <button
              onClick={handleResetToDefaultRoutines}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={language === 'en' ? 'Reset starter routines' : 'Ripristina schede iniziali'}
            >
              <Layers size={15} />
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: ROUTINES & WORKOUTS */}
      {activeTab === 'routines' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {routines.map(routine => {
              const isExpanded = expandedRoutineId === routine.id;

              return (
                <div
                  key={routine.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/20">
                        {routine.dayTag}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                        <Clock size={13} />
                        <span>~{routine.estimatedDurationMin} min</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {routine.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {routine.description}
                      </p>
                    </div>

                    {/* Exercise chips list */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>{language === 'en' ? 'Exercises' : 'Esercizi'} ({routine.exercises.length})</span>
                        <button
                          onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 text-[11px]"
                        >
                          <span>{isExpanded ? (language === 'en' ? 'Hide details' : 'Comprimi') : (language === 'en' ? 'Show details' : 'Dettagli')}</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>

                      {/* Mini exercise pills preview */}
                      <div className="flex flex-wrap gap-1.5">
                        {routine.exercises.map((ex, idx) => (
                          <button
                            key={ex.id || idx}
                            onClick={() => handleOpenExerciseById(ex.exerciseId)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-xs font-semibold transition-colors group"
                            title={language === 'en' ? 'Click to inspect execution' : 'Clicca per vedere la corretta esecuzione'}
                          >
                            <Dumbbell size={11} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                            <span>{ex.name}</span>
                            <span className="text-[10px] text-slate-400">({ex.sets.length}s)</span>
                          </button>
                        ))}
                      </div>

                      {/* Expanded detailed sets table */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 overflow-hidden"
                          >
                            {routine.exercises.map((ex, idx) => (
                              <div
                                key={`detail-${ex.id || idx}`}
                                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                              >
                                <div className="space-y-0.5">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <span>{idx + 1}.</span>
                                    <span>{ex.name}</span>
                                    <button
                                      onClick={() => handleOpenExerciseById(ex.exerciseId)}
                                      className="p-0.5 text-emerald-500 hover:text-emerald-600 rounded-md"
                                      title={language === 'en' ? 'View form guide' : 'Vedi guida esecuzione'}
                                    >
                                      <Info size={13} />
                                    </button>
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    {ex.notes || `${ex.sets.length} serie • ${ex.sets[0]?.reps || 10} reps`}
                                  </div>
                                </div>
                                <div className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  {ex.targetRestSeconds || 90}s rec
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Start Routine Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onStartWorkout(routine)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all"
                    >
                      <Play size={16} fill="currentColor" />
                      <span>{language === 'en' ? 'Start Workout' : 'Inizia Allenamento'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EXERCISE LIBRARY & 3D ANATOMY */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          {/* Search bar & Muscle Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search exercise or muscle (e.g. chest, lat machine, squat)...' : 'Cerca esercizio o muscolo (es. panca, squat, dorsali, tricipiti)...'}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Muscle pills filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {muscleFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedMuscle(filter.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedMuscle === filter.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedMuscle === filter.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Exercise cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(exercise => (
              <motion.div
                key={exercise.id}
                whileHover={{ y: -3 }}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
                onClick={() => setSelectedExercise(exercise)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                      {exercise.muscleGroup}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-semibold capitalize">
                      {exercise.equipment}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {language === 'en' ? exercise.nameEn : exercise.name}
                    </h3>
                    <div className="text-[11px] font-medium text-slate-400 mt-1">
                      {exercise.primaryMuscles.join(', ')}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {language === 'en' ? exercise.executionEn : exercise.execution}
                  </p>
                </div>

                {/* Card CTA */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>{language === 'en' ? 'View 3D Muscle Form' : 'Vedi Anatomia & Guida'}</span>
                  </span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3">
              <Dumbbell size={32} className="mx-auto text-slate-400" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {language === 'en' ? 'No exercises found' : 'Nessun esercizio trovato'}
              </div>
              <p className="text-xs text-slate-400">
                {language === 'en' ? 'Try adjusting your search or muscle filter.' : 'Prova a modificare i filtri o la ricerca.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WORKOUT LOG & HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          {workoutLogs.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Trophy size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'en' ? 'No Workouts Logged Yet' : 'Nessun Allenamento Registrato'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {language === 'en'
                    ? 'Complete your first workout routine to start tracking your total volume, consistency, and strength gains.'
                    : 'Porta a termine il tuo primo allenamento per iniziare a tracciare volume sollevato, serie e progressi nel tempo.'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('routines')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                <Play size={14} fill="currentColor" />
                <span>{language === 'en' ? 'Choose a Routine' : 'Scegli una Scheda'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {workoutLogs.map((log) => {
                const dateObj = new Date(log.date);
                const formattedDate = dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'it-IT', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={log.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                          {language === 'en' ? 'Completed' : 'Completato'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar size={12} />
                          <span>{formattedDate}</span>
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {log.routineTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          {language === 'en' ? 'Duration' : 'Durata'}
                        </div>
                        <div className="font-black text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                          <Clock size={13} className="text-slate-400" />
                          <span>{log.durationMinutes} min</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          {language === 'en' ? 'Volume' : 'Volume'}
                        </div>
                        <div className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                          <Activity size={13} />
                          <span>{log.totalVolumeKg.toLocaleString()} kg</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          {language === 'en' ? 'Sets Done' : 'Serie'}
                        </div>
                        <div className="font-black text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <span>{log.totalSets}</span>
                        </div>
                      </div>

                      {onDeleteLog && (
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="p-2 text-slate-300 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-auto sm:ml-2"
                          title={language === 'en' ? 'Delete session' : 'Elimina sessione'}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Exercise Detail & 3D Anatomy Guide */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />

      {/* Modal: Create Custom Routine */}
      <AnimatePresence>
        {isCreatingRoutine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Plus size={16} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {language === 'en' ? 'Create Custom Routine' : 'Crea Nuova Scheda'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreatingRoutine(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRoutineSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Routine Title' : 'Nome Scheda *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoutineTitle}
                    onChange={e => setNewRoutineTitle(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Upper Body Focus' : 'es. Upper Body / Dorso & Bicipiti'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Day Tag' : 'Etichetta Giorno'}
                    </label>
                    <input
                      type="text"
                      value={newRoutineTag}
                      onChange={e => setNewRoutineTag(e.target.value)}
                      placeholder={language === 'en' ? 'e.g. Day C' : 'es. Giorno C'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Description' : 'Descrizione'}
                    </label>
                    <input
                      type="text"
                      value={newRoutineDesc}
                      onChange={e => setNewRoutineDesc(e.target.value)}
                      placeholder={language === 'en' ? 'Short note' : 'Breve nota'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'en' ? 'Select Exercises to Include' : 'Scegli Esercizi da Includere'}
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    {EXERCISE_GUIDES.map(guide => {
                      const isSelected = newRoutineSelectedExIds.includes(guide.id);
                      return (
                        <button
                          type="button"
                          key={`select-${guide.id}`}
                          onClick={() => {
                            setNewRoutineSelectedExIds(prev => 
                              isSelected ? prev.filter(id => id !== guide.id) : [...prev, guide.id]
                            );
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="truncate">{language === 'en' ? guide.nameEn : guide.name}</span>
                          <span className="text-[10px] opacity-80 uppercase ml-2">{guide.muscleGroup}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreatingRoutine(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {language === 'en' ? 'Cancel' : 'Annulla'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                  >
                    {language === 'en' ? 'Save Routine' : 'Salva Scheda'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FitnessView;
