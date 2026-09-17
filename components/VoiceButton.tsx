import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { transcribeAudioWithGemini, getEffectiveGeminiApiKey } from '../services/geminiService';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: number;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscript, className = '', size = 16 }) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);
  const hasTranscribedRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  const stopAll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  };

  // 1. Fallback: Gemini MediaRecorder for environments where Web Speech fails (e.g. iOS Home Screen PWA)
  const startGeminiRecorder = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        language === 'en'
          ? 'Microphone not supported. On iPhone, you can also use the native dictation mic on the keyboard.'
          : 'Microfono non supportato. Su iPhone puoi anche usare il microfono nativo di Siri sulla tastiera in basso a destra.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];
      hasTranscribedRef.current = false;

      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        const candidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/aac'];
        for (const cand of candidates) {
          if (MediaRecorder.isTypeSupported(cand)) {
            mimeType = cand;
            break;
          }
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        const currentMime = recorder.mimeType || 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type: currentMime });

        if (audioBlob.size > 300) {
          setIsTranscribing(true);
          try {
            const key = getEffectiveGeminiApiKey();
            if (!key) {
              alert(
                language === 'en'
                  ? 'Gemini API key is required on this device. Go to Profile > Gemini AI Key to paste your key, or use the iPhone keyboard microphone.'
                  : 'Chiave API Gemini mancante su questo dispositivo. Vai su Profilo > Chiave API Gemini per inserirla, oppure usa il microfono di Siri sulla tastiera dell\'iPhone.'
              );
              return;
            }
            const text = await transcribeAudioWithGemini(audioBlob, language);
            if (text && text.trim()) {
              onTranscript(text.trim());
            }
          } catch (err: any) {
            console.error('Gemini transcription failed:', err);
            alert(
              language === 'en'
                ? `Voice note error: ${err?.message || 'Check Gemini key in Profile'}`
                : `Errore voce: ${err?.message || 'Verifica la chiave API Gemini nel Profilo'}`
            );
          } finally {
            setIsTranscribing(false);
          }
        } else {
          setIsTranscribing(false);
        }
      };

      // Start without timeslice to ensure iOS produces valid single-container audio file
      recorder.start();
      setIsListening(true);
      setRecordSeconds(0);

      let sec = 0;
      timerRef.current = setInterval(() => {
        sec += 1;
        setRecordSeconds(sec);
        if (sec >= 30) {
          stopAll();
        }
      }, 1000);

    } catch (err: any) {
      console.warn('getUserMedia failed:', err);
      alert(
        language === 'en'
          ? 'Microphone blocked. Go to iPhone Settings > Safari > Microphone > Allow, or use the keyboard microphone.'
          : 'Accesso al microfono bloccato. Vai su Impostazioni iPhone > Safari > Microfono > Consenti, oppure usa il microfono sulla tastiera.'
      );
      stopAll();
    }
  };

  // Primary Action Handler
  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTranscribing) return;

    if (isListening) {
      stopAll();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // Check if running as Standalone PWA on iOS (where Apple blocks webkitSpeechRecognition)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && isStandalone) {
      // In iOS PWA Home Screen mode, use Gemini MediaRecorder directly
      startGeminiRecorder();
      return;
    }

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = language === 'en' ? 'en-US' : 'it-IT';

        let capturedText = '';

        recognition.onstart = () => {
          setIsListening(true);
          setRecordSeconds(0);
          let sec = 0;
          timerRef.current = setInterval(() => {
            sec += 1;
            setRecordSeconds(sec);
          }, 1000);
        };

        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = 0; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          if (text) {
            capturedText = text;
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event);
          stopAll();
          // If Web Speech fails on iOS Safari, attempt Gemini recorder
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
            startGeminiRecorder();
          }
        };

        recognition.onend = () => {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsListening(false);
          if (capturedText && capturedText.trim()) {
            onTranscript(capturedText.trim());
          }
        };

        recognitionRef.current = recognition;
        recognition.start();

      } catch (err) {
        console.warn('SpeechRecognition start failed, falling back to Gemini:', err);
        startGeminiRecorder();
      }
    } else {
      startGeminiRecorder();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={isTranscribing}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all select-none active:scale-95 ${
        isListening
          ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/40 ring-2 ring-rose-400'
          : isTranscribing
          ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400 cursor-wait'
          : 'text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${className}`}
      title={
        isListening
          ? (language === 'en' ? `Listening (${recordSeconds}s) - Tap to finish` : `In ascolto (${recordSeconds}s) - Tocca per terminare`)
          : isTranscribing
          ? (language === 'en' ? 'Transcribing with AI...' : 'Trascrizione IA in corso...')
          : (language === 'en' ? 'Voice dictation' : 'Dettatura vocale')
      }
    >
      {isTranscribing ? (
        <>
          <Loader2 size={size} className="animate-spin text-brand-600 dark:text-brand-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">IA...</span>
        </>
      ) : isListening ? (
        <>
          <Square size={size - 2} className="fill-current text-white animate-bounce" />
          <span className="text-[11px] font-mono font-bold">{recordSeconds}s</span>
        </>
      ) : (
        <Mic size={size} />
      )}
    </button>
  );
};

export default VoiceButton;
