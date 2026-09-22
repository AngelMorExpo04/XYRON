import { useState } from 'react';
import { Edit2, Check, CheckSquare, Square, Dumbbell, HeartPulse, BatteryCharging, CalendarDays } from 'lucide-react';

const defaultSchedule = [
  { day: 'Lunes', workout: 'Entreno Completo (Abs + Fuerza)' },
  { day: 'Martes', workout: 'Circuito de Abdominales' },
  { day: 'Miércoles', workout: 'Cardio (5 km / Piscina)' },
  { day: 'Jueves', workout: 'Entreno Completo' },
  { day: 'Viernes', workout: 'Descanso Total' },
  { day: 'Sábado', workout: 'Entreno Completo' },
  { day: 'Domingo', workout: 'Cardio (5 km / Piscina)' },
];

export default function Planner() {
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('neonfit_schedule');
    return saved ? JSON.parse(saved) : defaultSchedule;
  });
  
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  };

  const startOfCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  };

  const [workoutHistory, setWorkoutHistory] = useState(() => {
    const saved = localStorage.getItem('neonfit_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [startDate, setStartDate] = useState(startOfCurrentMonth());
  const [endDate, setEndDate] = useState(getTodayString());

  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  const todayStr = getTodayString();
  const isDoneToday = workoutHistory.includes(todayStr);

  const toggleTodayDone = () => {
    let newHistory;
    if (isDoneToday) {
      newHistory = workoutHistory.filter(d => d !== todayStr);
    } else {
      newHistory = [...workoutHistory, todayStr];
    }
    setWorkoutHistory(newHistory);
    localStorage.setItem('neonfit_history', JSON.stringify(newHistory));
  };

  const handleEditClick = (idx, currentValue) => {
    setEditingIndex(idx);
    setEditValue(currentValue);
  };

  const handleSaveEdit = (idx) => {
    const newSchedule = [...schedule];
    newSchedule[idx].workout = editValue;
    setSchedule(newSchedule);
    localStorage.setItem('neonfit_schedule', JSON.stringify(newSchedule));
    setEditingIndex(null);
  };

  const getWorkoutTheme = (workout) => {
    const text = workout.toLowerCase();
    if (text.includes('entreno') || text.includes('fuerza') || text.includes('abs')) return { color: '#bdfc32', Icon: Dumbbell };
    if (text.includes('correr') || text.includes('cardio') || text.includes('piscina')) return { color: '#facc15', Icon: HeartPulse };
    if (text.includes('libre') || text.includes('descanso')) return { color: '#ef4444', Icon: BatteryCharging };
    return { color: '#9ca3af', Icon: CalendarDays };
  };

  const todayIndex = (new Date().getDay() + 6) % 7;

  const filteredCount = workoutHistory.filter(dateStr => {
    return dateStr >= startDate && dateStr <= endDate;
  }).length;

  return (
    <div className="flex flex-col gap-6 pb-6 mt-4">
      
      {/* Schedule Panel */}
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 ml-2 text-white">Plan Semanal</h2>
        
        <div className="flex flex-col gap-4 py-2 pr-2 pl-2">
          {schedule.map((item, idx) => {
            const isToday = idx === todayIndex;
            const theme = getWorkoutTheme(item.workout);
            const neonColor = theme.color;
            const Icon = theme.Icon;
            
            return (
            <div key={idx} className="relative flex flex-col w-full group">
              <div 
                className={`glass-panel p-3 w-full flex flex-row items-center justify-between transition-all duration-300 ${isToday ? 'bg-white/10' : 'border-transparent'}`}
                style={{ 
                  borderColor: isToday ? neonColor : 'transparent',
                  borderWidth: isToday ? '1px' : '1px', // Keep border consistent for layout
                  boxShadow: isToday ? `0 0 20px ${neonColor}30` : 'none' // Adds 30 hex (approx 20% opacity) to color
                }}
              >
                {/* Icon Circle */}
                <div 
                  className={`flex items-center justify-center shrink-0 mr-4 w-12 h-12 rounded-full transition-all duration-300 ${isToday ? 'bg-black/50' : 'bg-black/20'}`}
                >
                  <Icon color={isToday ? neonColor : '#9ca3af'} size={24} />
                </div>
              
                {/* Content */}
                <div className="flex-1 flex flex-col justify-center h-full min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-0.5">{item.day}</span>
                  
                  {editingIndex === idx ? (
                    <div className="flex gap-2 w-full">
                      <input 
                        type="text" 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="glass-input flex-1 text-sm w-full"
                        autoFocus
                        onBlur={() => handleSaveEdit(idx)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(idx)}
                      />
                      <button onClick={() => handleSaveEdit(idx)} className="glass-btn rounded-full w-9 h-9 flex items-center justify-center text-[#bdfc32]">
                        <Check size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span 
                        className={`text-sm font-semibold cursor-text transition-colors w-full ${isToday ? 'text-white' : 'text-gray-400'}`}
                        onClick={() => handleEditClick(idx, item.workout)}
                        style={isToday ? { textShadow: `0 0 10px ${neonColor}` } : {}}
                      >
                        {item.workout}
                      </span>
                      
                      {isToday && (
                        <button 
                          onClick={toggleTodayDone}
                          className={`ml-2 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shrink-0 ${isDoneToday ? 'bg-[#bdfc32] text-black' : 'bg-white/10 text-white'}`}
                        >
                          <Check size={20} strokeWidth={isDoneToday ? 3 : 2} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Stats Panel */}
      <div className="w-full mt-6">
        <h2 className="text-2xl font-bold mb-4 ml-2 text-white">Estadísticas</h2>
        
        <div className="glass-panel p-5 mx-2 flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Desde</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input text-xs sm:text-sm p-2 w-full uppercase font-mono" 
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Hasta</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input text-xs sm:text-sm p-2 w-full uppercase font-mono" 
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs uppercase font-bold opacity-60 tracking-widest text-[#bdfc32]">Clases</span>
              <span className="text-sm sm:text-base font-bold text-white uppercase tracking-widest">Completadas</span>
            </div>
            <div className="text-6xl font-semibold tracking-tighter" style={{ color: '#bdfc32', textShadow: '0 0 20px rgba(189,252,50,0.4)' }}>
              {filteredCount}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
