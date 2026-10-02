import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, CheckCircle2, Dumbbell, ShieldCheck, HelpCircle } from 'lucide-react';
import { ExerciseGuide } from '../types';
import MuscleAnatomyViewer from './MuscleAnatomyViewer';
import { useLanguage } from '../LanguageContext';
import { chatWithAssistant } from '../services/geminiService';

interface ExerciseDetailModalProps {
  exercise: ExerciseGuide | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, onClose }) => {
  const { language } = useLanguage();
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isLoadingAiTip, setIsLoadingAiTip] = useState(false);

  if (!exercise) return null;

  const handleAskAiForTips = async (questionType: 'form' | 'alternative') => {
    setIsLoadingAiTip(true);
    try {
      const prompt = questionType === 'form'
        ? (language === 'en'
            ? `Give me 2 specific practical posture cues to feel the target muscle better during ${exercise.nameEn}. Be brief, bullet points only.`
            : `Dammi 2 consigli pratici posturali specifici per sentire lavorare al massimo il muscolo target durante l'esecuzione di ${exercise.name}. Sii sintetico ed empatico, solo 2 punti elenco brevi.`)
        : (language === 'en'
            ? `Suggest the 2 best alternative gym exercises if ${exercise.nameEn} machine/equipment is occupied or unavailable.`
            : `Consigliami le 2 migliori alternative da fare in palestra se la macchina o l'attrezzo per ${exercise.name} è occupato o non disponibile.`);

      const res = await chatWithAssistant(
        prompt,
        [],
        { bio: 'Principiante in palestra', strengths: '', weaknesses: '', rules: 'Rispondi in modo ultra conciso e pratico.' },
        language
      );
      setAiTip(res.text);
    } catch (e) {
      console.warn('AI form tip failed:', e);
      setAiTip(
        language === 'en'
          ? 'Focus on slow controlled eccentric movement (2-3 seconds down) and pause at contraction.'
          : 'Concentrati su una discesa lenta e controllata di 2-3 secondi e stringi forte il muscolo in contrazione.'
      );
    } finally {
      setIsLoadingAiTip(false);
    }
  };

  const getEquipmentLabel = (eq: string) => {
    switch (eq) {
      case 'barbell': return language === 'en' ? 'Barbell' : 'Bilanciere';
      case 'dumbbell': return language === 'en' ? 'Dumbbells' : 'Manubri';
      case 'machine': return language === 'en' ? 'Machine' : 'Macchinario Guidato';
      case 'cables': return language === 'en' ? 'Cables' : 'Cavi';
      default: return language === 'en' ? 'Bodyweight' : 'Corpo Libero';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 px-6 py-4 bg-white/90 dark:bg-[#0b1120]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-brand-500 text-white shadow-lg shadow-emerald-500/25">
                <Dumbbell size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {language === 'en' ? exercise.nameEn : exercise.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                    {exercise.muscleGroup}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {getEquipmentLabel(exercise.equipment)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {/* Top section: Muscle Anatomy Visualizer & Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <MuscleAnatomyViewer
                muscleGroup={exercise.muscleGroup}
                primaryMuscles={exercise.primaryMuscles}
                secondaryMuscles={exercise.secondaryMuscles}
                defaultView={exercise.viewType}
              />

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    {language === 'en' ? 'Focus Muscle Group' : 'Gruppo Muscolare Primario'}
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {exercise.primaryMuscles.join(', ')}
                  </p>
                  {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">{language === 'en' ? 'Secondary:' : 'Secondari:'}</span>{' '}
                      {exercise.secondaryMuscles.join(', ')}
                    </p>
                  )}
                </div>

                {/* Quick Pro Tip banner */}
                {exercise.tip && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                    <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">{language === 'en' ? 'Pro Tip: ' : 'Consiglio Pro: '}</strong>
                      {exercise.tip}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Step-by-Step Technique Instructions */}
            <div className="space-y-4">
              {/* Setup */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    {language === 'en' ? '1. Proper Setup' : '1. Posizionamento & Setup'}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {language === 'en' ? exercise.setupEn : exercise.setup}
                </p>
              </div>

              {/* Execution */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    {language === 'en' ? '2. Execution & Motion' : '2. Esecuzione del Movimento'}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {language === 'en' ? exercise.executionEn : exercise.execution}
                </p>
              </div>

              {/* Common Mistakes to Avoid */}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400">
                  <AlertTriangle size={16} />
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    {language === 'en' ? 'Common Mistakes to Avoid' : 'Errori Comuni da Evitare'}
                  </h4>
                </div>
                <ul className="space-y-1 text-xs text-rose-900 dark:text-rose-200/90 pl-1">
                  {(language === 'en' ? exercise.commonMistakesEn : exercise.commonMistakes).map((mistake, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Assistant Section for Form and Alternatives */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-brand-500" />
                  {language === 'en' ? 'AI Workout Coach' : 'Assistente IA da Palestra'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAskAiForTips('form')}
                    disabled={isLoadingAiTip}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-slate-700 dark:text-slate-200 hover:text-emerald-500 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {language === 'en' ? '✨ Form Cues' : '✨ Trucchi Esecuzione'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskAiForTips('alternative')}
                    disabled={isLoadingAiTip}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-slate-700 dark:text-slate-200 hover:text-emerald-500 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {language === 'en' ? '🔄 Alternatives' : '🔄 Macchina Occupata?'}
                  </button>
                </div>
              </div>

              {isLoadingAiTip && (
                <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-600 dark:text-brand-400 animate-pulse flex items-center gap-2">
                  <Sparkles size={14} className="animate-spin" />
                  <span>{language === 'en' ? 'Gemini AI is analyzing the exercise...' : 'Gemini IA sta analizzando l\'esercizio...'}</span>
                </div>
              )}

              {aiTip && !isLoadingAiTip && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/30 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium space-y-1">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>{language === 'en' ? 'Coach Feedback:' : 'Consiglio del Coach:'}</span>
                  </div>
                  <div className="whitespace-pre-line">{aiTip}</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExerciseDetailModal;
