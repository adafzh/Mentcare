export type AppStep = 'splash' | 'onboarding' | 'auth' | 'main';
export type MainTab = 'home' | 'consultation' | 'education' | 'profile';

export interface UserProfile {
  name: string;
  avatar: string;
  points?: number;
  category?: string;
}
