import React, { useState } from 'react';
import { FileText, Download, Calendar, FileSpreadsheet, Eye, Check, Settings, ChevronDown, FileCode, Loader2 } from 'lucide-react';
import PreviewModal from './PreviewModal';
import CustomBuilderModal from './CustomBuilderModal';
import { generatePDFReport, generateCSVDownload } from '../utils/pdfUtils';
import { getReportData } from '../services/api';

// Helper component for report template card
function ReportTemplateCard({ template, isSelected, onClick, includes }) {
  const Icon = template.icon;
  const displayIncludes = includes.slice(0, 4);
  const remainingCount = includes.length - 4;
  
  return (
    <button
      onClick={onClick}
      className={'p-5 rounded-lg border-2 transition-all text-left hover:shadow-md ' + 
        (isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300')}
      data-testid={'report-template-' + template.id}
    >
      <div className="flex items-start space-x-3 mb-3">
        <div className={'p-2 rounded-lg ' + template.color}>
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
          {displayIncludes.map(function(item, idx) {
            return (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                <Check className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            );
          })}
          {remainingCount > 0 && (
            <li className="text-xs text-slate-500 italic">+{remainingCount} more...</li>
          )}
        </ul>
      </div>
    </button>
  );
}

// Helper component for format button
function FormatButton({ format, isSelected, onClick }) {
  const icons = {
    pdf: FileText,
    excel: FileSpreadsheet,
    csv: FileSpreadsheet,
    json: FileCode
  };
  const FormatIcon = icons[format.value] || FileText;
  
  return (
    <button
      onClick={onClick}
      data-testid={'export-format-' + format.value}
      className={'px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ' +
        (isSelected ? 'bg-violet-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
    >
      <FormatIcon className="w-4 h-4" />
      <span>{format.label}</span>
    </button>
  );
}

// Helper component for recent report row
function RecentReportRow({ report, index, onView, onDownloadCSV, onDownloadPDF, showMenu, onToggleMenu }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={'recent-report-' + index}>
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
        <div className="flex items-center space-x-2 relative">
          <button 
            onClick={onView}
            className="text-cyan-600 hover:text-cyan-700 flex items-center space-x-1 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          <div className="relative">
            <button 
              onClick={onToggleMenu}
              className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 text-sm font-medium"
              data-testid={'download-report-' + index}
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                <button 
                  onClick={onDownloadCSV}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 text-sm text-slate-700"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
                  <span>CSV</span>
                </button>
                <button 
                  onClick={onDownloadPDF}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 text-sm text-slate-700 border-t border-slate-100"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function ReportsPage() {
  const [reportType, setReportType] = useState('production');
  const [dateRange, setDateRange] = useState('today');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDownloadMenu, setShowDownloadMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get date range
  function getDateRange() {
    const today = new Date();
    let startDate, endDate;
    
    switch (dateRange) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        endDate = startDate;
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'custom':
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default:
        startDate = today.toISOString().split('T')[0];
        endDate = startDate;
    }
    
    return { startDate, endDate };
  }

  // Fetch real data from API
  async function fetchReportData() {
    const { startDate, endDate } = getDateRange();
    
    if (!startDate || !endDate) {
      setError('Please select a valid date range');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getReportData(startDate, endDate, reportType);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        setError('Failed to fetch report data: ' + (result.error || 'Unknown error'));
        return null;
      }
    } catch (err) {
      setError('Error fetching report data: ' + err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  // Download CSV function - NOW USES REAL DATA
  async function downloadCSV(reportName) {
    const name = reportName || 'Report';
    const apiData = await fetchReportData();
    
    if (!apiData || !apiData.daily_data || apiData.daily_data.length === 0) {
      alert('No data available for the selected date range');
      setShowDownloadMenu(null);
      return;
    }
    
    const rows = [];
    for (let i = 0; i < apiData.daily_data.length; i++) {
      const d = apiData.daily_data[i];
      const efficiency = d.avg_raw_biogas_flow > 0 
        ? ((d.avg_purified_gas_flow / d.avg_raw_biogas_flow) * 100).toFixed(2) 
        : '0.00';
      rows.push([
        d.date, 
        (d.avg_raw_biogas_flow || 0).toFixed(2), 
        (d.avg_purified_gas_flow || 0).toFixed(2), 
        (d.avg_product_gas_flow || 0).toFixed(2), 
        (d.avg_ch4 || 0).toFixed(2), 
        efficiency
      ]);
    }
    
    generateCSVDownload({
      title: name,
      headers: ['Date', 'Raw Biogas (Nm³/hr)', 'Purified Gas (Nm³/hr)', 'Product Gas (Nm³/hr)', 'CH₄ (%)', 'Efficiency (%)'],
      data: rows
    });
    setShowDownloadMenu(null);
  }

  // Download PDF function - NOW USES REAL DATA
  async function downloadPDF(reportName) {
    const name = reportName || 'Report';
    const apiData = await fetchReportData();
    
    if (!apiData || !apiData.daily_data || apiData.daily_data.length === 0) {
      alert('No data available for the selected date range');
      setShowDownloadMenu(null);
      return;
    }
    
    const data = apiData.daily_data;
    const { startDate, endDate } = getDateRange();
    
    let sumRawBiogas = 0;
    let sumEfficiency = 0;
    let minRawBiogas = data[0].avg_raw_biogas_flow || 0;
    let maxRawBiogas = data[0].avg_raw_biogas_flow || 0;
    
    for (let i = 0; i < data.length; i++) {
      const flow = data[i].avg_raw_biogas_flow || 0;
      const purified = data[i].avg_purified_gas_flow || 0;
      sumRawBiogas += flow;
      const eff = flow > 0 ? (purified / flow) * 100 : 0;
      sumEfficiency += eff;
      if (flow < minRawBiogas) minRawBiogas = flow;
      if (flow > maxRawBiogas) maxRawBiogas = flow;
    }
    
    const avgRawBiogas = data.length > 0 ? (sumRawBiogas / data.length).toFixed(2) : '0.00';
    const avgEfficiency = data.length > 0 ? (sumEfficiency / data.length).toFixed(2) : '0.00';
    
    // Use summary data from API if available
    const totalProduction = apiData.summary?.total_raw_biogas || sumRawBiogas;
    
    const tableData = [];
    const sliceEnd = Math.min(15, data.length);
    for (let i = 0; i < sliceEnd; i++) {
      const d = data[i];
      const flow = d.avg_raw_biogas_flow || 0;
      const purified = d.avg_purified_gas_flow || 0;
      const eff = flow > 0 ? ((purified / flow) * 100).toFixed(1) : '0.0';
      tableData.push([
        d.date, 
        (d.avg_raw_biogas_flow || 0).toFixed(2), 
        (d.avg_purified_gas_flow || 0).toFixed(2), 
        (d.avg_product_gas_flow || 0).toFixed(2), 
        eff + '%'
      ]);
    }
    
    // Format period string
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };
    const periodStr = formatDate(startDate) + ' - ' + formatDate(endDate);
    
    await generatePDFReport({
      title: name,
      subtitle: 'LR Energy Biogas Plant - Karnal | SCADA Monitoring System',
      period: periodStr,
      summaryData: {
        'Total Production': totalProduction.toFixed(0) + ' Nm³',
        'Avg Daily Flow': avgRawBiogas + ' Nm³/hr',
        'Avg Efficiency': avgEfficiency + '%',
        'Operating Days': data.length + ' days'
      },
      statistics: {
        max: maxRawBiogas.toFixed(2),
        avg: avgRawBiogas,
        min: minRawBiogas.toFixed(2)
      },
      tableHeaders: ['Date', 'Raw Biogas', 'Purified Gas', 'Product Gas', 'Efficiency'],
      tableData: tableData
    });
    setShowDownloadMenu(null);
  }

  const reportTemplates = [
    {
      id: 'production',
      label: 'Production Report',
      icon: FileText,
      color: 'bg-emerald-600',
      description: 'Complete biogas production metrics and performance'
    },
    {
      id: 'quality',
      label: 'Quality Report',
      icon: FileText,
      color: 'bg-violet-700',
      description: 'Gas quality parameters and composition analysis'
    },
    {
      id: 'performance',
      label: 'Performance Report',
      icon: FileText,
      color: 'bg-cyan-600',
      description: 'Equipment performance and operational efficiency'
    },
    {
      id: 'compliance',
      label: 'Compliance Report',
      icon: FileText,
      color: 'bg-amber-600',
      description: 'Regulatory compliance and safety metrics'
    },
    {
      id: 'custom',
      label: 'Custom Report',
      icon: Settings,
      color: 'bg-slate-700',
      description: 'Build your own report with selected parameters'
    }
  ];

  function getReportIncludes(id) {
    const includes = {
      production: ['Raw Biogas Flow', 'Purified Gas Flow', 'Product Gas Flow', 'CH₄ Average', 'Efficiency', 'Production Summary'],
      quality: ['CH₄ Min/Max/Avg', 'CO₂ Levels', 'O₂ Min/Max/Avg', 'H₂S Content', 'Dew Point', 'Compliance Status'],
      performance: ['Digester Temps', 'Pressures', 'Gas Levels', 'Tank Levels', 'Flow Meters', 'Uptime', 'Trends'],
      compliance: ['Gas Composition', 'Threshold Breaches', 'H₂S Compliance', 'Operating Hours', 'Alarm History'],
      custom: ['Select Parameters', 'Choose Date Range', 'Pick Format', 'Add Notes', 'Save Template']
    };
    return includes[id] || [];
  }

  const recentReports = [
    { name: 'Daily Production Report - Feb 01, 2026', date: '2026-02-01', size: '2.4 MB', format: 'PDF', status: 'Ready' },
    { name: 'Weekly Quality Report - Jan 26-Feb 01', date: '2026-02-01', size: '5.1 MB', format: 'Excel', status: 'Ready' },
    { name: 'Monthly Performance Report - January 2026', date: '2026-01-31', size: '8.7 MB', format: 'PDF', status: 'Ready' }
  ];

  const dateRanges = ['today', 'week', 'month', 'quarter', 'year', 'custom'];
  const exportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' }
  ];

  // Get current report template label
  function getCurrentReportLabel() {
    for (let i = 0; i < reportTemplates.length; i++) {
      if (reportTemplates[i].id === reportType) {
        return reportTemplates[i].label;
      }
    }
    return 'Report';
  }

  // Build template cards
  const templateCards = [];
  for (let i = 0; i < reportTemplates.length; i++) {
    const template = reportTemplates[i];
    templateCards.push(
      <ReportTemplateCard
        key={template.id}
        template={template}
        isSelected={reportType === template.id}
        includes={getReportIncludes(template.id)}
        onClick={function() {
          setReportType(template.id);
          if (template.id === 'custom') {
            setShowCustomBuilder(true);
          }
        }}
      />
    );
  }

  // Build date range buttons
  const dateRangeButtons = [];
  for (let i = 0; i < dateRanges.length; i++) {
    const range = dateRanges[i];
    dateRangeButtons.push(
      <button
        key={range}
        onClick={function() { setDateRange(range); }}
        data-testid={'date-range-' + range}
        className={'px-3 py-2 rounded-md text-sm font-medium transition-all capitalize ' +
          (dateRange === range ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
      >
        {range}
      </button>
    );
  }

  // Build format buttons
  const formatButtons = [];
  for (let i = 0; i < exportFormats.length; i++) {
    const format = exportFormats[i];
    formatButtons.push(
      <FormatButton
        key={format.value}
        format={format}
        isSelected={exportFormat === format.value}
        onClick={function() { setExportFormat(format.value); }}
      />
    );
  }

  // Build recent report rows
  const recentReportRows = [];
  for (let i = 0; i < recentReports.length; i++) {
    const report = recentReports[i];
    const idx = i;
    recentReportRows.push(
      <RecentReportRow
        key={idx}
        report={report}
        index={idx}
        showMenu={showDownloadMenu === 'recent-' + idx}
        onView={function() { setShowPreview(true); }}
        onToggleMenu={function() { setShowDownloadMenu(showDownloadMenu === 'recent-' + idx ? null : 'recent-' + idx); }}
        onDownloadCSV={function() { downloadCSV(report.name); }}
        onDownloadPDF={function() { downloadPDF(report.name); }}
      />
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="reports-page">
      <PreviewModal 
        show={showPreview} 
        onClose={function() { setShowPreview(false); }} 
        reportType={reportType} 
        dateRange={dateRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        reportTemplates={reportTemplates} 
      />
      <CustomBuilderModal 
        show={showCustomBuilder} 
        onClose={function() { setShowCustomBuilder(false); }} 
        onPreview={function() { setShowPreview(true); }} 
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-2 flex items-center space-x-3">
          <FileText className="w-7 h-7 text-emerald-600" />
          <span>Reports Generation</span>
        </h1>
        <p className="text-slate-600">Generate comprehensive reports for analysis, compliance, and record-keeping</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateCards}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Report Configuration</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                {dateRangeButtons}
              </div>
              
              {dateRange === 'custom' && (
                <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-700">Custom Date Selection</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={function(e) { setCustomStartDate(e.target.value); }}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        data-testid="custom-start-date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={function(e) { setCustomEndDate(e.target.value); }}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        data-testid="custom-end-date"
                      />
                    </div>
                    {customStartDate && customEndDate && (
                      <div className="bg-white rounded-md p-2 border border-emerald-200">
                        <div className="text-xs text-slate-600">Selected Range:</div>
                        <div className="text-sm font-semibold text-emerald-700">
                          {new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                          {' → '}
                          {new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Export Format</label>
              <div className="grid grid-cols-2 gap-2">
                {formatButtons}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-2">
                  {error}
                </div>
              )}
              <button
                onClick={function() { setShowPreview(true); }}
                className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <Eye className="w-5 h-5" />
                <span>Preview Report</span>
              </button>
              <div className="relative">
                <button 
                  onClick={function() { setShowDownloadMenu(showDownloadMenu === 'generate' ? null : 'generate'); }}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
                  data-testid="generate-report-button"
                >
                  <Download className="w-5 h-5" />
                  <span>Generate & Download</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showDownloadMenu === 'generate' && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    <button 
                      onClick={function() { downloadCSV(getCurrentReportLabel()); }}
                      disabled={isLoading}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center space-x-2 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-cyan-600" />}
                      <span>{isLoading ? 'Fetching data...' : 'Download as CSV'}</span>
                    </button>
                    <button 
                      onClick={function() { downloadPDF(getCurrentReportLabel()); }}
                      disabled={isLoading}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center space-x-2 text-slate-700 border-t border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 text-rose-600 animate-spin" /> : <FileText className="w-4 h-4 text-rose-600" />}
                      <span>{isLoading ? 'Fetching data...' : 'Download as PDF'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
              {recentReportRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
