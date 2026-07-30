import React from 'react';

interface ContributionGaugeProps {
  score?: number;
  isGenerated?: boolean;
}

export const ContributionGauge: React.FC<ContributionGaugeProps> = ({ score = 85 }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference / 2;
  
  const displayScore = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 85;
  const dashOffset = arcLength - (displayScore / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center w-36 relative">
      <svg className="w-full h-20" viewBox="0 0 100 50">
        <defs>
          <linearGradient id="contribution-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="url(#contribution-gauge-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center leading-none">
        <span className="text-2xl font-black text-slate-900">{displayScore}%</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
};
