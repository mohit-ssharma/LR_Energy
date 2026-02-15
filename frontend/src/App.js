import { useState, useEffect, useCallback, useRef } from "react";
import "@/App.css";
import { AuthProvider, useAuth, ROLES } from "./context/AuthContext";
import { getDashboardData } from "./services/api";
import LoginPage from "./components/LoginPage";
import DashboardListPage from "./components/DashboardListPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import KPISummary from "./components/KPISummary";
import GasComposition from "./components/GasComposition";
import DewPointMeter from "./components/DewPointMeter";
import DigestersSection from "./components/Digester";
import TankLevels from "./components/TankLevels";
import WaterFlowMeters from "./components/WaterFlowMeters";
import EquipmentStatus from "./components/EquipmentStatus";
import TrendsPage from "./components/TrendsPage";
import ReportsPage from "./components/ReportsPage";
import MNREDashboard from "./components/MNREDashboard";
import MNRETrendsPage from "./components/MNRETrendsPage";
import MNREHeader from "./components/MNREHeader";
import ComparisonView from "./components/ComparisonView";

const LREnergyDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastKnownDataRef = useRef(null);

  // Fetch dashboard data - NO MOCK DATA
  const fetchData = useCallback(async () => {
    try {
      const result = await getDashboardData();
      
      if (result.success && result.data && result.data.current) {
        setDashboardData(result.data);
        lastKnownDataRef.current = result.data;
        setError(null);
        setIsConnected(true);
      } else {
        handleConnectionLost(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Dashboard API error:', err);
      handleConnectionLost(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConnectionLost = (errorMsg) => {
    setIsConnected(false);
    if (lastKnownDataRef.current) {
      setDashboardData({ ...lastKnownDataRef.current, data_status: 'OFFLINE' });
      setError('Connection lost - showing last known data');
    } else {
      // NO MOCK DATA - show null state
      setDashboardData(null);
      setError('No data available - connect to database');
    }
  };

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="dashboard-page">
      <KPISummary />
      <GasComposition dashboardData={dashboardData} />
      <DewPointMeter dashboardData={dashboardData} />
      <DigestersSection dashboardData={dashboardData} />
      <TankLevels dashboardData={dashboardData} />
      <WaterFlowMeters dashboardData={dashboardData} />
      <EquipmentStatus dashboardData={dashboardData} />
      <ComparisonView />
    </div>
  );
};

const ComingSoonPage = ({ plantName, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-white">🚧</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Coming Soon</h1>
        <p className="text-slate-600 mb-6">
          {plantName} dashboard is under development
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
        >
          Back to Dashboard List
        </button>
      </div>
    </div>
  );
};

// MNRE User App - Restricted View
const MNREApp = ({ onLogout, showBackButton = false, onBack }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'trends':
        return <MNRETrendsPage />;
      default:
        return <MNREDashboard />;
    }
  };

  return (
    <div className="App min-h-screen bg-slate-50 flex flex-col">
      <MNREHeader 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={onLogout} 
        showBackButton={showBackButton}
        onBack={onBack}
      />
      <div className="flex-1">
        {renderPage()}
      </div>
      <Footer />
    </div>
  );
};

// Head Office App - Full Access with Dashboard Switcher
const HeadOfficeApp = ({ onLogout, onBackToDashboardList }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentDashboard, setCurrentDashboard] = useState('sonipat'); // 'sonipat' or 'mnre'

  const handleSwitchDashboard = (dashboardId) => {
    setCurrentDashboard(dashboardId);
    setCurrentPage('dashboard'); // Reset to dashboard when switching
  };

  // Render page based on current dashboard view
  const renderPage = () => {
    if (currentDashboard === 'mnre') {
      // MNRE View (limited)
      switch(currentPage) {
        case 'trends':
          return <MNRETrendsPage />;
        default:
          return <MNREDashboard />;
      }
    } else {
      // Sonipat / Full HO View
      switch(currentPage) {
        case 'trends':
          return <TrendsPage />;
        case 'reports':
          return <ReportsPage />;
        default:
          return <LREnergyDashboard />;
      }
    }
  };

  // Use MNRE header for MNRE view, regular header for Sonipat
  const renderHeader = () => {
    if (currentDashboard === 'mnre') {
      return (
        <MNREHeader 
          currentPage={currentPage} 
          onNavigate={setCurrentPage} 
          onLogout={onLogout}
          showBackButton={true}
          onBack={() => setCurrentDashboard('sonipat')}
        />
      );
    }
    return (
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={onLogout}
        onSwitchDashboard={handleSwitchDashboard}
        currentDashboard={currentDashboard}
      />
    );
  };

  return (
    <div className="App min-h-screen bg-slate-50 flex flex-col">
      {renderHeader()}
      <div className="flex-1">
        {renderPage()}
      </div>
      <Footer />
    </div>
  );
};

// Main App Content with Auth Logic
function AppContent() {
  const { user, isAuthenticated, isLoading, logout, isMNRE } = useAuth();
  const [selectedDashboard, setSelectedDashboard] = useState(null);

  const handleLogin = (userData) => {
    // Login is handled by AuthContext, just need to trigger re-render
  };

  const handleLogout = () => {
    logout();
    setSelectedDashboard(null);
  };

  const handleSelectDashboard = (dashboardId) => {
    setSelectedDashboard(dashboardId);
  };

  const handleBackToDashboardList = () => {
    setSelectedDashboard(null);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // MNRE users go directly to their restricted dashboard
  if (isMNRE()) {
    return <MNREApp onLogout={handleLogout} />;
  }

  // HEAD_OFFICE users - show dashboard list first
  if (!selectedDashboard) {
    return (
      <DashboardListPage 
        onSelectDashboard={handleSelectDashboard} 
        onLogout={handleLogout}
        user={user}
      />
    );
  }

  // Show coming soon for Sonipat (work in progress)
  if (selectedDashboard === 'lr-energy-sonipat') {
    return <ComingSoonPage plantName="LR Energy Biogas Plant - Sonipat" onBack={handleBackToDashboardList} />;
  }

  // Head Office accessing MNRE Dashboard view
  if (selectedDashboard === 'mnre-dashboard') {
    return <MNREApp onLogout={handleLogout} showBackButton={true} onBack={handleBackToDashboardList} />;
  }

  // Show Head Office SCADA dashboard for Karnal
  return <HeadOfficeApp onLogout={handleLogout} onBackToDashboardList={handleBackToDashboardList} />;
}

// Main App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
