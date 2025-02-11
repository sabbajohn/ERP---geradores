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
  FaBolt,
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

  // Estilo padrão para os botões da lista, mantendo o texto em branco e 
  // aplicando um fundo diferenciado quando o item estiver ativo.
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
        height: "100vh",
        position: "fixed",    // Torna a sidebar fixa
        top: 0,               // Alinha ao topo da tela
        left: 0,              // Alinha à esquerda da tela
        overflowY: "auto",    // Permite rolagem interna se necessário
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1e1e2f", // Fundo escuro
        color: "#fff",             // Texto branco
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
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <FaBolt style={{ marginRight: 8 }} /> Energimaq
        </Typography>
      </Box>

      {/* Menu de navegação */}
      <Box component="nav" sx={{ flex: 1 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/dashboard"
              end
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
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "rgba(255,255,255,0.2)" }}>
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
          Sabbá Systems
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;
