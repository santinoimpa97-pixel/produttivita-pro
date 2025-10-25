
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Durations in seconds
const POMODORO_DURATION = 25 * 60;
const SHORT_BREAK_DURATION = 5 * 60;
const LONG_BREAK_DURATION = 15 * 60;
const POMODOROS_UNTIL_LONG_BREAK = 4;

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

// Audio notification
const playSound = () => {
    if (typeof window.AudioContext === 'undefined' && typeof (window as any).webkitAudioContext === 'undefined') {
        console.warn('Browser does not support AudioContext');
        return;
    }
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
};

const PomodoroView: React.FC = () => {
    const [mode, setMode] = useState<Mode>('pomodoro');
    const [timeRemaining, setTimeRemaining] = useState(POMODORO_DURATION);
    const [isActive, setIsActive] = useState(false);
    const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

    const timerId = useRef<number | null>(null);

    const getDuration = useCallback((currentMode: Mode) => {
        switch (currentMode) {
            case 'pomodoro': return POMODORO_DURATION;
            case 'shortBreak': return SHORT_BREAK_DURATION;
            case 'longBreak': return LONG_BREAK_DURATION;
        }
    }, []);
    
    const switchMode = useCallback((newMode: Mode) => {
        if (timerId.current) {
            clearInterval(timerId.current);
        }
        setIsActive(false);
        setMode(newMode);
        setTimeRemaining(getDuration(newMode));
    }, [getDuration]);


    useEffect(() => {
        if (isActive && timeRemaining > 0) {
            timerId.current = window.setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            playSound();
            setIsActive(false);
            if (mode === 'pomodoro') {
                const newPomodorosCompleted = pomodorosCompleted + 1;
                setPomodorosCompleted(newPomodorosCompleted);
                if (newPomodorosCompleted > 0 && newPomodorosCompleted % POMODOROS_UNTIL_LONG_BREAK === 0) {
                    switchMode('longBreak');
                } else {
                    switchMode('shortBreak');
                }
            } else { // It was a break
                switchMode('pomodoro');
            }
        }

        return () => {
            if (timerId.current) {
                clearInterval(timerId.current);
            }
        };
    }, [isActive, timeRemaining, mode, pomodorosCompleted, switchMode]);

    useEffect(() => {
        if (!isActive) {
            document.title = 'Produttività Pro';
            return;
        }
        const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
        const seconds = (timeRemaining % 60).toString().padStart(2, '0');
        document.title = `${minutes}:${seconds} - ${mode === 'pomodoro' ? 'Concentrazione' : 'Pausa'}`;
        
        return () => { document.title = 'Produttività Pro'; };
    }, [timeRemaining, mode, isActive]);

    const handleToggle = () => setIsActive(!isActive);

    const handleReset = () => {
        if (timerId.current) {
            clearInterval(timerId.current);
        }
        setIsActive(false);
        setTimeRemaining(getDuration(mode));
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const totalDuration = getDuration(mode);
    const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;
    
    const messages: Record<Mode, string> = {
        pomodoro: "È ora di concentrarsi!",
        shortBreak: "Fai una breve pausa.",
        longBreak: "Prenditi una pausa più lunga."
    };

    const modeClasses = "px-4 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base";
    const activeModeClasses = "bg-violet-600 text-white shadow";
    const inactiveModeClasses = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600";

    return (
        <div className="flex flex-col items-center justify-center p-4 space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg w-full max-w-sm text-center">
                <div className="flex justify-center gap-2 mb-6">
                    <button onClick={() => switchMode('pomodoro')} className={`${modeClasses} ${mode === 'pomodoro' ? activeModeClasses : inactiveModeClasses}`}>Pomodoro</button>
                    <button onClick={() => switchMode('shortBreak')} className={`${modeClasses} ${mode === 'shortBreak' ? activeModeClasses : inactiveModeClasses}`}>Pausa Breve</button>
                    <button onClick={() => switchMode('longBreak')} className={`${modeClasses} ${mode === 'longBreak' ? activeModeClasses : inactiveModeClasses}`}>Pausa Lunga</button>
                </div>

                <div className="relative w-64 h-64 mx-auto mb-6">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="stroke-slate-200 dark:stroke-slate-700" />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            strokeWidth="12"
                            className="stroke-violet-600 dark:stroke-violet-500"
                            strokeLinecap="round"
                            style={{
                                strokeDasharray: 339.292, // 2 * PI * 54
                                strokeDashoffset: 339.292 - (progress / 100) * 339.292,
                                transform: 'rotate(-90deg)',
                                transformOrigin: 'center',
                                transition: 'stroke-dashoffset 0.5s linear'
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">{formatTime(timeRemaining)}</span>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">{messages[mode]}</p>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-4">
                    <button onClick={handleToggle} className="px-10 py-3 text-xl font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 w-40 transition-all uppercase tracking-wider">
                        {isActive ? 'Pausa' : 'Inizia'}
                    </button>
                    <button onClick={handleReset} title="Reset Timer" className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600 dark:text-slate-300">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v4.992m0 0h-4.992m4.992 0-3.181-3.183a8.25 8.25 0 0 0-11.667 0L2.985 16.953Z" />
                        </svg>
                    </button>
                </div>

                <div className="mt-6 text-slate-600 dark:text-slate-400">
                    <span>Sessioni completate: </span>
                    <span className="font-bold">{pomodorosCompleted}</span>
                </div>
            </div>
        </div>
    );
};

export default PomodoroView;
