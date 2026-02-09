import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, BarChart3, Calendar, Download, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Comparison Card Component
const ComparisonCard = ({ title, unit, todayValue, yesterdayValue, goodDirection, icon: Icon, color }) => {
  const change = todayValue - yesterdayValue;
  const changePercent = yesterdayValue !== 0 ? ((change / yesterdayValue) * 100) : 0;
  
  // Determine if this is an improvement
  let status, statusColor, statusBg, statusIcon;
  
  if (goodDirection === 'higher') {
    // Higher is better (gas flows, CH4, efficiency)
    if (changePercent > 2) {
      status = 'Improved';
      statusColor = 'text-emerald-700';
      statusBg = 'bg-emerald-50 border-emerald-200';
      statusIcon = <TrendingUp className="w-4 h-4" />;
    } else if (changePercent < -2) {
      status = 'Declined';
      statusColor = 'text-rose-700';
      statusBg = 'bg-rose-50 border-rose-200';
      statusIcon = <TrendingDown className="w-4 h-4" />;
    } else {
      status = 'Stable';
      statusColor = 'text-blue-700';
      statusBg = 'bg-blue-50 border-blue-200';
      statusIcon = <Minus className="w-4 h-4" />;
    }
  } else if (goodDirection === 'lower') {
    // Lower is better (CO2, H2S, O2)
    if (changePercent < -2) {
      status = 'Improved';
      statusColor = 'text-emerald-700';
      statusBg = 'bg-emerald-50 border-emerald-200';
      statusIcon = <TrendingDown className="w-4 h-4" />;
    } else if (changePercent > 2) {
      status = 'Declined';
      statusColor = 'text-rose-700';
      statusBg = 'bg-rose-50 border-rose-200';
      statusIcon = <TrendingUp className="w-4 h-4" />;
    } else {
      status = 'Stable';
      statusColor = 'text-blue-700';
      statusBg = 'bg-blue-50 border-blue-200';
      statusIcon = <Minus className="w-4 h-4" />;
    }
  } else {
    // Stable is better (tank levels, temperature)
    if (Math.abs(changePercent) <= 5) {
      status = 'Stable';
      statusColor = 'text-blue-700';
      statusBg = 'bg-blue-50 border-blue-200';
      statusIcon = <Minus className="w-4 h-4" />;
    } else {
      status = 'Changed';
      statusColor = 'text-amber-700';
      statusBg = 'bg-amber-50 border-amber-200';
      statusIcon = changePercent > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    }
  }

  const changeArrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
  const changeSign = change > 0 ? '+' : '';

  return (
    <div className={`bg-white rounded-lg border ${statusBg} p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-md ${color}`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">{title}</span>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusBg} ${statusColor}`}>
          {statusIcon}
          <span className="text-xs font-semibold">{status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-xs text-slate-500 mb-1">Today</div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {typeof todayValue === 'number' ? todayValue.toLocaleString() : todayValue}
            <span className="text-xs text-slate-500 ml-1">{unit}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Yesterday</div>
          <div className="text-lg font-semibold font-mono text-slate-600">
            {typeof yesterdayValue === 'number' ? yesterdayValue.toLocaleString() : yesterdayValue}
            <span className="text-xs text-slate-500 ml-1">{unit}</span>
          </div>
        </div>
      </div>

      <div className={`flex items-center justify-center space-x-2 py-2 rounded-md ${statusBg}`}>
        <span className={`text-lg font-bold ${statusColor}`}>{changeArrow}</span>
        <span className={`text-sm font-bold font-mono ${statusColor}`}>
          {changeSign}{change.toFixed(1)} ({changeSign}{changePercent.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

// Overlay Chart Component
const ComparisonChart = ({ title, todayData, yesterdayData, dataKey, color }) => {
  // Merge data for overlay chart
  const chartData = todayData.map((item, index) => ({
    time: item.time,
    today: item[dataKey],
    yesterday: yesterdayData[index] ? yesterdayData[index][dataKey] : null
  }));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '10px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '11px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="today" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            name="Today"
          />
          <Line 
            type="monotone" 
            dataKey="yesterday" 
            stroke="#94a3b8" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
            name="Yesterday"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center space-x-4 mt-2">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-0.5" style={{ backgroundColor: color }}></div>
          <span className="text-xs text-slate-600">Today</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-slate-400"></div>
          <span className="text-xs text-slate-600">Yesterday</span>
        </div>
      </div>
    </div>
  );
};

// Main Comparison View Component
const ComparisonView = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [comparisonPeriod, setComparisonPeriod] = useState('today-yesterday');
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Generate mock hourly data for charts
  const generateHourlyData = (baseValue, variance) => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      value: baseValue + (Math.random() * variance * 2 - variance)
    }));
  };

  // Today's data (mocked)
  const todayData = {
    rawBiogas: { current: 1250, totalizer: 30000 },
    purifiedGas: { current: 1180, totalizer: 28320 },
    productGas: { current: 1150, totalizer: 27600 },
    ch4: 96.8,
    co2: 2.9,
    o2: 0.3,
    h2s: 180,
    bufferTank: 82,
    lagoonTank: 76,
    psaEfficiency: 94.4,
    ltPanelPower: 245,
    d1Temp: 37,
    d2Temp: 36.5
  };

  // Yesterday's data (mocked - slightly different)
  const yesterdayData = {
    rawBiogas: { current: 1180, totalizer: 28320 },
    purifiedGas: { current: 1120, totalizer: 26880 },
    productGas: { current: 1090, totalizer: 26160 },
    ch4: 96.2,
    co2: 3.1,
    o2: 0.3,
    h2s: 195,
    bufferTank: 78,
    lagoonTank: 74,
    psaEfficiency: 93.8,
    ltPanelPower: 242,
    d1Temp: 36.8,
    d2Temp: 36.3
  };

  // Chart data
  const todayChartData = generateHourlyData(1250, 50).map((d, i) => ({
    time: d.time,
    rawBiogas: 1250 + (Math.random() * 100 - 50),
    ch4: 96.8 + (Math.random() * 0.5 - 0.25)
  }));

  const yesterdayChartData = generateHourlyData(1180, 50).map((d, i) => ({
    time: d.time,
    rawBiogas: 1180 + (Math.random() * 100 - 50),
    ch4: 96.2 + (Math.random() * 0.5 - 0.25)
  }));

  // Calculate overall performance summary
  const calculateSummary = () => {
    const comparisons = [
      { today: todayData.rawBiogas.current, yesterday: yesterdayData.rawBiogas.current, goodDirection: 'higher' },
      { today: todayData.purifiedGas.current, yesterday: yesterdayData.purifiedGas.current, goodDirection: 'higher' },
      { today: todayData.productGas.current, yesterday: yesterdayData.productGas.current, goodDirection: 'higher' },
      { today: todayData.ch4, yesterday: yesterdayData.ch4, goodDirection: 'higher' },
      { today: todayData.co2, yesterday: yesterdayData.co2, goodDirection: 'lower' },
      { today: todayData.h2s, yesterday: yesterdayData.h2s, goodDirection: 'lower' },
      { today: todayData.psaEfficiency, yesterday: yesterdayData.psaEfficiency, goodDirection: 'higher' },
      { today: todayData.bufferTank, yesterday: yesterdayData.bufferTank, goodDirection: 'stable' },
      { today: todayData.lagoonTank, yesterday: yesterdayData.lagoonTank, goodDirection: 'stable' }
    ];

    let improved = 0, stable = 0, warning = 0, declined = 0;

    comparisons.forEach(c => {
      const changePercent = c.yesterday !== 0 ? (((c.today - c.yesterday) / c.yesterday) * 100) : 0;
      
      if (c.goodDirection === 'higher') {
        if (changePercent > 2) improved++;
        else if (changePercent < -2) declined++;
        else stable++;
      } else if (c.goodDirection === 'lower') {
        if (changePercent < -2) improved++;
        else if (changePercent > 2) declined++;
        else stable++;
      } else {
        if (Math.abs(changePercent) <= 5) stable++;
        else warning++;
      }
    });

    return { improved, stable, warning, declined };
  };

  const summary = calculateSummary();

  // Get period label
  const getPeriodLabel = () => {
    switch (comparisonPeriod) {
      case 'today-yesterday': return 'Today vs Yesterday';
      case 'this-week-last-week': return 'This Week vs Last Week';
      case 'this-month-last-month': return 'This Month vs Last Month';
      default: return 'Today vs Yesterday';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6" data-testid="comparison-view">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6" />
          <div>
            <h2 className="text-lg font-bold">Performance Comparison</h2>
            <p className="text-indigo-200 text-sm">{getPeriodLabel()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Summary badges */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {summary.improved} Improved
            </span>
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {summary.stable} Stable
            </span>
            {summary.warning > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {summary.warning} Warning
              </span>
            )}
            {summary.declined > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {summary.declined} Declined
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select
                value={comparisonPeriod}
                onChange={(e) => setComparisonPeriod(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today-yesterday">Today vs Yesterday</option>
                <option value="this-week-last-week">This Week vs Last Week</option>
                <option value="this-month-last-month">This Month vs Last Month</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDetailModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Full Comparison</span>
              </button>
              <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-700">{summary.improved}</div>
              <div className="text-xs font-medium text-emerald-600">Improved</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{summary.stable}</div>
              <div className="text-xs font-medium text-blue-600">Stable</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-700">{summary.warning}</div>
              <div className="text-xs font-medium text-amber-600">Warning</div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-rose-700">{summary.declined}</div>
              <div className="text-xs font-medium text-rose-600">Declined</div>
            </div>
          </div>

          {/* Gas Production Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Gas Production</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ComparisonCard
                title="Raw Biogas Flow"
                unit="Nm³/hr"
                todayValue={todayData.rawBiogas.current}
                yesterdayValue={yesterdayData.rawBiogas.current}
                goodDirection="higher"
                icon={TrendingUp}
                color="bg-emerald-600"
              />
              <ComparisonCard
                title="Purified Gas Flow"
                unit="Nm³/hr"
                todayValue={todayData.purifiedGas.current}
                yesterdayValue={yesterdayData.purifiedGas.current}
                goodDirection="higher"
                icon={TrendingUp}
                color="bg-violet-600"
              />
              <ComparisonCard
                title="Product Gas Flow"
                unit="Nm³/hr"
                todayValue={todayData.productGas.current}
                yesterdayValue={yesterdayData.productGas.current}
                goodDirection="higher"
                icon={TrendingUp}
                color="bg-cyan-600"
              />
            </div>
          </div>

          {/* Gas Composition Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Gas Composition</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ComparisonCard
                title="CH₄"
                unit="%"
                todayValue={todayData.ch4}
                yesterdayValue={yesterdayData.ch4}
                goodDirection="higher"
                icon={TrendingUp}
                color="bg-amber-600"
              />
              <ComparisonCard
                title="CO₂"
                unit="%"
                todayValue={todayData.co2}
                yesterdayValue={yesterdayData.co2}
                goodDirection="lower"
                icon={TrendingDown}
                color="bg-slate-600"
              />
              <ComparisonCard
                title="O₂"
                unit="%"
                todayValue={todayData.o2}
                yesterdayValue={yesterdayData.o2}
                goodDirection="lower"
                icon={TrendingDown}
                color="bg-blue-600"
              />
              <ComparisonCard
                title="H₂S"
                unit="ppm"
                todayValue={todayData.h2s}
                yesterdayValue={yesterdayData.h2s}
                goodDirection="lower"
                icon={TrendingDown}
                color="bg-rose-600"
              />
            </div>
          </div>

          {/* Equipment & Storage Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>Equipment & Storage</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ComparisonCard
                title="Buffer Tank"
                unit="%"
                todayValue={todayData.bufferTank}
                yesterdayValue={yesterdayData.bufferTank}
                goodDirection="stable"
                icon={TrendingUp}
                color="bg-cyan-600"
              />
              <ComparisonCard
                title="Lagoon Tank"
                unit="%"
                todayValue={todayData.lagoonTank}
                yesterdayValue={yesterdayData.lagoonTank}
                goodDirection="stable"
                icon={TrendingUp}
                color="bg-teal-600"
              />
              <ComparisonCard
                title="PSA Efficiency"
                unit="%"
                todayValue={todayData.psaEfficiency}
                yesterdayValue={yesterdayData.psaEfficiency}
                goodDirection="higher"
                icon={TrendingUp}
                color="bg-indigo-600"
              />
              <ComparisonCard
                title="LT Panel Power"
                unit="kW"
                todayValue={todayData.ltPanelPower}
                yesterdayValue={yesterdayData.ltPanelPower}
                goodDirection="stable"
                icon={TrendingUp}
                color="bg-purple-600"
              />
            </div>
          </div>

          {/* Trend Charts */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Trend Comparison</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ComparisonChart
                title="Raw Biogas Flow (Nm³/hr)"
                todayData={todayChartData}
                yesterdayData={yesterdayChartData}
                dataKey="rawBiogas"
                color="#10b981"
              />
              <ComparisonChart
                title="CH₄ Concentration (%)"
                todayData={todayChartData}
                yesterdayData={yesterdayChartData}
                dataKey="ch4"
                color="#f59e0b"
              />
            </div>
          </div>

          {/* Insights Section */}
          <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-4">
            <h3 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center space-x-2">
              <span>💡</span>
              <span>Key Insights</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-emerald-700 mb-2">🟢 IMPROVEMENTS</h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Gas production increased by 5.9% compared to yesterday</li>
                  <li>• H₂S levels decreased by 7.7% - better gas quality</li>
                  <li>• PSA efficiency improved by 0.6%</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-amber-700 mb-2">🟡 ATTENTION NEEDED</h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Buffer Tank level increased by 5.1% - monitor closely</li>
                  <li>• Lagoon Tank level trending upward (+2.7%)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold">Full Performance Comparison - {getPeriodLabel()}</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Full comparison table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left p-3 font-semibold text-slate-700">Parameter</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Today</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Yesterday</th>
                      <th className="text-right p-3 font-semibold text-slate-700">Change</th>
                      <th className="text-center p-3 font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">Raw Biogas Flow</td>
                      <td className="p-3 text-right font-mono">{todayData.rawBiogas.current} Nm³/hr</td>
                      <td className="p-3 text-right font-mono text-slate-500">{yesterdayData.rawBiogas.current} Nm³/hr</td>
                      <td className="p-3 text-right font-mono text-emerald-600">↑ +5.9%</td>
                      <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">Improved</span></td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">Purified Gas Flow</td>
                      <td className="p-3 text-right font-mono">{todayData.purifiedGas.current} Nm³/hr</td>
                      <td className="p-3 text-right font-mono text-slate-500">{yesterdayData.purifiedGas.current} Nm³/hr</td>
                      <td className="p-3 text-right font-mono text-emerald-600">↑ +5.4%</td>
                      <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">Improved</span></td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">Product Gas Flow</td>
                      <td className="p-3 text-right font-mono">{todayData.productGas.current} Nm³/hr</td>
                      <td className="p-3 text-right font-mono text-slate-500">{yesterdayData.productGas.current} Nm³/hr</td>
                      <td className="p-3 text-right font-mono text-emerald-600">↑ +5.5%</td>
                      <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">Improved</span></td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">CH₄ Concentration</td>
                      <td className="p-3 text-right font-mono">{todayData.ch4}%</td>
                      <td className="p-3 text-right font-mono text-slate-500">{yesterdayData.ch4}%</td>
                      <td className="p-3 text-right font-mono text-emerald-600">↑ +0.6%</td>
                      <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">Improved</span></td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">CO₂ Level</td>
                      <td className="p-3 text-right font-mono">{todayData.co2}%</td>
                      <td className="p-3 text-right font-mono text-slate-500">{yesterdayData.co2}%</td>
                      <td className="p-3 text-right font-mono text-emerald-600">↓ -6.5%</td>
                      <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">Improved</span></td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">H₂S Content</td>
                      <td className="p-3 text-right font-mono">{todayData.h2s} ppm</td>
                      <td className="p-3 text-right font-mono text-slate-500">{yesterdayData.h2s} ppm</td>
                      <td className="p-3 text-right font-mono text-emerald-600">↓ -7.7%</td>
                      <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">Improved</span></td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">Buffer Tank Level</td>
                      <td className="p-3 text-right font-mono">{todayData.bufferTank}%</td>
                      <td className="p-3 text-right font-mono text-slate-500">{yesterdayData.bufferTank}%</td>
                      <td className="p-3 text-right font-mono text-amber-600">↑ +5.1%</td>
                      <td className="p-3 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold">Changed</span></td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">Lagoon Tank Level</td>
                      <td className="p-3 text-right font-mono">{todayData.lagoonTank}%</td>
                      <td className="p-3 text-right font-mono text-slate-500">{yesterdayData.lagoonTank}%</td>
                      <td className="p-3 text-right font-mono text-blue-600">↑ +2.7%</td>
                      <td className="p-3 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">Stable</span></td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">PSA Efficiency</td>
                      <td className="p-3 text-right font-mono">{todayData.psaEfficiency}%</td>
                      <td className="p-3 text-right font-mono text-slate-500">{yesterdayData.psaEfficiency}%</td>
                      <td className="p-3 text-right font-mono text-emerald-600">↑ +0.6%</td>
                      <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">Improved</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">LT Panel Power</td>
                      <td className="p-3 text-right font-mono">{todayData.ltPanelPower} kW</td>
                      <td className="p-3 text-right font-mono text-slate-500">{yesterdayData.ltPanelPower} kW</td>
                      <td className="p-3 text-right font-mono text-blue-600">↑ +1.2%</td>
                      <td className="p-3 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">Stable</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Export buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;
