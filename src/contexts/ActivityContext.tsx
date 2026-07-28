import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export type ActivityState = 'Active' | 'Inactive' | 'LongInactive';

interface ActivityContextType {
  activityState: ActivityState;
  setMockState: (state: ActivityState) => void;
}

const ActivityContext = createContext<ActivityContextType>({
  activityState: 'Active',
  setMockState: () => {},
});

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const [activityState, setActivityState] = useState<ActivityState>('Active');

  // In a real app, we would listen to WebSockets here for activity updates
  useEffect(() => {
    if (!isAuthenticated) {
      setActivityState('Inactive');
    }
  }, [isAuthenticated]);

  return (
    <ActivityContext.Provider value={{ activityState, setMockState: setActivityState }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => useContext(ActivityContext);
