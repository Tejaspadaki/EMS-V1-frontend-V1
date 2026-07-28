import React from 'react';
import { 
  Users, 
  Wallet, 
  Rocket, 
  ChevronDown, 
  Plus, 
  AlertTriangle,
  ArrowUpRight,
  MoreVertical,
  Check,
  Eye
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

interface DeptHeadDashboardProps {
  data: {
    tasks: any[];
    requests: any[];
    approvals: any[];
  } | null;
  deptData?: any;
}

export const DeptHeadDashboard: React.FC<DeptHeadDashboardProps> = ({ data, deptData }) => {
  const { user } = useAuthStore();
  
  const approvals = data?.approvals || [];
  const headcount = deptData?.headcount || { total: 0, newThisMonth: 0 };
  const budget = deptData?.budget || { annualLimit: 0, totalUsed: 0, utilizationPercentage: 0, payrollUsed: 0, infraUsed: 0, rdUsed: 0 };
  const projects = deptData?.projects || { active: 0, nearingMilestone: 0 };
  
  // Heatmap Data from Backend
  const heatmapData = deptData?.heatmapData || [];
  
  const resourceAllocation = deptData?.resourceAllocation || {
    critical: { count: 0, percentage: 0 },
    maintenance: { count: 0, percentage: 0 },
    innovation: { count: 0, percentage: 0 }
  };

  // Helper to generate random heatmap blocks based on score
  const renderHeatmapBlocks = (score: number) => {
    return Array.from({ length: 24 }).map((_, i) => {
      // Create a distribution of colors based on the score
      const rand = Math.random() * 100;
      let bgColor = 'bg-slate-100'; // default empty/low
      
      if (rand < score - 20) bgColor = 'bg-emerald-500'; // high performance
      else if (rand < score) bgColor = 'bg-emerald-300'; // good performance
      else if (rand < score + 10) bgColor = 'bg-amber-300'; // warning
      else bgColor = 'bg-slate-100'; // inactive/low

      return (
        <div 
          key={i} 
          className={`h-6 rounded-[3px] w-full ${bgColor} transition-colors duration-300 hover:opacity-80 cursor-pointer`}
          title={`Metric point ${i+1}`}
        />
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Department Performance</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            {user?.department || 'Engineering'} Division <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Welcome back, {user?.name?.split(' ')[0] || 'Leader'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
            Last 30 Days
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 shadow-sm shadow-indigo-200 flex items-center gap-2 font-semibold">
            <Plus size={18} />
            New Request
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (3 Cards) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Headcount Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users size={20} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={14} /> +{headcount.newThisMonth} this month
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Headcount</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{headcount.total}</h2>
            </div>
            {/* Simple visual progress/chart */}
            <div className="mt-5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="w-[85%] bg-blue-600 h-full rounded-full" />
            </div>
          </div>

          {/* Budget Utilization Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Wallet size={20} />
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical size={18} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-500 mb-1">Budget Utilization</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{budget.utilizationPercentage}%</h2>
                <span className="text-sm font-semibold text-slate-400">of Annual</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">${(budget.totalUsed / 1000000).toFixed(2)}M used</span>
                <span className="text-slate-400">Annual: ${(budget.annualLimit / 1000000).toFixed(2)}M</span>
              </div>
              {/* Dotted/Dashed progress bar effect */}
              <div className="flex gap-1 h-2">
                {Array.from({length: 10}).map((_, i) => (
                  <div key={i} className={`flex-1 rounded-sm ${i < (budget.utilizationPercentage / 10) ? 'bg-purple-600' : 'bg-slate-100'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Active Projects Card (Dark Navy Style) */}
          <div className="bg-[#0f172a] p-6 rounded-2xl shadow-xl shadow-slate-900/10 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            {/* Glow effects */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 rounded-full blur-[60px] opacity-20" />
            
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300 mb-6 border border-white/5">
                <Rocket size={20} />
              </div>
              <p className="text-sm font-medium text-slate-400 mb-1">Active Projects</p>
              <h2 className="text-5xl font-black tracking-tight mb-4 text-white">{projects.active}</h2>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  <span className="text-emerald-400 font-bold">{projects.nearingMilestone} projects</span> nearing milestone delivery this quarter.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Heatmap) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Team Performance Heatmap</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Velocity and quality metrics by squad</p>
              </div>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View Detailed Metrics <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="space-y-6">
              {heatmapData.map((team, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Team Label & Score */}
                  <div className="w-40 shrink-0">
                    <h4 className="font-semibold text-slate-900">{team.team}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-700">{team.score}%</span>
                      <span className={`text-xs font-bold ${team.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {team.trend}
                      </span>
                    </div>
                  </div>
                  
                  {/* Heatmap Grid Row */}
                  <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1.5">
                    {/* Render exactly 24 blocks per row to match a realistic heatmap span */}
                    {renderHeatmapBlocks(team.score)}
                  </div>
                </div>
              ))}
            </div>

            {/* Heatmap Legend */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" /> Optimal
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-emerald-300" /> Stable
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-amber-300" /> Needs Review
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-slate-100" /> Inactive
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Budget Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6">Budget Breakdown</h3>
          
          <div className="space-y-5 flex-1">
            {/* Category 1 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-700">Payroll & Benefits</span>
                <span className="font-bold text-slate-900">{budget.totalUsed > 0 ? Math.round((budget.payrollUsed / budget.totalUsed) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${budget.totalUsed > 0 ? (budget.payrollUsed / budget.totalUsed) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Category 2 (Warning) */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold flex items-center gap-1.5 text-amber-700">
                  Infrastructure {(budget.totalUsed > 0 && (budget.infraUsed / budget.totalUsed) > 0.3) && <AlertTriangle size={14} />}
                </span>
                <span className="font-bold text-amber-700">{budget.totalUsed > 0 ? Math.round((budget.infraUsed / budget.totalUsed) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${budget.totalUsed > 0 ? (budget.infraUsed / budget.totalUsed) * 100 : 0}%` }} />
              </div>
              {budget.totalUsed > 0 && (budget.infraUsed / budget.totalUsed) > 0.3 && (
                <p className="text-xs text-amber-600 font-medium mt-1.5">Approaching limit</p>
              )}
            </div>

            {/* Category 3 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-700">R&D and Innovation</span>
                <span className="font-bold text-slate-900">{budget.totalUsed > 0 ? Math.round((budget.rdUsed / budget.totalUsed) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${budget.totalUsed > 0 ? (budget.rdUsed / budget.totalUsed) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals (Using Real Data) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Pending Approvals</h3>
            <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-1 rounded-lg">
              {approvals.length > 0 ? `${approvals.length} Actions` : '0 Actions'}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
            {approvals.length > 0 ? (
              approvals.slice(0, 3).map((approval: any) => (
                <div key={approval.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{approval.user?.name || 'Employee'}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {approval.type || 'Leave Request'} • {new Date(approval.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Button className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 h-8 text-xs font-semibold">
                      <Eye size={14} className="mr-1.5" /> Review
                    </Button>
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold">
                      <Check size={14} className="mr-1.5" /> Approve
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-6">
                <Check size={40} className="mb-3 text-slate-200" />
                <p className="font-medium text-sm">All caught up!</p>
                <p className="text-xs">No pending approvals.</p>
              </div>
            )}
          </div>
          {approvals.length > 3 && (
            <button className="w-full mt-4 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
              View All Approvals ({approvals.length})
            </button>
          )}
        </div>

        {/* Resource Allocation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6">Resource Allocation</h3>
          
          <div className="flex-1 flex flex-col justify-center">
            {/* Visual Bar */}
            <div className="flex w-full h-4 rounded-full overflow-hidden mb-8 shadow-inner">
              <div className="bg-indigo-600 h-full" style={{ width: `${resourceAllocation.critical.percentage}%` }} title={`Critical (${resourceAllocation.critical.percentage}%)`} />
              <div className="bg-sky-400 h-full" style={{ width: `${resourceAllocation.maintenance.percentage}%` }} title={`Maintenance (${resourceAllocation.maintenance.percentage}%)`} />
              <div className="bg-emerald-400 h-full" style={{ width: `${resourceAllocation.innovation.percentage}%` }} title={`Innovation (${resourceAllocation.innovation.percentage}%)`} />
            </div>

            {/* Legend / Metrics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Critical Initiatives</p>
                    <p className="text-xs font-medium text-slate-500">Core product & scale</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{resourceAllocation.critical.percentage}%</p>
                  <p className="text-xs text-slate-500">{resourceAllocation.critical.count} Tasks</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Maintenance</p>
                    <p className="text-xs font-medium text-slate-500">Tech debt & bugs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{resourceAllocation.maintenance.percentage}%</p>
                  <p className="text-xs text-slate-500">{resourceAllocation.maintenance.count} Tasks</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Innovation</p>
                    <p className="text-xs font-medium text-slate-500">R&D & future scope</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{resourceAllocation.innovation.percentage}%</p>
                  <p className="text-xs text-slate-500">{resourceAllocation.innovation.count} Tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
