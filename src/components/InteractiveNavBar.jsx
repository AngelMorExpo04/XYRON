import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, Timer } from 'lucide-react';

const tabs = [
  { id: 'planner', label: 'PLANNER', icon: Calendar },
  { id: 'tabata', label: 'TABATA', icon: Activity },
  { id: 'strength', label: 'REST', icon: Timer },
];

export default function InteractiveNavBar({ activeTab, setActiveTab }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [slotWidth, setSlotWidth] = useState(0);
  
  const containerRef = useRef(null);
  const pillRef = useRef(null);

  useEffect(() => {
    const idx = tabs.findIndex(t => t.id === activeTab);
    if (idx !== -1) setActiveIdx(idx);
  }, [activeTab]);

  // Calculate the exact pixel width of each slot for flawless Framer Motion physics
  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Container has p-1 (4px padding on each side)
        const innerWidth = containerRef.current.offsetWidth - 8;
        setSlotWidth(innerWidth / 3);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Continuously track the physical position of the glass pill to determine which text should glow
  useEffect(() => {
    let frame;
    const checkPosition = () => {
      if (pillRef.current && containerRef.current) {
        const pillRect = pillRef.current.getBoundingClientRect();
        const contRect = containerRef.current.getBoundingClientRect();
        
        const pillCenter = pillRect.left + (pillRect.width / 2);
        const relativeX = pillCenter - contRect.left;
        const tabWidth = contRect.width / 3;
        
        let idx = Math.floor(relativeX / tabWidth);
        idx = Math.max(0, Math.min(2, idx));
        
        setHighlightIdx(idx);
      }
      frame = requestAnimationFrame(checkPosition);
    };
    frame = requestAnimationFrame(checkPosition);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleDragEnd = (e, info) => {
    if (!containerRef.current || !pillRef.current) return;
    
    const pillRect = pillRef.current.getBoundingClientRect();
    const contRect = containerRef.current.getBoundingClientRect();
    
    const pillCenter = pillRect.left + (pillRect.width / 2);
    const relativeX = pillCenter - contRect.left;
    const tabWidth = contRect.width / 3;
    
    let newIdx = Math.floor(relativeX / tabWidth);
    newIdx = Math.max(0, Math.min(2, newIdx));
    
    setActiveTab(tabs[newIdx].id);
  };

  return (
    <nav className="w-full relative z-50 px-4 pb-safe pt-4 mb-4">
      <div 
        ref={containerRef}
        className="relative flex w-full h-16 rounded-2xl items-center p-1 select-none"
        style={{
          background: 'linear-gradient(180deg, #1f2328 0%, #111215 100%)',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.1)'
        }}
      >
        {/* Layer 1: Interaction Hitboxes (z-10) */}
        <div className="absolute inset-0 flex items-center justify-between p-1 z-10">
          {tabs.map((tab, idx) => (
            <div 
              key={tab.id}
              className="flex-1 h-full cursor-pointer touch-none"
              onPointerDown={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Layer 2: The Animated Liquiglass Pill (z-20, draggable) */}
        <motion.div
          ref={pillRef}
          className="absolute top-1 bottom-1 z-20 cursor-grab active:cursor-grabbing touch-none"
          style={{ width: slotWidth }} // Exact pixel width!
          initial={false}
          animate={{ x: activeIdx * slotWidth }} // Exact pixel animation!
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
        >
          <div 
            className="w-full h-full rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          />
        </motion.div>

        {/* Layer 3: Static Text (z-30, pointer-events-none) */}
        <div className="absolute inset-0 flex items-center justify-between p-1 pointer-events-none z-30">
          {tabs.map((tab, idx) => {
            const isHighlighted = highlightIdx === idx;
            return (
              <div key={tab.id} className="flex-1 h-full flex flex-col items-center justify-center">
                <div 
                  className={`flex flex-col items-center justify-center transition-colors duration-150 ${isHighlighted ? 'text-[#7fff00]' : 'text-[#64748b]'}`}
                  style={isHighlighted ? { filter: 'drop-shadow(0 0 6px rgba(127,255,0,0.8))' } : {}}
                >
                  <tab.icon size={22} />
                  <span className="text-[10px] mt-1 font-bold tracking-widest">{tab.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
