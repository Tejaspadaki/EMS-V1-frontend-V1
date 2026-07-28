import React, { useEffect, useState } from 'react';
import { getCandidates, updateCandidateStage, generateMockCandidate } from '../../api/ats.api';
import { Button } from '../ui/Button';
import { BrainCircuit, Play } from 'lucide-react';
import { toast } from '../../utils/toast';

const STAGES = ['applied', 'screening', 'interview', 'offered', 'rejected'];

export const ATSKanbanBoard: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCandidates = async () => {
    try {
      const data = await getCandidates();
      setCandidates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleStageChange = async (candidateId: number, newStage: string) => {
    try {
      await updateCandidateStage(candidateId, newStage);
      loadCandidates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateMock = async () => {
    try {
      await generateMockCandidate();
      toast('AI generated a new candidate for review!');
      loadCandidates();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading pipeline...</div>;

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-extrabold text-xl flex items-center gap-2">
          Candidate Pipeline (Kanban)
        </h3>
        <Button onClick={handleGenerateMock} variant="outline" className="flex items-center gap-2 border-indigo-200 text-indigo-700 bg-indigo-50">
          <BrainCircuit size={16} /> Simulate AI Sourcing
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageCandidates = candidates.filter(c => c.stage === stage);
          return (
            <div key={stage} className="w-[300px] shrink-0 flex flex-col bg-slate-50/80 rounded-xl p-3 border border-slate-200/50">
              <div className="flex justify-between items-center mb-3 px-1">
                <h4 className="font-bold text-slate-700 capitalize">{stage}</h4>
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{stageCandidates.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                {stageCandidates.map(candidate => (
                  <div key={candidate.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-grab">
                    <h5 className="font-bold text-slate-800 text-sm">{candidate.name}</h5>
                    <p className="text-xs text-slate-500 mb-2 truncate">{candidate.job_title}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${candidate.ai_score > 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        AI Score: {candidate.ai_score}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <select 
                        value={candidate.stage}
                        onChange={(e) => handleStageChange(candidate.id, e.target.value)}
                        className="w-full text-xs p-1 border border-slate-200 rounded text-slate-700 font-medium"
                      >
                        {STAGES.map(s => <option key={s} value={s}>Move to {s.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
