import React, { useEffect, useState } from 'react';
import { getSprintBurndown, type BurndownPoint } from '../../api/sprints.api';
import { Modal } from '../ui/Modal';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface SprintBurndownModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: string;
}

export const SprintBurndownModal: React.FC<SprintBurndownModalProps> = ({ isOpen, onClose, sprintId }) => {
  const [data, setData] = useState<BurndownPoint[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sprintName, setSprintName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && sprintId) {
      setLoading(true);
      getSprintBurndown(sprintId)
        .then(res => {
          setData(res.burndown);
          setTotalPoints(res.totalStoryPoints);
          setSprintName(res.sprintName);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, sprintId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Sprint Burn-down Chart: ${sprintName}`}>
      <div className="p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            No story points or timeline defined for this sprint.
          </div>
        ) : (
          <>
            <div className="flex gap-6 text-sm bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
              <TrendingDown size={28} className="text-indigo-600 shrink-0" />
              <div>
                <p className="font-extrabold text-indigo-900">Sprint Tracking Analytics</p>
                <p className="text-indigo-700 text-xs mt-0.5">
                  Total starting workload estimated at <strong>{totalPoints} Story Points</strong>.
                  The dashed line shows the ideal linear path to completion, and the solid line shows actual remaining points.
                </p>
              </div>
            </div>

            <div className="h-[320px] w-full bg-white rounded-xl border border-slate-100 p-2 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => tick.slice(5)} // Show MM-DD format
                    stroke="#94A3B8" 
                    fontSize={11} 
                    fontFamily="inherit"
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={11} 
                    fontFamily="inherit"
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  
                  {/* Ideal Burn Line */}
                  <Line 
                    type="monotone" 
                    dataKey="ideal" 
                    name="Ideal Burn" 
                    stroke="#94A3B8" 
                    strokeDasharray="5 5" 
                    strokeWidth={2} 
                    dot={false}
                  />
                  
                  {/* Actual Burn Line */}
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    name="Remaining Points" 
                    stroke="#4F46E5" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
