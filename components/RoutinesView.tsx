import React, { useState } from 'react';
import { Routine, RoutineTemplate, RoutineTask } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { RoutineIcon } from './icons/RoutineIcon';

interface RoutinesViewProps {
    routines: Routine[];
    templates: RoutineTemplate[];
    onAddRoutine: (name: string) => void;
    onDeleteRoutine: (id: string) => void;
    onAddRoutineTask: (routineId: string, taskText: string) => void;
    onDeleteRoutineTask: (routineId: string, taskId: string) => void;
    onToggleRoutineTask: (routineId: string, taskId: string) => void;
    onResetRoutine: (routineId: string) => void;
    onGenerateTasks: (routineId: string, routineName: string) => void;
    generatingRoutineId: string | null;
    onSaveAsTemplate: (routineId: string) => void;
    onCreateFromTemplate: (templateId: string) => void;
    onDeleteTemplate: (templateId: string) => void;
}

const RoutineItem: React.FC<{
    routine: Routine;
    onDelete: (id: string) => void;
    onAddTask: (routineId: string, taskText: string) => void;
    onDeleteTask: (routineId: string, taskId: string) => void;
    onToggleTask: (routineId: string, taskId: string) => void;
    onReset: (routineId: string) => void;
    onGenerate: (routineId: string, routineName: string) => void;
    isGenerating: boolean;
    onSave: (routineId: string) => void;
}> = ({ routine, onDelete, onAddTask, onDeleteTask, onToggleTask, onReset, onGenerate, isGenerating, onSave }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(newTaskText.trim()) {
            onAddTask(routine.id, newTaskText.trim());
            setNewTaskText('');
        }
    }
    
    const hasCompletedTasks = routine.tasks.some(t => t.completed);

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{routine.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{routine.tasks.length} compiti</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onSave(routine.id)} title="Salva come modello" className="p-2 text-slate-500 hover:text-violet-500 dark:hover:text-violet-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"><BookmarkIcon /></button>
                    <button onClick={() => onDelete(routine.id)} className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"><TrashIcon /></button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-slate-500 hover:text-violet-500 dark:hover:text-violet-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                    {routine.tasks.length > 0 && (
                        <div className="flex justify-end">
                             <button
                                onClick={() => onReset(routine.id)}
                                disabled={!hasCompletedTasks}
                                className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline disabled:text-slate-500 disabled:no-underline disabled:cursor-not-allowed"
                            >
                                <RoutineIcon className="w-4 h-4" />
                                <span>Resetta Completamento</span>
                            </button>
                        </div>
                    )}
                    {routine.tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-2 rounded-md group hover:bg-slate-100 dark:hover:bg-slate-800/50">
                            <div className="flex items-center gap-3 flex-grow">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => onToggleTask(routine.id, task.id)}
                                    className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                    id={`routine-task-${task.id}`}
                                />
                                <label
                                    htmlFor={`routine-task-${task.id}`}
                                    className={`flex-grow cursor-pointer text-slate-700 dark:text-slate-300 ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}
                                >
                                    {task.text}
                                </label>
                            </div>
                            <button onClick={() => onDeleteTask(routine.id, task.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                    {routine.tasks.length === 0 && <p className="text-sm text-slate-400 italic">Nessun compito in questa routine.</p>}
                    <form onSubmit={handleAddTask} className="flex items-center gap-2 pt-2">
                        <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Nuovo compito..." className="flex-grow px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-1 focus:ring-violet-500"/>
                        <button type="submit" className="p-1.5 text-slate-500 hover:text-violet-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600"><PlusIcon className="w-5 h-5"/></button>
                    </form>
                    <button onClick={() => onGenerate(routine.id, routine.name)} disabled={isGenerating} className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-violet-50 text-violet-700 font-semibold rounded-lg hover:bg-violet-100 dark:bg-violet-900/50 dark:text-violet-300 dark:hover:bg-violet-900 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        {isGenerating ? 'Generazione...' : <><SparklesIcon className="w-5 h-5"/> Genera Compiti con IA</>}
                    </button>
                </div>
            )}
        </div>
    );
}

const TemplateItem: React.FC<{
    template: RoutineTemplate;
    onCreate: (templateId: string) => void;
    onDelete: (templateId: string) => void;
}> = ({ template, onCreate, onDelete }) => {
    return (
        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">{template.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{template.tasks.length} compiti</p>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onCreate(template.id)} title="Crea routine da questo modello" className="p-2 text-white bg-violet-600 hover:bg-violet-700 rounded-full transition"><PlusIcon className="w-4 h-4"/></button>
                    <button onClick={() => onDelete(template.id)} className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
        </div>
    )
}

const RoutinesView: React.FC<RoutinesViewProps> = (props) => {
    const [newRoutineName, setNewRoutineName] = useState('');

    const handleAddRoutine = (e: React.FormEvent) => {
        e.preventDefault();
        if(newRoutineName.trim()){
            props.onAddRoutine(newRoutineName.trim());
            setNewRoutineName('');
        }
    };

    return (
    <div className="space-y-8 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Crea Nuova Routine</h2>
            <form onSubmit={handleAddRoutine} className="flex items-center gap-2">
                <input type="text" value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} placeholder="Es. Routine Mattutina" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500" required/>
                <button type="submit" className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700"><PlusIcon className="w-5 h-5"/></button>
            </form>
        </div>

        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Le tue Routine</h2>
            {props.routines.length > 0 ? (
                props.routines.map(routine => 
                    <RoutineItem 
                        key={routine.id}
                        routine={routine}
                        onDelete={props.onDeleteRoutine}
                        onAddTask={props.onAddRoutineTask}
                        onDeleteTask={props.onDeleteRoutineTask}
                        onToggleTask={props.onToggleRoutineTask}
                        onReset={props.onResetRoutine}
                        onGenerate={props.onGenerateTasks}
                        isGenerating={props.generatingRoutineId === routine.id}
                        onSave={props.onSaveAsTemplate}
                    />)
            ) : (
                <div className="text-center py-6 px-4 bg-white dark:bg-slate-900 rounded-xl shadow-md">
                    <p className="text-slate-500 dark:text-slate-400">Nessuna routine creata. Aggiungine una per iniziare!</p>
                </div>
            )}
        </div>

        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Modelli Salvati</h2>
            {props.templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {props.templates.map(template => 
                        <TemplateItem 
                            key={template.id}
                            template={template}
                            onCreate={props.onCreateFromTemplate}
                            onDelete={props.onDeleteTemplate}
                        />
                    )}
                </div>
            ) : (
                 <div className="text-center py-6 px-4 bg-white dark:bg-slate-900 rounded-xl shadow-md">
                    <p className="text-slate-500 dark:text-slate-400">Nessun modello. Salva una routine come modello per riutilizzarla.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default RoutinesView;