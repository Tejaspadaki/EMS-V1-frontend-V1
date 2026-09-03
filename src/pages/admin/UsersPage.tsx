import React, { useEffect, useState } from 'react';
import { getAllUsers, unlockUser } from '../../api/admin.api';
import { Users, Search, Mail, Building, Briefcase, Hash, Calendar, Download, CheckSquare, Square, UserCheck, Lock, Unlock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getInitials } from '../../utils/initials';
import { TableContainer, Table, TableHeader, TableHead, TableRow, TableCell, TableBody, TableBulkActionBar, TableSkeleton } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from '../../utils/toast';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOCKED'>('ALL');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const lockedUsersCount = users.filter(u => u.isLocked).length;

  const filteredUsers = users.filter(u => {
    if (statusFilter === 'LOCKED' && !u.isLocked) return false;
    return (
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.empId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, id]);
    } else {
      setSelectedUserIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleUnlockSingle = async (userId: string, userName: string) => {
    try {
      setActionLoadingId(userId);
      const res = await unlockUser(userId);
      if (res.success) {
        toast.success(`Account unlocked: ${userName}`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isLocked: false, failedLoginAttempts: 0, lockedAt: null } : u));
      } else {
        toast.error(res.message || 'Failed to unlock');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Unlock error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnlockSelected = async () => {
    const lockedSelected = users.filter(u => selectedUserIds.includes(u.id) && u.isLocked);
    if (lockedSelected.length === 0) {
      toast.info('None of the selected accounts are locked.');
      return;
    }
    let successCount = 0;
    for (const u of lockedSelected) {
      try {
        await unlockUser(u.id);
        successCount++;
      } catch (e) {}
    }
    toast.success(`Successfully unlocked ${successCount} account(s).`);
    await fetchUsers();
    setSelectedUserIds([]);
  };

  const handleExportSelected = () => {
    const selected = users.filter(u => selectedUserIds.includes(u.id));
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      ['ID,Name,Email,Role,Department,Status']
        .concat(selected.map(u => `"${u.empId}","${u.name}","${u.email}","${u.role}","${u.department || 'N/A'}","${u.isLocked ? 'LOCKED' : 'ACTIVE'}"`))
        .join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EMS_Users_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${selected.length} user records to CSV.`);
  };

  const allSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;
  const hasLockedSelected = users.some(u => selectedUserIds.includes(u.id) && u.isLocked);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="text-indigo-600" size={26} />
            Employee Directory & Access Control
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage personnel profiles, department assignments, role authorizations, and account lockout statuses.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-72">
            <Input 
              icon={<Search size={16} />}
              placeholder="Search name, ID, email, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users size={14} />
          All Personnel ({users.length})
        </button>
        <button
          onClick={() => setStatusFilter('LOCKED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            statusFilter === 'LOCKED'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Lock size={14} className={lockedUsersCount > 0 ? 'text-rose-500' : ''} />
          Locked Accounts ({lockedUsersCount})
          {lockedUsersCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Main Table Layout */}
      <div className="hidden sm:block">
        <TableContainer>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead className="w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="accent-indigo-600 rounded cursor-pointer"
                    aria-label="Select all rows"
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Status & Access</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Birthdate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8">
                    <TableSkeleton rows={4} cols={6} />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    <Users size={36} className="mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-600">
                      {statusFilter === 'LOCKED' ? 'No locked accounts found' : 'No personnel records found'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {statusFilter === 'LOCKED' 
                        ? 'All user accounts are active and compliant.'
                        : `Try refining your search query "${searchTerm}"`}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const isChecked = selectedUserIds.includes(user.id);
                  const isBusy = actionLoadingId === user.id;

                  return (
                    <TableRow key={user.id} className={`${isChecked ? 'bg-indigo-50/40' : ''} ${user.isLocked ? 'bg-rose-50/30' : ''}`}>
                      <TableCell className="text-center">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(user.id, e.target.checked)}
                          className="accent-indigo-600 rounded cursor-pointer"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${user.isLocked ? 'bg-gradient-to-br from-rose-500 to-red-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                              {user.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                              <span>#{user.empId}</span>
                              <span className="text-slate-300">•</span>
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isLocked ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-black border border-rose-200">
                              <Lock size={12} className="text-rose-600" />
                              LOCKED OUT
                            </span>
                            {user.failedLoginAttempts > 0 && (
                              <p className="text-[10px] text-rose-600 font-semibold font-mono pl-0.5">
                                {user.failedLoginAttempts} failed attempts
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(user.roles && user.roles.length > 0 ? user.roles : [user.role]).map((r: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                              <Briefcase size={12} />
                              {r}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Building size={14} className="text-slate-400" />
                          {user.department || 'Unassigned'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                          <Calendar size={14} className="text-slate-400" />
                          {user.birthdate ? new Date(user.birthdate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.isLocked && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={isBusy}
                              onClick={() => handleUnlockSingle(user.id, user.name)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 font-extrabold text-xs h-8 px-2.5"
                            >
                              {isBusy ? (
                                <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-1" />
                              ) : (
                                <Unlock size={13} className="mr-1 text-emerald-600" />
                              )}
                              Unlock
                            </Button>
                          )}
                          <Link to={`/employees/${user.id}`}>
                            <Button variant="outline" size="sm" icon={<UserCheck size={14} />} className="h-8 text-xs">
                              Profile
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Mobile Responsive Cards Fallback (< 640px) */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <TableSkeleton rows={3} cols={1} />
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
            {statusFilter === 'LOCKED' ? 'No locked accounts.' : 'No employees found.'}
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className={`bg-white rounded-2xl border ${user.isLocked ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'} p-4 space-y-3 shadow-xs`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${user.isLocked ? 'bg-gradient-to-br from-rose-500 to-red-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'} text-white flex items-center justify-center font-bold text-sm`}>
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">#{user.empId}</p>
                  </div>
                </div>
                <div>
                  {user.isLocked ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-extrabold flex items-center gap-1 border border-rose-200">
                      <Lock size={10} /> Locked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs space-y-1 text-slate-600 border-t border-slate-100 pt-2">
                <p><span className="text-slate-400">Email:</span> {user.email}</p>
                <p><span className="text-slate-400">Department:</span> {user.department || 'Unassigned'}</p>
                {user.isLocked && user.failedLoginAttempts > 0 && (
                  <p className="text-rose-600 font-bold">Failed attempts: {user.failedLoginAttempts}</p>
                )}
              </div>
              <div className="pt-2 flex items-center gap-2">
                {user.isLocked && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    fullWidth 
                    onClick={() => handleUnlockSingle(user.id, user.name)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Unlock size={14} className="mr-1" /> Unlock
                  </Button>
                )}
                <Link to={`/employees/${user.id}`} className="w-full">
                  <Button variant="outline" size="sm" fullWidth icon={<UserCheck size={14} />}>
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bulk Action Toolbar */}
      <TableBulkActionBar 
        selectedCount={selectedUserIds.length}
        onClear={() => setSelectedUserIds([])}
      >
        {hasLockedSelected && (
          <Button variant="primary" size="sm" icon={<Unlock size={14} />} onClick={handleUnlockSelected} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            Unlock Selected
          </Button>
        )}
        <Button variant="accent" size="sm" icon={<Download size={14} />} onClick={handleExportSelected}>
          Export CSV ({selectedUserIds.length})
        </Button>
      </TableBulkActionBar>
    </div>
  );
};


