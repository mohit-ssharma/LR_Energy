import { useState } from "react";
import "@/App.css";
import Header from "./components/Header";
import KPISummary from "./components/KPISummary";
import GasComposition from "./components/GasComposition";
import DewPointMeter from "./components/DewPointMeter";
import DigestersSection from "./components/Digester";
import TankLevels from "./components/TankLevels";
import WaterFlowMeters from "./components/WaterFlowMeters";
import TrendsPage from "./components/TrendsPage";
import ReportsPage from "./components/ReportsPage";

const Dashboard = () => {
  return (
    <div className="px-6 py-6 bg-gradient-to-br from-blue-50 via-white to-gray-50 min-h-screen" data-testid="dashboard-page">
      <KPISummary />
      <GasComposition />
      <DewPointMeter />
      <DigestersSection />
      <TankLevels />
      <WaterFlowMeters />
    </div>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'trends':
        return <TrendsPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;
