import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { Task, SubTask, Priority, User, Routine, RoutineTask, RoutineTemplate, Appointment, Goal } from './types.ts';
import Header from './components/Header.tsx';
import AuthenticationView from './components/AuthenticationView.tsx';
import TasksView from './components/TasksView.tsx';
import RoutinesView from './components/RoutinesView.tsx';
import GoalsView from './components/GoalsView.tsx';
import CalendarView from './components/CalendarView.tsx';
import AnalyticsView from './components/AnalyticsView.tsx';
import UserProfileView from './components/UserProfileView.tsx';
import BottomNav, { View } from './components/BottomNav.tsx';
import { supabase, SUPABASE_CONFIG_ERROR } from './supabaseClient.ts';
import { generateSubtasksFromGemini, generateRoutineTasks, generateMotivationalQuote, GEMINI_CONFIG_ERROR } from './services/geminiService.ts';
import ConfigurationRequiredView from './components/ConfigurationRequiredView.tsx';

function App() {
  if (SUPABASE_CONFIG_ERROR || GEMINI_CONFIG_ERROR) {
    return <ConfigurationRequiredView supabaseError={SUPABASE_CONFIG_ERROR} geminiError={GEMINI_CONFIG_ERROR} />;
  }

  const newId = () => crypto.randomUUID();

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedPref = window.localStorage.getItem('darkMode');
        if (storedPref !== null) return JSON.parse(storedPref);
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  const [view, setView] = useState<View>('tasks');
  const [subtitle, setSubtitle] = useState('Caricamento frase del giorno...');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  const [generatingTaskId, setGeneratingTaskId] = useState<string | null>(null);
  const [generatingRoutineId, setGeneratingRoutineId] = useState<string | null>(null);

  useEffect(() => {
    generateMotivationalQuote().then(setSubtitle);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
            setUser({
                id: session.user.id,
                email: session.user.email!,
                displayName: session.user.user_metadata.display_name || session.user.email,
            });
        } else {
            setUser(null);
        }
        setAuthLoading(false); 
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async (userId: string) => {
    setDataLoading(true);
    setDataError(null);
    try {
        const [tasksRes, subTasksRes, routinesRes, routineTasksRes, templatesRes, appointmentsRes, goalsRes] = await Promise.all([
            supabase.from('tasks').select('*').eq('user_id', userId),
            supabase.from('sub_tasks').select('*').eq('user_id', userId),
            supabase.from('routines').select('*').eq('user_id', userId),
            supabase.from('routine_tasks').select('*').eq('user_id', userId),
            supabase.from('routine_templates').select('*').eq('user_id', userId),
            supabase.from('appointments').select('*').eq('user_id', userId),
            supabase.from('goals').select('*').eq('user_id', userId),
        ]);

        const results = [tasksRes, subTasksRes, routinesRes, routineTasksRes, templatesRes, appointmentsRes, goalsRes];
        const failedResult = results.find(res => res.error);
        if (failedResult) throw failedResult.error;
        
        const tasksData = tasksRes.data || [];
        const subTasksData = subTasksRes.data || [];
        const tasksWithSubTasks = tasksData.map(task => ({
            ...task,
            dueDate: task.due_date,
            createdAt: task.created_at,
            completedAt: task.completed_at,
            subTasks: subTasksData.filter(sub => sub.task_id === task.id)
        }));
        setTasks(tasksWithSubTasks);

        const routinesData = routinesRes.data || [];
        const routineTasksData = routineTasksRes.data || [];
        const routinesWithTasks = routinesData.map(routine => ({
            ...routine,
            tasks: routineTasksData.filter(task => task.routine_id === routine.id)
        }));
        setRoutines(routinesWithTasks);
        
        setTemplates(templatesRes.data?.map((t: any) => ({ ...t, tasks: t.tasks || [] })) || []);
        setAppointments(appointmentsRes.data || []);
        setGoals(goalsRes.data?.map((g: any) => ({ ...g, targetDate: g.target_date, linkedTaskIds: g.linked_task_ids || [] })) || []);

    } catch (error: any) {
        console.error("Error fetching data:", error);
        setDataError("Impossibile caricare i dati. Controlla la tua connessione e riprova.");
    } finally {
        setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchData(user.id);
    } else {
      setTasks([]);
      setRoutines([]);
      setTemplates([]);
      setAppointments([]);
      setGoals([]);
    }
  }, [user?.id, fetchData]);
  
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const handleLogout = () => supabase.auth.signOut();
  const handleUpdateUser = (displayName: string) => user && setUser({ ...user, displayName });

  const handleAddTask = async (text: string, priority: Priority, dueDate: string | null) => {
    if (!user) return;
    const newTask: Task = { id: newId(), text, priority, dueDate, completed: false, subTasks: [], createdAt: new Date().toISOString(), completedAt: null };
    setTasks(prev => [newTask, ...prev]);
    const { error } = await supabase.from('tasks').insert({ id: newTask.id, user_id: user.id, text, priority, due_date: dueDate, completed: false });
    if (error) {
      console.error(error);
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
    }
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = !task.completed;
    const newCompletedAt = newStatus ? new Date().toISOString() : null;
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: newStatus, completedAt: newCompletedAt } : t));
    const { error } = await supabase.from('tasks').update({ completed: newStatus, completed_at: newCompletedAt }).eq('id', id);
    if (error) {
        console.error(error);
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !newStatus, completedAt: task.completedAt } : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const oldTasks = tasks;
    setTasks(tasks.filter(t => t.id !== id));
    await supabase.from('sub_tasks').delete().eq('task_id', id);
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
        console.error(error);
        setTasks(oldTasks);
    }
  };

  const handleUpdateTask = async (id: string, newText: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, text: newText } : t));
    await supabase.from('tasks').update({ text: newText }).eq('id', id);
  };

  const handleAddSubTask = async (taskId: string, subTaskText: string) => {
    if (!user) return;
    const newSubTask: SubTask = { id: newId(), text: subTaskText, completed: false };
    setTasks(tasks.map(t => t.id === taskId ? {...t, subTasks: [...t.subTasks, newSubTask]} : t));
    await supabase.from('sub_tasks').insert({ ...newSubTask, task_id: taskId, user_id: user.id });
  };

  const handleToggleSubTask = async (taskId: string, subTaskId: string) => {
    const newStatus = tasks.find(t=>t.id===taskId)?.subTasks.find(st=>st.id===subTaskId)?.completed === false;
    setTasks(tasks.map(t => t.id === taskId ? {
        ...t,
        subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, completed: newStatus } : st)
    } : t));
    await supabase.from('sub_tasks').update({ completed: newStatus }).eq('id', subTaskId);
  };

  const handleDeleteSubTask = async (taskId: string, subTaskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? {...t, subTasks: t.subTasks.filter(st => st.id !== subTaskId)} : t));
    await supabase.from('sub_tasks').delete().eq('id', subTaskId);
  };
  
  const handleUpdateSubTask = async (taskId: string, subTaskId: string, newText: string) => {
    setTasks(tasks.map(t => t.id === taskId ? {
        ...t,
        subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, text: newText } : st)
    } : t));
    await supabase.from('sub_tasks').update({ text: newText }).eq('id', subTaskId);
  };
  
  const handleGenerateSubtasks = async (taskId: string, taskText: string) => {
    if (!user) return;
    setGeneratingTaskId(taskId);
    try {
        const subtaskTexts = await generateSubtasksFromGemini(taskText);
        if (subtaskTexts.length === 0) return;
        const newSubtasks: SubTask[] = subtaskTexts.map(text => ({ id: newId(), text, completed: false }));
        setTasks(tasks.map(t => t.id === taskId ? {...t, subTasks: [...t.subTasks, ...newSubtasks]} : t));
        const newDbSubtasks = newSubtasks.map(sub => ({ ...sub, task_id: taskId, user_id: user.id }));
        await supabase.from('sub_tasks').insert(newDbSubtasks);
    } finally {
        setGeneratingTaskId(null);
    }
  };

  const handleAddRoutine = async (name: string) => {
    if (!user) return;
    const newRoutine: Routine = { id: newId(), name, tasks: [] };
    setRoutines(prev => [newRoutine, ...prev]);
    await supabase.from('routines').insert({ id: newRoutine.id, user_id: user.id, name });
  };

  const handleDeleteRoutine = async (id: string) => {
    setRoutines(routines.filter(r => r.id !== id));
    await supabase.from('routine_tasks').delete().eq('routine_id', id);
    await supabase.from('routines').delete().eq('id', id);
  };

  const handleAddRoutineTask = async (routineId: string, taskText: string) => {
    if (!user) return;
    const newTask: RoutineTask = { id: newId(), text: taskText };
    setRoutines(routines.map(r => r.id === routineId ? {...r, tasks: [...r.tasks, newTask]} : r));
    await supabase.from('routine_tasks').insert({ ...newTask, routine_id: routineId, user_id: user.id });
  };

  const handleDeleteRoutineTask = async (routineId: string, taskId: string) => {
    setRoutines(routines.map(r => r.id === routineId ? {...r, tasks: r.tasks.filter(t => t.id !== taskId)} : r));
    await supabase.from('routine_tasks').delete().eq('id', taskId);
  };
  
  const handleGenerateRoutineTasks = async (routineId: string, routineName: string) => {
    if (!user) return;
    setGeneratingRoutineId(routineId);
    try {
        const taskTexts = await generateRoutineTasks(routineName);
        if (taskTexts.length === 0) return;
        const newTasks: RoutineTask[] = taskTexts.map(text => ({ id: newId(), text }));
        setRoutines(routines.map(r => r.id === routineId ? {...r, tasks: [...r.tasks, ...newTasks]} : r));
        const newDbTasks = newTasks.map(task => ({ ...task, routine_id: routineId, user_id: user.id }));
        await supabase.from('routine_tasks').insert(newDbTasks);
    } finally {
        setGeneratingRoutineId(null);
    }
  };
  
  const handleSaveAsTemplate = async (routineId: string) => {
      if (!user) return;
      const routine = routines.find(r => r.id === routineId);
      if (routine) {
          const newTemplate: RoutineTemplate = { id: newId(), name: `${routine.name} (Modello)`, tasks: routine.tasks.map(({text}) => ({text})) };
          setTemplates(prev => [newTemplate, ...prev]);
          await supabase.from('routine_templates').insert({ id: newTemplate.id, user_id: user.id, name: newTemplate.name, tasks: newTemplate.tasks });
      }
  };
  
  const handleCreateFromTemplate = async (templateId: string) => {
    if (!user) return;
    const template = templates.find(t => t.id === templateId);
    if (template) {
        const newRoutine: Routine = { id: newId(), name: template.name.replace(' (Modello)', '').trim(), tasks: [] };
        const { error: routineError } = await supabase.from('routines').insert({ id: newRoutine.id, user_id: user.id, name: newRoutine.name });
        if (routineError) return;
        const newTasks: RoutineTask[] = template.tasks.map(t => ({ ...t, id: newId() }));
        const newDbTasks = newTasks.map(task => ({ ...task, routine_id: newRoutine.id, user_id: user.id }));
        await supabase.from('routine_tasks').insert(newDbTasks);
        setRoutines(prev => [{ ...newRoutine, tasks: newTasks }, ...prev]);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
      setTemplates(templates.filter(t => t.id !== templateId));
      await supabase.from('routine_templates').delete().eq('id', templateId);
  };

  const handleAddAppointment = async (appointment: Omit<Appointment, 'id'>) => {
      if(!user) return;
      const newAppointment: Appointment = { id: newId(), ...appointment };
      setAppointments(prev => [...prev, newAppointment].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
      await supabase.from('appointments').insert({ id: newAppointment.id, user_id: user.id, ...appointment});
  };

  const handleDeleteAppointment = async (id: string) => {
      setAppointments(appointments.filter(a => a.id !== id));
      await supabase.from('appointments').delete().eq('id', id);
  };

  const handleAddGoal = async (goal: Omit<Goal, 'id' | 'completed' | 'linkedTaskIds'>) => {
      if(!user) return;
      const newGoal: Goal = { id: newId(), completed: false, linkedTaskIds: [], ...goal };
      setGoals(prev => [newGoal, ...prev]);
      await supabase.from('goals').insert({id: newGoal.id, user_id: user.id, title: newGoal.title, description: newGoal.description, target_date: newGoal.targetDate, completed: false, linked_task_ids: []});
  };
  
  const handleUpdateGoal = async (updatedGoalData: Omit<Goal, 'completed' | 'linkedTaskIds'>) => {
      setGoals(goals.map(g => g.id === updatedGoalData.id ? { ...g, ...updatedGoalData } : g));
      await supabase.from('goals').update({ title: updatedGoalData.title, description: updatedGoalData.description, target_date: updatedGoalData.targetDate }).eq('id', updatedGoalData.id);
  };

  const handleDeleteGoal = async (id: string) => {
      setGoals(goals.filter(g => g.id !== id));
      await supabase.from('goals').delete().eq('id', id);
  };

  const handleToggleGoal = async (id: string) => {
      const goal = goals.find(g => g.id === id);
      if(!goal) return;
      const newStatus = !goal.completed;
      setGoals(goals.map(g => g.id === id ? { ...g, completed: newStatus } : g));
      await supabase.from('goals').update({ completed: newStatus }).eq('id', id);
  };
  
  const handleToggleLinkTask = async (goalId: string, taskId: string) => {
      const goal = goals.find(g => g.id === goalId);
      if(!goal) return;
      const newLinkedTaskIds = goal.linkedTaskIds.includes(taskId) ? goal.linkedTaskIds.filter(id => id !== taskId) : [...goal.linkedTaskIds, taskId];
      setGoals(goals.map(g => g.id === goalId ? { ...g, linkedTaskIds: newLinkedTaskIds } : g));
      await supabase.from('goals').update({ linked_task_ids: newLinkedTaskIds }).eq('id', goalId);
  };
  
  const currentViewComponent = useMemo(() => {
    switch(view) {
        case 'tasks':
            return <TasksView 
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={handleUpdateTask}
                onAddSubTask={handleAddSubTask}
                onToggleSubTask={handleToggleSubTask}
                onDeleteSubTask={handleDeleteSubTask}
                onUpdateSubTask={handleUpdateSubTask}
                onGenerateSubtasks={handleGenerateSubtasks}
                generatingTaskId={generatingTaskId}
            />;
        case 'routines':
            return <RoutinesView
                routines={routines}
                templates={templates}
                onAddRoutine={handleAddRoutine}
                onDeleteRoutine={handleDeleteRoutine}
                onAddRoutineTask={handleAddRoutineTask}
                onDeleteRoutineTask={handleDeleteRoutineTask}
                onGenerateTasks={handleGenerateRoutineTasks}
                generatingRoutineId={generatingRoutineId}
                onSaveAsTemplate={handleSaveAsTemplate}
                onCreateFromTemplate={handleCreateFromTemplate}
                onDeleteTemplate={handleDeleteTemplate}
            />;
        case 'goals':
            return <GoalsView
                goals={goals}
                tasks={tasks}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
                onToggleGoal={handleToggleGoal}
                onToggleLinkTask={handleToggleLinkTask}
            />;
        case 'calendar':
            return <CalendarView 
                appointments={appointments}
                onAddAppointment={handleAddAppointment}
                onDeleteAppointment={handleDeleteAppointment}
            />;
        case 'analytics':
            return <AnalyticsView tasks={tasks} />;
        case 'profile':
            return user ? <UserProfileView user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} /> : null;
        default:
            return <h2>View not found</h2>;
    }
  }, [view, tasks, routines, templates, appointments, goals, user, generatingTaskId, generatingRoutineId]);

  const renderMainContent = () => {
    if (dataLoading) return <div className="text-center p-8 text-slate-500 dark:text-slate-400">Caricamento dei tuoi dati...</div>;
    if (dataError) return (
      <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 rounded-lg">
        <p className="font-semibold text-red-700 dark:text-red-300">{dataError}</p>
        <button onClick={() => user && fetchData(user.id)} className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Riprova</button>
      </div>
    );
    return currentViewComponent;
  };

  if (authLoading) return <div className="bg-slate-100 dark:bg-[#020617] min-h-screen flex items-center justify-center text-slate-500">Verifica in corso...</div>;
  if (!session || !user) return <AuthenticationView />;

  return (
    <div className="bg-slate-100 dark:bg-[#020617] min-h-screen font-sans">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        onSetView={setView} 
        subtitle={subtitle} 
      />
      <main className="max-w-4xl mx-auto p-4 pb-24">{renderMainContent()}</main>
      <BottomNav currentView={view} onSetView={setView} />
    </div>
  );
}

export default App;