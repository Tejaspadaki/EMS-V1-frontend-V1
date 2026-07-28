import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Video, Users, CheckCircle, XCircle, MapPin, Play, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { getMyMeetings, createMeeting, updateParticipantStatus, updateMeetingStatus, type Meeting, startInstantMeeting, downloadCalendarInvite } from '../../api/meetings.api';

import { getChannels, createMessage } from '../../api/messaging.api';
import { getAllUsers } from '../../api/admin.api';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../utils/toast';
import { getInitials } from '../../utils/initials';

const getStatusGradient = (status: string, myStatus?: string) => {
  if (status === 'cancelled') return 'from-rose-500 to-red-600';
  if (myStatus === 'accepted') return 'from-emerald-500 to-teal-600';
  if (myStatus === 'declined') return 'from-slate-400 to-slate-500';
  return 'from-indigo-500 to-violet-600';
};

const getAvatarColor = (name: string) => {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[idx];
};

export const MeetingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'all'>('upcoming');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    participants: [] as string[]
  });
  const [isInstantLoading, setIsInstantLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [meetingsData, usersData] = await Promise.all([
        getMyMeetings(),
        getAllUsers().catch(() => [])
      ]);
      setMeetings(meetingsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title.trim()) {
      toast.error('Please enter a meeting title.');
      return;
    }
    if (!newMeeting.date || !newMeeting.startTime) {
      toast.error('Please select date and start time.');
      return;
    }
    try {
      const startObj = new Date(`${newMeeting.date}T${newMeeting.startTime}`);
      const startDateTime = startObj.toISOString();
      let endDateTime: string;
      if (newMeeting.endTime) {
        endDateTime = new Date(`${newMeeting.date}T${newMeeting.endTime}`).toISOString();
      } else {
        // Default to +1 hour if end time is omitted
        endDateTime = new Date(startObj.getTime() + 60 * 60 * 1000).toISOString();
      }

      await createMeeting({
        title: newMeeting.title.trim(),
        description: newMeeting.description ? newMeeting.description.trim() : undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        meetingLink: newMeeting.meetingLink ? newMeeting.meetingLink.trim() : undefined,
        participants: newMeeting.participants
      });
      setIsModalOpen(false);
      fetchData();
      setNewMeeting({ title: '', description: '', date: '', startTime: '', endTime: '', meetingLink: '', participants: [] });
      toast.success('Meeting scheduled successfully!');
    } catch (error: any) {
      console.error('Failed to create meeting', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to schedule meeting. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleRsvp = async (meetingId: string, status: 'accepted' | 'declined') => {
    try {
      await updateParticipantStatus(meetingId, status);
      fetchData();
    } catch (error) {
      console.error('Failed to RSVP', error);
    }
  };

  const handleDownloadCalendar = async (id: string) => {
    try {
      await downloadCalendarInvite(id);
      toast.success('Downloaded ICS Calendar Invite');
    } catch (e) {
      toast.error('Failed to download calendar invite');
    }
  };


  const handleStartInstant = async (type: 'team_lead' | 'all_hands') => {
    setIsInstantLoading(true);
    try {
      const meeting = await startInstantMeeting({ type });
      if (meeting.meetingLink) {
        // Automatically post to relevant channel
        try {
          const channels = await getChannels();
          let targetChannel = null;
          if (type === 'all_hands') {
            targetChannel = channels.find(c => c.type === 'Announcement' || c.name.toLowerCase().includes('general') || c.name.toLowerCase().includes('company'));
          } else if (type === 'team_lead') {
            targetChannel = channels.find(c => c.type === 'Project' || c.name.toLowerCase().includes('team') || c.name.toLowerCase().includes('dev'));
          }
          if (!targetChannel && channels.length > 0) {
            targetChannel = channels.find(c => c.type === 'Public') || channels[0];
          }
          if (targetChannel) {
            await createMessage(targetChannel.id, `Join my meeting here: ${meeting.meetingLink}`);
            toast.success(`Meeting link posted to #${targetChannel.name}`);
          }
        } catch (e) {
          console.warn('Failed to post meeting link to channel', e);
        }

        const link = meeting.meetingLink;
        const match = link.match(/(?:ems:\/\/|https?:\/\/[^\/]+\/?)(?:meeting|meeting\/)([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          navigate(`/meeting/${match[1]}`);
        } else {
          window.open(link, '_blank');
        }
      }
      fetchData();
    } catch (error) {
      console.error('Failed to start instant meeting', error);
      toast.error('Failed to start meeting.');
    } finally {
      setIsInstantLoading(false);
    }
  };

  const joinMeeting = (link: string) => {
    const match = link.match(/(?:ems:\/\/|https?:\/\/[^\/]+\/?)(?:meeting|meeting\/)([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      navigate(`/meeting/${match[1]}`);
    } else {
      window.open(link, '_blank');
    }
  };


  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const isUpcoming = (meeting: Meeting) =>
    new Date(meeting.startTime) >= new Date() && meeting.status !== 'cancelled';

  const displayedMeetings = activeTab === 'upcoming'
    ? meetings.filter(isUpcoming)
    : meetings;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 animate-ping opacity-30" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Loading meetings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 shadow-2xl">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Calendar size={20} className="text-indigo-300" />
              </div>
              <span className="text-indigo-300 text-sm font-semibold tracking-wide uppercase">Meetings</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Calendar</h1>
            <p className="text-slate-400 mt-1.5 text-sm font-medium">
              {meetings.filter(isUpcoming).length} upcoming · {meetings.length} total
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role === 'Team Lead' && (
              <button
                onClick={() => handleStartInstant('team_lead')}
                disabled={isInstantLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={16} className="shrink-0" />
                Team Sync
              </button>
            )}
            {(user?.role === 'CTO' || user?.role === 'CEO') && (
              <button
                onClick={() => handleStartInstant('all_hands')}
                disabled={isInstantLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 text-white rounded-2xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users size={16} className="shrink-0" />
                All-Hands
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-2xl font-bold text-sm transition-all hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5"
            >
              <Plus size={16} className="shrink-0" />
              Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
        {(['upcoming', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'upcoming' ? 'Upcoming' : 'All Meetings'}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${
              activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
            }`}>
              {tab === 'upcoming' ? meetings.filter(isUpcoming).length : meetings.length}
            </span>
          </button>
        ))}
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedMeetings.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-200">
              <Sparkles size={28} className="text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-600">No meetings found</h3>
            <p className="text-sm text-slate-400 mt-1">Schedule one to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30"
            >
              <Plus size={16} /> New Meeting
            </button>
          </div>
        ) : (
          displayedMeetings.map((meeting) => {
            const isOrganizer = meeting.organizerId === user?.id?.toString();
            const myStatus = meeting.participants.find(p => p.userId === user?.id?.toString())?.status;
            const isCancelled = meeting.status === 'cancelled';
            const gradient = getStatusGradient(meeting.status, myStatus);
            const isPast = new Date(meeting.startTime) < new Date();

            return (
              <div
                key={meeting.id}
                className={`group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col ${isCancelled ? 'opacity-60' : ''}`}
              >
                {/* Card Top Gradient Bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />

                <div className="p-5 flex-1 flex flex-col gap-4">
                  {/* Title & Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-base leading-tight ${isCancelled ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {meeting.title}
                      </h3>
                      {meeting.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{meeting.description}</p>
                      )}
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wide ${
                      isCancelled
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : isPast
                        ? 'bg-slate-100 text-slate-500 border border-slate-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                      {isCancelled ? 'Cancelled' : isPast ? 'Past' : 'Upcoming'}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Calendar size={12} className="text-slate-500" />
                      </div>
                      {formatDate(meeting.startTime)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock size={12} className="text-slate-400" />
                      {formatTime(meeting.startTime)} – {formatTime(meeting.endTime)}
                    </div>
                  </div>

                  {/* Participants Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {meeting.participants.slice(0, 4).map((p, idx) => (
                        <div
                          key={p.userId}
                          className={`w-7 h-7 rounded-xl border-2 border-white flex items-center justify-center text-[9px] font-bold text-white bg-gradient-to-br ${getAvatarColor(p.userId)} ${idx > 0 ? '-ml-2' : ''}`}
                          title={`Participant ${idx + 1}`}
                          style={{ zIndex: meeting.participants.length - idx }}
                        >
                          {getInitials(p.userId)}
                        </div>
                      ))}
                      {meeting.participants.length > 4 && (
                        <div className="-ml-2 w-7 h-7 rounded-xl border-2 border-white bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                          +{meeting.participants.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">Org: <span className="font-semibold text-slate-600">{meeting.organizer.name.split(' ')[0]}</span></span>
                  </div>

                  {/* Join Link & Calendar */}
                  <div className="flex gap-2">
                    {meeting.meetingLink && !isCancelled && (
                      <button
                        onClick={() => joinMeeting(meeting.meetingLink!)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs font-bold transition-all hover:shadow-sm border border-indigo-100"
                      >
                        <Video size={13} />
                        Join
                        <ArrowRight size={12} className="ml-auto" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadCalendar(meeting.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold transition-all hover:shadow-sm border border-slate-200"
                    >
                      <Calendar size={13} /> ICS
                    </button>
                  </div>

                  {/* RSVP / Status Actions */}
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    {isCancelled ? (
                      <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                        <XCircle size={13} /> This meeting was cancelled
                      </p>
                    ) : meeting.status === 'completed' ? (
                      <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                        <CheckCircle size={13} /> This meeting is completed
                      </p>
                    ) : isOrganizer ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                          <Sparkles size={13} className="text-indigo-400" /> You are the organizer
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await updateMeetingStatus(meeting.id, 'completed');
                                fetchData();
                                toast.success('Meeting marked as completed');
                              } catch(e) { toast.error('Failed to update meeting status'); }
                            }}
                            className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-bold transition-all border border-emerald-100"
                          >
                            Mark Done
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await updateMeetingStatus(meeting.id, 'cancelled');
                                fetchData();
                                toast.success('Meeting cancelled');
                              } catch(e) { toast.error('Failed to cancel meeting'); }
                            }}
                            className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : myStatus === 'invited' || myStatus === 'tentative' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRsvp(meeting.id, 'accepted')}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all hover:shadow-md hover:shadow-emerald-500/30"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRsvp(meeting.id, 'declined')}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    ) : myStatus === 'accepted' ? (
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle size={13} /> You accepted this meeting
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <XCircle size={13} /> You declined this meeting
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule a Meeting">
        <form onSubmit={handleCreateMeeting} className="space-y-5 pt-4">

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Meeting Title</label>
            <Input
              required
              value={newMeeting.title}
              onChange={e => setNewMeeting({...newMeeting, title: e.target.value})}
              placeholder="e.g., Weekly Sync"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Description <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
            <Textarea
              value={newMeeting.description}
              onChange={e => setNewMeeting({...newMeeting, description: e.target.value})}
              placeholder="Agenda or notes"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Date</label>
              <Input
                type="date"
                required
                value={newMeeting.date}
                onChange={e => setNewMeeting({...newMeeting, date: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Start Time</label>
                <Input
                  type="time"
                  required
                  value={newMeeting.startTime}
                  onChange={e => setNewMeeting({...newMeeting, startTime: e.target.value})}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">End Time <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                <Input
                  type="time"
                  value={newMeeting.endTime}
                  onChange={e => setNewMeeting({...newMeeting, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Meeting Link / Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Video size={15} />
              </div>
              <Input
                className="pl-10"
                value={newMeeting.meetingLink}
                onChange={e => setNewMeeting({...newMeeting, meetingLink: e.target.value})}
                placeholder="https://zoom.us/j/123..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Participants</label>
            {(user?.role === 'Employee' || user?.role === 'Intern') && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl mb-2.5 font-medium">
                Your Department Head will be automatically invited.
              </p>
            )}
            <div className="border border-slate-200 rounded-2xl max-h-44 overflow-y-auto custom-scrollbar p-1.5 bg-slate-50">
              {users.filter(u => u.id !== user?.id?.toString()).map(u => (
                <label key={u.id} className="flex items-center gap-3 p-2.5 hover:bg-white rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                    checked={newMeeting.participants.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewMeeting({...newMeeting, participants: [...newMeeting.participants, u.id]});
                      } else {
                        setNewMeeting({...newMeeting, participants: newMeeting.participants.filter(id => id !== u.id)});
                      }
                    }}
                  />
                  <div className={`w-8 h-8 rounded-xl text-[10px] font-bold flex items-center justify-center text-white shrink-0 bg-gradient-to-br ${getAvatarColor(u.name)}`}>
                    {getInitials(u.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                </label>
              ))}
              {users.length <= 1 && (
                <p className="text-sm text-slate-400 p-4 text-center">No other users found.</p>
              )}
            </div>
            {newMeeting.participants.length > 0 && (
              <p className="text-xs text-indigo-600 mt-2 font-semibold flex items-center gap-1.5">
                <Users size={12} /> {newMeeting.participants.length} participant(s) selected
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2"
            >
              <Play size={14} /> Schedule Meeting
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
