import React, { useEffect, useState } from 'react';
import { getFinanceDashboardData } from '../../api/dashboard.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { DollarSign, FileText, Download, Send, CheckCircle2, History, AlertCircle, Users, FileCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

export const FinanceLeadDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getFinanceDashboardData();
        setData(res);
      } catch (err) {
        console.error('Error loading Finance dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { quotations, versions, complianceTasks } = data || {};

  const financeTeam = [
    { id: 1, name: 'Clara Oswald', role: 'Senior Finance Analyst', task: 'Tax Reconciliation' },
    { id: 2, name: 'Robert Vance', role: 'Billing Specialist', task: 'Invoice Auditing' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Finance Lead Dashboard</h1>
          <p className="text-slate-500">Quotation status tracking, immutable version history, invoice PDF proposals & compliance tasks</p>
        </div>
        <Button variant="primary" icon={<FileText size={16} />} onClick={() => navigate('/quotations')}>
          Quotations Workspace
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Total Quotations Value" value="$210,500" trend="Quotation-level view only" trendUp={true} icon={<FileText size={24} className="text-emerald-500" />} />
        <KPICard title="Pending Invoices" value="4" trend="Follow-up required" trendUp={true} icon={<DollarSign size={24} className="text-indigo-500" />} />
        <KPICard title="Compliance Tasks" value={(complianceTasks?.length || 2).toString()} trend="Tax & Audit on track" trendUp={true} icon={<CheckCircle2 size={24} className="text-sky-500" />} />
      </div>

      {/* Strict Revenue Boundary Alert */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-2">
          <AlertCircle className="text-amber-600" size={18} />
          Finance Lead Boundary Policy: Revenue visibility is restricted to quotation & invoice-level figures. Full company P&L remains CEO/CTO only.
        </span>
      </div>

      {/* Quotation Status & Immutable Version History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="text-emerald-600" size={20} />
            Quotations & Versioning Log (Immutable Post-Send Edits)
          </span>
          <Button variant="outline" size="sm" onClick={() => navigate('/quotations')}>View All</Button>
        </h3>
        <div className="space-y-4">
          {(quotations?.length ? quotations : [
            { id: 101, project_name: 'E-Commerce Mobile Application', client_name: 'Apex Retail Inc', total_amount: '18500.00', status: 'Sent', version: 2 },
            { id: 102, project_name: 'AI Customer Chatbot', client_name: 'Quantum Solutions', total_amount: '12000.00', status: 'Accepted', version: 1 }
          ]).map((q: any) => (
            <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{q.project_name}</h4>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Version v{q.version || 1}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Client: {q.client_name} • Status: {q.status}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-slate-900">${parseFloat(q.total_amount || '0').toLocaleString()}</span>
                <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => toast.success(`Downloaded Proposal PDF for ${q.client_name}`)}>
                  PDF Proposal
                </Button>
                <Button variant="primary" size="sm" icon={<Send size={14} />} onClick={() => toast.success(`Resent PDF proposal to ${q.client_name}`)}>
                  Resend
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Finance Team Roster & Compliance Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="text-emerald-600" size={20} />
            Finance & Admin Team Roster
          </h3>
          <div className="space-y-3">
            {financeTeam.map(f => (
              <div key={f.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{f.name}</h4>
                  <p className="text-slate-500">{f.role}</p>
                </div>
                <span className="font-semibold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                  {f.task}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-sky-600" size={20} />
            Compliance Checklist & Audit Tasks
          </h3>
          <div className="space-y-3">
            {(complianceTasks || [
              { id: 1, title: 'Q3 Tax Compliance Audit', dueDate: '2026-08-15', status: 'In Progress' },
              { id: 2, title: 'Monthly Invoice Reconciliation', dueDate: '2026-07-31', status: 'Pending' }
            ]).map((ct: any) => (
              <div key={ct.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{ct.title}</h4>
                  <p className="text-slate-400">Due Date: {ct.dueDate}</p>
                </div>
                <span className="font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                  {ct.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

