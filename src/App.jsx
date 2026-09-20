import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import DashboardTab from './components/DashboardTab';
import LocationsTab from './components/LocationsTab';
import AlertsTab from './components/AlertsTab';
import AnalyticsTab from './components/AnalyticsTab';
import AdminTab from './components/AdminTab';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLocId, setSelectedLocId] = useState(null);

  const handleSelectLocation = (locId) => {
    setSelectedLocId(locId);
    setActiveTab('locations');
  };

  const handleClearSelectedLocId = () => {
    setSelectedLocId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-500 font-bold text-sm">Smart Waste Monitor Loading...</p>
        </div>
      </div>
    );
  }

  // Renders the Login page directly if no session exists
  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      {/* Shared Nav Bar */}
      <Navbar onNavigateTab={setActiveTab} />
      
      {/* Main Body Shell */}
      <div className="flex-1 flex flex-row">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onNavigateTab={setActiveTab} />
        
        {/* Main Viewport Panel */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              onSelectLocation={handleSelectLocation} 
              onNavigateTab={setActiveTab} 
            />
          )}
          {activeTab === 'locations' && (
            <LocationsTab 
              selectedLocId={selectedLocId} 
              clearSelectedLocId={handleClearSelectedLocId} 
            />
          )}
          {activeTab === 'alerts' && <AlertsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'admin' && <AdminTab />}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
