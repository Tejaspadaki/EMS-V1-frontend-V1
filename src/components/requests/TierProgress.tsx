import React from 'react';

export const TierProgress: React.FC<{ currentTier: number }> = ({ currentTier }) => {
  const maxTiers = 3; // Tier 1 (TL), Tier 2 (DH), Tier 3 (HR)
  
  return (
    <div className="flex items-center gap-1.5" title={`Current Tier: ${currentTier}`}>
      {Array.from({ length: maxTiers }).map((_, i) => {
        const tierNum = i + 1;
        // if currentTier is 4 (approved), all dots are filled
        const isFilled = currentTier > tierNum; 
        const isCurrent = currentTier === tierNum;
        
        return (
          <div 
            key={i} 
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              isFilled 
                ? 'bg-[var(--color-secondary)]' // Secondary blue #3949AB for completed tiers
                : isCurrent 
                  ? 'bg-[var(--color-secondary)] opacity-50 border border-[var(--color-secondary)]' 
                  : 'bg-[var(--color-border)]'
            }`} 
          />
        );
      })}
    </div>
  );
};
