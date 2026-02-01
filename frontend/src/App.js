import { useState } from "react";
import "@/App.css";
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSelectedDashboard(null);
    setCurrentPage('dashboard');
  };

  const handleSelectDashboard = (dashboardId) => {
    setSelectedDashboard(dashboardId);
    setCurrentPage('dashboard');
  };

  const handleBackToDashboardList = () => {
    setSelectedDashboard(null);
    setCurrentPage('dashboard');
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show dashboard list if no dashboard selected
  if (!selectedDashboard) {
    return (
      <DashboardListPage 
        onSelectDashboard={handleSelectDashboard} 
        onLogout={handleLogout}
        user={user}
      />
    );
  }

  // Show coming soon for other dashboards
  if (selectedDashboard !== 'lr-energy') {
    const plantNames = {
      'solar-plant': 'Solar Power Station',
      'wind-farm': 'Wind Farm Station',
      'manufacturing': 'Manufacturing Unit'
    };
    return <ComingSoonPage plantName={plantNames[selectedDashboard]} onBack={handleBackToDashboardList} />;
  }

  // Show LR Energy SCADA dashboard
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
      <Header currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
      <div className="flex-1">
        {renderPage()}
      </div>
      <Footer />
    </div>
  );
}

export default App;
