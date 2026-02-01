import React, { useState } from 'react';
import { FileText, Download, Calendar, FileSpreadsheet, FileJson } from 'lucide-react';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('production');
  const [dateRange, setDateRange] = useState('today');
  const [exportFormat, setExportFormat] = useState('pdf');

  const reportTemplates = [
    { id: 'production', label: 'Production Report', icon: FileText, color: 'text-blue-600 bg-blue-100' },
    { id: 'quality', label: 'Quality Report', icon: FileText, color: 'text-green-600 bg-green-100' },
    { id: 'performance', label: 'Performance Report', icon: FileText, color: 'text-purple-600 bg-purple-100' },
    { id: 'compliance', label: 'Compliance Report', icon: FileText, color: 'text-orange-600 bg-orange-100' }
  ];

  const recentReports = [
    { name: 'Daily Production Report - Feb 01, 2026', date: '2026-02-01', size: '2.4 MB', format: 'PDF', status: 'Ready' },
    { name: 'Weekly Quality Report - Jan 26-Feb 01', date: '2026-02-01', size: '5.1 MB', format: 'Excel', status: 'Ready' },
    { name: 'Monthly Performance Report - January 2026', date: '2026-01-31', size: '8.7 MB', format: 'PDF', status: 'Ready' },
    { name: 'Compliance Report - Q4 2025', date: '2026-01-15', size: '12.3 MB', format: 'PDF', status: 'Ready' }
  ];

  return (
    <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-white min-h-screen" data-testid="reports-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <span>Reports Generation</span>
        </h1>
        <p className="text-gray-600">Generate comprehensive reports for analysis and compliance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate New Report</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Report Template</label>
            <div className="grid grid-cols-2 gap-3">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => setReportType(template.id)}
                    data-testid={`report-template-${template.id}`}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                      reportType === template.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${template.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{template.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Date Range</label>
            <div className="grid grid-cols-3 gap-3">
              {['today', 'week', 'month', 'quarter', 'year', 'custom'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  data-testid={`date-range-${range}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    dateRange === range
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Export Format</label>
            <div className="flex space-x-3">
              {[
                { value: 'pdf', label: 'PDF', icon: FileText },
                { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
                { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
                { value: 'json', label: 'JSON', icon: FileJson }
              ].map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.value}
                    onClick={() => setExportFormat(format.value)}
                    data-testid={`export-format-${format.value}`}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center space-y-2 ${
                      exportFormat === format.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{format.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
            data-testid="generate-report-button"
          >
            <FileText className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary Statistics</h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Total Production (Today)</div>
              <div className="text-2xl font-bold text-gray-800">12,450.8 Nm³</div>
              <div className="text-xs text-green-600 mt-1">↑ 5.2% vs yesterday</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Average CH₄ Content</div>
              <div className="text-2xl font-bold text-gray-800">96.8%</div>
              <div className="text-xs text-green-600 mt-1">Within optimal range</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-gray-600 mb-1">System Efficiency</div>
              <div className="text-2xl font-bold text-gray-800">92.9%</div>
              <div className="text-xs text-green-600 mt-1">↑ 1.3% vs last week</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
              <div className="text-sm text-gray-600 mb-1">Uptime (This Month)</div>
              <div className="text-2xl font-bold text-gray-800">99.2%</div>
              <div className="text-xs text-green-600 mt-1">Excellent performance</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Reports</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Report Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Size</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Format</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" data-testid={`recent-report-${index}`}>
                  <td className="py-3 px-4 text-sm text-gray-800">{report.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{report.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{report.size}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {report.format}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm font-medium"
                      data-testid={`download-report-${index}`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
