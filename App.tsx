import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Task, SubTask, Priority, User, Routine, RoutineTemplate, Appointment, Goal, RoutineTask } from './types';
import { generateSubtasksFromGemini, generateRoutineTasks } from './services/geminiService';
import { motivationalQuotes } from './data/quotes';

import AuthView from './components/AuthView';
import Header from './components/Header';
import BottomNav, { View } from './components/BottomNav';
import TasksView from './components/TasksView';
import RoutinesView from './components/RoutinesView';
import GoalsView from './components/GoalsView';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';

// Helper functions to map Supabase data to frontend types
const mapDbTaskToTask = (dbTask: any): Task => ({
    id: dbTask.id,
    text: dbTask.text,
    priority: dbTask.priority,
    completed: dbTask.completed,
    dueDate: dbTask.due_date,
    subTasks: (dbTask.sub_tasks || []).map(mapDbSubTaskToSubTask).sort((a,b) => a.text.localeCompare(b.text)),
});

const mapDbSubTaskToSubTask = (dbSubTask: any): SubTask => ({
    id: dbSubTask.id,
    text: dbSubTask.text,
    completed: dbSubTask.completed,
});

const mapDbRoutineToRoutine = (dbRoutine: any): Routine => ({
    id: dbRoutine.id,
    name: dbRoutine.name,
    tasks: (dbRoutine.routine_tasks || []).map(mapDbRoutineTaskToRoutineTask).sort((a,b) => a.text.localeCompare(b.text)),
});

const mapDbRoutineTaskToRoutineTask = (dbRoutineTask: any): RoutineTask => ({
    id: dbRoutineTask.id,
    text: dbRoutineTask.text,
});

const mapDbGoalToGoal = (dbGoal: any): Goal => ({
    id: dbGoal.id,
    title: dbGoal.title,
    description: dbGoal.description,
    completed: dbGoal.completed,
    targetDate: dbGoal.target_date,
    linkedTaskIds: dbGoal.linked_task_ids || [],
});

