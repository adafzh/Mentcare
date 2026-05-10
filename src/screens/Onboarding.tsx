import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Brain, HeartPulse } from 'lucide-react';

interface OnboardingSlide {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    title: "Kenali Perasaanmu",
    description: "Lacak mood harianmu dengan mudah dan temukan pola emosional yang membantu pertumbuhan dirimu.",
    icon: <Sparkles className="w-12 h-12" />,
    color: "bg-primary/10"
  },
  {
    title: "Konsultasi Ahli",
    description: "Terhubung dengan psikolog profesional kapan pun kamu membutuhkan dukungan nyata.",
    icon: <Brain className="w-12 h-12" />,
    color: "bg-accent/20"
  },
  {
    title: "Ketenangan Pikiran",
    description: "Latihan pernapasan dan mindfulness yang dirancang khusus untuk mengurangi kecemasanmu.",
    icon: <HeartPulse className="w-12 h-12" />,
    color: "bg-primary/5"
  }
];

export default function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    // Add Haptic Feedback trigger
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
    
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-off flex flex-col px-8 py-12">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center max-w-sm"
          >
            <div className={`w-48 h-48 ${slides[currentSlide].color} rounded-full flex items-center justify-center text-primary mb-12 shadow-inner border-4 border-white`}>
              {slides[currentSlide].icon}
            </div>
            <h2 className="text-3xl font-bold text-dark mb-6 leading-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-dark/50 text-base leading-relaxed px-4">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-10">
        <div className="flex gap-2.5">
          {slides.map((_, i) => (
            <div 
              key={i}
              className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-8 bg-primary' : 'w-1.5 bg-dark/10'}`}
            />
          ))}
        </div>

        <div className="w-full space-y-4">
          <button 
            onClick={nextSlide}
            className="w-full bg-primary text-white py-4.5 rounded-full font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all"
          >
            {currentSlide === slides.length - 1 ? "Masuk ke MentCare" : "Lanjutkan"}
          </button>
          
          {currentSlide < slides.length - 1 && (
            <button 
              onClick={onFinish}
              className="w-full text-dark/30 font-bold py-2 active:text-dark transition-colors"
            >
              Lewati
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
