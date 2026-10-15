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
  CalendarDays,
  Settings2,
  Coffee,
  Check,
  HeartPulse,
  Trophy, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Activity,
  History,
  BookOpen,
  Edit3
} from 'lucide-react';
import { 
  WorkoutRoutine, 
  WorkoutExercise, 
  ExerciseGuide, 
  MuscleGroup, 
  CompletedWorkoutLog,
  WeeklyScheduleDay,
  ExerciseWeightRecord
} from '../types';
import { EXERCISE_GUIDES, STARTER_ROUTINES, DEFAULT_WEEKLY_SCHEDULE } from '../data/exercisesData';
import ExerciseDetailModal from './ExerciseDetailModal';
import { useLanguage } from '../LanguageContext';
import { generateWorkoutRoutinesWithGemini, generateExerciseGuideDetailsWithGemini } from '../services/geminiService';

interface FitnessViewProps {
  onStartWorkout: (routine: WorkoutRoutine) => void;
  workoutLogs: CompletedWorkoutLog[];
  onDeleteLog?: (id: string) => void;
}

type TabType = 'routines' | 'exercises' | 'history';

const ROUTINES_STORAGE_KEY = 'produttivita_gym_routines_v1';
const CUSTOM_EXERCISES_STORAGE_KEY = 'produttivita_gym_custom_exercises_v1';
const EXERCISE_RECORDS_STORAGE_KEY = 'produttivita_gym_exercise_records_v1';

