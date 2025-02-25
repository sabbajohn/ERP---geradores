import React, { useEffect, useState } from "react";
import {
    Container,
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
} from "@mui/material";
import api from "../services/api";

function ReportsDashboard() {
    const [maintenanceStats, setMaintenanceStats] = useState(null);
    const [reportsStats, setReportsStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            // 1) Chamar a função getMaintenanceStats
            const respMaint = await api.post(
                "/functions/getMaintenanceStats",
                {},
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );

            // 2) Chamar a função getMaintenanceReportsStats
            const respReports = await api.post(
                "/functions/getMaintenanceReportsStats",
                {},
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );

            // Guardar os resultados no state
            setMaintenanceStats(respMaint.data?.result);
            setReportsStats(respReports.data?.result);
        } catch (error) {
            console.error("Erro ao buscar estatísticas:", error);
            alert("Falha ao obter dados de estatísticas.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    height: "70vh",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Dashboard de Relatórios
            </Typography>

            {/* Se tiver estatísticas de Manutenções */}
            {maintenanceStats && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Estatísticas de Manutenções
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1">
                                    Agendadas: {maintenanceStats.totalScheduled}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1">
                                    Em andamento: {maintenanceStats.totalInProgress}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1">
                                    Concluídas: {maintenanceStats.totalConcluded}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1">
                                    Canceladas: {maintenanceStats.totalCancelled}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1">
                                    Duração Média (Concluídas): {maintenanceStats.averageDuration}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Se tiver estatísticas de Relatórios de Manutenção */}
            {reportsStats && (
                <Box sx={{ mt: 6 }}>
                    <Typography variant="h5" gutterBottom>
                        Estatísticas de Relatórios de Manutenção
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1">
                                    Total de Relatórios: {reportsStats.totalReports}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1">
                                    Duração Média (Check-in x Check-out):{" "}
                                    {reportsStats.averageDuration}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1">
                                    Total de Peças Usadas: {reportsStats.totalPartsUsed}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1">
                                    Média de Peças por Relatório:{" "}
                                    {reportsStats.averagePartsUsed.toFixed(2)}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Container>
    );
}

export default ReportsDashboard;
