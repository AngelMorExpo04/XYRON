import { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
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
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      playBeep(880, 'square', 1.5);
      setTimeLeft(0);
      setIsActive(false);
    } else {
      const currentSeconds = Math.ceil(remainingMs / 1000);
      const prevSeconds = Math.ceil((remainingMs + 16) / 1000);
      
      if (currentSeconds < prevSeconds && currentSeconds > 0) {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        
        if (remainingMs <= 5000) {
          playBeep(660, 'square', 1.0);
        } else {
          // Play silent beep to keep AudioContext awake on iOS
          playBeep(440, 'sine', 0.0001);
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
    // Initial silent beep to lock in the AudioContext on iOS
    playBeep(440, 'sine', 0.0001);
    
    const now = Date.now();
    startTimeRef.current = now;
    endTimeRef.current = now + seconds * 1000;
    
    setTotalDuration(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const addTime = (seconds) => {
    if (!isActive) return;
    endTimeRef.current += seconds * 1000;
    setTotalDuration(prev => prev + seconds);
    setTimeLeft(prev => prev + seconds);
  };

  const cancelTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    setTotalDuration(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : s.toString();
  };

  // Progress percent from 1 (full) to 0 (empty)
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;

  return (
    <div className="flex flex-col items-center justify-between min-h-[75vh] h-full w-full py-4 pb-16 relative">
      
      {/* Background ambient orb that shrinks with time */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: progress * 1.5 + 0.2 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 1, ease: "linear" }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] z-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(189, 252, 50, 0.15) 0%, rgba(189, 252, 50, 0.05) 30%, transparent 70%)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Ultra-thin Laser Progress Bar (Top edge) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5">
        <motion.div 
          className="h-full bg-[#bdfc32]"
          style={{ width: `${progress * 100}%`, filter: 'drop-shadow(0 0 8px #bdfc32)' }}
          layout
        />
      </div>

      <motion.div 
        layoutId="shared-main-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="z-10 flex flex-col items-center justify-between flex-1 w-full max-w-sm mx-auto h-full"
      >
        
        {/* Central Typographic Timer */}
        <div className="relative flex flex-col items-center justify-center flex-1 w-full mt-10">
          
          <div className={`text-sm uppercase tracking-[0.4em] font-black mb-8 transition-colors ${isActive ? 'text-[#bdfc32]' : 'text-gray-600'}`}>
            {isActive ? 'Recuperación' : 'Descanso'}
          </div>

          {/* Animated Numbers */}
          <div className="relative h-40 w-full flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={timeLeft}
                initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -50, filter: 'blur(8px)' }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute p-12 text-[9rem] sm:text-[11rem] font-bold tracking-tighter tabular-nums leading-none"
                style={{ 
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.2)',
                  textShadow: isActive ? '0 0 30px rgba(189,252,50,0.3)' : 'none'
                }}
              >
                {formatTime(timeLeft)}
              </motion.div>
            </AnimatePresence>
          </div>
            
          {/* Extra active action (Add 30s) */}
          <div className="h-16 mt-8 flex items-center justify-center">
            <AnimatePresence>
              {isActive && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => addTime(30)}
                  className="px-6 py-3 rounded-full flex items-center gap-2 text-gray-300 hover:text-[#bdfc32] hover:bg-white/5 transition-all text-sm font-bold backdrop-blur-md"
                >
                  <Plus size={16} /> 30s
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom: Action Buttons */}
        <div className="flex flex-col items-center justify-end w-full h-[140px] relative mt-auto">
          <AnimatePresence mode="wait">
            {!isActive ? (
              <motion.div 
                key="start-buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex gap-6 absolute inset-0 w-full items-center justify-center pb-4"
              >
                <button
                  onClick={() => startTimer(60)}
                  className="w-28 h-28 flex flex-col items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all text-gray-300 hover:text-white"
                >
                  <span className="text-4xl font-bold">60<span className="text-xl text-[#bdfc32]">s</span></span>
                </button>
                <button
                  onClick={() => startTimer(90)}
                  className="w-28 h-28 flex flex-col items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all text-gray-300 hover:text-white"
                >
                  <span className="text-4xl font-bold">90<span className="text-xl text-[#bdfc32]">s</span></span>
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="cancel-button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                onClick={cancelTimer}
                className="w-24 h-24 flex items-center justify-center rounded-full text-red-500 bg-red-500/10 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] mb-4"
              >
                <X size={44} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
