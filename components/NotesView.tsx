import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, StickyNote, Search, Edit3, X, Clock } from 'lucide-react';
import { Note } from '../types';
import { useLanguage } from '../LanguageContext';
import VoiceButton from './VoiceButton';

interface NotesViewProps {
  notes: Note[];
  onAddNote: (title: string, content: string) => void;
  onUpdateNote: (id: string, title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, onAddNote, onUpdateNote, onDeleteNote }) => {
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'it-IT';
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchTerm]);

  const handleAdd = () => {
    if (newTitle.trim() || newContent.trim()) {
      onAddNote(newTitle.trim() || t('notes_title_placeholder'), newContent.trim());
      setNewTitle('');
      setNewContent('');
      setIsAdding(false);
    }
  };

  const handleUpdate = () => {
    if (editingNote && (newTitle.trim() || newContent.trim())) {
      onUpdateNote(editingNote.id, newTitle.trim() || t('notes_title_placeholder'), newContent.trim());
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

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale, { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <StickyNote className="text-brand-600" size={26} />
            {t('notes_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {t('notes_subtitle')}
          </p>
        </div>
        {!isAdding && !editingNote && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs shrink-0"
          >
            <Plus size={18} strokeWidth={3} />
            {t('notes_add')}
          </button>
        )}
      </header>

      {/* Search Input */}
      {!isAdding && !editingNote && (
        <div className="glass-card p-2 rounded-2xl flex items-center gap-2 focus-within:ring-2 focus-within:ring-brand-500 transition-all">
          <div className="pl-3 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder={t('tasks_search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-2 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-medium text-sm"
          />
        </div>
      )}

      {/* Editor Modal / Card */}
      <AnimatePresence mode="wait">
        {(isAdding || editingNote) && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card p-6 sm:p-8 rounded-[2.5rem] space-y-4 border-2 border-brand-500/30"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                {isAdding ? t('notes_add') : t('notes_edit')}
              </h3>
              <button onClick={cancelEdit} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('notes_title_placeholder')}
                className="w-full text-xl font-black bg-transparent text-slate-900 dark:text-white border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
              <VoiceButton 
                onTranscript={(spoken) => setNewTitle(prev => prev ? `${prev} ${spoken}` : spoken)} 
                title="Ditta titolo con voce"
              />
            </div>
            <div className="relative">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={t('notes_content_placeholder')}
                className="w-full h-56 bg-slate-50/50 dark:bg-slate-800/30 p-4 pr-12 rounded-2xl text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:outline-none resize-none custom-scrollbar text-sm"
              />
              <div className="absolute right-3 top-3">
                <VoiceButton 
                  onTranscript={(spoken) => setNewContent(prev => prev ? `${prev} ${spoken}` : spoken)} 
                  title="Ditta nota con voce"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={cancelEdit}
                className="px-5 py-3 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
              >
                {t('notes_cancel')}
              </button>
              <button
                onClick={isAdding ? handleAdd : handleUpdate}
                className="px-7 py-3 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                {t('notes_save')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      {!isAdding && !editingNote && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => startEditing(note)}
                  className="glass-card p-6 rounded-[2rem] hover:border-brand-500/30 cursor-pointer group flex flex-col justify-between transition-all space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {note.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shrink-0"
                        title={t('delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <Clock size={12} />
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 px-4 glass-card rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-medium text-sm">{t('notes_empty')}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NotesView;
