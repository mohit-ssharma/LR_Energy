import React from 'react';
import { X, Check, TrendingUp, TrendingDown, Minus, FileText, FileSpreadsheet, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generatePDFReport, generateCSVDownload, generateMonthlyData, calculateStats } from '../utils/pdfUtils';

// Data Quality Summary Component
function DataQualitySummary({ expectedRecords, actualRecords, gaps }) {
  const coverage = (actualRecords / expectedRecords) * 100;
  const missingRecords = expectedRecords - actualRecords;
  
  let statusColor, statusBg, statusIcon, statusText;
  if (coverage >= 95) {
    statusColor = 'text-emerald-700';
    statusBg = 'bg-emerald-50 border-emerald-200';
    statusIcon = <CheckCircle className="w-5 h-5 text-emerald-600" />;
    statusText = 'GOOD';
  } else if (coverage >= 80) {
    statusColor = 'text-amber-700';
    statusBg = 'bg-amber-50 border-amber-200';
    statusIcon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
    statusText = 'FAIR';
  } else {
    statusColor = 'text-orange-700';
    statusBg = 'bg-orange-50 border-orange-200';
    statusIcon = <AlertTriangle className="w-5 h-5 text-orange-600" />;
    statusText = 'POOR';
  }
  
  return (
    <div className={`rounded-lg p-4 border ${statusBg} mb-6`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-slate-600" />
          <h4 className="font-semibold text-slate-800">Data Quality Summary</h4>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusBg}`}>
          {statusIcon}
          <span className={`font-bold ${statusColor}`}>{statusText}</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/50 rounded-lg p-3">
          <div className="text-xs text-slate-500 uppercase mb-1">Coverage</div>
          <div className={`text-xl font-bold font-mono ${statusColor}`}>{coverage.toFixed(1)}%</div>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <div className="text-xs text-slate-500 uppercase mb-1">Expected</div>
          <div className="text-xl font-bold font-mono text-slate-800">{expectedRecords.toLocaleString()}</div>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <div className="text-xs text-slate-500 uppercase mb-1">Received</div>
          <div className="text-xl font-bold font-mono text-slate-800">{actualRecords.toLocaleString()}</div>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <div className="text-xs text-slate-500 uppercase mb-1">Missing</div>
          <div className="text-xl font-bold font-mono text-rose-600">{missingRecords.toLocaleString()}</div>
        </div>
      </div>
      {gaps && gaps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Data Gaps Detected:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {gaps.map((gap, idx) => (
              <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for table row
function TableRow({ rowData, rowIndex }) {
  return (
    <tr className={rowIndex % 2 === 0 ? "border-b border-slate-100" : "border-b border-slate-100 bg-slate-50"}>
      <td className="py-2 px-3 font-mono text-slate-700">{rowData[0]}</td>
      <td className="py-2 px-3 font-mono text-slate-700">{rowData[1]}</td>
      <td className="py-2 px-3 font-mono text-slate-700">{rowData[2]}</td>
      <td className="py-2 px-3 font-mono text-slate-700">{rowData[3]}</td>
      {rowData[4] !== undefined && <td className="py-2 px-3 font-mono text-slate-700">{rowData[4]}</td>}
    </tr>
  );
}

// Helper component for summary card
function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold font-mono text-slate-900">{value}</div>
    </div>
  );
}

// Helper component for parameter item
function ParameterItem({ text }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-blue-800">
      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function PreviewModal({ show, onClose, reportType, dateRange, reportTemplates }) {
  if (!show) return null;

  const template = reportTemplates.find(function(r) { return r.id === reportType; }) || reportTemplates[0];
  const monthlyData = generateMonthlyData(30);

  // Precompute statistics to avoid repeated calls
  const rawBiogasStats = calculateStats(monthlyData, 'rawBiogas');
  const efficiencyStats = calculateStats(monthlyData, 'efficiency');
  const ch4Stats = calculateStats(monthlyData, 'ch4');
  const co2Stats = calculateStats(monthlyData, 'co2');
  const o2Stats = calculateStats(monthlyData, 'o2');
  const h2sStats = calculateStats(monthlyData, 'h2s');
  const d1TempStats = calculateStats(monthlyData, 'd1Temp');
  const d2TempStats = calculateStats(monthlyData, 'd2Temp');
  const tankLevelStats = calculateStats(monthlyData, 'tankLevel');

  // Get summary data based on report type
  function getSummaryData() {
    const summaries = {
      production: {
        'Total Production': parseFloat(rawBiogasStats.total).toLocaleString() + ' Nm³',
        'Avg Daily Flow': rawBiogasStats.avg + ' Nm³/hr',
        'Avg Efficiency': efficiencyStats.avg + '%',
        'Operating Days': '30 days'
      },
      quality: {
        'Avg CH₄': ch4Stats.avg + '%',
        'Avg CO₂': co2Stats.avg + '%',
        'Avg O₂': o2Stats.avg + '%',
        'Avg H₂S': h2sStats.avg + ' ppm'
      },
      performance: {
        'Avg D1 Temp': d1TempStats.avg + '°C',
        'Avg D2 Temp': d2TempStats.avg + '°C',
        'Avg Tank Level': tankLevelStats.avg + '%',
        'Uptime': '99.2%'
      },
      compliance: {
        'Compliance Rate': '98.5%',
        'Threshold Breaches': '2',
        'Operating Hours': '720 hrs',
        'Total Alarms': '5'
      },
      custom: {
        'Parameters': 'Custom',
        'Date Range': '30 Days',
        'Format': 'PDF',
        'Status': 'Ready'
      }
    };
    return summaries[reportType] || summaries.production;
  }

  // Build table data
  function buildTableData() {
    const result = [];
    for (let i = 0; i < monthlyData.length; i++) {
      const d = monthlyData[i];
      if (reportType === 'quality') {
        result.push([d.date, d.ch4.toFixed(2), d.co2.toFixed(2), d.o2.toFixed(2), d.h2s.toFixed(2)]);
      } else if (reportType === 'performance') {
        result.push([d.date, d.d1Temp.toFixed(1), d.d2Temp.toFixed(1), d.tankLevel.toFixed(1), d.efficiency.toFixed(1)]);
      } else if (reportType === 'compliance') {
        result.push([d.date, d.ch4.toFixed(2), d.h2s.toFixed(2), d.h2s > 15 ? 'Warning' : 'Normal']);
      } else {
        result.push([d.date, d.rawBiogas.toFixed(2), d.purifiedGas.toFixed(2), d.productGas.toFixed(2), d.efficiency.toFixed(1) + '%']);
      }
    }
    return result;
  }

  // Get table config based on report type
  function getTableConfig() {
    if (reportType === 'quality') {
      return {
        headers: ['Date', 'CH₄ (%)', 'CO₂ (%)', 'O₂ (%)', 'H₂S (ppm)'],
        data: buildTableData()
      };
    }
    if (reportType === 'performance') {
      return {
        headers: ['Date', 'D1 Temp (°C)', 'D2 Temp (°C)', 'Tank Level (%)', 'Efficiency (%)'],
        data: buildTableData()
      };
    }
    if (reportType === 'compliance') {
      return {
        headers: ['Date', 'CH₄ (%)', 'H₂S (ppm)', 'Status'],
        data: buildTableData()
      };
    }
    return {
      headers: ['Date', 'Raw Biogas', 'Purified Gas', 'Product Gas', 'Efficiency'],
      data: buildTableData()
    };
  }

  // Get chart config based on report type
  function getChartConfig() {
    if (reportType === 'quality') return { dataKey: 'ch4', color: '#8b5cf6', label: 'CH₄ Concentration (%)' };
    if (reportType === 'performance') return { dataKey: 'd1Temp', color: '#06b6d4', label: 'Digester 1 Temperature (°C)' };
    if (reportType === 'compliance') return { dataKey: 'h2s', color: '#f59e0b', label: 'H₂S Levels (ppm)' };
    return { dataKey: 'rawBiogas', color: '#10b981', label: 'Raw Biogas Flow (Nm³/hr)' };
  }

  function getHeaderColor() {
    const colors = {
      production: 'from-emerald-600 to-teal-600',
      quality: 'from-violet-600 to-purple-600',
      performance: 'from-cyan-600 to-blue-600',
      compliance: 'from-amber-500 to-orange-500',
      custom: 'from-slate-600 to-slate-700'
    };
    return colors[reportType] || colors.production;
  }

  function getIncludes() {
    const includes = {
      production: ['Raw Biogas Flow', 'Purified Gas Flow', 'Product Gas Flow', 'Efficiency Metrics', 'Daily Totals', 'Monthly Summary'],
      quality: ['CH₄ Concentration', 'CO₂ Levels', 'O₂ Levels', 'H₂S Content', 'Daily Averages', 'Compliance Status'],
      performance: ['Digester Temperatures', 'Tank Levels', 'Equipment Status', 'Efficiency Trends', 'Uptime Stats', 'Maintenance Log'],
      compliance: ['Gas Composition', 'Safety Thresholds', 'Incident Log', 'H₂S Compliance', 'Regulatory Standards', 'Audit Trail'],
      custom: ['Selected Parameters', 'Custom Date Range', 'Export Format', 'Notes', 'Template Settings']
    };
    return includes[reportType] || includes.production;
  }

  const chartConfig = getChartConfig();
  const tableConfig = getTableConfig();
  const stats = calculateStats(monthlyData, chartConfig.dataKey);
  const summaryData = getSummaryData();
  const summaryKeys = Object.keys(summaryData);
  const includesList = getIncludes();

  // Download handlers
  function handleDownloadCSV() {
    generateCSVDownload({
      title: template.label,
      headers: tableConfig.headers,
      data: tableConfig.data
    });
  }

  async function handleDownloadPDF() {
    await generatePDFReport({
      title: template.label,
      subtitle: 'LR Energy Biogas Plant - Karnal | SCADA Monitoring System',
      period: 'January 01 - January 30, 2026',
      summaryData: summaryData,
      statistics: stats,
      tableHeaders: tableConfig.headers,
      tableData: tableConfig.data.slice(0, 15)
    });
  }

  // Build table rows
  const tableRows = [];
  for (let i = 0; i < tableConfig.data.length; i++) {
    tableRows.push(<TableRow key={i} rowData={tableConfig.data[i]} rowIndex={i} />);
  }

  // Build header cells
  const headerCells = [];
  for (let i = 0; i < tableConfig.headers.length; i++) {
    headerCells.push(
      <th key={i} className="text-left py-2 px-3 font-semibold text-slate-700">
        {tableConfig.headers[i]}
      </th>
    );
  }

  // Build summary cards
  const summaryCards = [];
  for (let i = 0; i < summaryKeys.length; i++) {
    const key = summaryKeys[i];
    summaryCards.push(<SummaryCard key={key} label={key} value={summaryData[key]} />);
  }

  // Build parameter items
  const parameterItems = [];
  for (let i = 0; i < includesList.length; i++) {
    parameterItems.push(<ParameterItem key={i} text={includesList[i]} />);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className={'bg-gradient-to-r ' + getHeaderColor() + ' text-white p-6 flex justify-between items-center'}>
          <div>
            <h2 className="text-2xl font-bold">Monthly Report Preview</h2>
            <p className="text-white/80 text-sm mt-1">{template.label} - January 2026 (30 Days)</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Report Header */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 mb-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/aywrj4co_LR%20Energy%20Logo.jpeg" 
                alt="LR Energy Logo" 
                className="h-12"
              />
              <div className="text-right">
                <div className="text-sm text-slate-600">Report Period</div>
                <div className="text-lg font-bold text-slate-900">Jan 01 - Jan 30, 2026</div>
              </div>
            </div>
            <div className="border-t border-slate-300 pt-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{template.label.toUpperCase()}</h3>
              <p className="text-slate-600">LR Energy Biogas Plant - Karnal | SCADA Monitoring System</p>
            </div>
          </div>

          {/* Data Quality Summary */}
          <DataQualitySummary 
            expectedRecords={43200} // 30 days * 24 hrs * 60 min
            actualRecords={41500}   // Simulated: ~96% coverage
            gaps={['Jan 5, 02:00 - 04:30 (150 min)', 'Jan 12, 18:00 - 18:45 (45 min)', 'Jan 22, 08:15 - 09:00 (45 min)']}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {summaryCards}
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 mb-6 shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-4">{chartConfig.label} - 30 Day Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey={chartConfig.dataKey} stroke={chartConfig.color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">Maximum</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700">{stats.max}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Minus className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Average</span>
              </div>
              <div className="text-2xl font-bold font-mono text-blue-700">{stats.avg}</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Minimum</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-700">{stats.min}</div>
            </div>
          </div>

          {/* Daily Breakdown Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm mb-6">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h4 className="font-semibold text-slate-800">Daily Breakdown (30 Days)</h4>
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>{headerCells}</tr>
                </thead>
                <tbody>{tableRows}</tbody>
              </table>
            </div>
          </div>

          {/* Parameters Included */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Parameters Included in Report</h4>
            <div className="grid grid-cols-3 gap-2">
              {parameterItems}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
          <div className="text-sm text-slate-500">Download report as CSV or PDF</div>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
              Close
            </button>
            <button onClick={handleDownloadCSV} className="px-5 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors flex items-center space-x-2 shadow-md">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
            <button onClick={handleDownloadPDF} className="px-5 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors flex items-center space-x-2 shadow-md">
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;
