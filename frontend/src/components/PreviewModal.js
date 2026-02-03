import React from 'react';
import { X, Download, Check } from 'lucide-react';

const PreviewModal = ({ show, onClose, reportType, dateRange, reportTemplates }) => {
  if (!show) return null;

  const template = reportTemplates.find(r => r.id === reportType) || reportTemplates[0];
  
  // Different summary data for each report type
  const getSummaryData = () => {
    const summaries = {
      production: {
        'Total Production': '12,450.8 Nm³',
        'Avg Flow Rate': '342.5 Nm³/hr',
        'Efficiency': '92.9%',
        'Uptime': '23.5 hrs'
      },
      quality: {
        'Avg CH₄': '96.8%',
        'Avg CO₂': '2.85%',
        'Avg O₂': '0.42%',
        'H₂S Level': '12.5 ppm'
      },
      performance: {
        'Digester 1 Temp': '38.5°C',
        'Digester 2 Temp': '37.8°C',
        'Tank Utilization': '78.5%',
        'Flow Efficiency': '94.2%'
      },
      compliance: {
        'Compliance Rate': '99.2%',
        'Threshold Breaches': '0',
        'Operating Hours': '720 hrs',
        'Alarms': '3'
      },
      custom: {
        'Parameters': 'Custom',
        'Date Range': 'Custom',
        'Format': 'Custom',
        'Status': 'Pending'
      }
    };
    return summaries[reportType] || summaries.production;
  };

  // Different parameters for each report type
  const getIncludes = () => {
    const includes = {
      production: ['Raw Biogas Flow', 'Purified Gas Flow', 'Product Gas Flow', 'CH₄ Average', 'Efficiency Metrics', 'Production Summary'],
      quality: ['CH₄ Min/Max/Avg', 'CO₂ Levels', 'O₂ Min/Max/Avg', 'H₂S Content', 'Dew Point', 'Compliance Status'],
      performance: ['Digester 1 & 2 Temps', 'Gas Pressures', 'Gas Levels', 'Tank Levels', 'Water Flow Meters', 'Equipment Uptime'],
      compliance: ['Gas Composition', 'Safety Thresholds', 'Environmental Parameters', 'H₂S Compliance', 'Operating Hours', 'Alarm History'],
      custom: ['Selected Parameters', 'Custom Date Range', 'Export Format', 'Notes', 'Template Settings']
    };
    return includes[reportType] || includes.production;
  };

  // Get header color based on report type
  const getHeaderColor = () => {
    const colors = {
      production: 'from-emerald-600 to-teal-600',
      quality: 'from-violet-600 to-purple-600',
      performance: 'from-cyan-600 to-blue-600',
      compliance: 'from-amber-500 to-orange-500',
      custom: 'from-slate-600 to-slate-700'
    };
    return colors[reportType] || colors.production;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
        <div className={`bg-gradient-to-r ${getHeaderColor()} text-white p-6 flex justify-between items-center`}>
          <div>
            <h2 className="text-2xl font-bold">Report Preview</h2>
            <p className="text-white/80 text-sm mt-1">{template.label} - {dateRange}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
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
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{template.label.toUpperCase()}</h3>
              <p className="text-slate-600">LR Energy Biogas Plant - SCADA Monitoring System</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.entries(getSummaryData()).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  {key}
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">{value}</div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Parameters Included in Report</h4>
            <div className="grid grid-cols-2 gap-2">
              {getIncludes().map((param, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-blue-800">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{param}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end space-x-3">
          <button 
            onClick={onClose} 
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
};

export default PreviewModal;
