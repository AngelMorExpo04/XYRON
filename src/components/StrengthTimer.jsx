import { useState, useEffect, useRef } from 'react';
import { Timer, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useWakeLock from '../hooks/useWakeLock';

export default function StrengthTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);

  useWakeLock(isActive);
  
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const requestRef = useRef();
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playBeep = (freq = 440, type = 'square', vol = 1.0) => {
    if (!audioCtxRef.current) return;
    const oscillator = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    
    gainNode.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
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
      playBeep(880, 'square', 1.5);
      setTimeLeft(0);
      setIsActive(false);
    } else {
      if (remainingMs <= 5000) {
        const currentSeconds = Math.ceil(remainingMs / 1000);
        const prevSeconds = Math.ceil((remainingMs + 16) / 1000);
        if (currentSeconds < prevSeconds && currentSeconds > 0) {
          playBeep(660, 'square', 1.0);
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
    <div className="flex flex-col items-center justify-between h-full w-full py-8 pb-12 relative">
      
      {/* Ambient Glow */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(189, 252, 50, 0.12) 0%, transparent 70%)'
            }}
          />
        )}
      </AnimatePresence>

      <motion.div 
        layoutId="shared-main-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="z-10 flex flex-col items-center justify-between h-full w-full max-w-sm mx-auto"
      >
        
        {/* Top: Light Indicators */}
        <div className="flex gap-4 items-center justify-center pt-8">
          {Array.from({ length: 6 }).map((_, i) => {
            const elapsed = totalDuration > 0 ? totalDuration - timeLeft : 0;
            const threshold = (i / 6) * totalDuration;
            const isOn = isActive && elapsed >= threshold;
            
            return (
              <div 
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 shrink-0 ${isOn ? 'bg-[#bdfc32]' : 'bg-white/10'}`}
                style={{
                  boxShadow: isOn ? '0 0 16px rgba(189,252,50,0.8)' : 'none'
                }}
              />
            );
          })}
        </div>
        
        {/* Center: Massive Timer */}
        <div className="flex flex-col items-center justify-center flex-1 w-full">
          <motion.div 
            animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-[7rem] sm:text-[9rem] font-semibold tracking-tighter tabular-nums leading-none" 
            style={{ 
              color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
              textShadow: isActive ? '0 0 40px rgba(189,252,50,0.5)' : 'none'
            }}
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div className={`text-sm uppercase tracking-widest font-bold mt-6 transition-colors ${isActive ? 'text-[#bdfc32]' : 'text-gray-500'}`}>
            {isActive ? 'Descansando' : 'Listo'}
          </div>
        </div>

        {/* Bottom: Action Buttons */}
        <div className="flex flex-col items-center justify-center w-full h-[120px] relative pb-6">
          <AnimatePresence mode="wait">
            {!isActive ? (
              <motion.div 
                key="start-buttons"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex gap-8 absolute inset-0 w-full items-center justify-center"
              >
                <button
                  onClick={() => startTimer(60)}
                  className="glass-btn w-28 h-28 flex flex-col items-center justify-center rounded-full text-white hover:text-[#bdfc32] hover:bg-white/15"
                >
                  <span className="text-3xl font-bold">60s</span>
                </button>
                <button
                  onClick={() => startTimer(90)}
                  className="glass-btn w-28 h-28 flex flex-col items-center justify-center rounded-full text-white hover:text-[#bdfc32] hover:bg-white/15"
                >
                  <span className="text-3xl font-bold">90s</span>
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="cancel-button"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, type: "spring", bounce: 0.3 }}
                onClick={cancelTimer}
                className="glass-btn w-24 h-24 flex flex-col items-center justify-center rounded-full text-red-500 bg-red-500/10 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                <X size={40} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
