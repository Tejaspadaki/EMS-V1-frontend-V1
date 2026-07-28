import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../../api/admin.api';
import { Users, Search, Mail, Building, Briefcase, Hash, Calendar, Download, CheckSquare, Square, UserCheck } from 'lucide-react';
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
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
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
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.empId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleExportSelected = () => {
    const selected = users.filter(u => selectedUserIds.includes(u.id));
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      ['ID,Name,Email,Role,Department']
        .concat(selected.map(u => `"${u.empId}","${u.name}","${u.email}","${u.role}","${u.department || 'N/A'}"`))
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="text-indigo-600" size={26} />
            Employee Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage personnel profiles, department assignments, and access roles across the organization.
          </p>
        </div>
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
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Birthdate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8">
                    <TableSkeleton rows={4} cols={5} />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    <Users size={36} className="mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-600">No personnel records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try refining your search query "{searchTerm}"</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const isChecked = selectedUserIds.includes(user.id);
                  return (
                    <TableRow key={user.id} className={isChecked ? 'bg-indigo-50/40' : ''}>
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
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{user.name}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                              <span>#{user.empId}</span>
                              <span className="text-slate-300">•</span>
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                          <Briefcase size={12} />
                          {user.role}
                        </span>
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
                        <Link to={`/employees/${user.id}`}>
                          <Button variant="outline" size="sm" icon={<UserCheck size={14} />}>
                            Profile
                          </Button>
                        </Link>
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
            No employees found.
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">#{user.empId}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                  {user.role}
                </span>
              </div>
              <div className="text-xs space-y-1 text-slate-600 border-t border-slate-100 pt-2">
                <p><span className="text-slate-400">Email:</span> {user.email}</p>
                <p><span className="text-slate-400">Department:</span> {user.department || 'Unassigned'}</p>
              </div>
              <div className="pt-2">
                <Link to={`/employees/${user.id}`} className="block w-full">
                  <Button variant="outline" size="sm" fullWidth icon={<UserCheck size={14} />}>
                    View Employee Profile
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
        <Button variant="accent" size="sm" icon={<Download size={14} />} onClick={handleExportSelected}>
          Export CSV ({selectedUserIds.length})
        </Button>
      </TableBulkActionBar>
    </div>
  );
};

