import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = string;

// Normalize Prisma enum (SUPER_ADMIN, DEPT_HEAD...) to display strings used in frontend
export const normalizeRole = (role: string): UserRole => {
  const map: Record<string, UserRole> = {
    SUPER_ADMIN: 'Super Admin',
    HR: 'HR',
    DEPT_HEAD: 'Dept Head',
    TEAM_LEAD: 'Team Lead',
    EMPLOYEE: 'Employee',
    INTERN: 'Intern',
    CEO: 'CEO',
    CTO: 'CTO',
  };
  return map[role] ?? role;
};

export const getRoleDashboardRoute = (role: UserRole | string): string => {
  return '/dashboard';
};

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  mustChangePassword?: boolean;
}

interface AuthState {
  user: User | null;
  role: UserRole | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isTwoFactorRequired: boolean;
  isLockedOut: boolean;
  devOtp: string | null; // DEV ONLY — never set in production
  
  // Actions
  loginSuccess: (token: string, user: User) => void;
  requireTwoFactor: (userId: string, devOtp?: string) => void;
  setLockedOut: (locked: boolean) => void;
  completePasswordChange: () => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      accessToken: null,
      isAuthenticated: false,
      isTwoFactorRequired: false,
      isLockedOut: false,
      devOtp: null,

      loginSuccess: (token, user) => set({ 
        accessToken: token, 
        user: { ...user, role: normalizeRole(user.role) as UserRole },
        role: normalizeRole(user.role), 
        isAuthenticated: true, 
        isTwoFactorRequired: false,
        isLockedOut: false 
      }),
      
      requireTwoFactor: (userId, devOtp) => set({ 
        accessToken: userId, // Store userId as temp "token" so verify2FA can read it
        isTwoFactorRequired: true,
        isAuthenticated: false,
        isLockedOut: false,
        devOtp: devOtp || null
      }),
      

      logout: () => set({ 
        user: null, 
        role: null,
        accessToken: null, 
        isAuthenticated: false,
        isLockedOut: false
      }),
      setLockedOut: (locked) => set({ isLockedOut: locked }),
      completePasswordChange: () => set((state) => ({
        user: state.user ? { ...state.user, mustChangePassword: false } : null
      })),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } as User : null
      }))
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        isTwoFactorRequired: state.isTwoFactorRequired,
        isLockedOut: state.isLockedOut
      }),
    }
  )
);
