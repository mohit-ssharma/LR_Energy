import React from 'react';
import { X, Download, Check, TrendingUp, TrendingDown, Minus, FileText, FileSpreadsheet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PreviewModal = ({ show, onClose, reportType, dateRange, reportTemplates }) => {
  if (!show) return null;

  const template = reportTemplates.find(r => r.id === reportType) || reportTemplates[0];
  
  // Generate 30 days of dummy data
  const generateMonthlyData = () => {
    const data = [];
    const baseDate = new Date('2026-01-01');
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        day: i + 1,
        rawBiogas: 320 + Math.random() * 50,
        purifiedGas: 300 + Math.random() * 40,
        productGas: 230 + Math.random() * 35,
        ch4: 95 + Math.random() * 3,
        co2: 2.5 + Math.random() * 1,
        o2: 0.3 + Math.random() * 0.3,
        h2s: 8 + Math.random() * 10,
        efficiency: 88 + Math.random() * 10,
        d1Temp: 36 + Math.random() * 4,
        d2Temp: 35 + Math.random() * 5,
        tankLevel: 60 + Math.random() * 30
      });
    }
    return data;
  };

  const monthlyData = generateMonthlyData();

  // Calculate statistics
  const calculateStats = (data, key) => {
    const values = data.map(d => d[key]);
    return {
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      total: values.reduce((a, b) => a + b, 0).toFixed(2)
    };
  };

  // Download as CSV
  const downloadCSV = () => {
    let headers = [];
    let csvData = [];

    switch(reportType) {
      case 'quality':
        headers = ['Date', 'CH4 (%)', 'CO2 (%)', 'O2 (%)', 'H2S (ppm)'];
        csvData = monthlyData.map(d => [d.fullDate, d.ch4.toFixed(2), d.co2.toFixed(2), d.o2.toFixed(2), d.h2s.toFixed(2)]);
        break;
      case 'performance':
        headers = ['Date', 'Digester 1 Temp (°C)', 'Digester 2 Temp (°C)', 'Tank Level (%)', 'Efficiency (%)'];
        csvData = monthlyData.map(d => [d.fullDate, d.d1Temp.toFixed(2), d.d2Temp.toFixed(2), d.tankLevel.toFixed(2), d.efficiency.toFixed(2)]);
        break;
      case 'compliance':
        headers = ['Date', 'CH4 (%)', 'H2S (ppm)', 'Status', 'Incidents'];
        csvData = monthlyData.map(d => [d.fullDate, d.ch4.toFixed(2), d.h2s.toFixed(2), d.h2s > 15 ? 'Warning' : 'Normal', d.h2s > 15 ? 1 : 0]);
        break;
      default: // production
        headers = ['Date', 'Raw Biogas (Nm³/hr)', 'Purified Gas (Nm³/hr)', 'Product Gas (Kg/hr)', 'Efficiency (%)'];
        csvData = monthlyData.map(d => [d.fullDate, d.rawBiogas.toFixed(2), d.purifiedGas.toFixed(2), d.productGas.toFixed(2), d.efficiency.toFixed(2)]);
    }

    const csvContent = [
      `LR Energy Biogas Plant - ${template.label}`,
      `Report Period: January 01-30, 2026`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `LREnergy_${reportType}_report_Jan2026.csv`;
    link.click();
  };

  // Download as JSON
  const downloadJSON = () => {
    const reportData = {
      reportInfo: {
        title: template.label,
        plant: 'LR Energy Biogas Plant - Karnal',
        period: 'January 01-30, 2026',
        generatedAt: new Date().toISOString(),
        totalDays: 30
      },
      summary: getSummaryData(),
      statistics: {
        rawBiogas: calculateStats(monthlyData, 'rawBiogas'),
        purifiedGas: calculateStats(monthlyData, 'purifiedGas'),
        productGas: calculateStats(monthlyData, 'productGas'),
        ch4: calculateStats(monthlyData, 'ch4'),
        efficiency: calculateStats(monthlyData, 'efficiency')
      },
      dailyData: monthlyData.map(d => ({
        date: d.fullDate,
        rawBiogas: parseFloat(d.rawBiogas.toFixed(2)),
        purifiedGas: parseFloat(d.purifiedGas.toFixed(2)),
        productGas: parseFloat(d.productGas.toFixed(2)),
        ch4: parseFloat(d.ch4.toFixed(2)),
        co2: parseFloat(d.co2.toFixed(2)),
        o2: parseFloat(d.o2.toFixed(2)),
        h2s: parseFloat(d.h2s.toFixed(2)),
        efficiency: parseFloat(d.efficiency.toFixed(2)),
        d1Temp: parseFloat(d.d1Temp.toFixed(2)),
        d2Temp: parseFloat(d.d2Temp.toFixed(2)),
        tankLevel: parseFloat(d.tankLevel.toFixed(2))
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `LREnergy_${reportType}_report_Jan2026.json`;
    link.click();
  };

  // Different summary data for each report type
  const getSummaryData = () => {
    const summaries = {
      production: {
        'Total Production': `${(parseFloat(calculateStats(monthlyData, 'rawBiogas').total)).toLocaleString()} Nm³`,
        'Avg Daily Flow': `${calculateStats(monthlyData, 'rawBiogas').avg} Nm³/hr`,
        'Avg Efficiency': `${calculateStats(monthlyData, 'efficiency').avg}%`,
        'Operating Days': '30 days'
      },
      quality: {
        'Avg CH₄': `${calculateStats(monthlyData, 'ch4').avg}%`,
        'Avg CO₂': `${calculateStats(monthlyData, 'co2').avg}%`,
        'Avg O₂': `${calculateStats(monthlyData, 'o2').avg}%`,
        'Avg H₂S': `${calculateStats(monthlyData, 'h2s').avg} ppm`
      },
      performance: {
        'Avg D1 Temp': `${calculateStats(monthlyData, 'd1Temp').avg}°C`,
        'Avg D2 Temp': `${calculateStats(monthlyData, 'd2Temp').avg}°C`,
        'Avg Tank Level': `${calculateStats(monthlyData, 'tankLevel').avg}%`,
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
  };

  // Get daily breakdown table data based on report type
  const getDailyBreakdown = () => {
    switch(reportType) {
      case 'quality':
        return monthlyData.map(d => ({
          date: d.date,
          ch4: d.ch4.toFixed(2) + '%',
          co2: d.co2.toFixed(2) + '%',
          o2: d.o2.toFixed(2) + '%',
          h2s: d.h2s.toFixed(1) + ' ppm'
        }));
      case 'performance':
        return monthlyData.map(d => ({
          date: d.date,
          d1Temp: d.d1Temp.toFixed(1) + '°C',
          d2Temp: d.d2Temp.toFixed(1) + '°C',
          tankLevel: d.tankLevel.toFixed(1) + '%',
          efficiency: d.efficiency.toFixed(1) + '%'
        }));
      case 'compliance':
        return monthlyData.slice(0, 10).map((d, i) => ({
          date: d.date,
          status: d.h2s > 15 ? 'Warning' : 'Normal',
          h2s: d.h2s.toFixed(1) + ' ppm',
          ch4: d.ch4.toFixed(2) + '%',
          incidents: d.h2s > 15 ? 1 : 0
        }));
      default: // production
        return monthlyData.map(d => ({
          date: d.date,
          rawBiogas: d.rawBiogas.toFixed(2),
          purifiedGas: d.purifiedGas.toFixed(2),
          productGas: d.productGas.toFixed(2),
          efficiency: d.efficiency.toFixed(1) + '%'
        }));
    }
  };

  // Get chart data based on report type
  const getChartConfig = () => {
    switch(reportType) {
      case 'quality':
        return { dataKey: 'ch4', color: '#8b5cf6', label: 'CH₄ Concentration (%)' };
      case 'performance':
        return { dataKey: 'd1Temp', color: '#06b6d4', label: 'Digester 1 Temperature (°C)' };
      case 'compliance':
        return { dataKey: 'h2s', color: '#f59e0b', label: 'H₂S Levels (ppm)' };
      default:
        return { dataKey: 'rawBiogas', color: '#10b981', label: 'Raw Biogas Flow (Nm³/hr)' };
    }
  };

  const chartConfig = getChartConfig();

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

  // Parameters included
  const getIncludes = () => {
    const includes = {
      production: ['Raw Biogas Flow', 'Purified Gas Flow', 'Product Gas Flow', 'Efficiency Metrics', 'Daily Totals', 'Monthly Summary'],
      quality: ['CH₄ Concentration', 'CO₂ Levels', 'O₂ Levels', 'H₂S Content', 'Daily Averages', 'Compliance Status'],
      performance: ['Digester Temperatures', 'Tank Levels', 'Equipment Status', 'Efficiency Trends', 'Uptime Stats', 'Maintenance Log'],
      compliance: ['Gas Composition', 'Safety Thresholds', 'Incident Log', 'H₂S Compliance', 'Regulatory Standards', 'Audit Trail'],
      custom: ['Selected Parameters', 'Custom Date Range', 'Export Format', 'Notes', 'Template Settings']
    };
    return includes[reportType] || includes.production;
  };

  const dailyData = getDailyBreakdown();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className={`bg-gradient-to-r ${getHeaderColor()} text-white p-6 flex justify-between items-center`}>
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

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.entries(getSummaryData()).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{key}</div>
                <div className="text-2xl font-bold font-mono text-slate-900">{value}</div>
              </div>
            ))}
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 mb-6 shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-4">{chartConfig.label} - 30 Day Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
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
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {calculateStats(monthlyData, chartConfig.dataKey).max}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Minus className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Average</span>
              </div>
              <div className="text-2xl font-bold font-mono text-blue-700">
                {calculateStats(monthlyData, chartConfig.dataKey).avg}
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Minimum</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-700">
                {calculateStats(monthlyData, chartConfig.dataKey).min}
              </div>
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
                  <tr>
                    {Object.keys(dailyData[0] || {}).map((key) => (
                      <th key={key} className="text-left py-2 px-3 font-semibold text-slate-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dailyData.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="py-2 px-3 font-mono text-slate-700">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Parameters Included */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Parameters Included in Report</h4>
            <div className="grid grid-cols-3 gap-2">
              {getIncludes().map((param, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-blue-800">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{param}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
          <div className="text-sm text-slate-500">
            Report generated with dummy data for demonstration
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={onClose} 
              className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={downloadCSV}
              className="px-5 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors flex items-center space-x-2 shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
            <button 
              onClick={downloadJSON}
              className="px-5 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors flex items-center space-x-2 shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
