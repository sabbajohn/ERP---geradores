import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, Typography, Button } from "@mui/material";
import moment from "moment";
import "moment/locale/pt-br";
import api from "../services/api";


const DayDetails = () => {
    const { selectedDate } = useParams();
    const navigate = useNavigate();

    // ID do técnico logado
    const [technicianId] = useState(localStorage.getItem("currentTechId") || "");
    const [dailyMaintenances, setDailyMaintenances] = useState([]);

    useEffect(() => {
        moment.locale("pt-br");
        fetchDailyMaintenances(selectedDate);
    }, [selectedDate]);

    // Busca manutenções só do técnico e daquela data
    const fetchDailyMaintenances = async (dateStr) => {
        try {
            const response = await api.post(
                "/functions/getMaintenancesByTechAndDate",
                { date: dateStr }, // Somente passamos a data
                { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
            );
            if (response.data.result) {
                setDailyMaintenances(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar manutenções do dia:", error.message);
        }
    };


    return (
        <Box sx={{ padding: 2 }}>
            <Card
                sx={{
                    padding: 2,
                    marginBottom: 2,
                    backgroundColor: "#e3f2fd",
                    borderLeft: "6px solid #03a9f4"
                }}
            >
                <Typography variant="h6" color="primary">
                    Atendimentos - {moment(selectedDate).format("DD/MM/YYYY")}
                </Typography>
            </Card>

            {dailyMaintenances.length > 0 ? (
                dailyMaintenances.map((m) => (
                    <Card
                        key={m.objectId}
                        sx={{
                            padding: 2,
                            marginBottom: 2,
                            borderLeft:
                                m.status === "Concluída"
                                    ? "6px solid #4caf50"
                                    : m.status === "Cancelada"
                                        ? "6px solid #f44336"
                                        : "6px solid #ff9800",
                            backgroundColor:
                                m.status === "Concluída"
                                    ? "#e8f5e9"
                                    : m.status === "Cancelada"
                                        ? "#ffebee"
                                        : "#fff8e1"
                        }}
                    >
                        <Typography variant="subtitle1" color="secondary">
                            <strong>Gerador:</strong> {m.generatorId?.name || "Desconhecido"}
                        </Typography>

                        <Typography variant="body2" sx={{ marginTop: 1 }}>
                            <strong>Cliente:</strong>{" "}
                            {m.generatorId?.customerId?.name || "Sem Cliente"}
                        </Typography>

                        <Typography variant="body2" sx={{ marginTop: 1 }}>
                            <strong>Endereço:</strong>{" "}
                            {m.generatorId?.address || "Sem endereço"}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                marginTop: 1,
                                color:
                                    m.status === "Concluída"
                                        ? "green"
                                        : m.status === "Cancelada"
                                            ? "red"
                                            : "orange"
                            }}
                        >
                            <strong>Status:</strong>{" "}
                            {m.status === "Concluída"
                                ? "Concluído"
                                : m.status === "Cancelada"
                                    ? "Cancelado"
                                    : m.status}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ marginTop: 2 }}
                            onClick={() => navigate(`/tecnico/atendimentos/${m.objectId}`)}
                        >
                            Ver Detalhes
                        </Button>
                    </Card>
                ))
            ) : (
                <Card
                    sx={{
                        padding: 2,
                        marginBottom: 2,
                        borderLeft: "6px solid #d32f2f",
                        backgroundColor: "#ffebee"
                    }}
                >
                    <Typography variant="body1" color="error">
                        Nenhum atendimento agendado para este dia.
                    </Typography>
                </Card>
            )}
        </Box>
    );
};

export default DayDetails;
