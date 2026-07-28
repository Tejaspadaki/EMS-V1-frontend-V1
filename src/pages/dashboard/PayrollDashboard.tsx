import React, { useEffect, useState } from 'react';
import { getPayrollSummary, processPayroll } from '../../api/payroll.api';
import { DollarSign, CheckCircle2, AlertCircle, FileText, Search, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { exportToCSV } from '../../utils/export';

export const PayrollDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getPayrollSummary();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    setProcessing(true);
    try {
      const date = new Date();
      await processPayroll(date.getMonth() + 1, date.getFullYear());
      alert('Payroll processed successfully for all active employees!');
      await loadData();
    } catch (err) {
      alert('Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Payroll Data...</div>;

  const filteredRecords = data?.records?.filter((record: any) => 
    record.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleExport = () => {
    if (!filteredRecords.length) return;
    const exportData = filteredRecords.map((r: any) => ({
      ID: r.id,
      Employee: r.name,
      Basic: r.base_salary,
      Gross: r.gross_pay,
      PF: r.pf_deduction,
      Tax: r.tax_deduction,
      NetSalary: r.net_pay,
      Status: r.status
    }));
    exportToCSV(exportData, `Payroll_Export_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payroll Administration</h1>
          <p className="text-slate-500">Manage and process monthly salaries</p>
        </div>
        <Button variant="primary" onClick={handleProcessPayroll} disabled={processing}>
          {processing ? 'Processing...' : 'Run Payroll Engine'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Payout</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${data?.stats?.total_net || 0}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Tax Collected</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">${data?.stats?.total_tax || 0}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total PF Deductions</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">${data?.stats?.total_pf || 0}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Gross Pay</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">${data?.stats?.total_gross || 0}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Current Month Payroll</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
              <Download size={16} /> Export CSV
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-6 py-3 font-semibold">Employee</th>
                <th className="px-6 py-3 font-semibold">Basic</th>
                <th className="px-6 py-3 font-semibold">Net Salary</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No payroll records found.</td>
                </tr>
              ) : (
                filteredRecords.map((record: any) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{record.name}</td>
                    <td className="px-6 py-4">${record.base_salary}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">${record.net_pay}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${record.status === 'generated' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs text-slate-400 flex items-center justify-end gap-1"><CheckCircle2 size={14} /> Created</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
