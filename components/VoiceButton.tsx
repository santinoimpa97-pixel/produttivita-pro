import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: number;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscript, className = '', size = 16 }) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'en' ? 'en-US' : 'it-IT';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event?.error === 'not-allowed') {
          alert(
            language === 'en'
              ? 'Microphone access is blocked. Please allow microphone in your browser settings (tap "aA" in Safari address bar -> Website Settings -> Microphone -> Allow).'
              : 'Accesso al microfono bloccato. Per riattivarlo: tocca l\'icona "aA" nella barra indirizzi di Safari -> Impostazioni sito web -> Microfono -> Consenti.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, onTranscript]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'en' ? 'en-US' : 'it-IT';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
        setIsListening(false);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-xl transition-all ${
        isListening
          ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
          : 'text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${className}`}
      title={isListening ? (language === 'en' ? 'Listening...' : 'In ascolto...') : (language === 'en' ? 'Voice dictation' : 'Dettatura vocale')}
    >
      {isListening ? <MicOff size={size} /> : <Mic size={size} />}
    </button>
  );
};

export default VoiceButton;
