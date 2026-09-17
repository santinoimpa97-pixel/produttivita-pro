import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { transcribeAudioWithGemini } from '../services/geminiService';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: number;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscript, className = '', size = 16 }) => {
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const stopAndProcessRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping mediaRecorder:', e);
      }
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        language === 'en'
          ? 'Audio recording is not supported on this browser.'
          : 'La registrazione audio non è supportata su questo browser.'
      );
      return;
    }

    audioChunksRef.current = [];
    setRecordSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Select best supported MIME type
      let mimeType = '';
      const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg'
      ];
      for (const t of types) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
          mimeType = t;
          break;
        }
      }

      const recorder = mimeType 
        ? new MediaRecorder(stream, { mimeType }) 
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Release hardware mic tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        const currentMime = recorder.mimeType || 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type: currentMime });

        if (audioBlob.size > 500) {
          setIsTranscribing(true);
          try {
            const transcribed = await transcribeAudioWithGemini(audioBlob, language);
            if (transcribed && transcribed.trim()) {
              onTranscript(transcribed.trim());
            }
          } catch (err: any) {
            console.error('Transcription error:', err);
            alert(
              language === 'en'
                ? `Transcription error: ${err?.message || 'Please check Gemini API key in Profile'}`
                : `Errore trascrizione: ${err?.message || 'Verifica la chiave API Gemini nel Profilo'}`
            );
          } finally {
            setIsTranscribing(false);
          }
        } else {
          setIsTranscribing(false);
        }
      };

      recorder.start(250); // collect chunks every 250ms
      setIsRecording(true);

      // Start elapsed timer and auto-stop after 45 seconds
      let sec = 0;
      timerRef.current = setInterval(() => {
        sec += 1;
        setRecordSeconds(sec);
        if (sec >= 45) {
          stopAndProcessRecording();
        }
      }, 1000);

    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      alert(
        language === 'en'
          ? 'Microphone permission blocked.\nOn iPhone: go to Settings > Safari > Microphone and select Allow.'
          : 'Accesso al microfono non consentito.\nSu iPhone vai in: Impostazioni > Safari > Microfono e seleziona "Consenti".'
      );
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTranscribing) return;

    if (isRecording) {
      stopAndProcessRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isTranscribing}
      className={`relative inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all select-none ${
        isRecording
          ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/40 ring-2 ring-rose-400'
          : isTranscribing
          ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400 cursor-wait'
          : 'text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${className}`}
      title={
        isRecording
          ? (language === 'en' ? `Recording (${recordSeconds}s) - Tap to send` : `In ascolto (${recordSeconds}s) - Tocca per trascrivere`)
          : isTranscribing
          ? (language === 'en' ? 'Transcribing with AI...' : 'Trascrizione IA in corso...')
          : (language === 'en' ? 'Voice dictation (AI powered)' : 'Dettatura vocale con IA')
      }
    >
      {isTranscribing ? (
        <>
          <Loader2 size={size} className="animate-spin text-brand-600 dark:text-brand-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">IA...</span>
        </>
      ) : isRecording ? (
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
