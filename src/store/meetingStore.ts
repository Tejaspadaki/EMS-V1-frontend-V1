import { create } from 'zustand';

interface MeetingState {
  activeMeetingId: string | null;
  isMinimized: boolean;
  joinMeeting: (id: string) => void;
  leaveMeeting: () => void;
  minimizeMeeting: () => void;
  maximizeMeeting: () => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  activeMeetingId: null,
  isMinimized: false,
  joinMeeting: (id: string) => set({ activeMeetingId: id, isMinimized: false }),
  leaveMeeting: () => set({ activeMeetingId: null, isMinimized: false }),
  minimizeMeeting: () => set({ isMinimized: true }),
  maximizeMeeting: () => set({ isMinimized: false }),
}));
