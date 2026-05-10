import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export default function SplashScreen() {
  const [logoError, setLogoError] = React.useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-primary flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-8"
      >
        <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center backdrop-blur-md border border-white/20 overflow-hidden p-4">
          {logoError ? (
            <Heart className="w-12 h-12 text-white" fill="currentColor" />
          ) : (
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
              onError={() => setLogoError(true)}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        <div className="text-center">
          <h1 className="text-white text-5xl font-bold tracking-tighter mb-2">
            MENTCARE
          </h1>
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-xs">
            Track Your Emotions
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
