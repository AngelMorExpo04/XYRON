import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const neonColor = '#bdfc32'; // The app's signature neon lime green

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
      >
        {/* Ambient Glow that scales up */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.5, 0.8], scale: [0.5, 1, 1.5] }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${neonColor}30 0%, transparent 50%)`
          }}
        />

        {/* Logo SVG Animation */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 z-10 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 595.28 595.28" 
            className="w-full h-full drop-shadow-[0_0_15px_rgba(189,252,50,0.8)]"
          >
            {/* The X Path */}
            <motion.path
              d="M226.4,252.52l-27.66-52.8h39.11l19.28,36.6c10.34,18.16,20.95,44.14,32.41,44.14,27.66,0,22.63,3.35,48.61-44.14l19.28-36.6h39.11l-27.66,52.8c-5.87,10.62-13.97,30.45-27.38,45.26,13.41,14.53,21.51,34.36,27.38,44.98l27.66,52.8h-39.11l-19.28-36.6c-10.34-18.16-20.95-43.86-32.41-43.86-27.66,0-22.63-3.35-48.61,43.86l-19.28,36.6h-39.11l27.66-52.8c5.87-10.62,13.97-30.45,27.38-44.98-13.41-14.81-21.51-34.64-27.38-45.26Z"
              initial={{ pathLength: 0, fill: "rgba(189,252,50,0)", stroke: neonColor, strokeWidth: 4 }}
              animate={{ pathLength: 1, fill: neonColor, strokeWidth: 0 }}
              transition={{
                pathLength: { duration: 1.5, ease: "easeInOut" },
                fill: { duration: 0.5, delay: 1.2, ease: "easeIn" },
                strokeWidth: { duration: 0.5, delay: 1.2 }
              }}
              onAnimationComplete={() => {
                // After 2.5 seconds total, trigger completion
                setTimeout(onComplete, 800);
              }}
            />

            {/* The Dot (Circle) */}
            <motion.circle
              cx="297.64"
              cy="382.31"
              r="13.24"
              fill={neonColor}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 1.3, // Triggers right as the X finishes drawing
                type: "spring",
                stiffness: 200,
                damping: 10
              }}
            />
          </svg>
        </div>
        
        {/* Optional glowing text below the logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="absolute bottom-20 text-[#bdfc32] text-xl font-bold tracking-[0.5em] uppercase"
          style={{ textShadow: '0 0 10px rgba(189,252,50,0.5)' }}
        >
          Xyron
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
