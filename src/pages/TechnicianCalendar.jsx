import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar"; // react-calendar (mobile-friendly)
import "react-calendar/dist/Calendar.css";

import {
    Box,
    Card,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    AppBar,
    Toolbar,
    IconButton,
} from "@mui/material";

import LogoutIcon from '@mui/icons-material/Logout'; // Importa o ícone de logout

import api from "../services/api";

const TechnicianCalendar = () => {
    const navigate = useNavigate();

    // Exemplo de ID do técnico logado (você obtém do seu auth)
    const [technicianId] = useState(() => {
        const id = localStorage.getItem("currentTechId") || "";
        console.log("Technician ID obtido:", id);
        return id;
    });

    const [date, setDate] = useState(new Date());
    const [maintenances, setMaintenances] = useState([]);
    const [openModal, setOpenModal] = useState(false);

    // Estado para novo cadastro (ex.: gerador ou cliente) - opcional
    const [newEntry, setNewEntry] = useState({
        type: "generator",
        name: "",
        client: ""
    });

    useEffect(() => {
        fetchMaintenancesByTechnician();
    }, []);

    const fetchMaintenancesByTechnician = async () => {
        try {
            const response = await api.post(
                "/functions/getMaintenancesByTech",
                { technicianId },
                { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
            );
            if (response.data.result) {
                setMaintenances(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar manutenções do técnico:", error.message);
        }
    };

    // Função para encerrar a sessão
    const handleLogout = () => {
        // Remove todos os itens relacionados à sessão do localStorage
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("role");
        localStorage.removeItem("fullname");
        localStorage.removeItem("currentTechId");

        // Opcional: limpar todo o localStorage
        // localStorage.clear();

        // Redireciona para a página de login
        navigate("/login");
    };

    // Clica num dia específico do calendário
    const handleDateClick = (value) => {
        const selectedDate = value.toISOString().split("T")[0]; // YYYY-MM-DD
        navigate(`/agenda/${selectedDate}`);
    };

    // Modal: abrir
    const handleOpenModal = () => setOpenModal(true);

    // Modal: fechar
    const handleCloseModal = () => {
        setOpenModal(false);
        setNewEntry({ type: "generator", name: "", client: "" });
    };

    // Modal: salvar
    const handleSaveEntry = () => {
        // Aqui você pode adicionar a lógica para salvar a nova entrada
        handleCloseModal();
    };

    // Indica eventos por dia no calendário
    const tileContent = ({ date: dayDate, view }) => {
        if (view === "month") {
            // Filtra manutenções do technician
            const dayString = dayDate.toISOString().split("T")[0];
            const count = maintenances.filter(
                (m) => m.maintenanceDate.iso.split("T")[0] === dayString
            ).length;
            if (count > 0) {
                return (
                    <Box sx={{ display: "flex", justifyContent: "center", gap: "2px" }}>
                        {Array.from({ length: count }).map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: "5px",
                                    height: "5px",
                                    backgroundColor: "#03a9f4",
                                    borderRadius: "50%"
                                }}
                            />
                        ))}
                    </Box>
                );
            }
        }
        return null;
    };

    return (
        <Box sx={{ padding: 2 }}>
            {/* Barra de Navegação com Logout */}
            <AppBar position="static" sx={{ marginBottom: 2 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Agenda Mensal do Técnico
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        aria-label="logout"
                        onClick={handleLogout}
                    >
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Card sx={{ padding: 2, marginBottom: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Manutenções Programadas
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleOpenModal}>
                        Adicionar Cadastro
                    </Button>
                </Box>
            </Card>

            <Card sx={{ padding: 2 }}>
                <Calendar
                    onChange={setDate}
                    value={date}
                    onClickDay={handleDateClick}
                    tileContent={tileContent}
                    locale="pt-BR"
                />
            </Card>

            {/* Modal para adicionar gerador ou cliente (opcional) */}
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Novo Cadastro</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ marginTop: 2 }}>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                            label="Tipo"
                            value={newEntry.type}
                            onChange={(e) =>
                                setNewEntry({ ...newEntry, type: e.target.value })
                            }
                        >
                            <MenuItem value="generator">Gerador</MenuItem>
                            <MenuItem value="client">Cliente</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        sx={{ marginTop: 2 }}
                        label={
                            newEntry.type === "generator"
                                ? "Nome do Gerador"
                                : "Nome do Cliente"
                        }
                        value={newEntry.name}
                        onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                    />

                    {newEntry.type === "generator" && (
                        <TextField
                            fullWidth
                            sx={{ marginTop: 2 }}
                            label="Cliente Associado"
                            value={newEntry.client}
                            onChange={(e) =>
                                setNewEntry({ ...newEntry, client: e.target.value })
                            }
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveEntry} color="primary" variant="contained">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TechnicianCalendar;
