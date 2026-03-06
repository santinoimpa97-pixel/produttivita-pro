import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Sparkles, LayoutGrid } from 'lucide-react';
import { Goal, Task } from '../types';
import GoalItem from './GoalItem';
import GoalModal from './GoalModal';
import LinkTasksModal from './LinkTasksModal';
import { useLanguage } from '../App';

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
    const { t } = useLanguage();
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
    
    const handleToggleLink = (taskId: string) => {
        if(goalToLink) {
            props.onToggleLinkTask(goalToLink.id, taskId);
        }
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Target className="text-brand-600" size={28} />
                        {t('goals_title')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('goals_empty')}</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                >
                    <Plus size={18} strokeWidth={3} />
                    {t('goals_add')}
                </button>
            </header>
            
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {props.goals.length > 0 ? (
                        props.goals.map((goal, index) => (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GoalItem 
                                    goal={goal}
                                    tasks={props.tasks}
                                    onEdit={handleEditGoal}
                                    onDelete={props.onDeleteGoal}
                                    onLinkTasks={handleLinkTasks}
                                    onToggleGoal={props.onToggleGoal}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 px-4 glass-card rounded-[2.5rem] border-dashed border-2 border-slate-200 dark:border-slate-800"
                        >
                            <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                                <Sparkles className="text-slate-400" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{t('goals_title')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                                {t('goals_empty')}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <GoalModal 
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                onSave={handleSaveGoal}
                goalToEdit={goalToEdit}
            />

            {goalToLink && (
                <LinkTasksModal
                    isOpen={isLinkModalOpen}
                    onClose={() => setIsLinkModalOpen(false)}
                    tasks={props.tasks}
                    linkedTaskIds={goalToLink.linkedTaskIds}
                    onToggleLinkTask={handleToggleLink}
                    goalTitle={goalToLink.title}
                />
            )}
        </div>
    );
};

export default GoalsView;
