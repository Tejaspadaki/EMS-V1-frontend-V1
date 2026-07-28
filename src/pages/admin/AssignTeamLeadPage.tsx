import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { assignTeamLead, getAllUsers } from '../../api/admin.api';
import { toast } from '../../utils/toast';

export const AssignTeamLeadPage: React.FC = () => {
  const [deptHeads, setDeptHeads] = useState<any[]>([]);
  const [teamLeads, setTeamLeads] = useState<any[]>([]);
  
  const [selectedDeptHead, setSelectedDeptHead] = useState('');
  const [selectedTeamLead, setSelectedTeamLead] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getAllUsers().then((users: any[]) => {
      setDeptHeads(users.filter(u => ['DEPT_HEAD', 'Dept Head'].includes(u.role)));
      setTeamLeads(users.filter(u => ['EMPLOYEE', 'Employee', 'INTERN', 'Intern', 'TEAM_LEAD', 'Team Lead'].includes(u.role)));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await assignTeamLead({ deptHeadId: selectedDeptHead, teamLeadId: selectedTeamLead });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error('Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Assign Team Lead</h2>
      
      <div className="ems-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Department Head</label>
            <Select required value={selectedDeptHead} onChange={(e) => setSelectedDeptHead(e.target.value)}>
              <option value="">Select Department Head</option>
              {deptHeads.map(u => (
                <option key={u.id} value={u.id}>{u.name} - {u.department}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Team Lead</label>
            <Select required value={selectedTeamLead} onChange={(e) => setSelectedTeamLead(e.target.value)}>
              <option value="">Select Team Lead</option>
              {teamLeads.map(u => (
                <option key={u.id} value={u.id}>{u.name} - {u.department}</option>
              ))}
            </Select>
          </div>

          {success && (
            <div className="p-3 bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)] rounded text-sm font-medium">
              Successfully assigned team lead to department head!
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="accent" disabled={loading || !selectedDeptHead || !selectedTeamLead}>
              {loading ? 'Assigning...' : 'Assign Team Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
