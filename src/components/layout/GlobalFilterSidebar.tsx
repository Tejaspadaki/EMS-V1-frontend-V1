import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronRight, X } from 'lucide-react';

export interface FilterFacet {
  id: string;
  label: string;
  options: { label: string; value: string }[];
}

interface GlobalFilterSidebarProps {
  facets: FilterFacet[];
  activeFilters: Record<string, string[]>;
  onChange: (filters: Record<string, string[]>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalFilterSidebar: React.FC<GlobalFilterSidebarProps> = ({ 
  facets, 
  activeFilters, 
  onChange,
  isOpen,
  onClose
}) => {
  const [expandedFacets, setExpandedFacets] = useState<Record<string, boolean>>(
    facets.reduce((acc, f) => ({ ...acc, [f.id]: true }), {})
  );

  const activeCount = Object.values(activeFilters).reduce((acc, curr) => acc + curr.length, 0);

  const toggleFacet = (facetId: string) => {
    setExpandedFacets(prev => ({ ...prev, [facetId]: !prev[facetId] }));
  };

  const handleCheckbox = (facetId: string, value: string, checked: boolean) => {
    const current = activeFilters[facetId] || [];
    const updated = checked 
      ? [...current, value]
      : current.filter(v => v !== value);
    
    onChange({
      ...activeFilters,
      [facetId]: updated
    });
  };

  const clearFilters = () => {
    onChange({});
  };

  if (!isOpen) return null;

  return (
    <div className="w-64 bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col shadow-sm shrink-0">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          Filter Facets
          {activeCount > 0 && (
            <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline font-semibold">
              Clear all
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 lg:hidden">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2 flex-1">
        {facets.map(facet => {
          const isExpanded = expandedFacets[facet.id];
          const activeValues = activeFilters[facet.id] || [];
          
          return (
            <div key={facet.id} className="border border-transparent hover:border-slate-100 rounded-xl overflow-hidden transition-colors">
              <button 
                onClick={() => toggleFacet(facet.id)}
                className="w-full flex items-center justify-between p-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {facet.label}
                {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
              </button>
              
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 mt-1">
                  {facet.options.map(opt => (
                    <label key={opt.value} className="flex items-start gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={activeValues.includes(opt.value)}
                        onChange={(e) => handleCheckbox(facet.id, opt.value, e.target.checked)}
                        className="mt-0.5 shrink-0 accent-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors leading-tight font-medium">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export interface AppliedFilterChipsProps {
  facets: FilterFacet[];
  activeFilters: Record<string, string[]>;
  onRemove: (facetId: string, value: string) => void;
  onClearAll: () => void;
}

export const AppliedFilterChips: React.FC<AppliedFilterChipsProps> = ({
  facets,
  activeFilters,
  onRemove,
  onClearAll
}) => {
  const activeEntries: { facetId: string; facetLabel: string; value: string; optionLabel: string }[] = [];

  Object.entries(activeFilters).forEach(([facetId, values]) => {
    const facet = facets.find(f => f.id === facetId);
    if (!facet) return;
    values.forEach(val => {
      const opt = facet.options.find(o => o.value === val);
      activeEntries.push({
        facetId,
        facetLabel: facet.label,
        value: val,
        optionLabel: opt ? opt.label : val
      });
    });
  });

  if (activeEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs font-bold text-slate-500 mr-1">Active Filters:</span>
      {activeEntries.map(entry => (
        <span 
          key={`${entry.facetId}-${entry.value}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
        >
          <span className="text-indigo-400 font-normal">{entry.facetLabel}:</span>
          <span>{entry.optionLabel}</span>
          <button 
            onClick={() => onRemove(entry.facetId, entry.value)}
            className="hover:bg-indigo-100 rounded-full p-0.5 text-indigo-500 hover:text-indigo-800 transition-colors"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <button 
        onClick={onClearAll}
        className="text-xs font-semibold text-slate-500 hover:text-red-600 underline ml-2 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
};

