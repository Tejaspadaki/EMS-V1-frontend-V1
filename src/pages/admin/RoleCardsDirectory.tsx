import React, { useEffect, useState } from 'react';
import { getAllUsers, bulkGenerateRoleCards } from '../../api/admin.api';
import { Shield, Fingerprint, RefreshCcw, Search, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const RoleCardsDirectory: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
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
    loadData();
  }, []);

  const handleBulkGenerate = async () => {
    setGenerating(true);
    setSuccessMsg('');
    try {
      const res = await bulkGenerateRoleCards();
      setSuccessMsg(res.data.message || 'Successfully generated role cards!');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to bulk generate');
    } finally {
      setGenerating(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const missingCount = users.filter(u => !u.roleCardGenerated).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 h-[calc(100vh-8rem)] overflow-y-auto pr-2">
      {/* Header Section */}
      <div className="bg-white/40 backdrop-blur-3xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative background effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 tracking-tight flex items-center gap-3">
            <Fingerprint className="text-indigo-600 w-10 h-10" />
            Digital Role Cards
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Manage digital identities and QR access credentials for all personnel.</p>
        </div>

        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search personnel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
            />
          </div>
          
          <Button 
            onClick={handleBulkGenerate} 
            disabled={generating || missingCount === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2 whitespace-nowrap"
          >
            {generating ? (
              <RefreshCcw className="w-5 h-5 animate-spin" />
            ) : (
              <Fingerprint className="w-5 h-5" />
            )}
            Bulk Generate ({missingCount})
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold animate-slide-up shadow-lg shadow-emerald-500/5">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Grid Section */}
      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent shadow-lg"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredUsers.map(user => (
            <div 
              key={user.id} 
              className="group relative bg-white/40 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col items-center text-center"
            >
              {/* Card Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Status Indicator */}
              <div className="absolute top-4 right-4">
                {user.roleCardGenerated ? (
                  <div className="bg-emerald-500/10 text-emerald-600 p-2 rounded-full shadow-sm backdrop-blur-md" title="Active">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="bg-rose-500/10 text-rose-600 p-2 rounded-full shadow-sm backdrop-blur-md" title="Not Generated">
                    <Shield className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* QR Code or Placeholder */}
              <div className="w-32 h-32 bg-white rounded-3xl p-3 shadow-xl shadow-slate-200/50 mb-6 relative z-10 border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                {user.roleCardGenerated && user.roleCardQrCodeUrl ? (
                  <img src={user.roleCardQrCodeUrl} alt="QR" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-slate-50/50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
                    <Fingerprint className="w-10 h-10 text-slate-300" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="relative z-10 w-full">
                <h3 className="text-xl font-bold text-slate-900 truncate mb-1" title={user.name}>{user.name}</h3>
                <p className="text-xs font-semibold text-slate-500 truncate mb-4">{user.email}</p>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <div className="flex gap-1 flex-wrap justify-center">
                    {(user.roles && user.roles.length > 0 ? user.roles : [user.role]).map((r: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-indigo-100">
                        {r}
                      </span>
                    ))}
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-slate-200 truncate max-w-[120px]" title={user.department}>
                    {user.department || 'N/A'}
                  </span>
                </div>
              </div>

              {/* ID Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 w-full relative z-10">
                <p className="text-[10px] font-mono text-slate-400 font-bold tracking-[0.2em] uppercase">
                  ID: {user.emp_id || user.id}
                </p>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white/30 backdrop-blur-md rounded-[2rem] border border-dashed border-slate-300">
              <Search className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-2xl font-bold text-slate-700">No personnel found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
