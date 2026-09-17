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
    const hasSpeech = typeof window !== 'undefined' && 
      Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setIsSupported(hasSpeech);
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore if already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        language === 'en'
          ? 'Voice recognition is not supported on this device/browser.'
          : 'Il riconoscimento vocale non è supportato su questo browser.'
      );
      return;
    }

    // Step 1: Explicitly request microphone stream to trigger iOS system permission dialog
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop the tracks so speech recognition can use the hardware mic
        stream.getTracks().forEach(t => t.stop());
      } catch (err: any) {
        console.warn('Microphone permission request failed:', err);
        alert(
          language === 'en'
            ? 'Microphone access is blocked.\nOn iPhone, go to Settings > Safari > Microphone (or Settings > Safari > Advanced > Website Data) and set it to Allow.'
            : 'Accesso al microfono non consentito.\nSu iPhone vai in: Impostazioni > Safari > Microfono (in basso) e seleziona "Consenti".'
        );
        return;
      }
    }

    // Step 2: Instantiate SpeechRecognition fresh inside the click gesture
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'en' ? 'en-US' : 'it-IT';

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        stopListening();
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event);
        stopListening();
      };

      recognition.onend = () => {
        stopListening();
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      stopListening();
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
