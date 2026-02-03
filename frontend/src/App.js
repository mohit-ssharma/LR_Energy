import { useState } from "react";
import "@/App.css";
import { AuthProvider, useAuth, ROLES } from "./context/AuthContext";
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
import TrendsPage from "./components/TrendsPage";
import ReportsPage from "./components/ReportsPage";
import MNREDashboard from "./components/MNREDashboard";
import MNRETrendsPage from "./components/MNRETrendsPage";
import MNREHeader from "./components/MNREHeader";

const LREnergyDashboard = () => {
  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="dashboard-page">
      <KPISummary />
      <GasComposition />
      <DewPointMeter />
      <DigestersSection />
      <TankLevels />
      <WaterFlowMeters />
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
const MNREApp = ({ onLogout }) => {
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
      <MNREHeader currentPage={currentPage} onNavigate={setCurrentPage} onLogout={onLogout} />
      <div className="flex-1">
        {renderPage()}
      </div>
      <Footer />
    </div>
  );
};

// Head Office App - Full Access
const HeadOfficeApp = ({ onLogout, onBackToDashboardList }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'trends':
        return <TrendsPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <LREnergyDashboard />;
    }
  };

  return (
    <div className="App min-h-screen bg-slate-50 flex flex-col">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} onLogout={onLogout} />
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
  if (selectedDashboard !== 'lr-energy-karnal') {
    const plantNames = {
      'lr-energy-sonipat': 'LR Energy Biogas Plant - Sonipat',
      'solar-plant': 'Solar Power Station',
      'wind-farm': 'Wind Farm Station',
      'manufacturing': 'Manufacturing Unit'
    };
    return <ComingSoonPage plantName={plantNames[selectedDashboard] || 'Selected Plant'} onBack={handleBackToDashboardList} />;
  }

  // Show Head Office SCADA dashboard
  return <HeadOfficeApp onLogout={handleLogout} onBackToDashboardList={handleBackToDashboardList} />;
}

export default App;
