import React, { useState } from 'react';
import { FileText, Download, Calendar, FileSpreadsheet, FileJson, Eye, Check, X, Settings } from 'lucide-react';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('production');
  const [dateRange, setDateRange] = useState('today');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customParams, setCustomParams] = useState([]);

  const reportTemplates = [
    {
      id: 'production',
      label: 'Production Report',
      icon: FileText,
      color: 'bg-emerald-600',
      description: 'Complete biogas production metrics and performance',
      includes: [
        'Raw Biogas Flow (Totalizer)',
        'Purified Gas Flow (Totalizer)',
        'Product Gas Flow (Totalizer)',
        'CH₄ Concentration (Average)',
        'O₂ Concentration (Average)',
        'System Efficiency (%)',
        'Daily Production Summary'
      ]
    },
    {
      id: 'quality',
      label: 'Quality Report',
      icon: FileText,
      color: 'bg-violet-700',
      description: 'Gas quality parameters and composition analysis',
      includes: [
        'CH₄ Concentration (Min/Max/Avg)',
        'CO₂ Levels',
        'O₂ Concentration (Min/Max/Avg)',
        'H₂S Content (ppm)',
        'Dew Point Readings',
        'Quality Compliance Status',
        'Out-of-Spec Incidents'
      ]
    },
    {
      id: 'performance',
      label: 'Performance Report',
      icon: FileText,
      color: 'bg-cyan-600',
      description: 'Equipment performance and operational efficiency',
      includes: [
        'Digester 1 & 2 Temperatures',
        'Digester 1 & 2 Pressures',
        'Digester 1 & 2 Gas Levels',
        'Tank Levels (Buffer & Lagoon)',
        'Water Flow Meters (All 4)',
        'Equipment Uptime',
        'Performance Trends'
      ]
    },
    {
      id: 'compliance',
      label: 'Compliance Report',
      icon: FileText,
      color: 'bg-amber-600',
      description: 'Regulatory compliance and safety metrics',
      includes: [
        'All Gas Composition Parameters',
        'Safety Threshold Breaches',
        'Environmental Parameters',
        'H₂S Limits Compliance',
        'Operating Hours Log',
        'Alarm/Alert History',
        'Regulatory Standards Met'
      ]
    },
    {
      id: 'maintenance',
      label: 'Maintenance Report',
      icon: FileText,
      color: 'bg-rose-600',
      description: 'Equipment health and maintenance requirements',
      includes: [
        'Equipment Runtime Hours',
        'Temperature Anomalies',
        'Pressure Fluctuations',
        'Flow Meter Performance',
        'Tank Level Trends',
        'Recommended Maintenance Actions',
        'Equipment Health Score'
      ]
    },
    {
      id: 'custom',
      label: 'Custom Report',
      icon: Settings,
      color: 'bg-slate-700',
      description: 'Build your own report with selected parameters',
      includes: [
        'Select any parameters',
        'Choose date range',
        'Pick export format',
        'Add custom notes',
        'Save as template'
      ]
    }
  ];

  const allParameters = {
    'Gas Flow': [
      'Raw Biogas Flow',
      'Purified Gas Flow',
      'Product Gas Flow'
    ],
    'Gas Composition': [
      'CH₄ Concentration',
      'CO₂ Levels',
      'O₂ Concentration',
      'H₂S Content',
      'Dew Point'
    ],
    'Digester 1': [
      'D1 Temperature Bottom',
      'D1 Temperature Top',
      'D1 Balloon Gas Pressure',
      'D1 Balloon Air Pressure',
      'D1 Gas Level'
    ],
    'Digester 2': [
      'D2 Temperature Bottom',
      'D2 Temperature Top',
      'D2 Balloon Gas Pressure',
      'D2 Balloon Air Pressure',
      'D2 Gas Level'
    ],
    'Tank Levels': [
      'Buffer Tank Slurry Level',
      'Lagoon Tank Water Level'
    ],
    'Water Flow': [
      'Feed FM - I',
      'Feed FM - II',
      'Fresh Water FM',
      'Recycle Water FM'
    ]
  };

  const toggleCustomParam = (param) => {
    setCustomParams(prev =>
      prev.includes(param) ? prev.filter(p => p !== param) : [...prev, param]
    );
  };

  const mockReportData = {
    production: {
      summary: {
        totalProduction: '12,450.8 Nm³',
        avgFlowRate: '342.5 Nm³/hr',
        efficiency: '92.9%',
        uptime: '23.5 hrs'
      },
      details: [
        { time: '00:00', rawBiogas: 338.2, purified: 315.1, product: 242.3 },
        { time: '04:00', rawBiogas: 342.5, purified: 318.2, product: 245.7 },
        { time: '08:00', rawBiogas: 345.8, purified: 320.5, product: 247.2 },
        { time: '12:00', rawBiogas: 340.1, purified: 316.8, product: 243.9 },
        { time: '16:00', rawBiogas: 344.3, purified: 319.4, product: 246.5 },
        { time: '20:00', rawBiogas: 341.7, purified: 317.9, product: 244.8 }
      ]
    }
  };

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Report Preview</h2>
            <p className="text-emerald-100 text-sm mt-1">
              {reportTemplates.find(r => r.id === reportType)?.label} - {dateRange}
            </p>
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* Report Header */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 mb-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/aywrj4co_LR%20Energy%20Logo.jpeg" 
                alt="LR Energy Logo" 
                className="h-12"
              />
              <div className="text-right">
                <div className="text-sm text-slate-600">Report Date</div>
                <div className="text-lg font-bold text-slate-900">Feb 01, 2026</div>
              </div>
            </div>
            <div className="border-t border-slate-300 pt-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {reportTemplates.find(r => r.id === reportType)?.label}
              </h3>
              <p className="text-slate-600">
                LR Energy Biogas Plant - SCADA Monitoring System
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.entries(mockReportData.production.summary).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">{value}</div>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-3 border-b border-slate-200">
              <h4 className="font-semibold text-slate-800">Hourly Readings</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600">Time</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600">Raw Biogas</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600">Purified Gas</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600">Product Gas</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReportData.production.details.map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-mono text-slate-700">{row.time}</td>
                      <td className="py-3 px-4 text-sm font-mono text-slate-900">{row.rawBiogas} Nm³/hr</td>
                      <td className="py-3 px-4 text-sm font-mono text-slate-900">{row.purified} Nm³/hr</td>
                      <td className="py-3 px-4 text-sm font-mono text-slate-900">{row.product} Kg/hr</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Parameters Included */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Parameters Included in Report</h4>
            <div className="grid grid-cols-2 gap-2">
              {reportTemplates.find(r => r.id === reportType)?.includes.map((param, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-blue-800">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span>{param}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center space-x-2 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>
    </div>
  );

  const CustomReportBuilder = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Custom Report Builder</h2>
            <p className="text-slate-300 text-sm mt-1">Select parameters to include in your custom report</p>
          </div>
          <button
            onClick={() => setShowCustomBuilder(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(allParameters).map(([category, params]) => (
              <div key={category} className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {params.filter(p => customParams.includes(p)).length}/{params.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {params.map((param) => (
                    <label
                      key={param}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={customParams.includes(param)}
                        onChange={() => toggleCustomParam(param)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">{param}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-900">Selected Parameters: {customParams.length}</h4>
                <p className="text-sm text-emerald-700 mt-1">
                  {customParams.length > 0 ? customParams.join(', ') : 'No parameters selected'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowCustomBuilder(false)}
            className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowCustomBuilder(false);
              setShowPreview(true);
            }}
            disabled={customParams.length === 0}
            className="px-6 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center space-x-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Custom Report</span>
          </button>
        </div>
      </div>
    </div>
  );

  const recentReports = [
    { name: 'Daily Production Report - Feb 01, 2026', date: '2026-02-01', size: '2.4 MB', format: 'PDF', status: 'Ready' },
    { name: 'Weekly Quality Report - Jan 26-Feb 01', date: '2026-02-01', size: '5.1 MB', format: 'Excel', status: 'Ready' },
    { name: 'Monthly Performance Report - January 2026', date: '2026-01-31', size: '8.7 MB', format: 'PDF', status: 'Ready' },
    { name: 'Compliance Report - Q4 2025', date: '2026-01-15', size: '12.3 MB', format: 'PDF', status: 'Ready' }
  ];

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="reports-page">
      {showPreview && <PreviewModal />}
      {showCustomBuilder && <CustomReportBuilder />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-2 flex items-center space-x-3">
          <FileText className="w-7 h-7 text-emerald-600" />
          <span>Reports Generation</span>
        </h1>
        <p className="text-slate-600">Generate comprehensive reports for analysis, compliance, and record-keeping</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Report Templates */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setReportType(template.id);
                    if (template.id === 'custom') {
                      setShowCustomBuilder(true);
                    }
                  }}
                  className={`p-5 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                    reportType === template.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  data-testid={`report-template-${template.id}`}
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${template.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{template.label}</h3>
                      <p className="text-xs text-slate-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-md p-3 border border-slate-100">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Includes:</div>
                    <ul className="space-y-1">
                      {template.includes.slice(0, 4).map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                          <Check className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {template.includes.length > 4 && (
                        <li className="text-xs text-slate-500 italic">
                          +{template.includes.length - 4} more parameters...
                        </li>
                      )}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Report Configuration</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                {['today', 'week', 'month', 'quarter', 'year', 'custom'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    data-testid={`date-range-${range}`}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                      dateRange === range
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Export Format</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'pdf', label: 'PDF', icon: FileText },
                  { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
                  { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
                  { value: 'json', label: 'JSON', icon: FileJson }
                ].map((format) => {
                  const FormatIcon = format.icon;
                  return (
                    <button
                      key={format.value}
                      onClick={() => setExportFormat(format.value)}
                      data-testid={`export-format-${format.value}`}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                        exportFormat === format.value
                          ? 'bg-violet-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <FormatIcon className="w-4 h-4" />
                      <span>{format.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                onClick={() => setShowPreview(true)}
                className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <Eye className="w-5 h-5" />
                <span>Preview Report</span>
              </button>
              <button 
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
                data-testid="generate-report-button"
              >
                <Download className="w-5 h-5" />
                <span>Generate & Download</span>
              </button>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Today's Production</span>
                <span className="font-bold font-mono text-slate-900">12,450 Nm³</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Avg CH₄ Content</span>
                <span className="font-bold font-mono text-slate-900">96.8%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">System Efficiency</span>
                <span className="font-bold font-mono text-slate-900">92.9%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Uptime</span>
                <span className="font-bold font-mono text-slate-900">99.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Reports</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Report Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Size</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Format</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={`recent-report-${index}`}>
                  <td className="py-3 px-4 text-sm text-slate-800">{report.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 font-mono">{report.date}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{report.size}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {report.format}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <Check className="w-3 h-3 mr-1" />
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setShowPreview(true)}
                        className="text-cyan-600 hover:text-cyan-700 flex items-center space-x-1 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button 
                        className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 text-sm font-medium"
                        data-testid={`download-report-${index}`}
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
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
