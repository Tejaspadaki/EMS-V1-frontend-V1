import React, { useEffect, useState } from 'react';
import { getPendingFaces, approveFace, rejectFace } from '../../api/attendance.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { Loader, Users, CheckCircle, XCircle, ChevronRight, User } from 'lucide-react';

interface PendingFace {
  id: number;
  user_id: number;
  name: string;
  emp_id: string;
  department_id: number | null;
  created_at: string;
  front_image: string;
  left_image: string;
  right_image: string;
}

export const FaceApprovalPage: React.FC = () => {
  const [pendingFaces, setPendingFaces] = useState<PendingFace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFace, setSelectedFace] = useState<PendingFace | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await getPendingFaces();
      if (res.success) {
        setPendingFaces(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to load pending enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async () => {
    if (!selectedFace) return;
    setIsActionLoading(true);
    try {
      await approveFace(selectedFace.id);
      toast.success(`Approved enrollment for ${selectedFace.name}`);
      setSelectedFace(null);
      fetchPending();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to approve enrollment');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedFace) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setIsActionLoading(true);
    try {
      await rejectFace(selectedFace.id, rejectReason);
      toast.success(`Rejected enrollment for ${selectedFace.name}`);
      setSelectedFace(null);
      setRejectReason('');
      fetchPending();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to reject enrollment');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600" />
            Face Enrollment Approvals
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve new biometric face profiles before they can be used for check-in.
          </p>
        </div>
      </div>

      {!selectedFace ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals ({pendingFaces.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingFaces.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle size={40} className="mx-auto mb-3 text-slate-400" />
                <p className="font-semibold">All caught up!</p>
                <p className="text-sm">No pending face enrollments require your attention.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingFaces.map((face) => (
                  <div key={face.id} className="py-4 flex items-center justify-between hover:bg-slate-50 px-4 -mx-4 transition-colors rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        {face.front_image ? (
                          <img 
                            src={`${API_URL}${face.front_image}`} 
                            alt={face.name} 
                            className="w-full h-full object-cover scale-x-[-1]" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <User className="w-full h-full p-2 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{face.name}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{face.emp_id} • Submitted: {new Date(face.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => setSelectedFace(face)} className="gap-1">
                      Review <ChevronRight size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <Button variant="ghost" onClick={() => { setSelectedFace(null); setRejectReason(''); }} className="pl-0 hover:bg-transparent text-indigo-600">
            ← Back to List
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Reviewing Enrollment for {selectedFace.name} ({selectedFace.emp_id})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl text-sm leading-relaxed">
                <strong>Quality Check Requirements:</strong> Ensure the face is clearly visible, well-lit, and the left/right profiles match the front profile. Masks or heavy obstructions should be rejected.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Front Profile', img: selectedFace.front_image },
                  { label: 'Left Profile', img: selectedFace.left_image },
                  { label: 'Right Profile', img: selectedFace.right_image },
                ].map((angle, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700 block text-center">{angle.label}</span>
                    <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                      {angle.img ? (
                        <img 
                          src={`${API_URL}${angle.img}`} 
                          alt={angle.label} 
                          className="w-full h-full object-cover scale-x-[-1]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                            (e.target as HTMLImageElement).className = "w-full h-full p-8 opacity-50";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Rejection Reason (if rejecting)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Blurry image, face not fully visible..."
                      className="w-full border-slate-200 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm p-2"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button 
                      variant="danger" 
                      onClick={handleReject} 
                      disabled={isActionLoading || !rejectReason.trim()}
                      className="gap-2"
                    >
                      {isActionLoading ? <Loader size={16} className="animate-spin" /> : <XCircle size={16} />}
                      Reject
                    </Button>
                    <Button 
                      variant="accent" 
                      onClick={handleApprove}
                      disabled={isActionLoading}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isActionLoading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      Approve Enrollment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
