import React from 'react';

interface ContributionGaugeProps {
  score: number;
  isGenerated: boolean;
}

export const ContributionGauge: React.FC<ContributionGaugeProps> = ({ score, isGenerated }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // Use half the circle for the gauge arc
  const arcLength = circumference / 2;
  
  // Calculate stroke dashoffset based on score (0 to 100)
  const scorePercent = isGenerated ? Math.max(0, Math.min(100, score)) : 0;
  const dashOffset = arcLength - (scorePercent / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center w-32 relative">
      <svg className="w-full h-16" viewBox="0 0 100 50">
        {/* Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={isGenerated ? 'var(--color-border)' : '#F5F5F5'}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Fill */}
        {isGenerated && (
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
          />
        )}
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center leading-none">
        {isGenerated ? (
          <>
            <span className="text-xl font-bold text-[var(--color-text-primary)]">{score}</span>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-medium uppercase tracking-widest mt-1">Score</span>
          </>
        ) : (
          <span className="text-xl font-bold text-gray-300">-</span>
        )}
      </div>
    </div>
  );
};
