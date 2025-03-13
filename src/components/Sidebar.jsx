import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
} from "@mui/material";
import {
  FaHome,
  FaUsers,
  FaCog,
  FaTools,
  FaChartBar,
  FaUserCog,
  FaCalendarAlt,
  FaBoxes,
  FaClipboardCheck,
  FaSignOutAlt,
  FaHandshake,
  FaWhatsapp,
  FaChartLine,
} from "react-icons/fa";

function Sidebar({ onClose }) {
  const navigate = useNavigate();

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("role");
    localStorage.removeItem("fullname");
    if (onClose) onClose(); // Fecha o Drawer em mobile, se existir
    navigate("/login");
  };

  // Estilo padrão para os botões da lista
  const listItemButtonStyle = {
    color: "#fff",
    "&.active": {
      backgroundColor: "#333",
    },
  };

  return (
    <Box
      sx={{
        width: 250,
        height: "100vh", // Altura total da tela
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1e1e2f", // Fundo escuro
        color: "#fff",              // Texto branco
      }}
    >
      {/* Cabeçalho com logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <img
          src="https://parsefiles.back4app.com/xwpmfaGkbxWwTv9txCSD6gk8BLj9XiPzXzQ3L92E/992b890208e68cbb6b1f7c19fe19f80e_ENERGIMAQ%20LOGO%20ORIGINAL.png"
          alt="Logo Energimaq"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </Box>

      {/* Menu de navegação (com scroll) */}
      <Box component="nav" sx={{ flex: 1, overflowY: "auto" }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/dashboard"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaHome />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/customers"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaUsers />
              </ListItemIcon>
              <ListItemText primary="Clientes" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/generators"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaCog />
              </ListItemIcon>
              <ListItemText primary="Geradores" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/maintenance"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaTools />
              </ListItemIcon>
              <ListItemText primary="Manutenção" />
            </ListItemButton>
          </ListItem>

          {/* Rota para Calendário */}
          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/calendar"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaCalendarAlt />
              </ListItemIcon>
              <ListItemText primary="Calendário" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/reports"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaChartBar />
              </ListItemIcon>
              <ListItemText primary="Atendimentos" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/technicians"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaUserCog />
              </ListItemIcon>
              <ListItemText primary="Técnicos" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/inventory"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaBoxes />
              </ListItemIcon>
              <ListItemText primary="Estoque" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/ChecklistLocacao"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaClipboardCheck />
              </ListItemIcon>
              <ListItemText primary="Checklist Locação" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/suppliers"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaHandshake />
              </ListItemIcon>
              <ListItemText primary="Fornecedores" />
            </ListItemButton>
          </ListItem>

          {/* Link para o Dashboard de relatórios estatísticos */}
          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/reports-dashboard"
              sx={listItemButtonStyle}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaChartLine />
              </ListItemIcon>
              <ListItemText primary="Relatórios Estatísticos" />
            </ListItemButton>
          </ListItem>

          {/* Botão de Logout */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={listItemButtonStyle}>
              <ListItemIcon sx={{ color: "inherit" }}>
                <FaSignOutAlt style={{ color: "red" }} />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Seção de Suporte fixa ao final */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "rgba(255,255,255,0.2)",
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Suporte:
        </Typography>
        <Button
          variant="contained"
          color="success"
          fullWidth
          component="a"
          href="https://wa.me/5547996601626"
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<FaWhatsapp />}
          sx={{
            fontSize: "1rem",
            padding: "8px 16px",
            textTransform: "none",
          }}
        >
          Atendimento
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;
