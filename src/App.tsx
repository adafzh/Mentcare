/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { AppStep, UserProfile } from './types';
import SplashScreen from './screens/Splash';
import OnboardingScreen from './screens/Onboarding';
import AuthScreen from './screens/Auth';
import MainApp from './screens/MainApp';

export default function App() {
  const [step, setStep] = useState<AppStep>('splash');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Initial splash delay
    const timer = setTimeout(() => {
      // Check if user has seen onboarding (mocked for now)
      setStep('onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingFinish = () => {
    setStep('auth');
  };

  const handleLogin = (name: string) => {
    setUser({
      name: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    });
    setStep('main');
  };

  return (
    <div className="font-sans antialiased text-dark bg-bg-off">
      <AnimatePresence mode="wait">
        {step === 'splash' && <SplashScreen />}
        {step === 'onboarding' && <OnboardingScreen onFinish={handleOnboardingFinish} />}
        {step === 'auth' && <AuthScreen onLogin={handleLogin} />}
        {step === 'main' && user && <MainApp user={user} />}
      </AnimatePresence>
    </div>
  );
}
