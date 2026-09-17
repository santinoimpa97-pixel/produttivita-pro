import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Language, getTranslator } from './i18n';
import { Session } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Task,
  SubTask,
  Priority,
  User,
  Routine,
  RoutineTask,
  RoutineTemplate,
  Appointment,
  Goal,
  Note,
  AssistantProfile,
  ChatMessage,
} from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import RoutinesView from './components/RoutinesView';
import GoalsView from './components/GoalsView';
import CalendarView from './components/CalendarView';
import NotesView from './components/NotesView';
import ProfileView from './components/ProfileView';
import AssistantView from './components/AssistantView';
import CommandMenu from './components/CommandMenu';
import BottomNav, { View } from './components/BottomNav';
import { supabase } from './supabaseClient';
import { generateSubtasksFromGemini, generateRoutineTasks, generateMotivationalQuote, chatWithAssistant } from './services/geminiService';
import { registerServiceWorker } from './services/notificationService';
import { playTaskCompleteSound, triggerCelebrationConfetti } from './services/audioService';
import { exportAllDataJSON } from './services/exportService';
import { LanguageContext } from './LanguageContext';

function App() {
  const newId = () => crypto.randomUUID();

  // Register service worker for push notifications on app launch
  useEffect(() => { 
    registerServiceWorker(); 
  }, []);

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'it';
  });
  const t = useMemo(() => getTranslator(language), [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // State
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

  // Default view is now Dashboard
  const [view, setView] = useState<View>('dashboard');
  const [subtitle, setSubtitle] = useState(() => getTranslator(((localStorage.getItem('language') as Language) || 'it'))('header_subtitle_loading'));
  
  // Command Menu State
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  // Today ISO Date string (YYYY-MM-DD)
  const todayISO = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Assistant States
  const [assistantProfile, setAssistantProfile] = useState<AssistantProfile>({ bio: '', strengths: '', weaknesses: '', rules: '' });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [assistantGenerating, setAssistantGenerating] = useState(false);
  
  // AI Loading States
  const [generatingTaskId, setGeneratingTaskId] = useState<string | null>(null);
  const [generatingRoutineId, setGeneratingRoutineId] = useState<string | null>(null);

  // Motivational Quote
  const [isRefreshingQuote, setIsRefreshingQuote] = useState(false);

  const handleRefreshQuote = async () => {
    setIsRefreshingQuote(true);
    try {
      const quote = await generateMotivationalQuote(language);
      setSubtitle(quote);
    } finally {
      setIsRefreshingQuote(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      const fetchQuote = async () => {
        setSubtitle(t('header_subtitle_loading'));
        const quote = await generateMotivationalQuote(language);
        setSubtitle(quote);
      };
      fetchQuote();
    }
  }, [user?.id, language]);

  // Dark mode effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Auth effect
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

  // Data fetching function
  const fetchData = useCallback(async (userId: string) => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [tasksRes, subTasksRes, routinesRes, routineTasksRes, templatesRes, appointmentsRes, goalsRes, notesRes, profileRes, messagesRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId),
        supabase.from('sub_tasks').select('*').eq('user_id', userId),
        supabase.from('routines').select('*').eq('user_id', userId),
        supabase.from('routine_tasks').select('*').eq('user_id', userId),
        supabase.from('routine_templates').select('*').eq('user_id', userId),
        supabase.from('appointments').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('notes').select('*').eq('user_id', userId),
        supabase.from('assistant_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('assistant_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      ]);

      const results = [tasksRes, subTasksRes, routinesRes, routineTasksRes, templatesRes, appointmentsRes, goalsRes, notesRes];
      const failedResult = results.find(res => res.error);
      if (failedResult) throw failedResult.error;
      if (messagesRes.error) throw messagesRes.error;
      
      const tasksData = tasksRes.data || [];
      const subTasksData = subTasksRes.data || [];
      const tasksWithSubTasks = tasksData.map(task => ({
        ...task,
        dueDate: task.due_date,
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
      setNotes(notesRes.data?.map((n: any) => ({ ...n, updatedAt: n.updated_at })) || []);
      
      if (profileRes.data) {
        setAssistantProfile({
          bio: profileRes.data.bio || '',
          strengths: profileRes.data.strengths || '',
          weaknesses: profileRes.data.weaknesses || '',
          rules: profileRes.data.rules || ''
        });
      }
      
      setChatHistory(messagesRes.data?.map((m: any) => ({ id: m.id, role: m.role as 'user' | 'model', content: m.content })) || []);

    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      setDataError(t('error_load'));
    } finally {
      setDataLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (user?.id) {
      fetchData(user.id);
    } else {
      setTasks([]);
      setRoutines([]);
      setTemplates([]);
      setAppointments([]);
      setGoals([]);
      setNotes([]);
      setAssistantProfile({ bio: '', strengths: '', weaknesses: '', rules: '' });
      setChatHistory([]);
    }
  }, [user?.id, fetchData]);
  
  // Handlers
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const handleLogout = () => supabase.auth.signOut();
  const handleUpdateUser = (displayName: string) => user && setUser({ ...user, displayName });

  // Task Handlers
  const handleAddTask = async (text: string, priority: Priority, dueDate: string | null) => {
    if (!user) return;
    const newTask: Task = { id: newId(), text, priority, dueDate, completed: false, subTasks: [] };
    setTasks(prev => [newTask, ...prev]);
    const { error } = await supabase.from('tasks').insert({ 
      id: newTask.id, 
      user_id: user.id, 
      text, 
      priority, 
      due_date: dueDate, 
      completed: false 
    });
    if (error) {
      console.error("Failed to add task:", error.message);
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
    }
  };

  const handleToggleTask = async (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = !task.completed;

    if (newStatus) {
      playTaskCompleteSound();
      const remainingToday = tasks.filter(t => t.dueDate === todayISO && !t.completed && t.id !== id).length;
      if (remainingToday === 0 && tasks.some(t => t.dueDate === todayISO)) {
        triggerCelebrationConfetti();
      }
    }

    setTasks(tasks.map(t => t.id === id ? { ...t, completed: newStatus } : t));
    const { error } = await supabase.from('tasks').update({ completed: newStatus }).eq('user_id', user.id).eq('id', id);
    if (error) {
      console.error("Failed to toggle task:", error.message);
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !newStatus } : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    const oldTasks = tasks;
    setTasks(tasks.filter(t => t.id !== id));
    
    const { error: subtasksError } = await supabase.from('sub_tasks').delete().eq('user_id', user.id).eq('task_id', id);
    if (subtasksError) {
      console.error("Error deleting subtasks:", subtasksError.message);
      setTasks(oldTasks);
      return;
    }
    
    const { error } = await supabase.from('tasks').delete().eq('user_id', user.id).eq('id', id);
    if (error) {
      console.error("Failed to delete task:", error.message);
      setTasks(oldTasks);
    }
  };

  const handleUpdateTask = async (id: string, newText: string) => {
    if (!user) return;
    const oldTasks = tasks;
    setTasks(tasks.map(t => t.id === id ? { ...t, text: newText } : t));
    const { error } = await supabase.from('tasks').update({ text: newText }).eq('user_id', user.id).eq('id', id);
    if (error) {
      console.error("Failed to update task:", error.message);
      setTasks(oldTasks);
    }
  };

  // SubTask Handlers
  const handleAddSubTask = async (taskId: string, subTaskText: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubTask: SubTask = { id: newId(), text: subTaskText, completed: false };
    const dbSubTask = { ...newSubTask, task_id: taskId, user_id: user.id };
    
    const oldTasks = tasks;
    setTasks(tasks.map(t => t.id === taskId ? {...t, subTasks: [...t.subTasks, newSubTask]} : t));

    const { error } = await supabase.from('sub_tasks').insert(dbSubTask);
    if (error) {
      console.error("Failed to add subtask:", error.message);
      setTasks(oldTasks);
    }
  };

  const handleToggleSubTask = async (taskId: string, subTaskId: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const subTask = task.subTasks.find(st => st.id === subTaskId);
    if (!subTask) return;
    const newStatus = !subTask.completed;

    const oldTasks = tasks;
    setTasks(tasks.map(t => t.id === taskId ? {
      ...t,
      subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, completed: newStatus } : st)
    } : t));

    const { error } = await supabase.from('sub_tasks').update({ completed: newStatus }).eq('user_id', user.id).eq('id', subTaskId);
    if (error) {
      console.error("Failed to toggle subtask:", error.message);
      setTasks(oldTasks);
    }
  };

  const handleDeleteSubTask = async (taskId: string, subTaskId: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const oldTasks = tasks;
    setTasks(tasks.map(t => t.id === taskId ? {...t, subTasks: t.subTasks.filter(st => st.id !== subTaskId)} : t));

    const { error } = await supabase.from('sub_tasks').delete().eq('user_id', user.id).eq('id', subTaskId);
    if (error) {
      console.error("Failed to delete subtask:", error.message);
      setTasks(oldTasks);
    }
  };
  
  const handleUpdateSubTask = async (taskId: string, subTaskId: string, newText: string) => {
    if (!user) return;
    const oldTasks = tasks;
    setTasks(tasks.map(t => t.id === taskId ? {
      ...t,
      subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, text: newText } : st)
    } : t));

    const { error } = await supabase.from('sub_tasks').update({ text: newText }).eq('user_id', user.id).eq('id', subTaskId);
    if (error) {
      console.error("Failed to update subtask:", error.message);
      setTasks(oldTasks);
    }
  };
  
  // AI Subtasks Generation with Language passed
  const handleGenerateSubtasks = async (taskId: string, taskText: string) => {
    if (!user) return;
    setGeneratingTaskId(taskId);
    try {
      const task = tasks.find(t => t.id === taskId);
      if(!task) return;

      const subtaskTexts = await generateSubtasksFromGemini(taskText, language);
      if (subtaskTexts.length === 0) return;

      const newSubtasks: SubTask[] = subtaskTexts.map(text => ({ id: newId(), text, completed: false }));
      const newDbSubtasks = newSubtasks.map(sub => ({ ...sub, task_id: taskId, user_id: user.id }));

      const oldTasks = tasks;
      setTasks(tasks.map(t => t.id === taskId ? {...t, subTasks: [...t.subTasks, ...newSubtasks]} : t));
      
      const { error } = await supabase.from('sub_tasks').insert(newDbSubtasks);
      if(error) {
        console.error("Failed to bulk insert generated subtasks:", error.message);
        setTasks(oldTasks);
      }
    } finally {
      setGeneratingTaskId(null);
    }
  };

  // Routine Handlers
  const handleAddRoutine = async (name: string) => {
    if (!user) return;
    const newRoutine: Routine = { id: newId(), name, tasks: [] };
    setRoutines(prev => [newRoutine, ...prev]);
    const { error } = await supabase.from('routines').insert({ id: newRoutine.id, user_id: user.id, name });
    if (error) {
      console.error("Failed to add routine:", error.message);
      setRoutines(prev => prev.filter(r => r.id !== newRoutine.id));
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!user) return;
    const oldRoutines = routines;
    setRoutines(routines.filter(r => r.id !== id));
    
    const { error: tasksError } = await supabase.from('routine_tasks').delete().eq('user_id', user.id).eq('routine_id', id);
    if (tasksError) {
      console.error("Error deleting routine tasks:", tasksError.message);
      setRoutines(oldRoutines);
      return;
    }

    const { error: routineError } = await supabase.from('routines').delete().eq('user_id', user.id).eq('id', id);
    if (routineError) {
      console.error("Error deleting routine:", routineError.message);
      setRoutines(oldRoutines);
    }
  };

  const handleAddRoutineTask = async (routineId: string, taskText: string) => {
    if (!user) return;
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    const newTask: RoutineTask = { id: newId(), text: taskText, completed: false };
    const dbTask = { ...newTask, routine_id: routineId, user_id: user.id };
    
    const oldRoutines = routines;
    setRoutines(routines.map(r => r.id === routineId ? {...r, tasks: [...r.tasks, newTask]} : r));

    const { error } = await supabase.from('routine_tasks').insert(dbTask);
    if (error) {
      console.error("Failed to add routine task:", error.message);
      setRoutines(oldRoutines);
    }
  };

  const handleDeleteRoutineTask = async (routineId: string, taskId: string) => {
    if (!user) return;
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    const oldRoutines = routines;
    setRoutines(routines.map(r => r.id === routineId ? {...r, tasks: r.tasks.filter(t => t.id !== taskId)} : r));

    const { error } = await supabase.from('routine_tasks').delete().eq('user_id', user.id).eq('id', taskId);
    if (error) {
      console.error("Failed to delete routine task:", error.message);
      setRoutines(oldRoutines);
    }
  };

  const handleToggleRoutineTask = async (routineId: string, taskId: string) => {
    if (!user) return;
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    const task = routine.tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = !task.completed;

    const oldRoutines = routines;
    setRoutines(routines.map(r => r.id === routineId ? {
      ...r,
      tasks: r.tasks.map(t => t.id === taskId ? { ...t, completed: newStatus } : t)
    } : r));

    const { error } = await supabase.from('routine_tasks').update({ completed: newStatus }).eq('user_id', user.id).eq('id', taskId);
    if (error) {
      console.error("Failed to toggle routine task:", error.message);
      setRoutines(oldRoutines);
    }
  };

  const handleResetRoutineTasks = async (routineId: string) => {
    if (!user) return;
    const routine = routines.find(r => r.id === routineId);
    if (!routine || !routine.tasks.some(t => t.completed)) return;

    const oldRoutines = routines;
    setRoutines(routines.map(r => r.id === routineId ? {
      ...r,
      tasks: r.tasks.map(t => ({ ...t, completed: false }))
    } : r));

    const taskIds = routine.tasks.map(t => t.id);
    const { error } = await supabase.from('routine_tasks').update({ completed: false }).eq('user_id', user.id).in('id', taskIds);
    if (error) {
      console.error("Failed to reset routine tasks:", error.message);
      setRoutines(oldRoutines);
    }
  };
  
  // AI Routine Tasks Generation with Language passed
  const handleGenerateRoutineTasks = async (routineId: string, routineName: string) => {
    if (!user) return;
    setGeneratingRoutineId(routineId);
    try {
      const routine = routines.find(r => r.id === routineId);
      if(!routine) return;

      const taskTexts = await generateRoutineTasks(routineName, language);
      if (taskTexts.length === 0) return;

      const newTasks: RoutineTask[] = taskTexts.map(text => ({ id: newId(), text, completed: false }));
      const newDbTasks = newTasks.map(task => ({ ...task, routine_id: routineId, user_id: user.id }));

      const oldRoutines = routines;
      setRoutines(routines.map(r => r.id === routineId ? {...r, tasks: [...r.tasks, ...newTasks]} : r));
      
      const { error } = await supabase.from('routine_tasks').insert(newDbTasks);
      if(error) {
        console.error("Failed to bulk insert generated routine tasks:", error.message);
        setRoutines(oldRoutines);
      }
    } finally {
      setGeneratingRoutineId(null);
    }
  };
  
  // Template Handlers
  const handleSaveAsTemplate = async (routineId: string) => {
    if (!user) return;
    const routine = routines.find(r => r.id === routineId);
    if (routine) {
      const newTemplate: RoutineTemplate = { id: newId(), name: `${routine.name} ${t('routines_template_suffix')}`, tasks: routine.tasks.map(({text}) => ({text})) };
      setTemplates(prev => [newTemplate, ...prev]);
      const { error } = await supabase.from('routine_templates').insert({ id: newTemplate.id, user_id: user.id, name: newTemplate.name, tasks: newTemplate.tasks });
      if(error) {
        console.error("Failed to save template:", error.message);
        setTemplates(prev => prev.filter(t => t.id !== newTemplate.id));
      }
    }
  };
  
  const handleCreateFromTemplate = async (templateId: string) => {
    if (!user) return;
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newRoutine: Routine = { id: newId(), name: template.name.replace(` ${t('routines_template_suffix')}`, '').trim(), tasks: [] };
      const { error: routineError } = await supabase.from('routines').insert({ id: newRoutine.id, user_id: user.id, name: newRoutine.name });
      if (routineError) {
        console.error(routineError.message);
        return;
      }

      const newTasks: RoutineTask[] = template.tasks.map(t => ({ text: t.text, id: newId(), completed: false }));
      const newDbTasks = newTasks.map(task => ({ ...task, routine_id: newRoutine.id, user_id: user.id }));
      
      const { error: tasksError } = await supabase.from('routine_tasks').insert(newDbTasks);
      if (tasksError) {
        console.error(tasksError.message);
        await supabase.from('routines').delete().eq('id', newRoutine.id);
        return;
      }
      
      setRoutines(prev => [{ ...newRoutine, tasks: newTasks }, ...prev]);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!user) return;
    const oldTemplates = templates;
    setTemplates(templates.filter(t => t.id !== templateId));
    const { error } = await supabase.from('routine_templates').delete().eq('user_id', user.id).eq('id', templateId);
    if(error) {
      console.error("Failed to delete template:", error.message);
      setTemplates(oldTemplates);
    }
  };

  // Appointment Handlers
  const handleAddAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    if(!user) return;
    const newAppointment: Appointment = { id: newId(), ...appointment };
    setAppointments(prev => [...prev, newAppointment].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
    const { error } = await supabase.from('appointments').insert({ id: newAppointment.id, user_id: user.id, text: appointment.text, date: appointment.date, time: appointment.time, notify: appointment.notify ?? false });
    if(error){
      console.error("Failed to add appointment:", error.message);
      setAppointments(prev => prev.filter(a => a.id !== newAppointment.id));
    }
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!user) return;
    const oldAppointments = appointments;
    setAppointments(appointments.map(a => a.id === id ? { ...a, ...updates } : a));
    const { error } = await supabase.from('appointments').update(updates).eq('user_id', user.id).eq('id', id);
    if(error){
      console.error("Failed to update appointment:", error.message);
      setAppointments(oldAppointments);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!user) return;
    const oldAppointments = appointments;
    setAppointments(appointments.filter(a => a.id !== id));
    const { error } = await supabase.from('appointments').delete().eq('user_id', user.id).eq('id', id);
    if(error){
      console.error("Failed to delete appointment:", error.message);
      setAppointments(oldAppointments);
    }
  };

  // Goal Handlers
  const handleAddGoal = async (goal: Omit<Goal, 'id' | 'completed' | 'linkedTaskIds'>) => {
    if(!user) return;
    const newGoal: Goal = { completed: false, linkedTaskIds: [], ...goal, id: newId() };
    setGoals(prev => [newGoal, ...prev]);
    const { error } = await supabase.from('goals').insert({
      id: newGoal.id, 
      user_id: user.id, 
      title: newGoal.title, 
      description: newGoal.description, 
      target_date: newGoal.targetDate, 
      completed: false, 
      linked_task_ids: []
    });
    if(error){
      console.error("Failed to add goal:", error.message);
      setGoals(prev => prev.filter(g => g.id !== newGoal.id));
    }
  };
  
  const handleUpdateGoal = async (updatedGoalData: Omit<Goal, 'completed' | 'linkedTaskIds'> & { id: string }) => {
    if (!user) return;
    const oldGoals = goals;
    setGoals(goals.map(g => g.id === updatedGoalData.id ? { ...g, title: updatedGoalData.title, description: updatedGoalData.description, targetDate: updatedGoalData.targetDate } : g));
    const { error } = await supabase.from('goals').update({ title: updatedGoalData.title, description: updatedGoalData.description, target_date: updatedGoalData.targetDate }).eq('user_id', user.id).eq('id', updatedGoalData.id);
    if(error){
      console.error("Failed to update goal:", error.message);
      setGoals(oldGoals);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user) return;
    const oldGoals = goals;
    setGoals(goals.filter(g => g.id !== id));
    const { error } = await supabase.from('goals').delete().eq('user_id', user.id).eq('id', id);
    if(error){
      console.error("Failed to delete goal:", error.message);
      setGoals(oldGoals);
    }
  };

  const handleToggleGoal = async (id: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if(!goal) return;
    const newStatus = !goal.completed;

    if (newStatus) {
      playTaskCompleteSound();
      triggerCelebrationConfetti();
    }

    setGoals(goals.map(g => g.id === id ? { ...g, completed: newStatus } : g));
    const { error } = await supabase.from('goals').update({ completed: newStatus }).eq('user_id', user.id).eq('id', id);
    if(error){
      console.error("Failed to toggle goal:", error.message);
      setGoals(goals.map(g => g.id === id ? { ...g, completed: !newStatus } : g));
    }
  };
  
  const handleToggleLinkTask = async (goalId: string, taskId: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === goalId);
    if(!goal) return;
    const linked = goal.linkedTaskIds.includes(taskId);
    const newLinkedTaskIds = linked ? goal.linkedTaskIds.filter(id => id !== taskId) : [...goal.linkedTaskIds, taskId];
    
    setGoals(goals.map(g => g.id === goalId ? { ...g, linkedTaskIds: newLinkedTaskIds } : g));
    
    const { error } = await supabase.from('goals').update({ linked_task_ids: newLinkedTaskIds }).eq('user_id', user.id).eq('id', goalId);
    if(error){
      console.error("Failed to link task to goal:", error.message);
      setGoals(goals.map(g => g.id === goalId ? { ...g, linkedTaskIds: goal.linkedTaskIds } : g));
    }
  };

  // Note Handlers
  const handleAddNote = async (title: string, content: string) => {
    if (!user) return;
    const newNote: Note = { id: newId(), title, content, updatedAt: new Date().toISOString() };
    setNotes(prev => [newNote, ...prev]);
    const { error } = await supabase.from('notes').insert({ id: newNote.id, user_id: user.id, title, content, updated_at: newNote.updatedAt });
    if (error) {
      console.error("Failed to add note:", error.message);
      setNotes(prev => prev.filter(n => n.id !== newNote.id));
    }
  };

  const handleUpdateNote = async (id: string, title: string, content: string) => {
    if (!user) return;
    const updatedAt = new Date().toISOString();
    const oldNotes = notes;
    setNotes(notes.map(n => n.id === id ? { ...n, title, content, updatedAt } : n));
    const { error } = await supabase.from('notes').update({ title, content, updated_at: updatedAt }).eq('user_id', user.id).eq('id', id);
    if (error) {
      console.error("Failed to update note:", error.message);
      setNotes(oldNotes);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!user) return;
    const oldNotes = notes;
    setNotes(notes.filter(n => n.id !== id));
    const { error } = await supabase.from('notes').delete().eq('user_id', user.id).eq('id', id);
    if (error) {
      console.error("Failed to delete note:", error.message);
      setNotes(oldNotes);
    }
  };
  
  // Assistant Handlers
  const handleSaveAssistantProfile = async (newProfile: AssistantProfile) => {
    if (!user) return;
    setAssistantProfile(newProfile);
    const { error } = await supabase.from('assistant_profiles').upsert({ 
      user_id: user.id, 
      bio: newProfile.bio, 
      strengths: newProfile.strengths, 
      weaknesses: newProfile.weaknesses, 
      rules: newProfile.rules,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) {
      console.error("Failed to save assistant profile:", error.message);
    }
  };

  const handleClearChatHistory = async () => {
    if (!user) return;
    setChatHistory([]);
    await supabase.from('assistant_messages').delete().eq('user_id', user.id);
  };

  const handleSendAssistantMessage = async (content: string) => {
    if (!user) return;
    const userMessageId = newId();
    const newUserMsg: ChatMessage = { id: userMessageId, role: 'user', content };
    const newHistory = [...chatHistory, newUserMsg];
    setChatHistory(newHistory);
    setAssistantGenerating(true);
    
    // Save user message to DB
    await supabase.from('assistant_messages').insert({ id: userMessageId, user_id: user.id, role: 'user', content });
    
    const response = await chatWithAssistant(content, chatHistory, assistantProfile, language);
    
    const modelMessageId = newId();
    const newModelMsg: ChatMessage = { id: modelMessageId, role: 'model', content: response.text };
    setChatHistory([...newHistory, newModelMsg]);
    setAssistantGenerating(false);
    
    // Save valid model message to DB
    if (!response.text.startsWith('⚠️')) {
      await supabase.from('assistant_messages').insert({ id: modelMessageId, user_id: user.id, role: 'model', content: response.text });
    }

    // Execute AI Coach action if returned
    if (response.action) {
      const { type, payload } = response.action;
      if (type === 'create_task' && payload?.text) {
        await handleAddTask(payload.text, payload.priority || Priority.Medium, payload.dueDate || null);
      } else if (type === 'create_appointment' && payload?.text && payload?.date && payload?.time) {
        await handleAddAppointment({ text: payload.text, date: payload.date, time: payload.time, notify: false });
      } else if (type === 'create_note' && payload?.title) {
        await handleAddNote(payload.title, payload.content || '');
      } else if (type === 'create_goal' && payload?.title) {
        await handleAddGoal({ title: payload.title, description: payload.description || '', targetDate: payload.targetDate || null });
      }
    }
  };

  const handleExportAllData = () => {
    exportAllDataJSON({ tasks, routines, templates, appointments, goals, notes });
  };

  const tasksCountToday = useMemo(() => {
    return tasks.filter(t => t.dueDate === todayISO && !t.completed).length;
  }, [tasks, todayISO]);

  // Current view component
  const currentViewComponent = useMemo(() => {
    switch(view) {
      case 'dashboard':
        return <DashboardView 
          tasks={tasks}
          routines={routines}
          appointments={appointments}
          goals={goals}
          subtitle={subtitle}
          userName={user?.displayName || 'Utente'}
          onSetView={setView}
          onToggleTask={handleToggleTask}
          onRefreshQuote={handleRefreshQuote}
          isRefreshingQuote={isRefreshingQuote}
        />;
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
          onToggleRoutineTask={handleToggleRoutineTask}
          onResetRoutine={handleResetRoutineTasks}
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
          onUpdateGoal={(g) => handleUpdateGoal(g as any)}
          onDeleteGoal={handleDeleteGoal}
          onToggleGoal={handleToggleGoal}
          onToggleLinkTask={handleToggleLinkTask}
        />;
      case 'calendar':
        return <CalendarView 
          appointments={appointments}
          onAddAppointment={handleAddAppointment}
          onDeleteAppointment={handleDeleteAppointment}
          onUpdateAppointment={handleUpdateAppointment}
          userId={user?.id}
        />;
      case 'notes':
        return <NotesView 
          notes={notes}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
        />;
      case 'profile':
        return user ? (
          <ProfileView 
            user={user} 
            onLogout={handleLogout} 
            onUpdateUser={handleUpdateUser} 
            language={language} 
            onSetLanguage={handleSetLanguage} 
            onExportData={handleExportAllData}
          />
        ) : null;
      case 'assistant':
        return <AssistantView
          profile={assistantProfile}
          onSaveProfile={handleSaveAssistantProfile}
          chatHistory={chatHistory}
          onSendMessage={handleSendAssistantMessage}
          onClearChat={handleClearChatHistory}
          isGenerating={assistantGenerating}
        />;
      default:
        return <h2>View not found</h2>;
    }
  }, [
    view, 
    tasks, 
    routines, 
    templates, 
    appointments, 
    goals, 
    notes, 
    generatingTaskId, 
    generatingRoutineId, 
    user, 
    language, 
    assistantProfile, 
    chatHistory, 
    assistantGenerating,
    subtitle,
    isRefreshingQuote
  ]);

  const renderMainContent = () => {
    if (dataLoading) {
      return (
        <div className="text-center py-24 text-slate-400 font-bold text-sm">
          {t('loading')}
        </div>
      );
    }
    if (dataError) {
      return (
        <div className="text-center p-8 bg-red-100 dark:bg-red-950/40 rounded-3xl border border-red-200 dark:border-red-900/50">
          <p className="font-bold text-red-700 dark:text-red-300 mb-3">{dataError}</p>
          <button 
            onClick={() => user && fetchData(user.id)} 
            className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors text-xs uppercase tracking-wider"
          >
            {t('retry')}
          </button>
        </div>
      );
    }
    return currentViewComponent;
  };

  if (authLoading) {
    return (
      <div className="bg-slate-50 dark:bg-[#070b14] min-h-screen flex items-center justify-center text-slate-400 font-bold">
        {t('auth_checking')}
      </div>
    );
  }

  if (!session || !user) {
    return (
      <LanguageContext.Provider value={{ language, t }}>
        <AuthView />
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, t }}>
      <div className="bg-slate-50 dark:bg-[#070b14] min-h-screen font-sans text-slate-900 dark:text-slate-100 flex relative overflow-x-hidden">
        {/* Ambient background glow */}
        <div className="ambient-glow fixed inset-0 pointer-events-none z-0" />

        {/* Desktop Sidebar */}
        <Sidebar 
          currentView={view}
          onSetView={setView}
          tasksCountToday={tasksCountToday}
          user={user}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
          onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
        />

        {/* Command Palette Modal */}
        <CommandMenu 
          isOpen={isCommandMenuOpen}
          onClose={() => setIsCommandMenuOpen(false)}
          onNavigate={setView}
          tasks={tasks}
          notes={notes}
          goals={goals}
          appointments={appointments}
          onAddTask={(text) => handleAddTask(text, Priority.Medium, todayISO)}
          onToggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
          onPlanDay={() => setView('dashboard')}
        />

        {/* Main Application Area (offset by sidebar on desktop) */}
        <div className="flex-1 flex flex-col md:pl-64 min-w-0 z-10">
          <Header 
            user={user} 
            onLogout={handleLogout} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode} 
            onSetView={setView} 
            subtitle={subtitle} 
            onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
            onRefreshQuote={handleRefreshQuote}
            isRefreshingQuote={isRefreshingQuote}
          />

          <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-28 md:pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {renderMainContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Floating Bottom Bar */}
        <BottomNav currentView={view} onSetView={setView} />
      </div>
    </LanguageContext.Provider>
  );
}

export default App;