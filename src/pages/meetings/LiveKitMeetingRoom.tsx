import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  Chat,
  useDataChannel
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { BackgroundBlur } from '@livekit/track-processors';
import { useAuthStore } from '../../store/authStore';
import { useMeetingStore } from '../../store/meetingStore';
import { toast } from '../../utils/toast';
import { Hand, EyeOff, Eye, Crown, FileText, BarChart2, Maximize2, Minimize2, PenTool, StopCircle, Video, UserPlus, Search } from 'lucide-react';
import { getChannels, createMessage } from '../../api/messaging.api';
import { Modal } from '../../components/ui/Modal';

const MeetingInviteButton = ({ roomId }: { roomId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getChannels().then(setChannels).catch(console.error);
    }
  }, [isOpen]);

  const handleInvite = async (channelId: string) => {
    setIsSending(true);
    try {
      await createMessage(channelId, `Join my meeting here: ems://meeting/${roomId}`);
      toast.success('Invite sent successfully!');
      setIsOpen(false);
    } catch (e) {
      toast.error('Failed to send invite.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-lg text-sm font-bold shadow transition flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 mr-2 border border-indigo-500"
      >
        <UserPlus size={16} /> Invite
      </button>

      {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Invite to Meeting">
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels or people..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
              {filteredChannels.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No results found.</p>
              ) : (
                filteredChannels.map(channel => (
                  <div key={channel.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                      <p className="text-xs text-gray-500">{channel.type}</p>
                    </div>
                    <button
                      onClick={() => handleInvite(channel.id)}
                      disabled={isSending}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

const RaiseHandButton = () => {
  const { localParticipant } = useLocalParticipant();
  const [isRaised, setIsRaised] = useState(false);

  useEffect(() => {
    if (localParticipant?.metadata) {
      try {
        const meta = JSON.parse(localParticipant.metadata);
        setIsRaised(!!meta.handRaised);
      } catch (e) {}
    }
  }, [localParticipant?.metadata]);

  const toggleHand = async () => {
    if (!localParticipant) return;
    try {
      const currentMeta = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {};
      const newMeta = { ...currentMeta, handRaised: !isRaised };
      await localParticipant.setMetadata(JSON.stringify(newMeta));
      setIsRaised(!isRaised);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button 
      onClick={toggleHand}
      className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow transition flex items-center gap-1.5 ${isRaised ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
    >
      {isRaised ? <><Hand size={16} /> Lower Hand</> : <><Hand size={16} /> Raise Hand</>}
    </button>
  );
};

const RaisedHandsList = () => {
  const participants = useParticipants();
  const raisedHands = participants.filter(p => {
    if (!p.metadata) return false;
    try {
      return JSON.parse(p.metadata).handRaised;
    } catch(e) { return false; }
  });

  if (raisedHands.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 bg-gray-900/90 p-3 rounded-xl border border-gray-700 w-64 z-40">
      <h3 className="text-amber-500 font-semibold mb-2 text-sm flex items-center gap-2"><Hand size={16} /> Raised Hands</h3>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {raisedHands.map(p => (
          <span key={p.identity} className="text-gray-200 text-sm truncate">{p.name || p.identity}</span>
        ))}
      </div>
    </div>
  );
};

const BlurToggle = () => {
  const { localParticipant } = useLocalParticipant();
  const [isBlurred, setIsBlurred] = useState(false);
  const [processor, setProcessor] = useState<any>(null);

  useEffect(() => {
    // Initialize processor once
    setProcessor(BackgroundBlur(10, { delegate: 'GPU' }));
  }, []);

  const toggleBlur = async () => {
    if (!localParticipant || !processor) return;
    
    // Find the camera track
    const trackPub = localParticipant.getTrackPublication('camera');
    if (!trackPub || !trackPub.track) {
      toast.error('Please turn on your camera first');
      return;
    }
    
    try {
      if (isBlurred) {
        await trackPub.track.setProcessor(null);
        setIsBlurred(false);
      } else {
        await trackPub.track.setProcessor(processor);
        setIsBlurred(true);
      }
    } catch (e) {
      console.error("Failed to toggle blur:", e);
      toast.error('Failed to apply background blur');
    }
  };

  return (
    <button 
      onClick={toggleBlur}
      className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow transition flex items-center gap-1.5 ${isBlurred ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
    >
      {isBlurred ? <><Eye size={16} /> Blur Off</> : <><EyeOff size={16} /> Blur On</>}
    </button>
  );
};

const HostControls = ({ roomId, token }: { roomId: string, token: string }) => {
  const participants = useParticipants();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleRemove = async (identity: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const tokenStr = useAuthStore.getState().accessToken;
      await fetch(`${apiUrl}/meetings/${roomId}/remove-participant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenStr}` },
        body: JSON.stringify({ identity })
      });
      toast.success('Participant removed');
    } catch (e) {
      toast.error('Failed to remove participant');
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-bold shadow transition flex items-center gap-2 border border-gray-700"
      >
        <Crown size={16} /> Host Controls
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 p-4 rounded-xl shadow-2xl w-64 z-50">
          <h3 className="text-white font-semibold mb-3">Manage Participants</h3>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {participants.filter(p => !p.isLocal).map(p => (
              <div key={p.identity} className="flex justify-between items-center text-sm text-gray-300 bg-gray-800/50 p-2 rounded">
                <span className="truncate">{p.name || p.identity}</span>
                <button 
                  onClick={() => handleRemove(p.identity)}
                  className="px-2 py-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded text-xs transition font-bold"
                >
                  Kick
                </button>
              </div>
            ))}
            {participants.filter(p => !p.isLocal).length === 0 && (
              <span className="text-gray-500 text-xs italic">No other participants</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SharedNotes = () => {
  const [text, setText] = useState('');
  const { send, message } = useDataChannel('meeting-notes');

  useEffect(() => {
    if (message) {
      const decoder = new TextDecoder();
      const decoded = decoder.decode(message.payload);
      setText(decoded);
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    const encoder = new TextEncoder();
    send(encoder.encode(newText), { reliable: true });
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 p-4">
      <h3 className="text-gray-300 font-semibold mb-2 flex items-center gap-2"><FileText size={18} /> Shared Scratchpad</h3>
      <p className="text-xs text-gray-500 mb-4">Anyone can type here. Notes disappear when the meeting ends.</p>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Type collaborative notes here..."
        className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm shadow-inner"
      />
    </div>
  );
};

const LiveMeetingPolls = ({ roomId, isHost }: { roomId: string, isHost: boolean }) => {
  const [polls, setPolls] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const { send, message } = useDataChannel('meeting-polls');

  const fetchPolls = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${apiUrl}/meetings/${roomId}/polls`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPolls(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [roomId]);

  useEffect(() => {
    if (message) {
      // Refresh polls when a data channel message says "poll-updated"
      const decoder = new TextDecoder();
      if (decoder.decode(message.payload) === 'poll-updated') {
        fetchPolls();
      }
    }
  }, [message]);

  const notifyUpdate = () => {
    const encoder = new TextEncoder();
    send(encoder.encode('poll-updated'), { reliable: true });
  };

  const handleCreatePoll = async () => {
    try {
      const validOptions = newOptions.filter(o => o.trim() !== '');
      if (!newQuestion.trim() || validOptions.length < 2) {
        toast.error('Enter a question and at least 2 options');
        return;
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${apiUrl}/meetings/${roomId}/polls`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion, options: validOptions })
      });
      setNewQuestion('');
      setNewOptions(['', '']);
      fetchPolls();
      notifyUpdate();
      toast.success('Poll created');
    } catch (e) {
      toast.error('Failed to create poll');
    }
  };

  const handleVote = async (pollId: number, optionIndex: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = useAuthStore.getState().accessToken;
      await fetch(`${apiUrl}/meetings/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex })
      });
      fetchPolls();
      notifyUpdate();
    } catch (e) {
      toast.error('Failed to vote');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 p-4 overflow-y-auto">
      <h3 className="text-gray-300 font-semibold mb-4 flex items-center gap-2"><BarChart2 size={18} /> Live Polls</h3>
      
      {isHost && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-bold text-gray-400 mb-2">Create New Poll</h4>
          <input 
            type="text"
            placeholder="Poll Question?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-white mb-2"
          />
          {newOptions.map((opt, idx) => (
            <input 
              key={idx}
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => {
                const updated = [...newOptions];
                updated[idx] = e.target.value;
                setNewOptions(updated);
              }}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-white mb-2"
            />
          ))}
          <div className="flex gap-2 mt-2">
            <button onClick={() => setNewOptions([...newOptions, ''])} className="text-xs text-indigo-400 font-semibold">
              + Add Option
            </button>
            <button onClick={handleCreatePoll} className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold">
              Launch Poll
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4 flex-1">
        {polls.length === 0 && <p className="text-gray-500 text-sm">No active polls.</p>}
        {polls.map((poll) => {
          const totalVotes = poll.votes?.reduce((acc: number, v: any) => acc + v.count, 0) || 0;
          return (
            <div key={poll.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">{poll.question}</h4>
              <div className="space-y-2">
                {poll.options.map((opt: string, idx: number) => {
                  const voteData = poll.votes?.find((v: any) => v.option_index === idx);
                  const count = voteData ? voteData.count : 0;
                  const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                  
                  return (
                    <div key={idx} className="relative cursor-pointer group" onClick={() => handleVote(poll.id, idx)}>
                      <div className="flex justify-between text-xs text-gray-300 mb-1 relative z-10 px-2 py-1">
                        <span>{opt}</span>
                        <span className="font-semibold">{percentage}% ({count})</span>
                      </div>
                      <div className="absolute inset-0 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group-hover:border-indigo-500 transition">
                        <div className="h-full bg-indigo-500/20 transition-all duration-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const LiveKitMeetingRoom: React.FC<{ roomId?: string }> = ({ roomId: propRoomId }) => {
  const { id: paramRoomId } = useParams<{ id: string }>();
  const roomId = propRoomId || paramRoomId;
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { isMinimized, minimizeMeeting, maximizeMeeting, leaveMeeting } = useMeetingStore();
  
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'notes' | 'polls'>('chat');

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  // PiP Dragging State
  const [pipPosition, setPipPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isMinimized) {
      setPipPosition({ x: 0, y: 0 });
    }
  }, [isMinimized]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isMinimized) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pipPosition.x, y: e.clientY - pipPosition.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPipPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Hardcoding the server URL to guarantee it connects to the actual LiveKit cloud instance
  const serverUrl = 'wss://ems-pmt0pnyo.livekit.cloud';

  useEffect(() => {
    const fetchToken = async () => {
      if (!roomId || !user) return;
      try {
        const tokenStr = useAuthStore.getState().accessToken;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const res = await fetch(`${apiUrl}/meetings/${roomId}/token`, {
          headers: {
            'Authorization': `Bearer ${tokenStr}`
          }
        });
        
        const data = await res.json();
        if (data.success && data.token) {
          setToken(data.token);
          setIsHost(data.isHost);
          setIsWaiting(data.isWaiting);
        } else {
          setError(data.error?.message || 'Failed to generate token');
          toast.error('Failed to join meeting.');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching meeting token');
      }
    };

    fetchToken();
  }, [roomId, user]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white flex-col gap-4">
        <h2 className="text-2xl font-semibold text-rose-500">Connection Error</h2>
        <p className="text-gray-400">{error}</p>
        <button onClick={() => navigate('/meetings')} className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500">
          Go Back
        </button>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white flex-col gap-4">
        <div className="animate-pulse bg-indigo-500/20 p-6 rounded-full">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-semibold mt-4">Waiting Room</h2>
        <p className="text-gray-400 text-center max-w-md">
          The host has enabled the waiting room. Please wait until you are admitted to the meeting.
        </p>
      </div>
    );
  }

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true
      });
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        stream.getTracks().forEach(t => t.stop());
        
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', blob, `meeting-${roomId}-${Date.now()}.webm`);

        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const tokenStr = useAuthStore.getState().accessToken;
          await fetch(`${apiUrl}/meetings/${roomId}/recording`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${tokenStr}` },
            body: formData
          });
          toast.success('Recording saved successfully!');
        } catch (e) {
          toast.error('Failed to upload recording');
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start(1000); // chunk every second
      setIsRecording(true);
      toast.success('Recording started');

      // Handle user manually stopping screen share via browser UI
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      };
    } catch (e) {
      toast.error('Could not start recording. Permission denied.');
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-3">Connecting to Secure Meeting...</span>
      </div>
    );
  }

  return (
    <div 
      className={
        isMinimized 
          ? `pip-mode fixed bottom-6 right-6 w-[400px] h-[225px] bg-gray-950 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[9999] border border-gray-700/60 flex flex-col transition-shadow duration-300 ${isDragging ? 'shadow-[0_30px_60px_rgba(0,0,0,0.8)]' : ''}`
          : "relative w-full h-screen bg-gray-950"
      }
      style={isMinimized ? { transform: `translate(${pipPosition.x}px, ${pipPosition.y}px)` } : {}}
    >
      <style>{`
        .pip-mode .lk-control-bar { display: none !important; }
        .pip-mode .lk-participant-tile .lk-focus-toggle-button { display: none !important; }
        .pip-mode .lk-participant-tile .lk-participant-metadata { opacity: 0.5; }
        .pip-mode .lk-grid-layout { gap: 2px !important; padding: 0 !important; }
      `}</style>
      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={serverUrl}
        onError={(err) => {
          console.error("LiveKit Error:", err);
          toast.error(`Connection Error: ${err.message}`);
        }}
        onDisconnected={() => {
          toast.error('Disconnected from meeting room');
          leaveMeeting();
          setTimeout(() => navigate('/meetings'), 2500);
        }}
        data-lk-theme="default"
        style={isMinimized ? { height: '100%', width: '100%' } : { height: '100dvh' }}
      >
        <div className="flex h-full w-full">
          <div className="flex-1 relative h-full flex flex-col">
            
            {/* Header */}
            {isMinimized ? (
              <div 
                className="h-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 flex items-center justify-between px-3 z-50 absolute top-0 left-0 right-0 cursor-move"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <span className="text-xs font-bold text-gray-200 flex items-center gap-2 pointer-events-none select-none">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                  Meeting Active
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); maximizeMeeting(); }} 
                  className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors" 
                  title="Maximize"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Maximize2 size={16} />
                </button>
              </div>
            ) : (
              <div className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-black text-lg">
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></div>
                    Meeting Room
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MeetingInviteButton roomId={roomId!} />
                  <button 
                    onClick={minimizeMeeting}
                    className="px-3 py-1.5 rounded-lg text-sm font-bold shadow transition flex items-center gap-1.5 bg-gray-800 text-gray-300 hover:bg-gray-700 mr-2"
                  >
                    <Minimize2 size={16} /> Minimize
                  </button>
                  <button 
                    onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow transition flex items-center gap-1.5 ${isWhiteboardOpen ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    <PenTool size={16} /> {isWhiteboardOpen ? 'Close Whiteboard' : 'Whiteboard'}
                  </button>
                  <RaiseHandButton />
                  <BlurToggle />
                  
                  {isHost && (
                    <>
                      <div className="w-px h-6 bg-gray-700 mx-1"></div>
                      <button
                        onClick={toggleRecording}
                        disabled={isUploading}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow transition flex items-center gap-1.5 ${isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-gray-800 text-rose-400 hover:bg-rose-600 hover:text-white'}`}
                      >
                        {isUploading ? 'Uploading...' : isRecording ? <><StopCircle size={16} /> Stop Rec</> : <><Video size={16} /> Record</>}
                      </button>
                      <HostControls roomId={roomId!} token={token} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Main Area */}
            <div className={`flex-1 relative bg-black ${isMinimized ? 'pt-10' : ''}`}>
              {isWhiteboardOpen ? (
                <div className="absolute inset-0 z-10 bg-white">
                  <Tldraw />
                </div>
              ) : (
                <VideoConference />
              )}
              <RoomAudioRenderer />
              <RaisedHandsList />
            </div>

          </div>
          {!isMinimized && (
            <div className="w-80 border-l border-gray-800 bg-gray-950 flex flex-col h-full shrink-0">
              {/* Sidebar Tabs */}
              <div className="flex bg-gray-900 border-b border-gray-800 p-2 gap-2">
                <button
                  onClick={() => setSidebarTab('chat')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition ${sidebarTab === 'chat' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setSidebarTab('notes')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition ${sidebarTab === 'notes' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setSidebarTab('polls')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition ${sidebarTab === 'polls' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Polls
                </button>
              </div>
              
              {/* Sidebar Content */}
              <div className="flex-1 overflow-hidden relative lk-chat-container">
                {sidebarTab === 'chat' ? (
                  <Chat />
                ) : sidebarTab === 'notes' ? (
                  <SharedNotes />
                ) : (
                  <LiveMeetingPolls roomId={roomId!} isHost={isHost} />
                )}
              </div>
            </div>
          )}
        </div>
      </LiveKitRoom>
    </div>
  );
};
