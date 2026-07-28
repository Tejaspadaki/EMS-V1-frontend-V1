import React, { useEffect, useState } from 'react';
import { getCustomerDashboardData } from '../../api/crm.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { FileText, DollarSign, Briefcase, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CustomerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCustomerDashboardData();
        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching Customer dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading CRM Dashboard...</span>
        </div>
      </div>
    );
  }

  const { metrics, charts, activeTickets } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer & CRM</h1>
          <p className="text-slate-500">View your active quotations and invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary">
            Request Quotation
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Total Quotations" 
          value={metrics?.totalQuotations?.toString() || '0'}
          trend="Sent proposals"
          trendUp={true}
          icon={<FileText size={24} className="text-sky-500" />}
        />
        <KPICard 
          title="Total Invoices" 
          value={metrics?.totalInvoices?.toString() || '0'}
          trend="Billed"
          trendUp={true}
          icon={<Briefcase size={24} className="text-emerald-500" />}
        />
        <KPICard 
          title="Outstanding Balance" 
          value={`$${metrics?.outstandingBalance?.toLocaleString() || '0'}`}
          trend="Unpaid invoices"
          trendUp={false}
          icon={<CreditCard size={24} className="text-rose-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotations List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            Active Quotations
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
            {!data?.quotations?.length ? (
              <p className="text-sm text-slate-500 text-center py-8">No quotations available</p>
            ) : (
              data.quotations.map((quote: any) => (
                <div key={quote.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{quote.project_name}</h4>
                    <span className="text-xs text-slate-500">{new Date(quote.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 mb-1">${quote.total_amount}</div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      quote.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            Invoices
            {metrics?.outstandingBalance > 0 && <AlertCircle className="text-rose-500 shrink-0" size={16} />}
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
            {!data?.invoices?.length ? (
              <p className="text-sm text-slate-500 text-center py-8">No invoices available</p>
            ) : (
              data.invoices.map((inv: any) => (
                <div key={inv.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Invoice #{inv.id}</h4>
                    <span className="text-xs text-slate-500">Due: {new Date(inv.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 mb-1">${inv.amount}</div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
