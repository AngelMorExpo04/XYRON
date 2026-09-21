import { useState, useEffect } from 'react';
import { Activity, Calendar, Timer, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Planner from './components/Planner';
import TabataTimer from './components/TabataTimer';
import StrengthTimer from './components/StrengthTimer';
import InteractiveNavBar from './components/InteractiveNavBar';

function App() {
  const [activeTab, setActiveTab] = useState('planner');

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden text-skeuo-text font-sans selection:bg-skeuo-accent selection:text-white relative">
      
      {/* Main Content Area */}
      <main 
        className="flex-1 overflow-y-auto pt-6 px-4 -mb-6 pb-16 max-w-2xl mx-auto w-full no-scrollbar"
        style={{
          maskImage: 'linear-gradient(to bottom, black calc(100% - 56px), transparent calc(100% - 16px))',
          WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 56px), transparent calc(100% - 16px))'
        }}
      >
        <div className="grid items-start w-full min-h-full">
          <AnimatePresence>
            {activeTab === 'planner' && (
              <div key="planner" className="col-start-1 row-start-1 w-full">
                <Planner />
              </div>
            )}
            {activeTab === 'tabata' && (
              <div key="tabata" className="col-start-1 row-start-1 w-full">
                <TabataTimer />
              </div>
            )}
            {activeTab === 'strength' && (
              <div key="strength" className="col-start-1 row-start-1 w-full">
                <StrengthTimer />
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation */}
      <InteractiveNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
