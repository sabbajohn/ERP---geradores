import React, { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { IconButton, Drawer, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// Removido: import CalendarSidebar
import Sidebar from "./components/Sidebar";

// Importa todas as suas páginas
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
import ChecklistsList from "./pages/ChecklistsList";
import GeneratorDetails from "./pages/GeneratorDetails";
import Suppliers from "./pages/Suppliers";

// Importa o novo Dashboard de relatórios agregados
import ReportsDashboard from "./pages/ReportsDashboard";

// Rota protegida
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("sessionToken");
  return token ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const location = useLocation();

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  // Detecta mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleToggleDrawer = () => setDrawerOpen(!drawerOpen);

  // Rotas onde a Sidebar deve aparecer
  const showSidebarPaths = [
    "/dashboard",
    "/customers",
    "/generators",
    "/maintenance",
    "/reports",
    "/notifications",
    "/technicians",
    "/calendar",
    "/inventory",
    "/suppliers",
    "/ChecklistLocacao",
    "/checklists",
    "/tecnico",
    "/agenda",
    "/reports-dashboard",
  ];

  const showSidebar = showSidebarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className={`app-container ${showSidebar ? "" : "no-sidebar"}`}>
      {/* Renderiza a Sidebar fixa para telas grandes, apenas se for admin */}
      {showSidebar && isAdmin && !isMobile && (
        <Sidebar />
      )}

      {/* Em mobile, exibe um botão hamburger se for admin e a sidebar estiver fechada */}
      {showSidebar && isAdmin && isMobile && !drawerOpen && (
        <IconButton
          onClick={handleToggleDrawer}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 2000,
            backgroundColor: "#1f2937",
            color: "#fff",
            "&:hover": { backgroundColor: "#374151" },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Drawer para mobile, apenas se for admin */}
      {showSidebar && isAdmin && (
        <Drawer
          open={drawerOpen}
          onClose={handleToggleDrawer}
          PaperProps={{
            sx: {
              width: 240,
              backgroundColor: "#1f2937",
              color: "#fff",
            },
          }}
        >
          <Sidebar onClose={handleToggleDrawer} />
        </Drawer>
      )}

      {/* Área principal: rotas da aplicação */}
      <main className="main-content">
        <Routes>
          {/* Rota de login (pública) */}
          <Route path="/login" element={<Login />} />
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
            path="/generator/:id"
            element={
              <ProtectedRoute>
                <GeneratorDetails />
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
          <Route
            path="/checklists"
            element={
              <ProtectedRoute>
                <ChecklistsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <Suppliers />
              </ProtectedRoute>
            }
          />

          {/* Nova rota para o Dashboard de Relatórios (estatísticas) */}
          <Route
            path="/reports-dashboard"
            element={
              <ProtectedRoute>
                <ReportsDashboard />
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
