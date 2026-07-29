import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LayoutDashboard, CheckSquare, Calendar, FolderKanban, 
  MessageCircle, Users, FileText, Camera, Shield, Settings, 
  PlusCircle, UserCheck, Clock, BookOpen, UserPlus, DollarSign, X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'People';
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
  roles?: string[];
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { role, user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commandItems: CommandItem[] = [
    // Navigation
    { id: 'nav-dashboard', title: 'Dashboard', category: 'Navigation', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { id: 'nav-tasks', title: 'Tasks', category: 'Navigation', icon: <CheckSquare size={18} />, path: '/tasks' },
    { id: 'nav-meetings', title: 'Meetings', category: 'Navigation', icon: <Calendar size={18} />, path: '/meetings' },
    { id: 'nav-projects', title: 'Projects Dashboard', category: 'Navigation', icon: <FolderKanban size={18} />, path: '/projects' },
    { id: 'nav-messages', title: 'Messages & Channels', category: 'Navigation', icon: <MessageCircle size={18} />, path: '/messages' },
    { id: 'nav-attendance', title: 'Check-In Attendance', category: 'Navigation', icon: <Camera size={18} />, path: '/attendance/check-in' },
    { id: 'nav-attendance-log', title: 'Attendance Log', category: 'Navigation', icon: <Clock size={18} />, path: '/attendance/log' },
    { id: 'nav-my-requests', title: 'My Requests', category: 'Navigation', icon: <FileText size={18} />, path: '/requests/my' },
    { id: 'nav-profile', title: 'My Profile', category: 'Navigation', icon: <UserCheck size={18} />, path: '/profile' },
    { id: 'nav-payslips', title: 'My Payslips', category: 'Navigation', icon: <DollarSign size={18} />, path: '/payroll/my-payslips' },
    { id: 'nav-training', title: 'Training Center', category: 'Navigation', icon: <BookOpen size={18} />, path: '/training' },
    { id: 'nav-users', title: 'Users Directory', category: 'Navigation', icon: <Users size={18} />, path: '/users' },
    { id: 'nav-hr-dashboard', title: 'HR Dashboard', category: 'Navigation', icon: <Shield size={18} />, path: '/hr/dashboard', roles: ['Super Admin', 'HR'] },
    { id: 'nav-settings', title: 'System Settings', category: 'Navigation', icon: <Settings size={18} />, path: '/settings', roles: ['Super Admin'] },

    // Actions
    { id: 'act-new-request', title: 'Submit New Request', category: 'Actions', icon: <PlusCircle size={18} />, path: '/requests/new' },
    { id: 'act-new-project', title: 'Create New Project', category: 'Actions', icon: <PlusCircle size={18} />, path: '/projects/new', roles: ['Super Admin', 'Dept Head', 'Team Lead', 'CEO', 'CTO'] },
    { id: 'act-onboard', title: 'Onboard Employee', category: 'Actions', icon: <UserPlus size={18} />, path: '/hr/onboard', roles: ['Super Admin', 'HR'] },
    { id: 'act-role-card', title: 'View My Role Card', category: 'Actions', icon: <UserCheck size={18} />, path: `/employees/${user?.id}` },
  ];

  const filteredItems = commandItems.filter(item => {
    if (item.roles && !item.roles.includes(role as string)) return false;
    if (!query.trim()) return true;
    return item.title.toLowerCase().includes(query.toLowerCase());
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: CommandItem) => {
    onClose();
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full text-sm font-medium text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-400"
            placeholder="Type a command or search page (e.g. Dashboard, Projects, Check-In)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No matching commands or pages found for &quot;<span className="font-semibold">{query}</span>&quot;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/20' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'text-white' : 'text-slate-500 bg-slate-100'}`}>
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Use <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs">↓</kbd> to navigate</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs">↵</kbd> to select</span>
          </div>
          <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
