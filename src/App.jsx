import React, { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { IconButton, Drawer, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// Importa as duas versões da Sidebar:
import Sidebar from "./components/Sidebar";
import CalendarSidebar from "./components/SidebarCalendar";

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

// Rota protegida (se não houver token, redireciona para /login)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("sessionToken");
  return token ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const location = useLocation();

  // Verifica o role do usuário (supondo que esteja salvo no localStorage)
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  // Determina se estamos em um dispositivo mobile (largura <= 768px)
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Controla se o Drawer (menu lateral mobile) está aberto
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleToggleDrawer = () => setDrawerOpen(!drawerOpen);

  // Defina as rotas onde a Sidebar deve aparecer
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
    "/agenda"
  ];
  const showSidebar = showSidebarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  // Se estivermos na tela de calendário, usaremos a Sidebar específica
  const isCalendarScreen = location.pathname.startsWith("/calendar");

  return (
    <div className={`app-container ${showSidebar ? "" : "no-sidebar"}`}>
      {/* Renderiza a Sidebar fixa para telas grandes apenas se o usuário for admin */}
      {showSidebar && isAdmin && !isMobile && (
        isCalendarScreen ? <CalendarSidebar /> : <Sidebar />
      )}

      {/* Em mobile, exibe o botão hamburger (caso o Drawer esteja fechado) apenas para admin */}
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

      {/* Drawer para mobile apenas se o usuário for admin */}
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
          {isCalendarScreen ? (
            <CalendarSidebar onClose={handleToggleDrawer} />
          ) : (
            <Sidebar onClose={handleToggleDrawer} />
          )}
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
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