export const FitnessView: React.FC<FitnessViewProps> = ({
  onStartWorkout,
  workoutLogs,
  onDeleteLog
}) => {
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('routines');

  // Custom User-Created Exercises
  const [customExercises, setCustomExercises] = useState<ExerciseGuide[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_EXERCISES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse custom exercises from storage', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_EXERCISES_STORAGE_KEY, JSON.stringify(customExercises));
    } catch (e) {
      console.error('Failed to save custom exercises', e);
    }
  }, [customExercises]);

  // Combined exercise guide list
  const allExercises = useMemo(() => {
    return [...customExercises, ...EXERCISE_GUIDES];
  }, [customExercises]);

  // Previous exercise weight records (load progression)
  const [exerciseRecords, setExerciseRecords] = useState<Record<string, ExerciseWeightRecord>>(() => {
    try {
      const saved = localStorage.getItem(EXERCISE_RECORDS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Routines state
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    try {
      const saved = localStorage.getItem(ROUTINES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse gym routines from storage', e);
    }
    return STARTER_ROUTINES;
  });

  // Routine Weights Editor modal state
  const [editingRoutineWeights, setEditingRoutineWeights] = useState<WorkoutRoutine | null>(null);

  // Delete Routine Confirmation state
  const [routineToDelete, setRoutineToDelete] = useState<WorkoutRoutine | null>(null);

  // New Custom Exercise modal state
  const [isAddingCustomExercise, setIsAddingCustomExercise] = useState(false);
  const [isAiFillingExercise, setIsAiFillingExercise] = useState(false);
  const [customExName, setCustomExName] = useState('');
  const [customExNameEn, setCustomExNameEn] = useState('');
  const [customExMuscleGroup, setCustomExMuscleGroup] = useState<MuscleGroup>('chest');
  const [customExEquipment, setCustomExEquipment] = useState<'dumbbell' | 'barbell' | 'machine' | 'cables' | 'bodyweight'>('dumbbell');
  const [customExPrimaryMuscles, setCustomExPrimaryMuscles] = useState('');
  const [customExViewType, setCustomExViewType] = useState<'front' | 'back'>('front');
  const [customExSetup, setCustomExSetup] = useState('');
  const [customExExecution, setCustomExExecution] = useState('');
  const [customExMistakes, setCustomExMistakes] = useState('');
  const [customExTip, setCustomExTip] = useState('');

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

  // AI Workout Generator State
  const [isGeneratingWithAi, setIsGeneratingWithAi] = useState(false);
  const [aiDaysPerWeek, setAiDaysPerWeek] = useState(3);
  const [aiGoal, setAiGoal] = useState<'massa' | 'definizione' | 'dimagrimento' | 'forza'>('massa');
  const [aiExperience, setAiExperience] = useState<'beginner' | 'intermediate'>('beginner');
  const [aiCustomNotes, setAiCustomNotes] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Weekly Coach Schedule State
  const SCHEDULE_STORAGE_KEY = 'produttivita_gym_weekly_schedule_v1';
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleDay[]>(() => {
    try {
      const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse gym weekly schedule', e);
    }
    return DEFAULT_WEEKLY_SCHEDULE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(weeklySchedule));
    } catch (e) {
      console.error('Failed to save gym weekly schedule', e);
    }
  }, [weeklySchedule]);

  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  // Today day index (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const todayDayIndex = useMemo(() => new Date().getDay(), []);

  // Today schedule entry
  const todaySchedule = useMemo(() => {
    return weeklySchedule.find(s => s.dayIndex === todayDayIndex) || weeklySchedule[0];
  }, [weeklySchedule, todayDayIndex]);

  // Is today workout done?
  const isTodayWorkoutDone = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return workoutLogs.some(log => log.date.startsWith(todayStr));
  }, [workoutLogs]);

  // Today routine object
  const todayRoutine = useMemo(() => {
    if (!todaySchedule.isWorkoutDay) return null;
    if (todaySchedule.assignedRoutineId) {
      const found = routines.find(r => r.id === todaySchedule.assignedRoutineId);
      if (found) return found;
    }
    return routines[0] || null;
  }, [todaySchedule, routines]);

  // Next workout day if today is rest day
  const nextWorkoutDay = useMemo(() => {
    for (let i = 1; i <= 7; i++) {
      const checkIdx = (todayDayIndex + i) % 7;
      const day = weeklySchedule.find(s => s.dayIndex === checkIdx);
      if (day && day.isWorkoutDay) {
        const assigned = routines.find(r => r.id === day.assignedRoutineId) || routines[0];
        return { ...day, routine: assigned };
      }
    }
    return null;
  }, [weeklySchedule, todayDayIndex, routines]);

  // Ordered days from Monday (1) to Sunday (0) for standard European weekly calendar
  const orderedWeekDays = useMemo(() => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.map(idx => weeklySchedule.find(s => s.dayIndex === idx)!).filter(Boolean);
  }, [weeklySchedule]);

  // Helper to apply common weekly presets
  const handleApplyPreset = (preset: '3-mon-wed-fri' | '3-tue-thu-sat' | '2-tue-thu' | '4-upper-lower') => {
    const routineA = routines[0];
    const routineB = routines[1] || routines[0];

    let newSched = [...DEFAULT_WEEKLY_SCHEDULE];
    if (preset === '3-mon-wed-fri') {
      newSched = [
        { dayIndex: 1, dayName: 'Lunedì', shortName: 'Lun', isWorkoutDay: true, assignedRoutineId: routineA?.id, assignedRoutineTitle: routineA?.title, assignedDayTag: routineA?.dayTag || 'Giorno A' },
        { dayIndex: 2, dayName: 'Martedì', shortName: 'Mar', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 3, dayName: 'Mercoledì', shortName: 'Mer', isWorkoutDay: true, assignedRoutineId: routineB?.id, assignedRoutineTitle: routineB?.title, assignedDayTag: routineB?.dayTag || 'Giorno B' },
        { dayIndex: 4, dayName: 'Giovedì', shortName: 'Gio', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 5, dayName: 'Venerdì', shortName: 'Ven', isWorkoutDay: true, assignedRoutineId: routineA?.id, assignedRoutineTitle: routineA?.title, assignedDayTag: routineA?.dayTag || 'Giorno A' },
        { dayIndex: 6, dayName: 'Sabato', shortName: 'Sab', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 0, dayName: 'Domenica', shortName: 'Dom', isWorkoutDay: false, assignedDayTag: 'Riposo' },
      ];
    } else if (preset === '3-tue-thu-sat') {
      newSched = [
        { dayIndex: 1, dayName: 'Lunedì', shortName: 'Lun', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 2, dayName: 'Martedì', shortName: 'Mar', isWorkoutDay: true, assignedRoutineId: routineA?.id, assignedRoutineTitle: routineA?.title, assignedDayTag: routineA?.dayTag || 'Giorno A' },
        { dayIndex: 3, dayName: 'Mercoledì', shortName: 'Mer', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 4, dayName: 'Giovedì', shortName: 'Gio', isWorkoutDay: true, assignedRoutineId: routineB?.id, assignedRoutineTitle: routineB?.title, assignedDayTag: routineB?.dayTag || 'Giorno B' },
        { dayIndex: 5, dayName: 'Venerdì', shortName: 'Ven', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 6, dayName: 'Sabato', shortName: 'Sab', isWorkoutDay: true, assignedRoutineId: routineA?.id, assignedRoutineTitle: routineA?.title, assignedDayTag: routineA?.dayTag || 'Giorno A' },
        { dayIndex: 0, dayName: 'Domenica', shortName: 'Dom', isWorkoutDay: false, assignedDayTag: 'Riposo' },
      ];
    } else if (preset === '2-tue-thu') {
      newSched = [
        { dayIndex: 1, dayName: 'Lunedì', shortName: 'Lun', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 2, dayName: 'Martedì', shortName: 'Mar', isWorkoutDay: true, assignedRoutineId: routineA?.id, assignedRoutineTitle: routineA?.title, assignedDayTag: routineA?.dayTag || 'Giorno A' },
        { dayIndex: 3, dayName: 'Mercoledì', shortName: 'Mer', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 4, dayName: 'Giovedì', shortName: 'Gio', isWorkoutDay: true, assignedRoutineId: routineB?.id, assignedRoutineTitle: routineB?.title, assignedDayTag: routineB?.dayTag || 'Giorno B' },
        { dayIndex: 5, dayName: 'Venerdì', shortName: 'Ven', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 6, dayName: 'Sabato', shortName: 'Sab', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 0, dayName: 'Domenica', shortName: 'Dom', isWorkoutDay: false, assignedDayTag: 'Riposo' },
      ];
    } else if (preset === '4-upper-lower') {
      newSched = [
        { dayIndex: 1, dayName: 'Lunedì', shortName: 'Lun', isWorkoutDay: true, assignedRoutineId: routineA?.id, assignedRoutineTitle: routineA?.title, assignedDayTag: 'Upper A' },
        { dayIndex: 2, dayName: 'Martedì', shortName: 'Mar', isWorkoutDay: true, assignedRoutineId: routineB?.id, assignedRoutineTitle: routineB?.title, assignedDayTag: 'Lower A' },
        { dayIndex: 3, dayName: 'Mercoledì', shortName: 'Mer', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 4, dayName: 'Giovedì', shortName: 'Gio', isWorkoutDay: true, assignedRoutineId: routineA?.id, assignedRoutineTitle: routineA?.title, assignedDayTag: 'Upper B' },
        { dayIndex: 5, dayName: 'Venerdì', shortName: 'Ven', isWorkoutDay: true, assignedRoutineId: routineB?.id, assignedRoutineTitle: routineB?.title, assignedDayTag: 'Lower B' },
        { dayIndex: 6, dayName: 'Sabato', shortName: 'Sab', isWorkoutDay: false, assignedDayTag: 'Riposo' },
        { dayIndex: 0, dayName: 'Domenica', shortName: 'Dom', isWorkoutDay: false, assignedDayTag: 'Riposo' },
      ];
    }
    setWeeklySchedule(newSched);
  };

  const handleToggleDay = (dayIndex: number) => {
    setWeeklySchedule(prev => prev.map(d => {
      if (d.dayIndex !== dayIndex) return d;
      const nextIsWorkout = !d.isWorkoutDay;
      const defaultRot = routines[0];
      return {
        ...d,
        isWorkoutDay: nextIsWorkout,
        assignedDayTag: nextIsWorkout ? (defaultRot?.dayTag || 'Giorno A') : 'Riposo',
        assignedRoutineId: nextIsWorkout ? defaultRot?.id : undefined,
        assignedRoutineTitle: nextIsWorkout ? defaultRot?.title : undefined
      };
    }));
  };

  const handleAssignRoutine = (dayIndex: number, routineId: string) => {
    const selRoutine = routines.find(r => r.id === routineId);
    setWeeklySchedule(prev => prev.map(d => {
      if (d.dayIndex !== dayIndex) return d;
      return {
        ...d,
        assignedRoutineId: routineId,
        assignedRoutineTitle: selRoutine?.title,
        assignedDayTag: selRoutine?.dayTag
      };
    }));
  };

  // Filtered exercises for the library tab (includes default and custom)
  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      const matchesMuscle = selectedMuscle === 'all' || ex.muscleGroup === selectedMuscle;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        ex.name.toLowerCase().includes(query) || 
        ex.nameEn.toLowerCase().includes(query) ||
        ex.primaryMuscles.some(m => m.toLowerCase().includes(query));
      return matchesMuscle && matchesSearch;
    });
  }, [allExercises, selectedMuscle, searchQuery]);

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

  // Muscle filter buttons (counts all exercises)
  const muscleFilters: { id: MuscleGroup | 'all'; label: string; count: number }[] = [
    { id: 'all', label: language === 'en' ? 'All' : 'Tutti', count: allExercises.length },
    { id: 'chest', label: language === 'en' ? 'Chest' : 'Petto', count: allExercises.filter(e => e.muscleGroup === 'chest').length },
    { id: 'back', label: language === 'en' ? 'Back' : 'Dorso', count: allExercises.filter(e => e.muscleGroup === 'back').length },
    { id: 'legs', label: language === 'en' ? 'Legs' : 'Gambe', count: allExercises.filter(e => e.muscleGroup === 'legs').length },
    { id: 'shoulders', label: language === 'en' ? 'Shoulders' : 'Spalle', count: allExercises.filter(e => e.muscleGroup === 'shoulders').length },
    { id: 'arms', label: language === 'en' ? 'Arms' : 'Braccia', count: allExercises.filter(e => e.muscleGroup === 'arms').length },
    { id: 'core', label: language === 'en' ? 'Core' : 'Addome', count: allExercises.filter(e => e.muscleGroup === 'core').length },
  ];

  // Helper to open exercise guide by ID
  const handleOpenExerciseById = (exerciseId: string) => {
    const guide = allExercises.find(e => e.id === exerciseId);
    if (guide) setSelectedExercise(guide);
  };

  // Helper to add custom exercise
  const handleAiFillExercise = async () => {
    if (!customExName.trim() || isAiFillingExercise) return;
    setIsAiFillingExercise(true);
    try {
      const details = await generateExerciseGuideDetailsWithGemini(
        customExName.trim(),
        customExMuscleGroup,
        language
      );
      if (details) {
        setCustomExMuscleGroup(details.muscleGroup);
        setCustomExEquipment(details.equipment);
        setCustomExPrimaryMuscles(details.primaryMuscles);
        setCustomExViewType(details.viewType);
        setCustomExSetup(details.setup);
        setCustomExExecution(details.execution);
        setCustomExMistakes(details.mistakes);
        setCustomExTip(details.tip);
      }
    } catch (e) {
      console.error('Failed to auto-fill exercise with AI', e);
    } finally {
      setIsAiFillingExercise(false);
    }
  };

  const handleCreateCustomExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExName.trim()) return;

    const newGuide: ExerciseGuide = {
      id: `custom-${Date.now()}`,
      name: customExName.trim(),
      nameEn: customExNameEn.trim() || customExName.trim(),
      muscleGroup: customExMuscleGroup,
      primaryMuscles: customExPrimaryMuscles ? customExPrimaryMuscles.split(',').map(m => m.trim()).filter(Boolean) : [customExMuscleGroup],
      equipment: customExEquipment,
      difficulty: 'beginner',
      viewType: customExViewType,
      setup: customExSetup.trim() || (language === 'en' ? 'Maintain upright posture with neutral spine.' : 'Posizionati correttamente con postura eretta e schiena neutra.'),
      setupEn: customExSetup.trim() || 'Maintain upright posture with neutral spine.',
      execution: customExExecution.trim() || (language === 'en' ? 'Perform movement with control contracting target muscle.' : 'Esegui il movimento in modo controllato contraendo il muscolo bersaglio.'),
      executionEn: customExExecution.trim() || 'Perform movement with control contracting target muscle.',
      commonMistakes: customExMistakes ? customExMistakes.split('\n').map(m => m.trim()).filter(Boolean) : ['Eccessivo slancio del busto'],
      commonMistakesEn: ['Using momentum'],
      tip: customExTip.trim() || 'Concentrati sulla connessione mente-muscolo.'
    };

    setCustomExercises(prev => [newGuide, ...prev]);
    setIsAddingCustomExercise(false);
    setCustomExName('');
    setCustomExNameEn('');
    setCustomExPrimaryMuscles('');
    setCustomExSetup('');
    setCustomExExecution('');
    setCustomExMistakes('');
    setCustomExTip('');
  };

  const handleDeleteCustomExercise = (id: string) => {
    if (window.confirm(language === 'en' ? 'Delete this custom exercise?' : 'Eliminare questo esercizio personalizzato?')) {
      setCustomExercises(prev => prev.filter(ex => ex.id !== id));
      if (selectedExercise?.id === id) {
        setSelectedExercise(null);
      }
    }
  };

  // Helper to create a new routine
  const handleCreateRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineTitle.trim()) return;

    const chosenExercises: WorkoutExercise[] = newRoutineSelectedExIds.map((exId, index) => {
      const guide = allExercises.find(g => g.id === exId);
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

  const handleDeleteRoutine = (routineId: string) => {
    setRoutines(prev => prev.filter(r => r.id !== routineId));
    setWeeklySchedule(prev => prev.map(d => d.routineId === routineId ? { ...d, isRestDay: true, routineId: undefined, customLabel: undefined } : d));
    if (expandedRoutineId === routineId) setExpandedRoutineId(null);
    if (editingRoutineWeights?.id === routineId) setEditingRoutineWeights(null);
    setRoutineToDelete(null);
  };

  const handleResetToDefaultRoutines = () => {
    if (window.confirm(language === 'en' ? 'Reset routines to starter templates?' : 'Ripristinare le schede predefinite per principianti?')) {
      setRoutines(STARTER_ROUTINES);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. WEEKLY COACH SCHEDULE BAR */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <CalendarDays size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {language === 'en' ? 'Your Weekly Training Schedule' : 'Il Tuo Programma Settimanale'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {language === 'en' ? 'Follow your weekly plan day by day' : 'Giorno per giorno: sai sempre quando allenarti'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingSchedule(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors shrink-0"
          >
            <Settings2 size={13} />
            <span className="hidden xs:inline">{language === 'en' ? 'Customize' : 'Personalizza'}</span>
          </button>
        </div>

        {/* 7 Days Row - Swipeable on mobile, grid on desktop */}
        <div className="flex overflow-x-auto no-scrollbar pb-1 gap-2 sm:gap-2.5 sm:grid sm:grid-cols-4 lg:grid-cols-7 snap-x">
          {orderedWeekDays.map(day => {
            const isToday = day.dayIndex === todayDayIndex;
            const assigned = routines.find(r => r.id === day.assignedRoutineId) || (day.isWorkoutDay ? routines[0] : null);

            return (
              <div
                key={`schedule-day-${day.dayIndex}`}
                className={`shrink-0 w-[125px] sm:w-auto sm:min-w-0 sm:flex-1 snap-start p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2 relative ${
                  isToday
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10'
                    : day.isWorkoutDay
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800/60 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {day.dayName}
                  </span>
                  {isToday && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
                      OGGI
                    </span>
                  )}
                </div>

                <div>
                  {day.isWorkoutDay ? (
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">
                        <Dumbbell size={10} />
                        <span>{day.assignedDayTag || assigned?.dayTag || 'Giorno A'}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate" title={assigned?.title}>
                        {assigned ? assigned.title.replace(/Full Body 3x - /, '') : 'Scheda'}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
                        <Coffee size={10} />
                        <span>{language === 'en' ? 'Rest Day' : 'Riposo'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {language === 'en' ? 'Recovery' : 'Recupero'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Day status indicator */}
                {isToday && day.isWorkoutDay && (
                  <div className="pt-1.5 border-t border-emerald-500/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    {isTodayWorkoutDone ? (
                      <>
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span>Completato!</span>
                      </>
                    ) : (
                      <>
                        <Flame size={12} className="text-amber-500 animate-bounce" />
                        <span>Da fare oggi!</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. TODAY'S COACH HERO DIRECTIVE */}
      <div className={`relative overflow-hidden rounded-3xl p-4 sm:p-8 shadow-xl border transition-all ${
        todaySchedule.isWorkoutDay && !isTodayWorkoutDone
          ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white border-emerald-500/30 shadow-emerald-950/25'
          : todaySchedule.isWorkoutDay && isTodayWorkoutDone
          ? 'bg-gradient-to-br from-teal-700 via-emerald-800 to-slate-900 text-white border-teal-500/30 shadow-teal-950/25'
          : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border-indigo-500/30 shadow-indigo-950/25'
      }`}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black tracking-wide text-white uppercase">
              {todaySchedule.isWorkoutDay ? (
                isTodayWorkoutDone ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-300" />
                    <span>{language === 'en' ? `Today (${todaySchedule.dayName}): Session Completed!` : `Oggi (${todaySchedule.dayName}): Allenamento Completato!`}</span>
                  </>
                ) : (
                  <>
                    <Flame size={14} className="text-amber-300" />
                    <span>{language === 'en' ? `Today is Workout Day • ${todaySchedule.dayName}` : `Oggi è Giorno di Allenamento • ${todaySchedule.dayName}`}</span>
                  </>
                )
              ) : (
                <>
                  <Coffee size={14} className="text-amber-300" />
                  <span>{language === 'en' ? `Today is Rest Day • ${todaySchedule.dayName}` : `Oggi è Giorno di Riposo • ${todaySchedule.dayName}`}</span>
                </>
              )}
            </div>

            {/* Headline */}
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight break-words">
              {todaySchedule.isWorkoutDay ? (
                isTodayWorkoutDone ? (
                  language === 'en' ? 'Session Completed! Great job.' : 'Sessione Completata! Grande lavoro.'
                ) : (
                  todayRoutine ? `Oggi tocca a: ${todayRoutine.title}` : 'Oggi tocca al tuo allenamento!'
                )
              ) : (
                language === 'en' ? 'Rest & Muscle Recovery Day' : 'Giorno di Riposo & Recupero Muscolare'
              )}
            </h1>

            {/* Description */}
            <p className="text-white/80 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
              {todaySchedule.isWorkoutDay ? (
                isTodayWorkoutDone ? (
                  language === 'en'
                    ? 'You checked off all your exercises for today. Hydrate, eat enough protein and rest up!'
                    : 'Hai spuntato tutti i tuoi esercizi per oggi. Bevi acqua, assumi proteine e riposati per ricostruire le fibre muscolari!'
                ) : (
                  todayRoutine
                    ? `${todayRoutine.exercises.length} esercizi in programma (${todayRoutine.exercises.map(e => e.name).slice(0, 3).join(', ')}...). Durata stimata ~${todayRoutine.estimatedDurationMin} minuti.`
                    : 'Preparati, riscaldati bene e segui gli esercizi.'
                )
              ) : (
                nextWorkoutDay
                  ? `I muscoli non crescono durante la palestra, ma nei giorni di riposo! Rilassati, dormi bene. Prossima sessione: ${nextWorkoutDay.dayName} (${nextWorkoutDay.assignedDayTag || 'Allenamento'}).`
                  : 'Giorno di rigenerazione muscolare e mentale per prepararsi alla prossima sessione.'
              )}
            </p>
          </div>

          {/* Primary CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            {todaySchedule.isWorkoutDay && !isTodayWorkoutDone && todayRoutine && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onStartWorkout(todayRoutine)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-slate-900 hover:bg-emerald-50 font-black text-sm shadow-xl shadow-slate-950/30 group transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                  <Play size={16} fill="currentColor" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {language === 'en' ? 'Start Today\'s Session' : 'Inizia Sessione di Oggi'}
                  </div>
                  <div className="text-slate-900 font-extrabold">
                    {todayRoutine.dayTag}
                  </div>
                </div>
              </motion.button>
            )}

            {/* If rest day, option to train anyway */}
            {!todaySchedule.isWorkoutDay && routines.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onStartWorkout(routines[0])}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all"
              >
                <Play size={14} fill="currentColor" />
                <span>{language === 'en' ? 'Train anyway today' : 'Vuoi allenarti comunque oggi?'}</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Quick Stats bar inside hero */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-5 border-t border-white/15">
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/10">
            <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider truncate">
              {language === 'en' ? 'This Week' : 'Questa Settimana'}
            </div>
            <div className="text-sm sm:text-xl font-black text-white mt-0.5 flex items-center gap-1.5 truncate">
              <Flame size={15} className="text-amber-400 shrink-0" />
              <span className="truncate">{stats.workoutsThisWeek} {language === 'en' ? 'sessions' : 'allenamenti'}</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/10">
            <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider truncate">
              {language === 'en' ? 'Total Workouts' : 'Totale Sessioni'}
            </div>
            <div className="text-sm sm:text-xl font-black text-white mt-0.5 flex items-center gap-1.5">
              <Trophy size={15} className="text-yellow-400 shrink-0" />
              <span>{stats.totalWorkouts}</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/10">
            <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider truncate">
              {language === 'en' ? 'Volume Lifted' : 'Volume Sollevato'}
            </div>
            <div className="text-sm sm:text-xl font-black text-white mt-0.5 flex items-center gap-1.5 truncate">
              <Activity size={15} className="text-emerald-300 shrink-0" />
              <span className="truncate">{stats.totalVolumeKg.toLocaleString()} kg</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/10">
            <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider truncate">
              {language === 'en' ? 'Total Time' : 'Tempo Totale'}
            </div>
            <div className="text-sm sm:text-xl font-black text-white mt-0.5 flex items-center gap-1.5 truncate">
              <Clock size={15} className="text-sky-300 shrink-0" />
              <span className="truncate">{stats.totalDurationMin} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation & action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Scrollable tabs on mobile */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab('routines')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'exercises'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen size={15} />
            <span>{language === 'en' ? 'Exercises & 3D Anatomy' : 'Esercizi & Anatomia'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {allExercises.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 ${
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
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setIsGeneratingWithAi(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
            >
              <Sparkles size={14} className="text-yellow-300" />
              <span>{language === 'en' ? 'AI Routine Generator' : 'Genera con Coach IA'}</span>
            </button>
            <button
              onClick={() => setIsCreatingRoutine(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shrink-0"
            >
              <Plus size={14} />
              <span>{language === 'en' ? 'New Routine' : 'Nuova Scheda'}</span>
            </button>
            <button
              onClick={handleResetToDefaultRoutines}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title={language === 'en' ? 'Reset starter routines' : 'Ripristina schede predefinite'}
            >
              <Layers size={15} />
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: ROUTINES & WORKOUTS */}
      {activeTab === 'routines' && (
        <div className="space-y-5">
          {routines.length === 0 ? (
            <div className="text-center py-12 px-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Dumbbell size={28} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'en' ? 'No workout routines found' : 'Nessuna scheda presente'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'en'
                    ? 'You have deleted all routines. Create a new one, generate one with AI Coach, or restore starter templates.'
                    : 'Hai rimosso tutte le schede. Puoi crearne una nuova, generarla con il Coach IA o ripristinare le schede predefinite.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsCreatingRoutine(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <Plus size={15} />
                  <span>{language === 'en' ? 'New Routine' : 'Nuova Scheda'}</span>
                </button>
                <button
                  onClick={handleResetToDefaultRoutines}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                >
                  <Layers size={15} />
                  <span>{language === 'en' ? 'Restore Defaults' : 'Ripristina Predefinite'}</span>
                </button>
              </div>
            </div>
          ) : (
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
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                            <Clock size={13} />
                            <span>~{routine.estimatedDurationMin} min</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRoutineToDelete(routine)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title={language === 'en' ? 'Delete routine' : 'Elimina scheda'}
                          >
                            <Trash2 size={14} />
                          </button>
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
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingRoutineWeights(routine)}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                            title={language === 'en' ? 'Edit routine loads and sets' : 'Modifica carichi e serie'}
                          >
                            <Edit3 size={12} />
                            <span>{language === 'en' ? 'Edit weights' : 'Modifica carichi'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-0.5 text-[11px]"
                          >
                            <span>{isExpanded ? (language === 'en' ? 'Hide details' : 'Comprimi') : (language === 'en' ? 'Show details' : 'Dettagli')}</span>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </div>
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
                            <Dumbbell size={11} className="text-emerald-500 group-hover:scale-110 transition-transform shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-none">{ex.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">({ex.sets.length}s)</span>
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
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                    <span className="shrink-0">{idx + 1}.</span>
                                    <span className="truncate">{ex.name}</span>
                                    <button
                                      onClick={() => handleOpenExerciseById(ex.exerciseId)}
                                      className="p-0.5 text-emerald-500 hover:text-emerald-600 rounded-md shrink-0"
                                      title={language === 'en' ? 'View form guide' : 'Vedi guida esecuzione'}
                                    >
                                      <Info size={13} />
                                    </button>
                                  </div>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                                    <span>
                                      {ex.sets.length} serie • {ex.sets[0]?.weightKg || 0} kg × {ex.sets[0]?.reps || 10} reps
                                    </span>
                                    {exerciseRecords[ex.exerciseId] && (
                                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                        💡 Ultimo: {exerciseRecords[ex.exerciseId].lastWeightKg} kg × {exerciseRecords[ex.exerciseId].lastReps} reps
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
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
          )}
        </div>
      )}

      {/* TAB 2: EXERCISE LIBRARY & 3D ANATOMY */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          {/* Search bar, Add Exercise Button & Muscle Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={language === 'en' ? 'Search exercise or muscle (e.g. chest, squat, lats)...' : 'Cerca esercizio o muscolo (es. panca, squat, dorsali, tricipiti)...'}
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

              <button
                type="button"
                onClick={() => setIsAddingCustomExercise(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0"
              >
                <Plus size={16} strokeWidth={3} />
                <span>{language === 'en' ? 'Add Custom Exercise' : 'Nuovo Esercizio'}</span>
              </button>
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
                    <div className="flex items-center gap-1.5">
                      {exercise.id.startsWith('custom-') && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                          Personalizzato
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-semibold capitalize">
                        {exercise.equipment}
                      </span>
                      {exercise.id.startsWith('custom-') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomExercise(exercise.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                          title="Elimina esercizio personalizzato"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
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
              className="w-full max-w-lg max-h-[90dvh] overflow-y-auto custom-scrollbar rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5"
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
                    {allExercises.map(guide => {
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

      {/* Modal: AI Workout Generator */}
      <AnimatePresence>
        {isGeneratingWithAi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[90dvh] overflow-y-auto custom-scrollbar rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {language === 'en' ? 'AI Coach: Personalized Workout' : 'Coach IA: Crea la Tua Scheda'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {language === 'en' ? 'Gemini designs a balanced program for your goals' : 'Gemini crea una scheda su misura per le tue esigenze'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGeneratingWithAi(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {aiError && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-semibold">
                  {aiError}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsAiLoading(true);
                  setAiError(null);
                  try {
                    const generated = await generateWorkoutRoutinesWithGemini({
                      daysPerWeek: aiDaysPerWeek,
                      goal: aiGoal === 'massa' ? 'Ipertrofia e aumento massa muscolare' :
                            aiGoal === 'definizione' ? 'Tonificazione e definizione muscolare' :
                            aiGoal === 'dimagrimento' ? 'Dimagrimento e brucia calorie' : 'Forza base e postura per chi ha iniziato da poco',
                      experienceLevel: aiExperience,
                      notes: aiCustomNotes.trim()
                    }, language);

                    if (generated && generated.length > 0) {
                      setRoutines(prev => [...generated, ...prev]);
                      setExpandedRoutineId(generated[0].id);
                      setIsGeneratingWithAi(false);
                    }
                  } catch (err: any) {
                    console.error('Failed to generate routine with Gemini', err);
                    setAiError(language === 'en' ? 'Generation failed. Check your connection or API key.' : 'Generazione fallita. Verifica la connessione o la chiave API.');
                  } finally {
                    setIsAiLoading(false);
                  }
                }}
                className="space-y-4"
              >
                {/* Frequency */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {language === 'en' ? 'Days Per Week' : 'Quante volte a settimana vuoi andare in palestra?'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map(days => (
                      <button
                        type="button"
                        key={`days-${days}`}
                        onClick={() => setAiDaysPerWeek(days)}
                        className={`py-2 rounded-xl text-xs font-black transition-all ${
                          aiDaysPerWeek === days
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {days} {language === 'en' ? 'Days' : 'Giorni'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {language === 'en' ? 'Primary Goal' : 'Qual è il tuo obiettivo principale?'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'massa', label: language === 'en' ? 'Muscle Gain / Mass' : 'Massa & Ipertrofia' },
                      { id: 'definizione', label: language === 'en' ? 'Toning & Shape' : 'Tonificazione & Definizione' },
                      { id: 'dimagrimento', label: language === 'en' ? 'Fat Loss / Cardio' : 'Dimagrimento & Brucia Calorie' },
                      { id: 'forza', label: language === 'en' ? 'Posture & Strength' : 'Postura & Forza Base' },
                    ].map(g => (
                      <button
                        type="button"
                        key={`goal-${g.id}`}
                        onClick={() => setAiGoal(g.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                          aiGoal === g.id
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience level */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {language === 'en' ? 'Experience Level' : 'Il tuo livello di esperienza'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAiExperience('beginner')}
                      className={`p-2 rounded-xl text-xs font-black transition-all ${
                        aiExperience === 'beginner'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {language === 'en' ? 'Beginner (Just started)' : 'Principiante (Appena iniziato)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiExperience('intermediate')}
                      className={`p-2 rounded-xl text-xs font-black transition-all ${
                        aiExperience === 'intermediate'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {language === 'en' ? 'Intermediate' : 'Intermedio'}
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Specific preferences or notes (optional)' : 'Note o preferenze speciali (facoltativo)'}
                  </label>
                  <input
                    type="text"
                    value={aiCustomNotes}
                    onChange={e => setAiCustomNotes(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Focus on chest & arms, only machines' : 'es. Focus braccia e petto, preferisco macchinari guidati'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={isAiLoading}
                    onClick={() => setIsGeneratingWithAi(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {language === 'en' ? 'Cancel' : 'Annulla'}
                  </button>
                  <button
                    type="submit"
                    disabled={isAiLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <Sparkles size={14} className={isAiLoading ? 'animate-spin' : ''} />
                    <span>{isAiLoading ? (language === 'en' ? 'Generating Plan...' : 'Creazione Scheda in corso...') : (language === 'en' ? 'Generate My Routine' : 'Genera la Mia Scheda')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Customize Weekly Schedule */}
      <AnimatePresence>
        {isEditingSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl max-h-[90dvh] overflow-y-auto custom-scrollbar rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Settings2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {language === 'en' ? 'Customize Your Weekly Schedule' : 'Personalizza i Tuoi Giorni di Allenamento'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {language === 'en' ? 'Choose which days you go to the gym and assign your routines' : 'Stabilisci in quali giorni vai in palestra e associa le tue schede'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingSchedule(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Fast Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'en' ? 'Quick Presets' : 'Combinazioni Consigliate:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('3-mon-wed-fri')}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all text-left"
                  >
                    <div className="font-black">3 Giorni</div>
                    <div className="text-[10px] text-slate-400">Lun - Mer - Ven</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('3-tue-thu-sat')}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all text-left"
                  >
                    <div className="font-black">3 Giorni</div>
                    <div className="text-[10px] text-slate-400">Mar - Gio - Sab</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('2-tue-thu')}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all text-left"
                  >
                    <div className="font-black">2 Giorni</div>
                    <div className="text-[10px] text-slate-400">Mar - Gio</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('4-upper-lower')}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all text-left"
                  >
                    <div className="font-black">4 Giorni</div>
                    <div className="text-[10px] text-slate-400">Lun-Mar-Gio-Ven</div>
                  </button>
                </div>
              </div>

              {/* Day-by-Day Editor */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'en' ? 'Edit Day-by-Day:' : 'Modifica Singoli Giorni:'}
                </label>
                {orderedWeekDays.map(day => (
                  <div
                    key={`edit-day-${day.dayIndex}`}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
                  >
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {day.dayName}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleDay(day.dayIndex)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          day.isWorkoutDay
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {day.isWorkoutDay ? 'Palestra' : 'Riposo'}
                      </button>
                    </div>

                    {day.isWorkoutDay && (
                      <select
                        value={day.assignedRoutineId || routines[0]?.id}
                        onChange={e => handleAssignRoutine(day.dayIndex, e.target.value)}
                        className="w-full sm:w-auto px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:max-w-[200px] truncate"
                      >
                        {routines.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.dayTag}: {r.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingSchedule(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20"
                >
                  {language === 'en' ? 'Save Schedule' : 'Salva Programma'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Weights & Sets for Routine */}
      <AnimatePresence>
        {editingRoutineWeights && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl max-h-[90dvh] overflow-y-auto custom-scrollbar rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {language === 'en' ? 'Edit Routine Weights & Sets' : 'Modifica Carichi & Serie'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {editingRoutineWeights.title} ({editingRoutineWeights.dayTag})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingRoutineWeights(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {editingRoutineWeights.exercises.map((ex, exIdx) => (
                  <div key={ex.id || exIdx} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-black flex items-center justify-center">{exIdx + 1}</span>
                        <span className="truncate max-w-[200px] sm:max-w-none">{ex.name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newSet = {
                            id: `s-${Date.now()}-${ex.sets.length + 1}`,
                            setNumber: ex.sets.length + 1,
                            reps: ex.sets[ex.sets.length - 1]?.reps || 10,
                            weightKg: ex.sets[ex.sets.length - 1]?.weightKg || 10,
                            completed: false
                          };
                          setEditingRoutineWeights(prev => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              exercises: prev.exercises.map(item => item.id === ex.id ? { ...item, sets: [...item.sets, newSet] } : item)
                            };
                          });
                        }}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
                      >
                        <Plus size={12} /> {language === 'en' ? 'Add Set' : 'Aggiungi Serie'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {ex.sets.map((set, sIdx) => (
                        <div key={set.id || sIdx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs">
                          <span className="font-bold text-slate-500 shrink-0 w-12 sm:w-16">Set #{sIdx + 1}:</span>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase hidden sm:inline">Kg:</span>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={set.weightKg}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setEditingRoutineWeights(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    exercises: prev.exercises.map(item => item.id === ex.id ? {
                                      ...item,
                                      sets: item.sets.map(s => s.id === set.id ? { ...s, weightKg: val } : s)
                                    } : item)
                                  };
                                });
                              }}
                              className="w-14 sm:w-16 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border text-center font-mono font-bold text-xs"
                            />
                            <span className="text-[10px] text-slate-400 font-bold">kg</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase hidden sm:inline">Reps:</span>
                            <span className="text-slate-400">×</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={set.reps}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setEditingRoutineWeights(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    exercises: prev.exercises.map(item => item.id === ex.id ? {
                                      ...item,
                                      sets: item.sets.map(s => s.id === set.id ? { ...s, reps: val } : s)
                                    } : item)
                                  };
                                });
                              }}
                              className="w-12 sm:w-14 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border text-center font-mono font-bold text-xs"
                            />
                            <span className="text-[10px] text-slate-400 font-bold">reps</span>
                          </div>

                          {ex.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoutineWeights(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    exercises: prev.exercises.map(item => item.id === ex.id ? {
                                      ...item,
                                      sets: item.sets.filter(s => s.id !== set.id)
                                    } : item)
                                  };
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRoutineWeights(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {language === 'en' ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editingRoutineWeights) {
                      setRoutines(prev => prev.map(r => r.id === editingRoutineWeights.id ? editingRoutineWeights : r));
                      setEditingRoutineWeights(null);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  {language === 'en' ? 'Save Weights' : 'Salva Nuovi Carichi'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Custom Exercise to Library */}
      <AnimatePresence>
        {isAddingCustomExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[90dvh] overflow-y-auto custom-scrollbar rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {language === 'en' ? 'Add Custom Exercise' : 'Aggiungi Nuovo Esercizio'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {language === 'en' ? 'Integrated into exercise library and 3D anatomy viewer' : 'Integrato nella biblioteca e nel modello anatomico 3D'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddingCustomExercise(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCustomExerciseSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Exercise Name *' : 'Nome Esercizio *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customExName}
                    onChange={e => setCustomExName(e.target.value)}
                    placeholder="es. Croci ai cavi alti, Hip Thrust con bilanciere, Face Pull..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* AI Auto-Fill Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{language === 'en' ? 'AI Coach Auto-Fill' : 'Compilazione Automatica con IA'}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-full">Gemini</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {language === 'en' ? 'Fills muscle group, setup, execution, mistakes & pro tip' : 'Compila per te muscoli, setup, esecuzione corretta ed errori'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!customExName.trim() || isAiFillingExercise}
                    onClick={handleAiFillExercise}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all shrink-0 active:scale-95"
                  >
                    {isAiFillingExercise ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{language === 'en' ? 'Generating...' : 'Generazione...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-yellow-300" />
                        <span>{language === 'en' ? 'Auto-Fill with AI' : 'Compila con IA'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Muscle Group' : 'Gruppo Muscolare'}
                    </label>
                    <select
                      value={customExMuscleGroup}
                      onChange={e => setCustomExMuscleGroup(e.target.value as MuscleGroup)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="chest">Petto (Chest)</option>
                      <option value="back">Dorso (Back)</option>
                      <option value="legs">Gambe (Legs)</option>
                      <option value="shoulders">Spalle (Shoulders)</option>
                      <option value="arms">Braccia (Arms)</option>
                      <option value="core">Addome (Core)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Equipment' : 'Attrezzo'}
                    </label>
                    <select
                      value={customExEquipment}
                      onChange={e => setCustomExEquipment(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="dumbbell">Manubri</option>
                      <option value="barbell">Bilanciere</option>
                      <option value="machine">Macchinario Guidato</option>
                      <option value="cables">Cavi</option>
                      <option value="bodyweight">Corpo Libero</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Primary Muscle(s)' : 'Muscolo Target'}
                    </label>
                    <input
                      type="text"
                      value={customExPrimaryMuscles}
                      onChange={e => setCustomExPrimaryMuscles(e.target.value)}
                      placeholder="es. Pettorali alti, Femorali..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? '3D Body View' : 'Visuale 3D Corpo'}
                    </label>
                    <div className="flex gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setCustomExViewType('front')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          customExViewType === 'front'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        Fronte
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomExViewType('back')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          customExViewType === 'back'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        Retro
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Setup & Positioning' : 'Setup & Posizionamento'}
                  </label>
                  <textarea
                    rows={2}
                    value={customExSetup}
                    onChange={e => setCustomExSetup(e.target.value)}
                    placeholder="es. Posiziona la panca a 30°, contrai le scapole e mantieni i piedi ben saldi a terra..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'en' ? 'Correct Execution' : 'Esecuzione Corretta'}
                  </label>
                  <textarea
                    rows={2}
                    value={customExExecution}
                    onChange={e => setCustomExExecution(e.target.value)}
                    placeholder="es. Scendi in 3 secondi controllando il carico, sfiora il petto e risali senza bloccare i gomiti..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Common Mistakes to Avoid' : 'Errori Comuni da Evitare'}
                    </label>
                    <textarea
                      rows={2}
                      value={customExMistakes}
                      onChange={e => setCustomExMistakes(e.target.value)}
                      placeholder="es. Gomiti a 90°, rimbalzo sul petto (separati da a capo)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'en' ? 'Pro Tip / Mind-Muscle' : 'Consiglio del Coach'}
                    </label>
                    <textarea
                      rows={2}
                      value={customExTip}
                      onChange={e => setCustomExTip(e.target.value)}
                      placeholder="es. Pensa a spingere i gomiti l'uno verso l'altro per isolare il petto..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomExercise(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {language === 'en' ? 'Cancel' : 'Annulla'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    {language === 'en' ? 'Save Exercise' : 'Salva Esercizio'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Routine Confirmation Modal */}
      <AnimatePresence>
        {routineToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {language === 'en' ? 'Delete Routine?' : 'Eliminare la Scheda?'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'en' 
                    ? `Are you sure you want to delete "${routineToDelete.title}"? This cannot be undone.`
                    : `Sei sicuro di voler eliminare "${routineToDelete.title}"? La scheda verrà rimossa anche dal tuo programma settimanale.`}
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRoutineToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  {language === 'en' ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRoutine(routineToDelete.id)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all active:scale-95"
                >
                  {language === 'en' ? 'Delete' : 'Elimina'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FitnessView;
