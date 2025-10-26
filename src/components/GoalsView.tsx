
import React from 'react';
import { Goal, Task } from '../types.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import GoalItem from './GoalItem.tsx';
import GoalModal from './GoalModal.tsx';
import LinkTasksModal from './LinkTasksModal.tsx';

interface GoalsViewProps {
    goals: Goal[];
    tasks: Task[];
    onAddGoal: (goal: Omit<Goal, 'id' | 'completed' | 'linkedTaskIds'>) => void;
    onUpdateGoal: (goal: Omit<Goal, 'completed' | 'linkedTaskIds'>) => void;
    onDeleteGoal: (id: string) => void;
    onToggleGoal: (id: string) => void;
    onToggleLinkTask: (goalId: string, taskId: string) => void;
}

const GoalsView: React.FC<GoalsViewProps> = (props) => {
    const [isGoalModalOpen, setIsGoalModalOpen] = React.useState(false);
    const [goalToEdit, setGoalToEdit] = React.useState<Goal | null>(null);
    const [isLinkModalOpen, setIsLinkModalOpen] = React.useState(false);
    const [goalToLink, setGoalToLink] = React.useState<Goal | null>(null);

    const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'completed' | 'linkedTaskIds'> & { id?: string }) => {
        if (goalData.id) {
            props.onUpdateGoal({ id: goalData.id, ...goalData });
        } else {
            props.onAddGoal(goalData);
        }
    };

    const handleEditGoal = (goal: Goal) => {
        setGoalToEdit(goal);
        setIsGoalModalOpen(true);
    };
    
    const handleOpenAddModal = () => {
        setGoalToEdit(null);
        setIsGoalModalOpen(true);
    }
    
    const handleLinkTasks = (goal: Goal) => {
        setGoalToLink(goal);
        setIsLinkModalOpen(true);
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">I tuoi Obiettivi</h2>
                <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700">
                    <PlusIcon className="w-5 h-5" />
                    Nuovo Obiettivo
                </button>
            </div>
            <div className="space-y-4">
                {props.goals.length > 0 ? (
                    props.goals.map(goal => (
                        <GoalItem 
                            key={goal.id}
                            goal={goal}
                            tasks={props.tasks}
                            onEdit={handleEditGoal}
                            onDelete={props.onDeleteGoal}
                            onLinkTasks={handleLinkTasks}
                            onToggleGoal={props.onToggleGoal}
                        />
                    ))
                ) : (
                    <div className="text-center py-6 px-4 bg-white dark:bg-slate-900 rounded-xl shadow-md">
                        <p className="text-slate-500 dark:text-slate-400">Nessun obiettivo definito. Inizia a pianificare!</p>
                    </div>
                )}
            </div>
            <GoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} onSave={handleSaveGoal} goalToEdit={goalToEdit} />
            {goalToLink && (
                <LinkTasksModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} tasks={props.tasks} linkedTaskIds={goalToLink.linkedTaskIds} onToggleLinkTask={(taskId) => props.onToggleLinkTask(goalToLink.id, taskId)} goalTitle={goalToLink.title} />
            )}
        </div>
    );
};
export default GoalsView;
