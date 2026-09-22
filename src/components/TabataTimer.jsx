import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useWakeLock from '../hooks/useWakeLock';

const WORK_TIME = 45;
const REST_TIME = 15;

const defaultExercises = [
  'Burpees',
  'Flexiones',
  'Sentadillas',
  'Plancha'
];

export default function TabataTimer() {
  const [totalRounds, setTotalRounds] = useState(2);
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('neonfit_tabata_exercises');
    return saved ? JSON.parse(saved) : defaultExercises;
  });
  
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  useWakeLock(isActive);
  const [phase, setPhase] = useState('work'); // 'work' | 'rest' | 'done'
  const [exerciseCount, setExerciseCount] = useState(1);
  const [roundCount, setRoundCount] = useState(1);
  
  const startTimeRef = useRef(null);
  const timeLeftAtPauseRef = useRef(WORK_TIME * 1000);
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

  const advancePhase = () => {
    if (phase === 'work') {
      setPhase('rest');
      return REST_TIME * 1000;
    } else {
      if (exerciseCount < exercises.length) {
        setExerciseCount(prev => prev + 1);
        setPhase('work');
        return WORK_TIME * 1000;
      } else {
        if (roundCount < totalRounds) {
          setRoundCount(prev => prev + 1);
          setExerciseCount(1);
          setPhase('work');
          return WORK_TIME * 1000;
        } else {
          setPhase('done');
          setIsActive(false);
          return 0;
        }
      }
    }
  };

  const animate = () => {
    if (!startTimeRef.current) return;
    
    const now = Date.now();
    const delta = now - startTimeRef.current;
    let newTimeLeftMs = timeLeftAtPauseRef.current - delta;

    if (newTimeLeftMs <= 0) {
      playBeep(880, 'square', 1.5);
      const nextTime = advancePhase();
      if (nextTime > 0) {
        startTimeRef.current = Date.now();
        timeLeftAtPauseRef.current = nextTime;
        newTimeLeftMs = nextTime;
      } else {
        newTimeLeftMs = 0;
      }
    } else if (newTimeLeftMs > 0 && newTimeLeftMs <= 3000) {
      const currentSeconds = Math.ceil(newTimeLeftMs / 1000);
      const prevSeconds = Math.ceil((newTimeLeftMs + 16) / 1000);
      if (currentSeconds < prevSeconds && currentSeconds > 0) {
        playBeep(660, 'square', 1.0);
      }
    }

    setTimeLeft(Math.ceil(newTimeLeftMs / 1000));
    
    if (isActive && phase !== 'done') {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      timeLeftAtPauseRef.current = timeLeft * 1000;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, phase, exerciseCount, roundCount, totalRounds, exercises.length]);

  const toggleTimer = () => {
    if (exercises.length === 0) {
      alert("Añade al menos un ejercicio antes de empezar.");
      return;
    }
    initAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    if (phase === 'done') return;
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setPhase('work');
    setExerciseCount(1);
    setRoundCount(1);
    setTimeLeft(WORK_TIME);
    timeLeftAtPauseRef.current = WORK_TIME * 1000;
  };

  const isIdle = !isActive && phase === 'work' && exerciseCount === 1 && roundCount === 1 && timeLeft === WORK_TIME;
  const activeGreenCount = isIdle ? 0 : roundCount;

  const updateRounds = (amt) => {
    if (!isIdle) return;
    setTotalRounds(prev => Math.max(1, prev + amt));
  };

  const saveExercises = (newExercises) => {
    setExercises(newExercises);
    localStorage.setItem('neonfit_tabata_exercises', JSON.stringify(newExercises));
  };

  const handleExerciseChange = (index, value) => {
    const newEx = [...exercises];
    newEx[index] = value;
    saveExercises(newEx);
  };

  const addExercise = () => {
    saveExercises([...exercises, '']);
  };

  const removeExercise = (index) => {
    const newEx = exercises.filter((_, i) => i !== index);
    saveExercises(newEx);
  };

  const totalTime = phase === 'work' ? WORK_TIME : REST_TIME;
  const progressPercent = phase === 'done' ? 100 : ((totalTime - timeLeft) / totalTime) * 100;
  
  const circleColor = phase === 'work' ? '#bdfc32' : phase === 'rest' ? '#facc15' : '#4b5563';

  const currentExercise = exercises[exerciseCount - 1] || '';
  let nextExercise = '';
  if (exerciseCount < exercises.length) {
    nextExercise = exercises[exerciseCount];
  } else if (roundCount < totalRounds) {
    nextExercise = exercises[0] + ' (Sig. Ronda)';
  } else {
    nextExercise = 'FIN TABATA';
  }

  return (
    <div className="flex flex-col items-center min-h-full w-full py-6 pb-24">
      
      {/* Exercises Section */}
      <div className="w-full flex flex-col min-h-[220px] mb-8 mt-2">
        <AnimatePresence mode="wait">
          {!isIdle ? (
            /* Active Workout Screen (Minimalist) */
            <motion.div 
              key="active"
              layoutId="shared-main-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-panel p-6 w-full flex flex-col items-center text-center justify-center min-h-[200px]"
            >
              <div className="mb-4 pb-4 border-b border-white/10 w-full flex flex-col items-center">
                <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">
                  Actual ({exerciseCount}/{exercises.length})
                </span>
                <div className="text-xl sm:text-2xl font-bold h-10 flex justify-center items-center text-[#bdfc32]">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={phase === 'done' ? 'done' : exerciseCount}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="block"
                    >
                      {phase === 'done' ? '-' : currentExercise}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex flex-col items-center w-full">
                <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">
                  Siguiente
                </span>
                <div className="text-base sm:text-lg font-semibold h-6 text-gray-300">
                  <AnimatePresence mode="popLayout">
                    <motion.span 
                      key={phase === 'done' ? 'done' : exerciseCount}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="block"
                    >
                      {phase === 'done' ? '-' : nextExercise}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Editable Exercise List (Minimalist) */
            <motion.div 
              key="list"
              layoutId="shared-main-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-panel p-5 flex flex-col gap-4 w-full"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm tracking-wider text-white">Lista de Ejercicios</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-white/10 rounded-md text-[#bdfc32]">
                  Total: {exercises.length}
                </span>
              </div>
              
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                {exercises.map((ex, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="flex items-center justify-center w-6 text-[10px] font-bold text-gray-500">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={ex}
                      onChange={(e) => handleExerciseChange(idx, e.target.value)}
                      className="glass-input flex-1 text-sm py-2"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); removeExercise(idx); }}
                      className="glass-btn p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                      disabled={exercises.length <= 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); addExercise(); }}
                className="glass-btn mt-2 py-3 rounded-xl flex items-center justify-center gap-2 text-sm text-[#bdfc32] w-full"
              >
                <Plus size={16} /> Añadir Ejercicio
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern Main Dial & Controls */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center w-full mt-4 shrink-0 gap-8"
      >
        
        {/* The Clean Circular Timer */}
        <div className="relative flex items-center justify-center w-64 h-64">
          
          {/* Progress Ring */}
          <svg className="absolute w-full h-full transform -rotate-90 pointer-events-none overflow-visible" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="4"
            />
            {/* Active track */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={circleColor}
              strokeWidth="6"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-[200ms] ease-linear"
              style={{ filter: `drop-shadow(0 0 4px ${circleColor})` }}
            />
          </svg>

          {/* Central Time Display */}
          <div className="flex flex-col items-center justify-center z-10 w-full h-full rounded-full">
            <span className="text-7xl font-bold tracking-tighter tabular-nums" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.8)' }}>
              {timeLeft}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${phase === 'work' ? 'text-[#bdfc32]' : phase === 'rest' ? 'text-[#facc15]' : 'text-gray-500'}`}>
              {phase === 'done' ? 'FIN' : phase === 'work' ? 'TRABAJO' : 'DESCANSO'}
            </span>
          </div>
          
        </div>

        {/* Action Buttons (Apple Watch Style) */}
        <div className="flex items-center justify-center gap-6 w-full">
          
          {/* Reset or Rounds (-) */}
          {isIdle ? (
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); updateRounds(-1); }}
              className="w-16 h-16 rounded-full glass-btn flex items-center justify-center text-white"
            >
              <Minus size={24} />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); resetTimer(); }}
              className="w-16 h-16 rounded-full glass-btn flex items-center justify-center text-red-500"
            >
              <RotateCcw size={22} />
            </button>
          )}

          {/* Main Play/Pause Button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleTimer(); }}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-[#bdfc32] text-black shadow-[0_0_20px_rgba(189,252,50,0.4)]'}`}
          >
            {isActive 
              ? <Pause size={32} fill="currentColor" /> 
              : <Play size={32} fill="currentColor" className="ml-1" />
            }
          </button>

          {/* Rounds (+) */}
          {isIdle ? (
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); updateRounds(1); }}
              className="w-16 h-16 rounded-full glass-btn flex items-center justify-center text-white relative"
            >
              <Plus size={24} />
              <div className="absolute -top-3 -right-3 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#bdfc32]">
                {totalRounds} R
              </div>
            </button>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center flex-col gap-1">
              <span className="text-xl font-bold text-gray-300 tabular-nums">{roundCount}</span>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Ronda</span>
            </div>
          )}

        </div>
      </motion.div>

    </div>
  );
}
