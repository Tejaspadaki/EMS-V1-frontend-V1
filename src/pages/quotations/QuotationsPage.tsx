import React, { useEffect, useState } from 'react';
import { getQuotations, generateQuotation, type Quotation, type LineItem } from '../../api/quotations.api';
import { getProjects, type Project } from '../../api/projects.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, FileText } from 'lucide-react';

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Builder state
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [lineItems, setLineItems] = useState<Omit<LineItem, 'id' | 'total'>[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    Promise.all([getQuotations(), getProjects()]).then(([quots, projs]) => {
      setQuotations(quots);
      setProjects(projs);
      setLoading(false);
    });
  }, []);

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    setSelectedProjectId(pid);
    
    if (pid) {
      // Auto-populate quotation template
      setLineItems([
        { description: 'Initial Consultation', quantity: 1, unitPrice: 1500 },
        { description: 'Development Phase 1', quantity: 1, unitPrice: 8500 }
      ]);
    } else {
      setLineItems([]);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof Omit<LineItem, 'id' | 'total'>, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!selectedProjectId || lineItems.length === 0) return;
    setSubmitLoading(true);
    
    const proj = projects.find(p => p.id === selectedProjectId);
    const newQuot = await generateQuotation(selectedProjectId, proj?.title || 'Unknown Project', lineItems);
    
    setQuotations([newQuot, ...quotations]);
    setIsBuilding(false);
    setSelectedProjectId('');
    setLineItems([]);
    setSubmitLoading(false);
  };

  const calcTotal = () => lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Quotations</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage and generate commercial quotations</p>
        </div>
        {!isBuilding && (
          <Button variant="primary" onClick={() => setIsBuilding(true)} className="flex items-center gap-2">
            <Plus size={16} /> New Quotation
          </Button>
        )}
      </div>

      {isBuilding && (
        <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm p-6 mb-8 border-l-4 border-l-[var(--color-primary)]">
          <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <FileText size={20} className="text-[var(--color-primary)]" />
            Quotation Builder
          </h3>
          
          <div className="mb-6 max-w-md">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Select Project</label>
            <select 
              className="ems-input w-full"
              value={selectedProjectId}
              onChange={handleProjectSelect}
            >
              <option value="">-- Choose a Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {selectedProjectId && (
            <div className="space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-3">Unit Price (₹)</div>
                <div className="col-span-1"></div>
              </div>
              
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50 p-3 md:p-2 md:bg-transparent rounded-lg">
                  <div className="col-span-1 md:col-span-6">
                    <Input 
                      type="text" 
                      placeholder="Item description" 
                      value={item.description}
                      onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <Input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(i, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-3">
                    <Input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end md:justify-center">
                    <button 
                      onClick={() => removeLineItem(i)}
                      className="text-gray-400 hover:text-[#C62828] p-2 transition-colors rounded-md hover:bg-[#FFEBEE]"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <button 
                  onClick={addLineItem}
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Line Item
                </button>
              </div>

              <div className="pt-6 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">
                  Total: ₹{calcTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button variant="ghost" onClick={() => setIsBuilding(false)} className="w-full md:w-auto">Cancel</Button>
                  <Button variant="primary" onClick={handleGenerate} disabled={submitLoading || lineItems.length === 0} className="w-full md:w-auto">
                    {submitLoading ? 'Generating...' : 'Generate Quotation'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden">
        {quotations.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-secondary)]">No quotations found.</div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {quotations.map(q => (
              <div key={q.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-[var(--color-text-primary)]">{q.projectTitle}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      q.status === 'Sent' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] font-mono">ID: {q.id} • Created: {new Date(q.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[var(--color-text-primary)]">₹{q.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{q.lineItems.length} items</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
