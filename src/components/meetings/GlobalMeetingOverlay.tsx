import React, { Suspense, lazy } from 'react';
import { useMeetingStore } from '../../store/meetingStore';

const LiveKitMeetingRoom = lazy(() => import('../../pages/meetings/LiveKitMeetingRoom').then(m => ({ default: m.LiveKitMeetingRoom })));

export const GlobalMeetingOverlay: React.FC = () => {
  const { activeMeetingId } = useMeetingStore();

  if (!activeMeetingId) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <div className="pointer-events-auto w-full h-full">
        <Suspense fallback={<div />}>
          <LiveKitMeetingRoom roomId={activeMeetingId} />
        </Suspense>
      </div>
    </div>
  );
};
