import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { AssistantProfile, ChatMessage } from '../types';
import { Send, User, Sparkles, Loader2, Save } from 'lucide-react';

interface AssistantViewProps {
    profile: AssistantProfile;
    onSaveProfile: (profile: AssistantProfile) => void;
    chatHistory: ChatMessage[];
    onSendMessage: (message: string) => void;
    isGenerating: boolean;
}

const AssistantView: React.FC<AssistantViewProps> = ({ 
    profile, 
    onSaveProfile, 
    chatHistory, 
    onSendMessage,
    isGenerating
}) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'chat' | 'profile'>('chat');
    
    // Profile State
    const [bio, setBio] = useState(profile.bio);
    const [strengths, setStrengths] = useState(profile.strengths);
    const [weaknesses, setWeaknesses] = useState(profile.weaknesses);
    const [rules, setRules] = useState(profile.rules);
    const [saveMessage, setSaveMessage] = useState('');

    // Chat State
    const [inputMsg, setInputMsg] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (activeTab === 'chat') {
            scrollToBottom();
        }
    }, [chatHistory, activeTab, isGenerating]);

    const handleSaveProfile = () => {
        onSaveProfile({ bio, strengths, weaknesses, rules });
        setSaveMessage(t('assistant_profile_saved'));
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleSend = () => {
        if (!inputMsg.trim() || isGenerating) return;
        onSendMessage(inputMsg);
        setInputMsg('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col bg-slate-50 dark:bg-[#020617]" style={{ minHeight: 'calc(100dvh - 200px)' }}>
            {/* Header / Tabs */}
            <div className="mb-4 text-center shrink-0">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="text-brand-500" size={24} />
                    {t('assistant_title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t('assistant_subtitle')}</p>
                
                <div className="flex justify-center mb-4 border-b border-slate-200 dark:border-slate-800">
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'chat' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                        {t('assistant_tab_chat')}
                        {activeTab === 'chat' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-t-full" />
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'profile' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                        {t('assistant_tab_profile')}
                        {activeTab === 'profile' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-t-full" />
                        )}
                    </button>
                </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="flex-1 overflow-y-auto pb-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                {t('assistant_profile_bio_label')}
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder={t('assistant_profile_bio_placeholder')}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none h-24"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                {t('assistant_profile_strengths_label')}
                            </label>
                            <textarea
                                value={strengths}
                                onChange={(e) => setStrengths(e.target.value)}
                                placeholder={t('assistant_profile_strengths_placeholder')}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none h-20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                {t('assistant_profile_weaknesses_label')}
                            </label>
                            <textarea
                                value={weaknesses}
                                onChange={(e) => setWeaknesses(e.target.value)}
                                placeholder={t('assistant_profile_weaknesses_placeholder')}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none h-20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                {t('assistant_profile_rules_label')}
                            </label>
                            <textarea
                                value={rules}
                                onChange={(e) => setRules(e.target.value)}
                                placeholder={t('assistant_profile_rules_placeholder')}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none h-20"
                            />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                {saveMessage}
                            </span>
                            <button
                                onClick={handleSaveProfile}
                                className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20 active:scale-95"
                            >
                                <Save size={18} />
                                {t('assistant_profile_save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
                <div className="flex flex-col flex-1 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex-1 glass-card rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatHistory.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                    <Sparkles size={48} className="mb-4 opacity-50" />
                                    <p>{t('assistant_empty_chat')}</p>
                                </div>
                            ) : (
                                chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                            msg.role === 'user' 
                                            ? 'bg-brand-600 text-white rounded-br-sm' 
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm shadow-sm'
                                        }`}>
                                            {msg.role === 'model' && (
                                                <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-semibold">
                                                    <Sparkles size={12} /> Coach
                                                </div>
                                            )}
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            
                            {isGenerating && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-brand-500" />
                                        <span className="text-sm opacity-70">Sta pensando...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="relative flex items-end gap-2">
                                <textarea
                                    value={inputMsg}
                                    onChange={(e) => setInputMsg(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t('assistant_chat_placeholder')}
                                    className="flex-1 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none max-h-32 min-h-[44px]"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputMsg.trim() || isGenerating}
                                    className="p-3 rounded-full bg-brand-600 text-white disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors shrink-0 shadow-sm"
                                >
                                    <Send size={18} className="ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssistantView;
