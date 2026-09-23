import { motion } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const neonColor = '#bdfc32'; // The app's signature neon lime green
  const logoBlack = '#1d1d1b';
  const glowColor = '#bccf0a'; // The center color of the background gradient

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000100] overflow-hidden"
    >
      {/* Background Gradient (Lights up first) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <div 
          className="w-[150vw] h-[150vw] sm:w-[100vw] sm:h-[100vw]"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #bccf0a 0%, #839006 30%, #000100 70%)',
            opacity: 0.8
          }}
        />
      </motion.div>

      {/* Logo SVG Animation */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 z-10 flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 595.28 595.28" 
          className="w-full h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          {/* The X Path */}
          <motion.path
            d="M226.4,252.52l-27.66-52.8h39.11l19.28,36.6c10.34,18.16,20.95,44.14,32.41,44.14,27.66,0,22.63,3.35,48.61-44.14l19.28-36.6h39.11l-27.66,52.8c-5.87,10.62-13.97,30.45-27.38,45.26,13.41,14.53,21.51,34.36,27.38,44.98l27.66,52.8h-39.11l-19.28-36.6c-10.34-18.16-20.95-43.86-32.41-43.86-27.66,0-22.63-3.35-48.61,43.86l-19.28,36.6h-39.11l27.66-52.8c5.87-10.62,13.97-30.45,27.38-44.98-13.41-14.81-21.51-34.64-27.38-45.26Z"
            initial={{ pathLength: 0, fill: "rgba(29,29,27,0)", stroke: "#ffffff", strokeWidth: 4 }}
            animate={{ pathLength: 1, fill: logoBlack, strokeWidth: 0, stroke: logoBlack }}
            transition={{
              pathLength: { duration: 1.2, delay: 0.8, ease: "easeInOut" },
              fill: { duration: 0.5, delay: 2.0, ease: "easeIn" },
              strokeWidth: { duration: 0.5, delay: 2.0 }
            }}
            onAnimationComplete={() => {
              // After drawing and filling, wait a moment then trigger exit
              setTimeout(onComplete, 1200);
            }}
          />

          {/* The Dot (Circle) */}
          <motion.circle
            cx="297.64"
            cy="382.31"
            r="13.24"
            initial={{ scale: 0, fill: logoBlack }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{
              duration: 0.5,
              delay: 2.2, // Triggers right after the X finishes filling
              type: "spring",
              stiffness: 200,
              damping: 10
            }}
          />
        </svg>
      </div>
      
      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.4 }}
        className="absolute bottom-20 text-xl font-bold tracking-[0.5em] uppercase"
        style={{ 
          color: glowColor,
          textShadow: `0 0 15px ${glowColor}80` 
        }}
      >
        Xyron
      </motion.div>
    </motion.div>
  );
}
