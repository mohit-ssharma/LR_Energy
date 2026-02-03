import html2pdf from 'html2pdf.js';

// Standard PDF report template
export const generatePDFReport = async (reportData) => {
  const {
    title = 'Report',
    subtitle = 'LR Energy Biogas Plant - Karnal',
    period = '',
    summaryData = {},
    tableHeaders = [],
    tableData = [],
    statistics = null,
    chartImageBase64 = null
  } = reportData;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 800px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 20px;">
        <div>
          <div style="font-size: 28px; font-weight: bold; color: #10b981;">LR Energy</div>
          <div style="font-size: 12px; color: #666; margin-top: 5px;">Biogas Plant - SCADA Monitoring</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: #666;">Report Generated</div>
          <div style="font-size: 14px; font-weight: bold;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          ${period ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">Period: ${period}</div>` : ''}
        </div>
      </div>

      <!-- Title -->
      <div style="margin-bottom: 25px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #1e293b; margin: 0 0 5px 0;">${title.toUpperCase()}</h1>
        <p style="font-size: 14px; color: #64748b; margin: 0;">${subtitle}</p>
      </div>

      <!-- Summary Cards -->
      ${Object.keys(summaryData).length > 0 ? `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 25px;">
          ${Object.entries(summaryData).map(([key, value]) => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
              <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">${key}</div>
              <div style="font-size: 18px; font-weight: bold; color: #1e293b; margin-top: 5px;">${value}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Statistics -->
      ${statistics ? `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 25px;">
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px;">
            <div style="font-size: 12px; font-weight: bold; color: #047857;">Maximum</div>
            <div style="font-size: 22px; font-weight: bold; color: #065f46;">${statistics.max}</div>
          </div>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px;">
            <div style="font-size: 12px; font-weight: bold; color: #1d4ed8;">Average</div>
            <div style="font-size: 22px; font-weight: bold; color: #1e40af;">${statistics.avg}</div>
          </div>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px;">
            <div style="font-size: 12px; font-weight: bold; color: #b45309;">Minimum</div>
            <div style="font-size: 22px; font-weight: bold; color: #92400e;">${statistics.min}</div>
          </div>
        </div>
      ` : ''}

      <!-- Data Table -->
      ${tableHeaders.length > 0 && tableData.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">Data Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f1f5f9;">
                ${tableHeaders.map(h => `<th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableData.map((row, idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  ${row.map(cell => `<td style="padding: 6px 8px; border: 1px solid #e2e8f0; color: #334155;">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
          <div>LR Energy Biogas Plant - Karnal | SCADA Monitoring System</div>
          <div>Generated: ${new Date().toLocaleString()}</div>
        </div>
        <div style="font-size: 9px; color: #cbd5e1; margin-top: 5px;">
          This is an automatically generated report. For queries, contact the system administrator.
        </div>
      </div>
    </div>
  `;

  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  document.body.appendChild(element);

  const opt = {
    margin: 10,
    filename: `LREnergy_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    document.body.removeChild(element);
  }
};

// Generate CSV download
export const generateCSVDownload = (reportData) => {
  const {
    title = 'Report',
    headers = [],
    data = []
  } = reportData;

  const csvContent = [
    `LR Energy Biogas Plant - ${title}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    headers.join(','),
    ...data.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `LREnergy_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

// Generate dummy monthly data
export const generateMonthlyData = (days = 30) => {
  const data = [];
  const baseDate = new Date('2026-01-01');
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
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

// Calculate statistics
export const calculateStats = (data, key) => {
  const values = data.map(d => d[key]);
  return {
    min: Math.min(...values).toFixed(2),
    max: Math.max(...values).toFixed(2),
    avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
    total: values.reduce((a, b) => a + b, 0).toFixed(2)
  };
};
