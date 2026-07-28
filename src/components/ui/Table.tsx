import React from 'react';

export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string;
}

export const TableContainer: React.FC<TableContainerProps> = ({ 
  className = '', 
  children, 
  maxHeight = 'calc(100vh - 260px)',
  ...props 
}) => (
  <div 
    className={`w-full overflow-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm relative ${className}`} 
    style={{ maxHeight }}
    {...props}
  >
    {children}
  </div>
);

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className = '', children, ...props }) => (
  <table className={`w-full text-left border-collapse ${className}`} {...props}>
    {children}
  </table>
);

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  sticky?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ className = '', sticky = true, children, ...props }) => (
  <thead 
    className={`
      bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold text-xs tracking-wider uppercase
      ${sticky ? 'sticky top-0 z-10 backdrop-blur-md' : ''}
      ${className}
    `.trim()} 
    {...props}
  >
    {children}
  </thead>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = '', children, ...props }) => (
  <tr className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', children, ...props }) => (
  <th className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0 ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', children, ...props }) => (
  <td className={`px-4 py-3.5 text-sm text-slate-700 font-medium ${className}`} {...props}>
    {children}
  </td>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', children, ...props }) => (
  <tbody className={`divide-y divide-slate-100 ${className}`} {...props}>
    {children}
  </tbody>
);

export interface TableBulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  children: React.ReactNode;
}

export const TableBulkActionBar: React.FC<TableBulkActionBarProps> = ({ selectedCount, onClear, children }) => {
  if (selectedCount <= 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/50 flex items-center gap-4 animate-slide-in">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700 text-xs font-bold">
        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">
          {selectedCount}
        </span>
        <span>items selected</span>
        <button 
          onClick={onClear} 
          className="text-slate-400 hover:text-white underline text-[11px] ml-1 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="animate-pulse space-y-3 p-4">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 items-center">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="h-4 bg-slate-200 rounded-md flex-1" />
        ))}
      </div>
    ))}
  </div>
);

