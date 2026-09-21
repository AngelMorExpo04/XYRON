import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      playBeep(880, 'square');
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
        playBeep(440, 'sine');
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
  
  const circleColor = phase === 'work' ? '#7fff00' : phase === 'rest' ? '#ed8936' : '#a0aec0';

  const currentExercise = exercises[exerciseCount - 1] || '';
  let nextExercise = '';
  if (exerciseCount < exercises.length) {
    nextExercise = exercises[exerciseCount];
  } else if (roundCount < totalRounds) {
    nextExercise = exercises[0] + ' (Siguiente Ronda)';
  } else {
    nextExercise = 'FIN DEL TABATA';
  }

  return (
    <div className="flex flex-col items-center min-h-full w-full py-6 pb-10">
      
      {/* Exercises Section */}
      <div className="w-full flex flex-col min-h-[300px] mb-8 mt-2">
        <AnimatePresence mode="wait">
          {!isIdle ? (
            /* Active Workout Screen (Wide LCD) */
            <motion.div 
              key="active"
              layoutId="shared-main-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="skeuo-panel rounded-none p-4 mt-2 w-full overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="skeuo-screen rounded-none w-full flex flex-col p-4 text-center"
              >
                <div className="mb-2 border-b border-gray-600 pb-2">
                  <span className="block text-xs uppercase opacity-70 mb-1">Actual ({exerciseCount}/{exercises.length})</span>
                  <div className="text-xl font-bold h-8 flex justify-center items-center overflow-hidden" style={{ color: '#7fff00', textShadow: '0 0 6px rgba(127,255,0,0.6), 0 0 12px rgba(127,255,0,0.4)' }}>
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={phase === 'done' ? 'done' : exerciseCount}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -30, opacity: 0 }}
                        transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                        className="block"
                      >
                        {phase === 'done' ? '-' : currentExercise}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
                <div className="h-16 flex flex-col justify-center overflow-hidden">
                  <span className="block text-xs uppercase opacity-70 mb-1">Siguiente</span>
                  <AnimatePresence mode="popLayout">
                    <motion.span 
                      key={phase === 'done' ? 'done' : exerciseCount}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 0.9 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="text-lg block"
                    >
                      {phase === 'done' ? '-' : nextExercise}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* Editable Exercise List */
            <motion.div 
              key="list"
              layoutId="shared-main-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="skeuo-panel p-4 flex flex-col gap-3 w-full overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col gap-3"
              >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm" style={{ textShadow: '1px 1px 1px #fff' }}>Lista de Ejercicios</h3>
                <span className="text-xs font-mono px-2 py-1 bg-gray-200 rounded-md border border-gray-400">
                  Total: {exercises.length}
                </span>
              </div>
              
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                {exercises.map((ex, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="flex items-center justify-center w-6 text-xs font-mono opacity-60">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={ex}
                      onChange={(e) => handleExerciseChange(idx, e.target.value)}
                      className="skeuo-input flex-1 text-sm py-2"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); removeExercise(idx); }}
                      className="skeuo-btn px-2 text-red-600"
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
                className="skeuo-btn mt-2 py-2 flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={16} /> Añadir Ejercicio
              </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Dial & Controls */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative flex items-center justify-center w-64 h-64 mt-12 mb-4 shrink-0"
      >
        
        {/* RONDAS Label - Outside and above everything */}
        <div className="absolute -top-[55px] left-1/2 -translate-x-1/2 text-gray-300 text-xs font-bold tracking-widest uppercase" style={{ textShadow: '1px 1px 2px #000, -1px -1px 1px rgba(255,255,255,0.1)' }}>
          Rondas
        </div>

        {/* Top Crown Appendage for Rounds */}
        <div className="absolute -top-[32px] left-1/2 -translate-x-1/2 w-[140px] h-[60px] z-0 overflow-hidden" style={{ borderRadius: '70px 70px 0 0' }}>
          {/* Rotating textured background */}
          <div 
             className="absolute w-[140px] h-[140px] top-0 left-0 rounded-full skeuo-groove flex items-center justify-center transition-transform duration-700 ease-in-out"
             style={{ transform: `rotate(${(totalRounds - 1) * 365}deg)` }}
          >
             {/* Gear teeth pattern using individual lines */}
             <svg width="140" height="140" viewBox="0 0 140 140" className="opacity-30">
               {Array.from({length: 36}).map((_, i) => {
                 const rad = (i * 10) * Math.PI / 180;
                 return <line key={i} x1={70 + 58 * Math.cos(rad)} y1={70 + 58 * Math.sin(rad)} x2={70 + 68 * Math.cos(rad)} y2={70 + 68 * Math.sin(rad)} stroke="black" strokeWidth="4" strokeLinecap="round" />;
               })}
             </svg>
          </div>

          {/* Active Ticks Overlay (Fixed in center) */}
          <svg width="140" height="140" viewBox="0 0 140 140" className="absolute top-0 left-0 z-10 pointer-events-none">
            {/* Green active/completed ticks */}
            <g style={{ filter: 'drop-shadow(0 0 3px rgba(127,255,0,0.8))' }}>
              {Array.from({length: activeGreenCount}).map((_, i) => {
                 const spacing = 10;
                 const startAngle = -90 - ((totalRounds - 1) * spacing) / 2;
                 const rad = (startAngle + i * spacing) * Math.PI / 180;
                 return <line key={`green-${i}`} x1={70 + 58 * Math.cos(rad)} y1={70 + 58 * Math.sin(rad)} x2={70 + 68 * Math.cos(rad)} y2={70 + 68 * Math.sin(rad)} stroke="#7fff00" strokeWidth="4" strokeLinecap="round" />;
              })}
            </g>
            {/* Red pending ticks */}
            <g style={{ filter: 'drop-shadow(0 0 3px rgba(255,0,0,0.8))' }}>
              {Array.from({length: Math.max(0, totalRounds - activeGreenCount)}).map((_, idx) => {
                 const i = idx + activeGreenCount;
                 const spacing = 10;
                 const startAngle = -90 - ((totalRounds - 1) * spacing) / 2;
                 const rad = (startAngle + i * spacing) * Math.PI / 180;
                 return <line key={`red-${i}`} x1={70 + 58 * Math.cos(rad)} y1={70 + 58 * Math.sin(rad)} x2={70 + 68 * Math.cos(rad)} y2={70 + 68 * Math.sin(rad)} stroke="#ff3333" strokeWidth="4" strokeLinecap="round" />;
              })}
            </g>
          </svg>

          {/* Number overlay */}
          <div className="absolute top-[12px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
            <span className="text-2xl font-mono text-gray-800 leading-none drop-shadow-sm font-bold">{totalRounds}</span>
          </div>
        </div>

        {/* Left button (-) - OUTSIDE */}
        {isIdle && (
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); updateRounds(-1); }}
            className="absolute -top-[18px] left-[20px] w-7 h-7 skeuo-btn flex items-center justify-center rounded-full z-20 group"
          >
            <Minus size={12} className="text-gray-700 group-active:text-[#7fff00] group-active:drop-shadow-[0_0_5px_rgba(127,255,0,0.8)] transition-all duration-75" />
          </button>
        )}
        
        {/* Right button (+) - OUTSIDE */}
        {isIdle && (
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); updateRounds(1); }}
            className="absolute -top-[18px] right-[20px] w-7 h-7 skeuo-btn flex items-center justify-center rounded-full z-20 group"
          >
            <Plus size={12} className="text-gray-700 group-active:text-[#7fff00] group-active:drop-shadow-[0_0_5px_rgba(127,255,0,0.8)] transition-all duration-75" />
          </button>
        )}
        
        {/* Side Button Panel Appendage */}
        <div 
          className="absolute -left-[56px] top-1/2 -translate-y-1/2 w-[80px] h-[140px] skeuo-groove z-0 overflow-hidden"
          style={{ borderRadius: '40px 0 0 40px' }}
        >
        </div>

        {/* Controls attached to the left appendage */}
        <div className="absolute -left-[48px] top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center z-10">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); toggleTimer(); }}
            className={`${isActive ? 'skeuo-btn-primary-pressed' : 'skeuo-btn-primary'} text-white w-[50px] h-[60px] flex items-center justify-start pl-[14px]`}
            style={{ 
              borderTopLeftRadius: '32px', 
              borderTopRightRadius: '8px', 
              borderBottomLeftRadius: '4px',
              borderBottomRightRadius: '8px'
            }}
          >
            {isActive 
              ? <Pause size={20} fill="currentColor" /> 
              : <Play size={20} className="skeuo-icon-raised ml-0.5" fill="currentColor" />
            }
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); resetTimer(); }}
            className="skeuo-btn w-[50px] h-[60px] flex items-center justify-start pl-[16px] text-red-500"
            title="Reiniciar"
            style={{ 
              borderBottomLeftRadius: '32px', 
              borderBottomRightRadius: '8px',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '8px'
            }}
          >
            <RotateCcw size={16} className="skeuo-icon-raised" />
          </button>
        </div>

        {/* Physical Groove around the screen */}
        <div className="absolute w-full h-full rounded-full skeuo-groove flex items-center justify-center z-20">
          <svg className="absolute w-full h-full transform -rotate-90 p-4 overflow-visible" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="6"
            />
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
              className="transition-all duration-100 ease-linear"
              style={{ filter: `drop-shadow(0 0 5px ${circleColor}) drop-shadow(0 0 10px ${circleColor})` }}
            />
          </svg>
        </div>

        {/* LCD Screen in the center */}
        <div className="skeuo-screen w-40 h-40 rounded-full flex flex-col items-center justify-center absolute z-30">
          <span className="text-5xl font-bold font-mono tracking-tighter" style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.3)' }}>
            {timeLeft}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest mt-2 opacity-80">
            {phase === 'done' ? 'FIN' : phase === 'work' ? 'TRABAJO' : 'DESCANSO'}
          </span>
        </div>
      </motion.div>

    </div>
  );
}
