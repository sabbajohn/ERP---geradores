import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton
} from "@mui/material";

// Ícones do Material UI
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ConstructionIcon from "@mui/icons-material/Construction";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessIcon from "@mui/icons-material/Business";
import InventoryIcon from "@mui/icons-material/Inventory";

// Instância 'api' (Axios) do seu services/api
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    rentedGeneratorsCount: 0,
    ownedGeneratorsCount: 0,
    thirdPartyGeneratorsCount: 0,
    stockGenerators: [],
    scheduledMaintCount: 0,
    concludedMaintCount: 0
  });
  const [loading, setLoading] = useState(true);

  // Ao montar o componente, buscar dados da Cloud Function do Parse
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.post(
          "/functions/getDashboardStats",
          {},
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken")
            }
          }
        );

        if (response.data.result) {
          setStats(response.data.result);
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas do dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Definições dos cards (título, valor, ícone, etc.)
  const statsData = [
    {
      title: "Geradores Alugados",
      value: stats.rentedGeneratorsCount,
      icon: <BatteryFullIcon fontSize="small" style={{ color: "#F59E0B" }} />,
      color: "#F59E0B"
    },
    {
      title: "Geradores da Empresa",
      value: stats.ownedGeneratorsCount,
      icon: <BusinessIcon fontSize="small" style={{ color: "#3B82F6" }} />,
      color: "#3B82F6"
    },
    {
      title: "Geradores de Terceiros",
      value: stats.thirdPartyGeneratorsCount,
      icon: <BatteryFullIcon fontSize="small" style={{ color: "#8B5CF6" }} />,
      color: "#8B5CF6"
    },
    {
      title: "Geradores no Estoque",
      value: stats.stockGenerators ? stats.stockGenerators.length : 0,
      icon: <InventoryIcon fontSize="small" style={{ color: "#EF4444" }} />,
      color: "#EF4444"
    },
    {
      title: "Manutenções Agendadas",
      value: stats.scheduledMaintCount,
      icon: <CalendarMonthIcon fontSize="small" style={{ color: "#06B6D4" }} />,
      color: "#06B6D4"
    },
    {
      title: "Manutenções Concluídas",
      value: stats.concludedMaintCount,
      icon: <CheckCircleIcon fontSize="small" style={{ color: "#10B981" }} />,
      color: "#10B981"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Cabeçalho do Dashboard */}
      <Box display="flex" alignItems="center" mb={4}>
        <ConstructionIcon sx={{ fontSize: 32, color: "text.secondary", mr: 1 }} />
        <Typography variant="h4" component="h1" color="text.primary">
          Dashboard
        </Typography>
      </Box>

      {/* Se estiver carregando, mostra Skeleton */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card variant="outlined">
                <CardContent>
                  <Skeleton variant="text" width="60%" height={25} />
                  <Skeleton variant="text" width="40%" height={40} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Caso contrário, mostra os cards
        <Grid container spacing={3}>
          {statsData.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: "#f0f0f0",
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-3px)"
                  }
                }}
              >
                <CardContent>
                  {/* Título + Ícone */}
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 500, color: "text.secondary" }}
                    >
                      {item.title}
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: "#f9fafb",
                        p: 1,
                        borderRadius: 1
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Box>

                  {/* Valor (estatística) */}
                  <Box display="flex" alignItems="baseline">
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {item.value.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
