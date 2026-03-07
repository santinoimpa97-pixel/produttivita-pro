import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, StickyNote, Search, Edit3, Save, X } from 'lucide-react';
import { Note } from '../types';
import { useLanguage } from '../LanguageContext';

interface NotesViewProps {
    notes: Note[];
    onAddNote: (title: string, content: string) => void;
    onUpdateNote: (id: string, title: string, content: string) => void;
    onDeleteNote: (id: string) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, onAddNote, onUpdateNote, onDeleteNote }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const handleAdd = () => {
        if (newTitle.trim() || newContent.trim()) {
            onAddNote(newTitle.trim() || (t('notes_title_placeholder')), newContent.trim());
            setNewTitle('');
            setNewContent('');
            setIsAdding(false);
        }
    };

    const handleUpdate = () => {
        if (editingNote && (newTitle.trim() || newContent.trim())) {
            onUpdateNote(editingNote.id, newTitle.trim() || (t('notes_title_placeholder')), newContent.trim());
            setEditingNote(null);
            setNewTitle('');
            setNewContent('');
        }
    };

    const startEditing = (note: Note) => {
        setEditingNote(note);
        setNewTitle(note.title);
        setNewContent(note.content);
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingNote(null);
        setIsAdding(false);
        setNewTitle('');
        setNewContent('');
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <StickyNote className="text-brand-600" size={28} />
                        {t('notes_title')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('notes_title')}</p>
                </div>
                {!isAdding && !editingNote && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                    >
                        <Plus size={18} strokeWidth={3} />
                        {t('notes_add')}
                    </button>
                )}
            </header>

            <AnimatePresence mode="wait">
                {(isAdding || editingNote) ? (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card p-6 rounded-[2.5rem] space-y-4 border-2 border-brand-500/20"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                                {isAdding ? t('notes_add') : t('notes_edit')}
                            </h3>
                            <button onClick={cancelEdit} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={20} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder={t('notes_title_placeholder')}
                            className="w-full text-xl font-black bg-transparent text-slate-900 dark:text-white border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                        />
                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder={t('notes_content_placeholder')}
                            className="w-full h-64 bg-transparent text-slate-700 dark:text-slate-300 border-none focus:ring-0 resize-none custom-scrollbar"
                        />
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={cancelEdit}
                                className="px-6 py-3 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                            >
                                {t('notes_cancel')}
                            </button>
                            <button
                                onClick={isAdding ? handleAdd : handleUpdate}
                                className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                            >
                                <Save size={18} />
                                {isAdding ? t('notes_save') : t('notes_edit')}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        <div className="glass-card p-2 rounded-2xl flex items-center gap-2 group focus-within:ring-2 focus-within:ring-brand-500 transition-all">
                            <div className="pl-3 text-slate-400">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder={t('notes_empty')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-2 py-2 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredNotes.map((note, index) => (
                                    <motion.div
                                        key={note.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 hover:shadow-xl transition-all group flex flex-col h-64"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-black text-slate-900 dark:text-white truncate pr-8">{note.title}</h4>
                                            <div className="flex items-center gap-1 transition-opacity">
                                                <button 
                                                    onClick={() => startEditing(note)}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => onDeleteNote(note.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-6 flex-grow overflow-hidden">
                                            {note.content}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                {new Date(note.updatedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <button 
                                                onClick={() => startEditing(note)}
                                                className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:underline"
                                            >
                                                Leggi tutto
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredNotes.length === 0 && (
                            <div className="text-center py-20 px-4 glass-card rounded-[2.5rem] border-dashed border-2 border-slate-200 dark:border-slate-800">
                                <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <StickyNote className="text-slate-400" size={40} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t('notes_empty')}</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                                    {searchTerm ? t('notes_empty') : t('notes_add')}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotesView;
