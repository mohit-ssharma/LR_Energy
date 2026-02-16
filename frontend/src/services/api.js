/**
 * SCADA API Service
 * Handles all API calls to PHP backend
 * 
 * For Local Testing: Set REACT_APP_BACKEND_URL=http://localhost/scada-api
 * For Production: Set REACT_APP_BACKEND_URL=https://your-domain.com/api
 */

// API Base URL - from environment variable
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost/scada-api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return { success: true, data };
        
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Get dashboard data (current values, averages, equipment status)
 * Endpoint: GET /dashboard.php
 */
export async function getDashboardData() {
    return fetchAPI('dashboard.php');
}

/**
 * Get comparison data (today vs yesterday)
 * Endpoint: GET /comparison.php?period=today_vs_yesterday
 */
export async function getComparisonData(period = 'today_vs_yesterday') {
    return fetchAPI(`comparison.php?period=${period}`);
}

/**
 * Get trends data for charts
 * Endpoint: GET /trends.php?hours=24&parameters=raw_biogas_flow,ch4_concentration
 * 
 * @param {number} hours - Number of hours of data to fetch (1, 12, 24, or 168 for 7 days)
 * @param {array} parameters - Optional list of specific parameters to fetch
 * @param {boolean} raw - If true, returns individual records without grouping (default: false)
 * 
 * Interval Logic (when raw=false):
 * - 1 hour: 10 intervals of 6 minutes each
 * - 12 hours: 10 intervals of 72 minutes each
 * - 24 hours: 10 intervals of 144 minutes each
 * - 7 days: 7 intervals of 1 day each
 */
export async function getTrendsData(hours = 24, parameters = null, raw = false) {
    let url = `trends.php?hours=${hours}`;
    if (parameters && parameters.length > 0) {
        url += `&parameters=${parameters.join(',')}`;
    }
    if (raw) {
        url += `&raw=true`;
    }
    return fetchAPI(url);
}

/**
 * Get sync status
 * Endpoint: GET /sync_status.php
 */
export async function getSyncStatus() {
    return fetchAPI('sync_status.php');
}

/**
 * Login user
 * Endpoint: POST /auth.php
 */
export async function loginUser(email, password) {
    return fetchAPI('auth.php', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

/**
 * Test API connection
 * Endpoint: GET /test.php
 */
export async function testConnection() {
    return fetchAPI('test.php');
}

/**
 * Get report data for user-selected date range
 * Endpoint: GET /reports.php?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&report_type=production
 * 
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} reportType - Type of report: production, quality, performance, compliance, custom
 */
export async function getReportData(startDate, endDate, reportType = 'production') {
    return fetchAPI(`reports.php?start_date=${startDate}&end_date=${endDate}&report_type=${reportType}`);
}

/**
 * Format number with commas
 */
export function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format timestamp to readable format
 */
export function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/**
 * Get daily production data (based on totalizer differences)
 * Endpoint: GET /daily_production.php?days=30
 * 
 * @param {number} days - Number of days to fetch (default: 30, max: 365)
 */
export async function getDailyProductionData(days = 30) {
    return fetchAPI(`daily_production.php?days=${days}`);
}

/**
 * Format "Last updated" time - show only time if today, else show date + time
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted time string
 */
export function formatLastUpdated(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    const today = new Date();
    
    const isToday = date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
    
    if (isToday) {
        // Today - show only time
        return date.toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } else {
        // Not today - show date + time
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
}

/**
 * Get status color class based on data status
 */
export function getStatusColor(status) {
    switch (status) {
        case 'FRESH': return 'text-emerald-600 bg-emerald-50';
        case 'DELAYED': return 'text-amber-600 bg-amber-50';
        case 'STALE': return 'text-red-600 bg-red-50';
        default: return 'text-slate-600 bg-slate-50';
    }
}

/**
 * Calculate data quality percentage
 */
export function calculateDataQuality(samples, expected) {
    if (!expected || expected === 0) return 0;
    return Math.round((samples / expected) * 100);
}

export default {
    getDashboardData,
    getComparisonData,
    getTrendsData,
    getReportData,
    getDailyProductionData,
    getSyncStatus,
    loginUser,
    testConnection,
    formatNumber,
    formatTimestamp,
    formatLastUpdated,
    getStatusColor,
    calculateDataQuality
};
