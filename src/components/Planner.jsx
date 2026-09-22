import { useState } from 'react';
import { Edit2, Check } from 'lucide-react';

const PixelDumbbell = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 16 16" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <path d="M4 2v12h2V2H4zm8 0v12h2V2h-2zM2 4v8h2V4H2zm12 0v8h2V4h-2zM6 7v2h4V7H6z" />
  </svg>
);

const PixelHeart = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 16 16" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <path d="M2 3h4v2H2V3zm8 0h4v2h-4V3zM0 5h16v4H0V5zM2 9h12v2H2V9zM4 11h8v2H4v-2zM6 13h4v2H6v-2z" />
  </svg>
);

const PixelBattery = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 16 16" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M2 3h10v10H2V3zm2 2h6v6H4V5zm9 2h2v4h-2V7zM5 6h2v4H5V6zm3 0h2v4H8V6z" />
  </svg>
);

const PixelCross = ({ color }) => (
  <svg width="28" height="28" viewBox="0 0 16 16" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
    <path d="M6 2h4v4h4v4h-4v4H6v-4H2V6h4V2z" />
  </svg>
);

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
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

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
    if (text.includes('entreno') || text.includes('fuerza') || text.includes('abs')) return { color: '#7fff00', Icon: PixelDumbbell };
    if (text.includes('correr') || text.includes('cardio') || text.includes('piscina')) return { color: '#facc15', Icon: PixelHeart }; // Amarillo anterior
    if (text.includes('libre') || text.includes('descanso')) return { color: '#ef4444', Icon: PixelBattery }; // Rojo
    return { color: '#9ca3af', Icon: PixelCross };
  };

  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="flex flex-col gap-6 pb-6">
      
      {/* Schedule Panel */}
      <div className="w-full">
        <h2 className="text-xl font-bold mb-4 ml-2 text-gray-300" style={{ textShadow: '1px 1px 2px #000, -1px -1px 1px rgba(255,255,255,0.1)' }}>Plan Semanal</h2>
        
        <div className="flex flex-col gap-8 py-4 pr-4 pl-4 sm:pl-6">
          {schedule.map((item, idx) => {
            const isToday = idx === todayIndex;
            const theme = getWorkoutTheme(item.workout);
            const neonColor = theme.color;
            const Icon = theme.Icon;
            
            // Hex to rgba helper for shadows (rough approximation for the 3 main colors)
            const shadowColor = neonColor === '#7fff00' ? 'rgba(127,255,0,0.4)' : 
                                neonColor === '#facc15' ? 'rgba(250,204,21,0.4)' : 
                                neonColor === '#ef4444' ? 'rgba(239,68,68,0.4)' : 'rgba(156,163,175,0.4)';

            return (
            <div key={idx} className="relative flex items-center w-full">
              
              {/* Vertical Day on Left Margin (Outside Container) */}
              <div 
                className="absolute -left-4 sm:-left-5 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase [writing-mode:vertical-rl] rotate-180 transition-colors duration-500"
                style={{ 
                  color: isToday ? neonColor : '#9ca3af',
                  textShadow: isToday ? `0 0 8px ${shadowColor}` : 'none'
                }}
              >
                {item.day}
              </div>

              {/* The Container */}
              <div 
                className={`skeuo-btn p-3 sm:p-4 w-full flex flex-row items-center justify-between cursor-default hover:shadow-none hover:translate-y-0 transition-all duration-300`}
                style={{ 
                  boxShadow: isToday 
                    ? `inset 1.5px 1.5px 3px rgba(255,255,255,0.7), inset -1.5px -1.5px 3px rgba(0,0,0,0.4), 8px 8px 20px rgba(0,0,0,0.4), 0 0 10px ${shadowColor}, -6px -6px 16px rgba(255,255,255,0.1)` 
                    : 'inset 1.5px 1.5px 3px rgba(255,255,255,0.7), inset -1.5px -1.5px 3px rgba(0,0,0,0.4), 8px 8px 20px rgba(0,0,0,0.6), -6px -6px 16px rgba(255,255,255,0.1)', 
                  cursor: 'default',
                  borderColor: isToday ? shadowColor : 'transparent',
                  borderWidth: isToday ? '1px' : '0px'
                }}
              >
                {/* Retro Screen with Pixel Art Icon */}
                <div 
                  className="skeuo-screen flex items-center justify-center shrink-0 mr-3 sm:mr-4 w-14 h-12 sm:w-16 sm:h-14 transition-all duration-300"
                  style={isToday ? { boxShadow: `inset 2px 2px 5px rgba(0,0,0,0.8), 0 0 10px ${shadowColor}` } : {}}
                >
                  <Icon color={neonColor} />
                </div>
              
              {editingIndex === idx ? (
                <div className="flex-1 flex gap-3">
                  <input 
                    type="text" 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="skeuo-input flex-1 text-sm"
                    autoFocus
                    onBlur={() => handleSaveEdit(idx)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(idx)}
                  />
                  <button onClick={() => handleSaveEdit(idx)} className="skeuo-btn px-3 flex items-center justify-center text-green-600">
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center h-full">
                  <span 
                    className="text-sm font-bold pl-3 border-l-2 flex-1 py-1 flex items-center cursor-text transition-colors"
                    onClick={() => handleEditClick(idx, item.workout)}
                    style={{ 
                      color: isToday ? neonColor : '#6b7280',
                      borderColor: isToday ? shadowColor : 'rgba(156,163,175,0.3)',
                      textShadow: isToday ? `0 0 8px ${shadowColor}` : 'none'
                    }}
                  >
                    {item.workout}
                  </span>
                </div>
              )}
              </div>
            </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
