import React, { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile } from '../../api/profile.api';
import { User, Phone, Shield, Building, CreditCard, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>({
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    skills: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getMyProfile();
      if (data && Object.keys(data).length > 0) {
        setProfile({
          ...data,
          skills: data.skills ? (typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills) : []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyProfile(profile);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s: string) => s !== skill) });
  };

  if (loading) return <div className="p-8 text-center">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Advanced Profile</h1>
          <p className="text-slate-500 mt-1">Manage your bank details, emergency contacts, and professional skills</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bank Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Building className="text-indigo-600" size={20} /> Bank Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Bank Name</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-200 rounded-lg"
                value={profile.bank_name || ''}
                onChange={e => setProfile({...profile, bank_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Account Number</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-200 rounded-lg"
                value={profile.account_number || ''}
                onChange={e => setProfile({...profile, account_number: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">IFSC / Routing Code</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-200 rounded-lg"
                value={profile.ifsc_code || ''}
                onChange={e => setProfile({...profile, ifsc_code: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Shield className="text-rose-600" size={20} /> Emergency Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Contact Name</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-200 rounded-lg"
                value={profile.emergency_contact_name || ''}
                onChange={e => setProfile({...profile, emergency_contact_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Contact Phone</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-200 rounded-lg"
                value={profile.emergency_contact_phone || ''}
                onChange={e => setProfile({...profile, emergency_contact_phone: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Skills & Certifications */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <User className="text-emerald-600" size={20} /> Professional Skills
          </h2>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Add a skill (e.g. React, Python)"
              className="flex-1 p-2 border border-slate-200 rounded-lg"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} variant="outline">Add Skill</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.length === 0 && <span className="text-slate-400 text-sm">No skills added yet.</span>}
            {profile.skills.map((skill: string) => (
              <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium flex items-center gap-2">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-rose-500">&times;</button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={saving} className="flex items-center gap-2">
            <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};
