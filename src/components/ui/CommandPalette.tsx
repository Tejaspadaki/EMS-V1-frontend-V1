import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  FolderKanban, 
  CheckSquare, 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  Calendar,
  MessageCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { globalSearch, type SearchResult } from '../../api/search.api';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Core navigation quick links
  const defaultNavCommands = [
    { id: 'nav-dash', title: 'Go to Dashboard', link: '/dashboard', category: 'Navigation', icon: <LayoutDashboard size={16} className="text-indigo-500" /> },
    { id: 'nav-tasks', title: 'Go to My Tasks', link: '/tasks', category: 'Navigation', icon: <CheckSquare size={16} className="text-emerald-500" /> },
    { id: 'nav-req', title: 'Create New Request', link: '/requests/new', category: 'Quick Action', icon: <PlusCircle size={16} className="text-sky-500" /> },
    { id: 'nav-checkin', title: 'Attendance Check-in / Punch', link: '/attendance/check-in', category: 'Quick Action', icon: <Clock size={16} className="text-amber-500" /> },
    { id: 'nav-msg', title: 'Open Team Chat Messages', link: '/messages', category: 'Communication', icon: <MessageCircle size={16} className="text-purple-500" /> },
    { id: 'nav-meet', title: 'Meetings & Schedule', link: '/meetings', category: 'Communication', icon: <Calendar size={16} className="text-pink-500" /> },
    { id: 'nav-sett', title: 'System Settings', link: '/settings', category: 'System', icon: <Settings size={16} className="text-slate-500" /> },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const results = await globalSearch(query);
          setSearchResults(results);
        } catch (err) {
          console.error('Command search failed', err);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const filteredQuickLinks = query.trim() 
    ? defaultNavCommands.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
    : defaultNavCommands;

  const totalItems = query.trim() 
    ? searchResults.length + filteredQuickLinks.length
    : defaultNavCommands.length;

  const handleSelect = (link: string) => {
    navigate(link);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalItems) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim() && searchResults.length > 0 && selectedIndex < searchResults.length) {
        handleSelect(searchResults[selectedIndex].link);
      } else {
        const offsetIndex = query.trim() ? selectedIndex - searchResults.length : selectedIndex;
        if (filteredQuickLinks[offsetIndex]) {
          handleSelect(filteredQuickLinks[offsetIndex].link);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search size={20} className="text-slate-400 shrink-0 mr-3" />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Type a command or search employees, projects, tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm font-semibold outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md border border-slate-300/40">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          {loading && (
            <div className="p-6 text-center text-xs text-slate-400 font-medium">
              Searching directory...
            </div>
          )}

          {/* Dynamic API Search Results */}
          {!loading && searchResults.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Search Results ({searchResults.length})
              </div>
              <div className="space-y-0.5">
                {searchResults.map((res, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div 
                      key={res.id}
                      onClick={() => handleSelect(res.link)}
                      className={`
                        flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm font-medium
                        ${isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'}
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                          {res.type === 'Employee' ? <User size={16} className="text-blue-500" /> : <FolderKanban size={16} className="text-purple-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm">{res.title}</p>
                          <p className="text-xs text-slate-400 truncate">{res.metadata}</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className={isSelected ? 'text-indigo-600' : 'opacity-0'} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions / Navigation */}
          {!loading && filteredQuickLinks.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Commands & Navigation
              </div>
              <div className="space-y-0.5">
                {filteredQuickLinks.map((item, idx) => {
                  const actualIdx = searchResults.length + idx;
                  const isSelected = selectedIndex === actualIdx;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleSelect(item.link)}
                      className={`
                        flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm font-medium
                        ${isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && totalItems === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">
              No matching commands or records found for "{query}".
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-3">
            <span><kbd className="font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">↵</kbd> Select</span>
          </div>
          <div>EMS Command Engine v1.0</div>
        </div>
      </div>
    </div>
  );
};
