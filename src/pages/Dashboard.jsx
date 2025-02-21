import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Divider,
  Tabs,
  Tab,
  Paper
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

// Ícones do Material UI
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import ConstructionIcon from "@mui/icons-material/Construction";
import BusinessIcon from "@mui/icons-material/Business";
import InventoryIcon from "@mui/icons-material/Inventory";
import BarChartIcon from "@mui/icons-material/BarChart";

// Gráficos (Recharts)
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip
} from "recharts";

// Instância 'api' (Axios) do seu services/api
import api from "../services/api";

export default function Dashboard() {
  // ---------------------------
  //      ESTADOS PRINCIPAIS
  // ---------------------------
  const [stats, setStats] = useState({
    soldGeneratorsCount: 0,
    stockGeneratorsCount: 0,
    maintenanceGeneratorsCount: 0,
    rentedGeneratorsCount: 0,
    thirdPartyGeneratorsCount: 0,
    scheduledMaintCount: 0,
    concludedMaintCount: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Manutenções
  const [upcomingMaint, setUpcomingMaint] = useState([]);
  const [loadingMaint, setLoadingMaint] = useState(true);
  const [upcomingMaint30, setUpcomingMaint30] = useState([]);
  const [loadingMaint30, setLoadingMaint30] = useState(true);

  // Peças com mais de 50% de uso
  const [partsAbove50, setPartsAbove50] = useState([]);
  const [loadingParts, setLoadingParts] = useState(true);

  // Abas (Tabs)
  const [tabValue, setTabValue] = useState(0);

  // ---------------------------
  //      FORÇANDO ANIMAÇÃO
  // ---------------------------
  // Sempre que stats mudar, incrementamos chartKey para forçar remontagem do gráfico
  const [chartKey, setChartKey] = useState(0);
  useEffect(() => {
    // Quando 'stats' é atualizado, re-renderiza o gráfico
    setChartKey((prev) => prev + 1);
  }, [stats]);

  // ---------------------------
  //      HANDLERS E FUNÇÕES
  // ---------------------------
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  // (Se necessário, um generatorId)
  const generatorId = "SEU_GENERATOR_ID_AQUI";

  // ---------------------------
  //      BUSCA DE ESTATÍSTICAS
  // ---------------------------
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
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  // ---------------------------
  //      MANUTENÇÕES (2 SEMANAS)
  // ---------------------------
  useEffect(() => {
    async function fetchUpcomingMaint() {
      try {
        const response = await api.post(
          "/functions/getUpcomingMaintenances",
          {},
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken")
            }
          }
        );
        setUpcomingMaint(response.data.result || []);
      } catch (error) {
        console.error("Erro ao buscar manutenções futuras (2 semanas):", error);
      } finally {
        setLoadingMaint(false);
      }
    }
    fetchUpcomingMaint();
  }, []);

  // ---------------------------
  //      MANUTENÇÕES (30 DIAS)
  // ---------------------------
  useEffect(() => {
    async function fetchUpcomingMaint30() {
      try {
        const response = await api.post(
          "/functions/getUpcomingMaintenances30Days",
          {},
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken")
            }
          }
        );
        setUpcomingMaint30(response.data.result || []);
      } catch (error) {
        console.error("Erro ao buscar manutenções futuras (30 dias):", error);
      } finally {
        setLoadingMaint30(false);
      }
    }
    fetchUpcomingMaint30();
  }, []);

  // ---------------------------
  //      PEÇAS COM +50% DE USO
  // ---------------------------
  useEffect(() => {
    async function fetchPartsAbove50() {
      try {
        const response = await api.post(
          "/functions/getAllGeneratorPartsAbove50",
          {},
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken")
            }
          }
        );
        console.log("BACKEND partsAbove50 =>", response.data.result.partsAbove50);

        if (response.data.result?.partsAbove50) {
          setPartsAbove50(response.data.result.partsAbove50);
        }
      } catch (error) {
        console.error("Erro ao buscar peças com mais de 50% de uso:", error);
      } finally {
        setLoadingParts(false);
      }
    }
    fetchPartsAbove50();
  }, []);

  // ---------------------------
  //      DADOS DOS CARDS
  // ---------------------------
  const statsData = [
    {
      title: "Geradores Vendidos",
      value: stats.soldGeneratorsCount,
      icon: <BusinessIcon fontSize="small" style={{ color: "#6B7280" }} />,
      color: "#6B7280"
    },
    {
      title: "Em Estoque",
      value: stats.stockGeneratorsCount,
      icon: <InventoryIcon fontSize="small" style={{ color: "#EF4444" }} />,
      color: "#EF4444"
    },
    {
      title: "Em Manutenção",
      value: stats.maintenanceGeneratorsCount,
      icon: <ConstructionIcon fontSize="small" style={{ color: "#F59E0B" }} />,
      color: "#F59E0B"
    },
    {
      title: "Alugados",
      value: stats.rentedGeneratorsCount,
      icon: <BatteryFullIcon fontSize="small" style={{ color: "#06B6D4" }} />,
      color: "#06B6D4"
    },
    {
      title: "Terceiros",
      value: stats.thirdPartyGeneratorsCount,
      icon: <BatteryFullIcon fontSize="small" style={{ color: "#8B5CF6" }} />,
      color: "#8B5CF6"
    }
  ];

  // ---------------------------
  //   DADOS PARA O GRÁFICO PIZZA
  // ---------------------------
  const pieData = [
    {
      name: "Vendidos",
      value: stats.soldGeneratorsCount,
      color: "#6B7280"
    },
    {
      name: "Estoque",
      value: stats.stockGeneratorsCount,
      color: "#EF4444"
    },
    {
      name: "Manutenção",
      value: stats.maintenanceGeneratorsCount,
      color: "#F59E0B"
    },
    {
      name: "Alugados",
      value: stats.rentedGeneratorsCount,
      color: "#06B6D4"
    },
    {
      name: "Terceiros",
      value: stats.thirdPartyGeneratorsCount,
      color: "#8B5CF6"
    }
  ].filter((item) => item.value > 0);

  // ---------------------------
  //     COLUNAS DAS MANUTENÇÕES
  // ---------------------------
  const columnsMaint = [
    { field: "date", headerName: "Data", width: 110 },
    { field: "generator", headerName: "Gerador", width: 200 },
    { field: "client", headerName: "Cliente", width: 200 },
    { field: "technician", headerName: "Técnico", width: 150 },
    { field: "startTime", headerName: "Início", width: 80 },
    { field: "endTime", headerName: "Término", width: 80 },
    { field: "status", headerName: "Status", width: 120 }
  ];

  // Converte os dados de manutenções do backend para rows
  const transformMaintRows = (maintArray) => {
    return maintArray.map((m) => {
      const d = m.maintenanceDate;
      const dateObj = d && d.iso ? new Date(d.iso) : new Date(d || Date.now());
      return {
        id: m.objectId,
        maintenanceDate: m.maintenanceDate,
        date: dateObj.toLocaleDateString(),
        generator: m.generator?.name || "Desconhecido",
        client: m.generator?.customer ? m.generator.customer.name : "Não informado",
        technician: m.technician ? m.technician.name : "Não definido",
        startTime: m.startTime,
        endTime: m.endTime,
        status: m.status
      };
    });
  };

  const rowsUpcomingMaint = transformMaintRows(upcomingMaint);
  const rowsUpcomingMaint30 = transformMaintRows(upcomingMaint30);

  // ---------------------------
  //  COLUNAS DAS PEÇAS (>50% USO)
  // ---------------------------
  const columnsParts = [
    { field: "generatorName", headerName: "Gerador", width: 200 },
    { field: "customerName", headerName: "Cliente", width: 200 },
    { field: "partName", headerName: "Peça", width: 200 },
    { field: "currentHours", headerName: "Horas Atuais", width: 130 },
    { field: "intervalHours", headerName: "Intervalo (Horas)", width: 130 },
    {
      field: "usagePercent",
      headerName: "% de Uso",
      width: 120
      // Sem valueFormatter => exibe o valor do backend diretamente
      // Se quiser formatar, é só re-adicionar o valueFormatter
    }
  ];

  // ---------------------------
  //         RENDERIZAÇÃO
  // ---------------------------
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* CABEÇALHO */}
      <Box
        display="flex"
        alignItems="center"
        mb={4}
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center">
          <ConstructionIcon sx={{ fontSize: 40, color: "text.secondary", mr: 2 }} />
          <Typography variant="h4" component="h1" color="text.primary">
            Dashboard
          </Typography>
        </Box>
      </Box>

      {/* GRID PRINCIPAL: CARDS (ESQ) E GRÁFICO (DIR) */}
      <Grid container spacing={3}>
        {/* Coluna da esquerda (Cards de estatísticas) */}
        <Grid item xs={12} md={8}>
          {loadingStats ? (
            <Grid container spacing={3}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={6} lg={6} key={i}>
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
            <Grid container spacing={3}>
              {statsData.map((item, idx) => (
                <Grid item xs={12} sm={6} md={6} lg={6} key={idx}>
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
        </Grid>

        {/* Coluna da direita (Gráfico Pizza) */}
        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              borderColor: "#f0f0f0",
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <BarChartIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Distribuição de Geradores
                </Typography>
              </Box>

              {loadingStats ? (
                <Skeleton variant="rectangular" width="100%" height={200} />
              ) : pieData.length === 0 ? (
                <Typography variant="body2">
                  Nenhum dado para exibir no gráfico.
                </Typography>
              ) : (
                // Adicionamos a key={chartKey} para forçar animação
                <Box sx={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer key={chartKey}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        label
                        // Opções de animação
                        isAnimationActive
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SEPARADOR */}
      <Divider sx={{ my: 4 }} />

      {/* TABELAS EM ABAS (TABS) */}
      <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          indicatorColor="primary"
        >
          <Tab label="Próx. 2 Semanas" />
          <Tab label="Próx. 30 Dias" />
          <Tab label="Peças (+50% Uso)" />
        </Tabs>

        {/* Aba 0: Manutenções (próx. 2 semanas) */}
        {tabValue === 0 && (
          <Box mt={2}>
            <Typography variant="h6" component="h2" gutterBottom>
              Manutenções para as próximas 2 semanas
            </Typography>
            {loadingMaint ? (
              <Skeleton variant="rectangular" height={200} />
            ) : rowsUpcomingMaint.length === 0 ? (
              <Typography variant="body1">
                Nenhuma manutenção agendada para as próximas 2 semanas.
              </Typography>
            ) : (
              <Box sx={{ width: "100%", height: 400 }}>
                <DataGrid
                  rows={rowsUpcomingMaint}
                  columns={columnsMaint}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10]}
                  disableSelectionOnClick
                />
              </Box>
            )}
          </Box>
        )}

        {/* Aba 1: Manutenções (próx. 30 dias) */}
        {tabValue === 1 && (
          <Box mt={2}>
            <Typography variant="h6" component="h2" gutterBottom>
              Manutenções para os próximos 30 dias
            </Typography>
            {loadingMaint30 ? (
              <Skeleton variant="rectangular" height={200} />
            ) : rowsUpcomingMaint30.length === 0 ? (
              <Typography variant="body1">
                Nenhuma manutenção agendada para os próximos 30 dias.
              </Typography>
            ) : (
              <Box sx={{ width: "100%", height: 400 }}>
                <DataGrid
                  rows={rowsUpcomingMaint30}
                  columns={columnsMaint}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10]}
                  disableSelectionOnClick
                />
              </Box>
            )}
          </Box>
        )}

        {/* Aba 2: Peças com mais de 50% da vida útil */}
        {tabValue === 2 && (
          <Box mt={2}>
            <Typography variant="h6" component="h2" gutterBottom>
              Peças com mais de 50% da vida útil
            </Typography>
            {loadingParts ? (
              <Skeleton variant="rectangular" height={200} />
            ) : partsAbove50.length === 0 ? (
              <Typography variant="body1">
                Nenhuma peça ultrapassou 50% da vida útil.
              </Typography>
            ) : (
              <Box sx={{ width: "100%", height: 400 }}>
                <DataGrid
                  getRowId={(row) => row.objectId}
                  rows={partsAbove50}
                  columns={columnsParts}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10]}
                  disableSelectionOnClick
                />
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
