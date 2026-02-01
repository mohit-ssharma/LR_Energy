import React, { useState } from 'react';
import { FileText, Download, Calendar, FileSpreadsheet, FileJson, Eye, Check, Settings } from 'lucide-react';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('production');
  const [dateRange, setDateRange] = useState('today');
  const [exportFormat, setExportFormat] = useState('pdf');

  const reportTemplates = [
    { id: 'production', label: 'Production Report', icon: FileText, color: 'bg-emerald-600', description: 'Complete biogas production metrics', includes: ['Raw Biogas Flow', 'Purified Gas Flow', 'Product Gas Flow', 'CH₄ Concentration', 'Efficiency'] },
    { id: 'quality', label: 'Quality Report', icon: FileText, color: 'bg-violet-700', description: 'Gas quality and composition', includes: ['CH₄ Concentration', 'O₂ Levels', 'H₂S Content', 'Dew Point', 'Compliance'] },
    { id: 'performance', label: 'Performance Report', icon: FileText, color: 'bg-cyan-600', description: 'Equipment performance', includes: ['Digesters 1&2 Temps', 'Pressures', 'Tank Levels', 'Flow Meters', 'Uptime'] },
    { id: 'compliance', label: 'Compliance Report', icon: FileText, color: 'bg-amber-600', description: 'Regulatory compliance', includes: ['Safety Parameters', 'Thresholds', 'Alarms', 'Standards'] },
    { id: 'custom', label: 'Custom Report', icon: Settings, color: 'bg-slate-700', description: 'Build custom report', includes: ['Select Parameters', 'Date Range', 'Export Format'] }
  ];

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="reports-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-2 flex items-center space-x-3">
          <FileText className="w-7 h-7 text-emerald-600" />
          <span>Reports Generation</span>
        </h1>
        <p className="text-slate-600">Generate comprehensive reports for analysis and compliance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => setReportType(template.id)}
                  className={`p-5 rounded-lg border-2 transition-all text-left hover:shadow-md ${reportType === template.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${template.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{template.label}</h3>
                      <p className="text-xs text-slate-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-md p-3 border border-slate-100">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Includes:</div>
                    <ul className="space-y-1">
                      {template.includes.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                          <Check className="w-3 h-3 text-emerald-600 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Configuration</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                {['today', 'week', 'month', 'quarter'].map((range) => (
                  <button key={range} onClick={() => setDateRange(range)} className={`px-3 py-2 rounded-md text-sm font-medium transition-all capitalize ${dateRange === range ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Format</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: 'pdf', label: 'PDF', icon: FileText }, { value: 'excel', label: 'Excel', icon: FileSpreadsheet }].map((format) => {
                  const FormatIcon = format.icon;
                  return (
                    <button key={format.value} onClick={() => setExportFormat(format.value)} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center space-x-2 ${exportFormat === format.value ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <FormatIcon className="w-4 h-4" />
                      <span>{format.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 flex items-center justify-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
