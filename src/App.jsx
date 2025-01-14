import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Generators from './pages/Generators';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import TechnicianCalendar from './pages/TechnicianCalendar';
import TechnicianAttendances from './pages/TechnicianAttendances';
import AttendanceDetails from './pages/AttendanceDetails';
import ScheduleMaintenance from './pages/ScheduleMaintenance';
import Technicians from './pages/Technicians';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const location = useLocation();

  // Definir as rotas onde o Sidebar deve ser exibido
  const showSidebar = [
    '/',
    '/customers',
    '/generators',
    '/maintenance',
    '/reports',
    '/notifications'
  ].includes(location.pathname);

  return (
    <div className={`app-container ${showSidebar ? '' : 'no-sidebar'}`}>
      {/* Exibe o Sidebar apenas nas rotas definidas */}
      {showSidebar && <Sidebar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/generators" element={<Generators />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/maintenance/schedule" element={<ScheduleMaintenance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/technicians" element={<Technicians />} />
          <Route path="/tecnico" element={<TechnicianCalendar />} />
          <Route path="/tecnico/atendimentos" element={<TechnicianAttendances />} />
          <Route path="/tecnico/atendimentos/:id" element={<AttendanceDetails />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
