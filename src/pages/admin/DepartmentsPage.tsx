import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { type Department, getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/department.api';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from '../../utils/toast';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name, description: dept.description || '' });
    } else {
      setEditingDept(null);
      setFormData({ name: '', description: '' });
    }
    setError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDept(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, formData);
      } else {
        await createDepartment(formData);
      }
      handleCloseModal();
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the department "${name}"?`)) {
      try {
        await deleteDepartment(id);
        fetchDepartments();
      } catch (err: any) {
        toast.error(err.response?.data?.error?.message || 'Failed to delete department');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Departments</h2>
        <Button variant="primary" onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={16} /> New Department
        </Button>
      </div>

      <div className="novynth-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-secondary)]">No departments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-canvas)] text-[var(--color-text-secondary)] uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-[var(--color-canvas)]/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{dept.name}</td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">{dept.description || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(dept)}
                          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-[var(--color-primary)]/10"
                          title="Edit Department"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id, dept.name)}
                          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-status-missed-text)] transition-colors rounded-lg hover:bg-[var(--color-status-missed-bg)]"
                          title="Delete Department"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingDept ? 'Edit Department' : 'Create Department'}>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-3 bg-[var(--color-status-missed-bg)] text-[var(--color-status-missed-text)] rounded text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Department Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Engineering"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Description (Optional)</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Software development and engineering"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
