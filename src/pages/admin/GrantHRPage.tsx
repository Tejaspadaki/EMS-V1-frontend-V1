import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { grantHRRole, getAllUsers } from '../../api/admin.api';
import { toast } from '../../utils/toast';

export const GrantHRPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Search all potential employees to grant HR role (only show employees from HR department)
    getAllUsers().then(users => {
      setUsers(users.filter((u: any) => {
        const isNotAlreadyHRAdmin = !['SUPER_ADMIN', 'Super Admin', 'HR'].includes(u.role);
        const isHRDepartment = u.department && (
          u.department.toLowerCase().includes('hr') || 
          u.department.toLowerCase().includes('human resource')
        );
        return isNotAlreadyHRAdmin && isHRDepartment;
      }));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await grantHRRole(selectedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to grant HR role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Grant HR Role</h2>
      
      <div className="novynth-card p-6">
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Elevate an existing user's permissions to Human Resources. This grants them access to user management features.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Select User</label>
            <Select required value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">Search / Select User</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </Select>
          </div>

          {success && (
            <div className="p-3 bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)] rounded text-sm font-medium">
              Successfully granted HR role to the user!
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="accent" disabled={loading || !selectedUser}>
              {loading ? 'Granting...' : 'Grant HR Access'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
