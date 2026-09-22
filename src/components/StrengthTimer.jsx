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

  // Progress for the giant circle
  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  // Use strokeDasharray="283" for a circle of r="45" (2 * PI * 45 ≈ 282.7)
  const dashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="flex flex-col items-center justify-between min-h-[75vh] h-full w-full py-4 pb-16 relative overflow-hidden">
      
      {/* Background ambient pulse */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 40%, rgba(189, 252, 50, 0.15) 0%, transparent 60%)'
            }}
          />
        )}
      </AnimatePresence>

      <motion.div 
        layoutId="shared-main-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="z-10 flex flex-col items-center justify-between flex-1 w-full max-w-sm mx-auto"
      >
        
        {/* Giant Circle Timer Area */}
        <div className="relative flex flex-col items-center justify-center flex-1 w-full max-h-[60vh] aspect-square mt-4">
          
          <svg className="absolute w-[85vw] max-w-[360px] h-full transform -rotate-90 pointer-events-none overflow-visible" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="2"
            />
            {/* Animated active track */}
            {isActive && (
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#bdfc32"
                strokeWidth="4"
                strokeDasharray="283"
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
                style={{ filter: 'drop-shadow(0 0 12px rgba(189,252,50,0.8))' }}
              />
            )}
            {/* Inner ambient ring */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="rgba(255,255,255,0.02)"
              stroke={isActive ? 'rgba(189,252,50,0.1)' : 'rgba(255,255,255,0.05)'}
              strokeWidth="1"
            />
          </svg>

          {/* Central Time Display */}
          <div className="flex flex-col items-center justify-center z-10 w-full absolute inset-0">
            <motion.div 
              animate={isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="text-[8rem] sm:text-[10rem] font-bold tracking-tighter tabular-nums leading-none flex items-center justify-center h-40" 
              style={{ 
                color: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                textShadow: isActive ? '0 0 40px rgba(189,252,50,0.4)' : 'none'
              }}
            >
              {formatTime(timeLeft)}
            </motion.div>
            
            <div className={`text-sm uppercase tracking-[0.3em] font-black mt-2 transition-colors ${isActive ? 'text-[#bdfc32]' : 'text-gray-600'}`}>
              {isActive ? 'Recuperación' : 'Selecciona'}
            </div>
            
            {/* Extra active action (Add 30s) inside the circle */}
            <AnimatePresence>
              {isActive && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => addTime(30)}
                  className="mt-8 px-5 py-2 rounded-full glass-panel flex items-center gap-2 text-white hover:text-[#bdfc32] hover:bg-white/10 transition-colors text-sm font-bold"
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
                  className="w-28 h-28 flex flex-col items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-gray-300 hover:text-white"
                >
                  <span className="text-4xl font-bold">60<span className="text-xl text-gray-500">s</span></span>
                </button>
                <button
                  onClick={() => startTimer(90)}
                  className="w-28 h-28 flex flex-col items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-gray-300 hover:text-white"
                >
                  <span className="text-4xl font-bold">90<span className="text-xl text-gray-500">s</span></span>
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
