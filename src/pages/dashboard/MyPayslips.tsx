import React, { useEffect, useState } from 'react';
import { getMyPayslips } from '../../api/payroll.api';
import { FileText, Download } from 'lucide-react';

export const MyPayslips: React.FC = () => {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const data = await getMyPayslips();
        setPayslips(data);
      } catch (error) {
        console.error('Error fetching payslips', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading payslips...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Payslips</h1>
          <p className="text-slate-500 mt-1">View and download your monthly salary slips</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {payslips.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <FileText size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Payslips Found</h3>
            <p className="text-slate-500 mt-2">Your payroll records will appear here once processed by HR.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payslips.map(slip => (
              <div key={slip.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Payslip for {new Date(slip.month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h3>
                    <p className="text-sm font-medium text-emerald-600 mt-1">Net Salary: ${slip.net_salary}</p>
                  </div>
                </div>
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
                  onClick={() => alert('Download functionality would generate a PDF client-side here.')}
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
