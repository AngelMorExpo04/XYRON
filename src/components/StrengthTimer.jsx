import { useState, useEffect, useRef } from 'react';
import { Timer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StrengthTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const requestRef = useRef();
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playBeep = (freq = 440, type = 'sine') => {
    if (!audioCtxRef.current) return;
    const oscillator = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);
    
    oscillator.start();
    oscillator.stop(audioCtxRef.current.currentTime + 0.5);
  };

  const animate = () => {
    if (!endTimeRef.current) return;
    
    const now = Date.now();
    const remainingMs = Math.max(0, endTimeRef.current - now);
    
    if (remainingMs <= 0) {
      playBeep(880, 'square');
      setTimeLeft(0);
      setIsActive(false);
    } else {
      if (remainingMs <= 5000) {
        const currentSeconds = Math.ceil(remainingMs / 1000);
        const prevSeconds = Math.ceil((remainingMs + 16) / 1000);
        if (currentSeconds < prevSeconds && currentSeconds > 0) {
          playBeep(440, 'sine');
        }
      }
      
      setTimeLeft(Math.ceil(remainingMs / 1000));
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive]);

  const startTimer = (seconds) => {
    initAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    const now = Date.now();
    startTimeRef.current = now;
    endTimeRef.current = now + seconds * 1000;
    
    setTotalDuration(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const cancelTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    setTotalDuration(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full py-6 pb-10">
      <motion.div 
        layoutId="shared-main-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="skeuo-panel flex flex-col items-center justify-center py-10 px-6 w-full max-w-sm my-auto overflow-hidden relative"
      >
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 15 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: -15 }}
           transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
           className="w-full flex flex-col items-center"
        >
          {/* Light Indicators */}
          <div className="flex gap-2.5 mb-8 items-center justify-center">
            {Array.from({ length: 6 }).map((_, i) => {
              const elapsed = totalDuration > 0 ? totalDuration - timeLeft : 0;
            const threshold = (i / 6) * totalDuration;
            const isOn = isActive && elapsed >= threshold;
            
            return (
              <div 
                key={i}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-300 shrink-0"
                style={{
                  backgroundColor: isOn ? '#d25c46' : '#cbd5e1',
                  boxShadow: isOn 
                    ? 'inset -1.5px -1.5px 3px rgba(0,0,0,0.3), inset 1.5px 1.5px 3px rgba(255,255,255,0.4), 0 0 12px 1px rgba(210, 92, 70, 0.7)' 
                    : 'inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.8), 0.5px 0.5px 1px rgba(255,255,255,0.5)'
                }}
              />
            );
          })}
        </div>
        
        {/* LCD Screen */}
        <div className="skeuo-screen flex flex-col items-center justify-center mb-10 w-full max-w-sm py-8 px-4">
          <div className="text-xs uppercase tracking-widest font-bold opacity-60 mb-2">
            {isActive ? 'Descansando' : 'Listo'}
          </div>
          <div className="text-7xl sm:text-8xl font-bold font-mono tracking-tighter" style={{ textShadow: '2px 2px 0 rgba(255,255,255,0.4)' }}>
            {formatTime(timeLeft)}
          </div>
        </div>

      {/* Buttons */}
      <div className="flex flex-col gap-6 w-full max-w-sm h-[72px] justify-center relative">
        <AnimatePresence mode="wait">
          {!isActive ? (
            <motion.div 
              key="start-buttons"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex gap-4 absolute inset-0 w-full"
            >
              <button
                onClick={() => startTimer(60)}
                className="skeuo-btn flex-1 py-5 text-xl rounded-xl"
              >
                60s
              </button>
              <button
                onClick={() => startTimer(90)}
                className="skeuo-btn flex-1 py-5 text-xl rounded-xl"
              >
                90s
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="cancel-button"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.2, type: "spring", bounce: 0.3 }}
              onClick={cancelTimer}
              className="skeuo-btn-danger absolute inset-0 w-full py-5 flex items-center justify-center gap-3 text-xl rounded-xl"
            >
              <X size={24} /> Cancelar
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      </motion.div>
      </motion.div>
    </div>
  );
}
