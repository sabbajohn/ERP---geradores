import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Generators from "./pages/Generators";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import TechnicianCalendar from "./pages/TechnicianCalendar";
import TechnicianAttendances from "./pages/TechnicianAttendances";
import AttendanceDetails from "./pages/AttendanceDetails";
import ScheduleMaintenance from "./pages/ScheduleMaintenance";
import Technicians from "./pages/Technicians";
import DemandCalendar from "./pages/DemandCalendar";
import DayDetails from "./pages/DayDetails";
import Inventory from "./pages/Inventory";
import ChecklistLocacao from "./pages/ChecklistLocacao";

// **Import do novo componente**:
import ChecklistsList from "./pages/ChecklistsList";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("sessionToken");

  return token ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const location = useLocation();

  // Rotas onde o Sidebar aparece
  const showSidebar = [
    "/dashboard",
    "/customers",
    "/generators",
    "/maintenance",
    "/reports",
    "/notifications",
    "/technicians",
    "/calendar",
    "/inventory",
    "/ChecklistLocacao",
    // Adicionar "/checklists" se quiser exibir a sidebar nessa página
    "/checklists",
  ].includes(location.pathname);

  return (
    <div className={`app-container ${showSidebar ? "" : "no-sidebar"}`}>
      {showSidebar && <Sidebar />}
      <main className="main-content">
        <Routes>
          {/* Login acessível a todos */}
          <Route path="/login" element={<Login />} />

          {/* Redirecionar para login se acessar a raiz sem estar autenticado */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generators"
            element={
              <ProtectedRoute>
                <Generators />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <Maintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/schedule"
            element={
              <ProtectedRoute>
                <ScheduleMaintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicians"
            element={
              <ProtectedRoute>
                <Technicians />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <DemandCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda/:selectedDate"
            element={
              <ProtectedRoute>
                <DayDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tecnico"
            element={
              <ProtectedRoute>
                <TechnicianCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tecnico/atendimentos"
            element={
              <ProtectedRoute>
                <TechnicianAttendances />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ChecklistLocacao"
            element={
              <ProtectedRoute>
                <ChecklistLocacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tecnico/atendimentos/:maintenanceId"
            element={
              <ProtectedRoute>
                <AttendanceDetails />
              </ProtectedRoute>
            }
          />

          {/* Nova rota: /checklists */}
          <Route
            path="/checklists"
            element={
              <ProtectedRoute>
                <ChecklistsList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
