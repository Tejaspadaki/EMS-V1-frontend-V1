import React from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  } | string;
  trendUp?: boolean;
  colorClass?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, trendUp, colorClass = 'bg-indigo-50 text-indigo-600' }) => {
  const trendObj = typeof trend === 'string' 
    ? { value: trend, isPositive: trendUp ?? true } 
    : trend;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
          
          {trendObj && (
            <div className={`flex items-center gap-1.5 mt-3 text-xs font-semibold ${trendObj.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span className={`flex items-center justify-center w-5 h-5 rounded-full ${trendObj.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {trendObj.isPositive ? '↑' : '↓'}
              </span>
              <span>{trendObj.value}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

