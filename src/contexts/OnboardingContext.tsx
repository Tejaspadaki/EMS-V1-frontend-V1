import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPendingRemindersCount } from '../api/hr.api';
import { useAuthStore } from '../store/authStore';

interface OnboardingContextType {
  pendingRemindersCount: number;
  refreshReminders: () => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  pendingRemindersCount: 0,
  refreshReminders: () => {},
});

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);
  const { role, isAuthenticated } = useAuthStore();

  const refreshReminders = async () => {
    // Only HR or Super Admin need to see this badge
    if (isAuthenticated && (role === 'HR' || role === 'Super Admin')) {
      try {
        const c = await getPendingRemindersCount();
        setCount(c);
      } catch (error: any) {
        if (error?.response?.status !== 401) {
          console.error('Failed to fetch reminders count', error);
        }
      }
    }
  };

  useEffect(() => {
    refreshReminders();
    const interval = setInterval(refreshReminders, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [role, isAuthenticated]);

  return (
    <OnboardingContext.Provider value={{ pendingRemindersCount: count, refreshReminders }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