const mapDbAppointmentToAppointment = (dbAppointment: any): Appointment => ({
    id: dbAppointment.id,
    text: dbAppointment.text,
    date: dbAppointment.date,
    time: dbAppointment.time,
});

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>('tasks');
    const [generatingTaskId, setGeneratingTaskId] = useState<string | null>(null);
    const [generatingRoutineId, setGeneratingRoutineId] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false); // Start with light mode

    const quote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);
    
    const fetchAllData = async (userId: string) => {
        setLoading(true);
        try {
            const [
                { data: tasksData, error: tasksError },
                { data: routinesData, error: routinesError },
                { data: templatesData, error: templatesError },
                { data: appointmentsData, error: appointmentsError },
                { data: goalsData, error: goalsError },
            ] = await Promise.all([
                supabase.from('tasks').select('*, sub_tasks(*)').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('routines').select('*, routine_tasks(*)').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('routine_templates').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('appointments').select('*').eq('user_id', userId).order('date', { ascending: true }).order('time', { ascending: true }),
                supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
            ]);

            if (tasksError) throw tasksError;
            if (routinesError) throw routinesError;
            if (templatesError) throw templatesError;
            if (appointmentsError) throw appointmentsError;
            if (goalsError) throw goalsError;

            setTasks(tasksData?.map(mapDbTaskToTask) || []);
            setRoutines(routinesData?.map(mapDbRoutineToRoutine) || []);
            setTemplates(templatesData?.map(t => ({ id: t.id, name: t.name, tasks: t.tasks || [] })) || []);
            setAppointments(appointmentsData?.map(mapDbAppointmentToAppointment) || []);
            setGoals(goalsData?.map(mapDbGoalToGoal) || []);
            
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                 const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                 setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    displayName: profile?.display_name || session.user.email || 'Utente',
                });
                await fetchAllData(session.user.id);
            } else {
                setUser(null);
                setTasks([]); 
                setRoutines([]); 
                setTemplates([]); 
                setAppointments([]); 
                setGoals([]);
                setLoading(false);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };
    
    const handleUpdateUser = (displayName: string) => {
        if(user) setUser({ ...user, displayName });
    };

    // --- TASKS ---
    const handleAddTask = async (text: string, priority: Priority, dueDate: string | null) => {
        if (!user) return;
        const { data, error } = await supabase.from('tasks').insert({ text, priority, due_date: dueDate, user_id: user.id }).select('*, sub_tasks(*)').single();
        if (error) console.error("Error adding task:", error);
        else if(data) setTasks(prev => [mapDbTaskToTask(data), ...prev]);
    };
    const handleToggleTask = (id: string) => {
        const originalTasks = tasks;
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        
        setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t));
        
        supabase.from('tasks').update({ completed: !task.completed }).eq('id', id).then(({error}) => {
            if (error) {
                console.error("Error toggling task", error);
                setTasks(originalTasks); // Revert on error
            }
        });
    };
    const handleDeleteTask = (id: string) => {
        const originalTasks = tasks;
        setTasks(prev => prev.filter(t => t.id !== id));
        supabase.from('tasks').delete().eq('id', id).then(({error}) => {
            if (error) {
                console.error("Error deleting task", error);
                setTasks(originalTasks);
            }
        });
    };
    const handleUpdateTask = (id: string, newText: string) => {
        const originalTasks = tasks;
        setTasks(prev => prev.map(t => t.id === id ? {...t, text: newText} : t));
        supabase.from('tasks').update({ text: newText }).eq('id', id).then(({error}) => {
            if (error) {
                console.error("Error updating task", error);
                setTasks(originalTasks);
            }
        });
    };

    // --- SUBTASKS ---
    const handleAddSubTask = async (taskId: string, subTaskText: string) => {
        if (!user) return;
        const { data, error } = await supabase.from('sub_tasks').insert({ text: subTaskText, task_id: taskId, user_id: user.id }).select().single();
        if(error) console.error("Error adding subtask:", error);
        else if (data) {
            const newSubTask = mapDbSubTaskToSubTask(data);
            setTasks(prev => prev.map(t => t.id === taskId ? {...t, subTasks: [...t.subTasks, newSubTask].sort((a,b) => a.text.localeCompare(b.text))} : t));
        }
    };
    const handleToggleSubTask = (taskId: string, subTaskId: string) => {
        const originalTasks = tasks;
        let originalSubTaskState = false;

        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    subTasks: t.subTasks.map(st => {
                        if (st.id === subTaskId) {
                            originalSubTaskState = st.completed;
                            return { ...st, completed: !st.completed };
                        }
                        return st;
                    })
                };
            }
            return t;
        });
        setTasks(updatedTasks);

        supabase.from('sub_tasks').update({ completed: !originalSubTaskState }).eq('id', subTaskId).then(({error}) => {
             if (error) {
                console.error("Error toggling subtask", error);
                setTasks(originalTasks);
            }
        });
    };
    const handleDeleteSubTask = (taskId: string, subTaskId: string) => {
        const originalTasks = tasks;
        setTasks(prev => prev.map(t => t.id === taskId ? {...t, subTasks: t.subTasks.filter(st => st.id !== subTaskId)} : t));
        supabase.from('sub_tasks').delete().eq('id', subTaskId).then(({error}) => {
            if (error) {
                console.error("Error deleting subtask", error);
                setTasks(originalTasks);
            }
        });
    };
    const handleUpdateSubTask = (taskId: string, subTaskId: string, newText: string) => {
        const originalTasks = tasks;
        setTasks(prev => prev.map(t => t.id === taskId ? {...t, subTasks: t.subTasks.map(st => st.id === subTaskId ? {...st, text: newText} : st)} : t));
        supabase.from('sub_tasks').update({ text: newText }).eq('id', subTaskId).then(({error}) => {
             if (error) {
                console.error("Error updating subtask", error);
                setTasks(originalTasks);
            }
        });
    };
    const handleGenerateSubtasks = async (taskId: string, taskText: string) => {
        if(!user) return;
        setGeneratingTaskId(taskId);
        const subtaskTexts = await generateSubtasksFromGemini(taskText);
        const newSubtasksData = subtaskTexts.map(text => ({ text, task_id: taskId, user_id: user.id }));
        if(newSubtasksData.length > 0) {
            const { data, error } = await supabase.from('sub_tasks').insert(newSubtasksData).select();
            if(error) console.error("Error generating subtasks:", error);
            else if(data) {
                const newSubTasks = data.map(mapDbSubTaskToSubTask);
                setTasks(prev => prev.map(t => t.id === taskId ? {...t, subTasks: [...t.subTasks, ...newSubTasks].sort((a,b) => a.text.localeCompare(b.text))} : t));
            }
        }
        setGeneratingTaskId(null);
    };

    // --- ROUTINES ---
    const handleAddRoutine = async (name: string) => {
        if(!user) return;
        const { data, error } = await supabase.from('routines').insert({ name, user_id: user.id }).select('*, routine_tasks(*)').single();
        if(error) console.error("Error adding routine", error);
        else if (data) setRoutines(prev => [mapDbRoutineToRoutine(data), ...prev]);
    };
    const handleDeleteRoutine = (id: string) => {
        const originalRoutines = routines;
        setRoutines(prev => prev.filter(r => r.id !== id));
        supabase.from('routines').delete().eq('id', id).then(({error}) => {
            if (error) {
                console.error("Error deleting routine", error);
                setRoutines(originalRoutines);
            }
        });
    };
    const handleAddRoutineTask = async (routineId: string, taskText: string) => {
        if(!user) return;
        const { data, error } = await supabase.from('routine_tasks').insert({ routine_id: routineId, text: taskText, user_id: user.id }).select().single();
        if(error) console.error("Error adding routine task", error);
        else if(data) {
            const newTask = mapDbRoutineTaskToRoutineTask(data);
            setRoutines(prev => prev.map(r => r.id === routineId ? {...r, tasks: [...r.tasks, newTask].sort((a,b) => a.text.localeCompare(b.text))} : r));
        }
    };
    const handleDeleteRoutineTask = (routineId: string, taskId: string) => {
        const originalRoutines = routines;
        setRoutines(prev => prev.map(r => r.id === routineId ? {...r, tasks: r.tasks.filter(t => t.id !== taskId)} : r));
        supabase.from('routine_tasks').delete().eq('id', taskId).then(({error}) => {
             if (error) {
                console.error("Error deleting routine task", error);
                setRoutines(originalRoutines);
            }
        });
    };
    const handleGenerateRoutineTasks = async (routineId: string, routineName: string) => {
        if(!user) return;
        setGeneratingRoutineId(routineId);
        const taskTexts = await generateRoutineTasks(routineName);
        const newTasksData = taskTexts.map(text => ({ routine_id: routineId, text, user_id: user.id }));
        if(newTasksData.length > 0) {
            const { data, error } = await supabase.from('routine_tasks').insert(newTasksData).select();
            if(error) console.error("Error generating routine tasks", error);
            else if(data) {
                const newTasks = data.map(mapDbRoutineTaskToRoutineTask);
                setRoutines(prev => prev.map(r => r.id === routineId ? {...r, tasks: [...r.tasks, ...newTasks].sort((a,b) => a.text.localeCompare(b.text))} : r));
            }
        }
        setGeneratingRoutineId(null);
    };

    // --- TEMPLATES ---
    const handleSaveAsTemplate = async (routineId: string) => {
        const routine = routines.find(r => r.id === routineId);
        if(!routine || !user) return;
        const tasksJson = routine.tasks.map(t => ({ text: t.text }));
        const { data, error } = await supabase.from('routine_templates').insert({ name: `${routine.name} Modello`, user_id: user.id, tasks: tasksJson }).select().single();
        if(error) console.error("Error saving template", error);
        else if(data) setTemplates(prev => [{ id: data.id, name: data.name, tasks: data.tasks || [] }, ...prev]);
    };
    const handleCreateFromTemplate = async (templateId: string) => {
        if(!user) return;
        const template = templates.find(t => t.id === templateId);
        if(!template) return;
        
        await fetchAllData(user.id); // Refresh data to avoid state issues
    };
    const handleDeleteTemplate = (templateId: string) => {
        const originalTemplates = templates;
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        supabase.from('routine_templates').delete().eq('id', templateId).then(({error}) => {
             if (error) {
                console.error("Error deleting template", error);
                setTemplates(originalTemplates);
            }
        });
    };
    
    // --- GOALS ---
    const handleAddGoal = async (goal: Omit<Goal, 'id' | 'completed' | 'linkedTaskIds'>) => {
        if(!user) return;
        const { data, error } = await supabase.from('goals').insert({ title: goal.title, description: goal.description, target_date: goal.targetDate, user_id: user.id, linked_task_ids: [] }).select().single();
        if(error) console.error("Error adding goal", error);
        else if (data) setGoals(prev => [mapDbGoalToGoal(data), ...prev]);
    };
    const handleUpdateGoal = (goal: Omit<Goal, 'completed' | 'linkedTaskIds'>) => {
        const originalGoals = goals;
        setGoals(prev => prev.map(g => g.id === goal.id ? {...g, title: goal.title, description: goal.description, targetDate: goal.targetDate} : g));
        supabase.from('goals').update({ title: goal.title, description: goal.description, target_date: goal.targetDate }).eq('id', goal.id).then(({error}) => {
             if (error) {
                console.error("Error updating goal", error);
                setGoals(originalGoals);
            }
        });
    };
    const handleDeleteGoal = (id: string) => {
        const originalGoals = goals;
        setGoals(prev => prev.filter(g => g.id !== id));
        supabase.from('goals').delete().eq('id', id).then(({error}) => {
             if (error) {
                console.error("Error deleting goal", error);
                setGoals(originalGoals);
            }
        });
    };
    const handleToggleGoal = (id: string) => {
        const originalGoals = goals;
        const goal = goals.find(g => g.id === id);
        if (!goal) return;
        setGoals(prev => prev.map(g => g.id === id ? {...g, completed: !g.completed} : g));
        supabase.from('goals').update({ completed: !goal.completed }).eq('id', id).then(({error}) => {
             if (error) {
                console.error("Error toggling goal", error);
                setGoals(originalGoals);
            }
        });
    };
    const handleToggleLinkTask = (goalId: string, taskId: string) => {
        const originalGoals = goals;
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;
        const linkedTaskIds = goal.linkedTaskIds.includes(taskId) ? goal.linkedTaskIds.filter(id => id !== taskId) : [...goal.linkedTaskIds, taskId];
        setGoals(prev => prev.map(g => g.id === goalId ? {...g, linkedTaskIds} : g));
        supabase.from('goals').update({ linked_task_ids: linkedTaskIds }).eq('id', goalId).then(({error}) => {
             if (error) {
                console.error("Error linking task", error);
                setGoals(originalGoals);
            }
        });
    };

    // --- APPOINTMENTS ---
    const handleAddAppointment = async (appointment: Omit<Appointment, 'id'>) => {
        if(!user) return;
        const { data, error } = await supabase.from('appointments').insert({ ...appointment, user_id: user.id }).select().single();
        if(error) console.error("Error adding appointment", error);
        else if (data) {
            setAppointments(prev => [...prev, mapDbAppointmentToAppointment(data)].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
        }
    };
    const handleDeleteAppointment = (id: string) => {
        const originalAppointments = appointments;
        setAppointments(prev => prev.filter(a => a.id !== id));
        supabase.from('appointments').delete().eq('id', id).then(({error}) => {
             if (error) {
                console.error("Error deleting appointment", error);
                setAppointments(originalAppointments);
            }
        });
    };

    const renderView = () => {
        if (loading) {
             return (
                <div className="flex items-center justify-center pt-20">
                    <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )
        }
        switch (view) {
            case 'tasks': return <TasksView {...{tasks, onAddTask: handleAddTask, onToggleTask: handleToggleTask, onDeleteTask: handleDeleteTask, onUpdateTask: handleUpdateTask, onAddSubTask: handleAddSubTask, onToggleSubTask: handleToggleSubTask, onDeleteSubTask: handleDeleteSubTask, onUpdateSubTask: handleUpdateSubTask, onGenerateSubtasks: handleGenerateSubtasks, generatingTaskId}} />;
            case 'routines': return <RoutinesView {...{routines, templates, onAddRoutine: handleAddRoutine, onDeleteRoutine: handleDeleteRoutine, onAddRoutineTask: handleAddRoutineTask, onDeleteRoutineTask: handleDeleteRoutineTask, onGenerateTasks: handleGenerateRoutineTasks, generatingRoutineId, onSaveAsTemplate: handleSaveAsTemplate, onCreateFromTemplate: handleCreateFromTemplate, onDeleteTemplate: handleDeleteTemplate}} />;
            case 'goals': return <GoalsView {...{goals, tasks, onAddGoal: handleAddGoal, onUpdateGoal: handleUpdateGoal, onDeleteGoal: handleDeleteGoal, onToggleGoal: handleToggleGoal, onToggleLinkTask: handleToggleLinkTask}} />;
            case 'calendar': return <CalendarView {...{appointments, onAddAppointment: handleAddAppointment, onDeleteAppointment: handleDeleteAppointment}} />;
            case 'analytics': return <AnalyticsView tasks={tasks} />;
            case 'profile': return user && <ProfileView user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
            default: return <TasksView {...{tasks, onAddTask: handleAddTask, onToggleTask: handleToggleTask, onDeleteTask: handleDeleteTask, onUpdateTask: handleUpdateTask, onAddSubTask: handleAddSubTask, onToggleSubTask: handleToggleSubTask, onDeleteSubTask: handleDeleteSubTask, onUpdateSubTask: handleUpdateSubTask, onGenerateSubtasks: handleGenerateSubtasks, generatingTaskId}} />;
        }
    };
    
    if (loading && !session) {
      return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
      )
    }

    if (!session) {
        return <AuthView />;
    }

    return (
        <div className={`min-h-screen bg-slate-100 dark:bg-slate-900 font-sans transition-colors`}>
            <Header user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onSetView={setView} subtitle={quote} />
            <main className="max-w-4xl mx-auto p-4 pb-24">
                {renderView()}
            </main>
            {view !== 'profile' && <BottomNav currentView={view} onSetView={setView} />}
        </div>
    );
};

export default App;