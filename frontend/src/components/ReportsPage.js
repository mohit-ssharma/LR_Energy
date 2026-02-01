import React from 'react';
import { FileText, Download } from 'lucide-react';

const ReportsPage = () => {
  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Reports Generation</h1>
        <p className="text-slate-600">Generate comprehensive SCADA reports</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Report Templates</h2>
        <div className="space-y-3">
          <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Generate Production Report</span>
          </button>
          <button className="w-full bg-violet-700 text-white py-3 rounded-lg font-semibold hover:bg-violet-800 flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Generate Quality Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
