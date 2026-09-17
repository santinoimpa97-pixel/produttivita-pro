import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { AssistantProfile, ChatMessage } from '../types';
import { Send, Sparkles, Loader2, Save, Trash2, Bot, User as UserIcon } from 'lucide-react';
import VoiceButton from './VoiceButton';

interface AssistantViewProps {
  profile: AssistantProfile;
  onSaveProfile: (profile: AssistantProfile) => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearChat?: () => void;
  isGenerating: boolean;
}

// Lightweight, compact Markdown renderer for coach replies
const MarkdownText: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-1 text-xs sm:text-sm leading-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Header ###
        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white pt-1">{trimmed.replace('### ', '')}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white pt-1">{trimmed.replace('## ', '')}</h3>;
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const text = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="text-brand-500 font-bold text-xs leading-none mt-1">•</span>
              <span>{formatBold(text)}</span>
            </div>
          );
        }

        // Numbered list (e.g. "1. ")
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="text-brand-600 dark:text-brand-400 font-bold text-[11px] shrink-0 mt-0.5">{numMatch[1]}.</span>
              <span>{formatBold(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx} className="leading-snug">{formatBold(line)}</p>;
      })}
    </div>
  );
};

// Helper for **bold** text
function formatBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

const AssistantView: React.FC<AssistantViewProps> = ({ 
  profile, 
  onSaveProfile, 
  chatHistory, 
  onSendMessage,
  onClearChat,
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

  // Sync profile state when prop changes from Supabase async fetch
  useEffect(() => {
    setBio(profile.bio || '');
    setStrengths(profile.strengths || '');
    setWeaknesses(profile.weaknesses || '');
    setRules(profile.rules || '');
  }, [profile]);

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
    <div className="flex flex-col max-w-3xl mx-auto w-full">
      {/* Header & Tabs */}
      <div className="mb-3 text-center shrink-0 space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="text-brand-500" size={22} />
          {t('assistant_title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-sm mx-auto">
          {t('assistant_subtitle')}
        </p>
        
        <div className="flex justify-center pt-1">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'chat' 
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('assistant_tab_chat')}
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'profile' 
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('assistant_tab_profile')}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="flex-1 pb-6 space-y-4 animate-in fade-in duration-200">
          <div className="glass-card p-6 rounded-[2.5rem] space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                {t('assistant_profile_bio_label')}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('assistant_profile_bio_placeholder')}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none h-24"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                {t('assistant_profile_strengths_label')}
              </label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder={t('assistant_profile_strengths_placeholder')}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                {t('assistant_profile_weaknesses_label')}
              </label>
              <textarea
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                placeholder={t('assistant_profile_weaknesses_placeholder')}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                {t('assistant_profile_rules_label')}
              </label>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder={t('assistant_profile_rules_placeholder')}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none h-20"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {saveMessage}
              </span>
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20 active:scale-95 text-xs uppercase tracking-wider"
              >
                <Save size={16} />
                {t('assistant_profile_save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 pb-2 animate-in fade-in duration-200">
          <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col relative h-[450px] sm:h-[480px] shadow-xl shadow-slate-900/5">
            {/* Top Chat Bar with Clear Option */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Coach AI Online
                </span>
              </div>
              {onClearChat && chatHistory.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(t('assistant_clear_confirm'))) {
                      onClearChat();
                    }
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                  <Trash2 size={12} />
                  {t('assistant_clear_chat')}
                </button>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                    <Bot size={26} />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold max-w-xs">{t('assistant_empty_chat')}</p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-2xl px-4 py-2.5 sm:px-4.5 sm:py-3 text-xs sm:text-sm ${
                      msg.role === 'user' 
                        ? 'max-w-[80%] sm:max-w-[70%] bg-brand-600 text-white rounded-br-sm shadow-sm font-medium leading-relaxed' 
                        : 'max-w-[88%] sm:max-w-[78%] bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700/80 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.role === 'model' && (
                        <div className="flex items-center gap-1 mb-1 text-brand-600 dark:text-brand-400 text-[10px] font-black tracking-wider uppercase">
                          <Sparkles size={11} /> Coach
                        </div>
                      )}
                      {msg.role === 'model' ? (
                        <MarkdownText content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-3.5 py-2 shadow-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-brand-500" />
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {t('assistant_thinking')}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-2.5 sm:p-3 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
              <div className="relative flex items-center gap-2">
                <textarea
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('assistant_chat_placeholder')}
                  className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3.5 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none max-h-24 min-h-[40px]"
                  rows={1}
                />
                <VoiceButton 
                  onTranscript={(spoken) => setInputMsg(prev => prev ? `${prev} ${spoken}` : spoken)} 
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0"
                  size={15}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputMsg.trim() || isGenerating}
                  className="p-2.5 rounded-xl bg-brand-600 text-white disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed hover:bg-brand-700 transition-all shrink-0 shadow-md shadow-brand-500/20 active:scale-95"
                >
                  <Send size={16} />
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
