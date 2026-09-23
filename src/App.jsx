import { useState, useEffect } from 'react';
import { Activity, Calendar, Timer, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Planner from './components/Planner';
import TabataTimer from './components/TabataTimer';
import StrengthTimer from './components/StrengthTimer';
import InteractiveNavBar from './components/InteractiveNavBar';
import SplashScreen from './components/SplashScreen';

function App() {
  const [activeTab, setActiveTab] = useState('planner');
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div 
      className="flex flex-col h-[100dvh] overflow-hidden text-white font-sans selection:bg-[#bdfc32] selection:text-black relative"
      style={{
        background: 'radial-gradient(circle at 50% 40%, rgba(189, 252, 50, 0.08) 0%, #000000 60%)',
        backgroundColor: '#000000'
      }}
    >
      {/* Main Content Area */}
      <AnimatePresence>
        {showSplash && <SplashScreen key="splashscreen" onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      <main className="flex-1 overflow-y-auto pt-6 px-4 -mb-6 pb-16 max-w-2xl mx-auto w-full no-scrollbar">
        <div className="flex flex-col w-full h-full">
          <AnimatePresence mode="wait">
            {activeTab === 'planner' && (
              <motion.div 
                key="planner" 
                initial={{ opacity: 0, filter: 'blur(10px)' }} 
                animate={{ opacity: 1, filter: 'blur(0px)' }} 
                exit={{ opacity: 0, filter: 'blur(10px)' }} 
                transition={{ duration: 0.25 }} 
                className="w-full flex-1"
              >
                <Planner />
              </motion.div>
            )}
            {activeTab === 'tabata' && (
              <motion.div 
                key="tabata" 
                initial={{ opacity: 0, filter: 'blur(10px)' }} 
                animate={{ opacity: 1, filter: 'blur(0px)' }} 
                exit={{ opacity: 0, filter: 'blur(10px)' }} 
                transition={{ duration: 0.25 }} 
                className="w-full flex-1"
              >
                <TabataTimer />
              </motion.div>
            )}
            {activeTab === 'strength' && (
              <motion.div 
                key="strength" 
                initial={{ opacity: 0, filter: 'blur(10px)' }} 
                animate={{ opacity: 1, filter: 'blur(0px)' }} 
                exit={{ opacity: 0, filter: 'blur(10px)' }} 
                transition={{ duration: 0.25 }} 
                className="w-full flex-1"
              >
                <StrengthTimer />
              </motion.div>
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
