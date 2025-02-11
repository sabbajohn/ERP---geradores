import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar"; // react-calendar (mobile-friendly)
import "react-calendar/dist/Calendar.css";

import InputMask from "react-input-mask";

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

import LogoutIcon from "@mui/icons-material/Logout";

import api from "../services/api";

const TechnicianCalendar = () => {
    const navigate = useNavigate();

    // ID do técnico logado (obtido do localStorage)
    const [technicianId] = useState(() => {
        const id = localStorage.getItem("currentTechId") || "";
        console.log("Technician ID obtido:", id);
        return id;
    });

    const [date, setDate] = useState(new Date());
    const [maintenances, setMaintenances] = useState([]);
    const [openModal, setOpenModal] = useState(false);

    // Para popular o dropdown de clientes no formulário de gerador
    const [clients, setClients] = useState([]);

    // Estado para controlar qual formulário será exibido no modal:
    // "generator" ou "client"
    const [entryType, setEntryType] = useState("generator");

    // Estado para cadastro de cliente (campos conforme a tela de administrador)
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        document: "",
        phone: "",
        email: "",
        address: "",
    });

    // Estado para cadastro de gerador (campos conforme a tela de administrador)
    const [newGenerator, setNewGenerator] = useState({
        name: "",
        serialNumber: "",
        customerId: "",
        location: "",
        purchaseDate: "",
        deliveryDate: "",
        status: "disponivel", // valor padrão
        ownershipType: "Empresa",
    });

    useEffect(() => {
        fetchMaintenancesByTechnician();
    }, []);

    // Busca as manutenções do técnico logado
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

    // Busca todos os clientes para preencher o dropdown do gerador
    const fetchClients = async () => {
        try {
            const response = await api.post(
                "/functions/getAllCustomers",
                {},
                { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
            );
            if (response.data.result) {
                setClients(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar clientes:", error.message);
        }
    };

    // Executa a busca de clientes uma vez (para o formulário de gerador)
    useEffect(() => {
        fetchClients();
    }, []);

    // Logout: limpa os dados do localStorage e redireciona para o login
    const handleLogout = () => {
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("role");
        localStorage.removeItem("fullname");
        localStorage.removeItem("currentTechId");
        navigate("/login");
    };

    // Ao clicar em um dia do calendário, navega para a agenda do dia
    const handleDateClick = (value) => {
        const selectedDate = value.toISOString().split("T")[0]; // YYYY-MM-DD
        navigate(`/agenda/${selectedDate}`);
    };

    // Abre o modal e define o tipo padrão (pode ser alterado no select)
    const handleOpenModal = () => {
        setOpenModal(true);
    };

    // Fecha o modal e reseta os estados dos formulários
    const handleCloseModal = () => {
        setOpenModal(false);
        setEntryType("generator");
        setNewCustomer({
            name: "",
            document: "",
            phone: "",
            email: "",
            address: "",
        });
        setNewGenerator({
            name: "",
            serialNumber: "",
            customerId: "",
            location: "",
            purchaseDate: "",
            deliveryDate: "",
            status: "disponivel",
            ownershipType: "Empresa",
        });
    };

    // Salva o novo cadastro (cliente ou gerador) conforme o tipo selecionado
    const handleSaveEntry = async () => {
        if (entryType === "client") {
            // Prepara os dados removendo formatações de documento e telefone
            const payload = {
                ...newCustomer,
                document: newCustomer.document.replace(/\D/g, ""),
                phone: newCustomer.phone.replace(/\D/g, ""),
            };
            try {
                await api.post(
                    "/functions/createCustomer",
                    payload,
                    { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
                );
                // Aqui você pode exibir uma notificação de sucesso ou atualizar uma lista, se necessário.
            } catch (error) {
                console.error("Erro ao salvar cliente:", error.response?.data || error.message);
            }
        } else if (entryType === "generator") {
            try {
                await api.post(
                    "/functions/createGenerator",
                    newGenerator,
                    { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
                );
                // Aqui você pode exibir uma notificação de sucesso ou atualizar uma lista, se necessário.
            } catch (error) {
                console.error("Erro ao salvar gerador:", error.response?.data || error.message);
            }
        }
        handleCloseModal();
    };

    // Para marcar os dias do calendário que possuem manutenções
    const tileContent = ({ date: dayDate, view }) => {
        if (view === "month") {
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
            {/* Barra de navegação com botão de logout */}
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

            {/* Modal para cadastro de Cliente ou Gerador */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>Novo Cadastro</DialogTitle>
                <DialogContent>
                    {/* Seletor para o tipo de cadastro */}
                    <FormControl fullWidth sx={{ marginTop: 2 }}>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                            label="Tipo"
                            value={entryType}
                            onChange={(e) => setEntryType(e.target.value)}
                        >
                            <MenuItem value="generator">Gerador</MenuItem>
                            <MenuItem value="client">Cliente</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Formulário para Cliente */}
                    {entryType === "client" && (
                        <>
                            <TextField
                                fullWidth
                                sx={{ marginTop: 2 }}
                                label="Nome do Cliente"
                                value={newCustomer.name}
                                onChange={(e) =>
                                    setNewCustomer({ ...newCustomer, name: e.target.value })
                                }
                            />

                            <InputMask
                                mask={
                                    newCustomer.document.replace(/\D/g, "").length > 11
                                        ? "99.999.999/9999-99"
                                        : "999.999.999-99"
                                }
                                value={newCustomer.document}
                                onChange={(e) =>
                                    setNewCustomer({ ...newCustomer, document: e.target.value })
                                }
                            >
                                {(inputProps) => (
                                    <TextField {...inputProps} label="CPF/CNPJ" fullWidth margin="dense" />
                                )}
                            </InputMask>

                            <InputMask
                                mask="(99) 99999-9999"
                                value={newCustomer.phone}
                                onChange={(e) =>
                                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                                }
                            >
                                {(inputProps) => (
                                    <TextField {...inputProps} label="Telefone" fullWidth margin="dense" />
                                )}
                            </InputMask>

                            <TextField
                                fullWidth
                                sx={{ marginTop: 2 }}
                                label="E-mail"
                                value={newCustomer.email}
                                onChange={(e) =>
                                    setNewCustomer({ ...newCustomer, email: e.target.value })
                                }
                            />

                            <TextField
                                fullWidth
                                sx={{ marginTop: 2 }}
                                label="Endereço"
                                value={newCustomer.address}
                                onChange={(e) =>
                                    setNewCustomer({ ...newCustomer, address: e.target.value })
                                }
                            />
                        </>
                    )}

                    {/* Formulário para Gerador */}
                    {entryType === "generator" && (
                        <>
                            <TextField
                                fullWidth
                                sx={{ marginTop: 2 }}
                                label="Nome do Gerador"
                                value={newGenerator.name}
                                onChange={(e) =>
                                    setNewGenerator({ ...newGenerator, name: e.target.value })
                                }
                            />

                            <TextField
                                fullWidth
                                sx={{ marginTop: 2 }}
                                label="Número de Série"
                                value={newGenerator.serialNumber}
                                onChange={(e) =>
                                    setNewGenerator({ ...newGenerator, serialNumber: e.target.value })
                                }
                            />

                            <TextField
                                fullWidth
                                sx={{ marginTop: 2 }}
                                label="Localização"
                                value={newGenerator.location}
                                onChange={(e) =>
                                    setNewGenerator({ ...newGenerator, location: e.target.value })
                                }
                            />

                            <TextField
                                fullWidth
                                sx={{ marginTop: 2 }}
                                label="Data de Compra"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={newGenerator.purchaseDate}
                                onChange={(e) =>
                                    setNewGenerator({ ...newGenerator, purchaseDate: e.target.value })
                                }
                            />

                            <TextField
                                fullWidth
                                sx={{ marginTop: 2 }}
                                label="Data de Entrega Técnica"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={newGenerator.deliveryDate}
                                onChange={(e) =>
                                    setNewGenerator({ ...newGenerator, deliveryDate: e.target.value })
                                }
                            />

                            <TextField
                                label="Status"
                                select
                                fullWidth
                                margin="dense"
                                SelectProps={{ native: true }}
                                InputLabelProps={{ shrink: true }}
                                value={newGenerator.status}
                                onChange={(e) =>
                                    setNewGenerator({ ...newGenerator, status: e.target.value })
                                }
                            >
                                <option value="disponivel">Disponível</option>
                                <option value="alugado">Alugado</option>
                                <option value="em manutencao">Em Manutenção</option>
                                <option value="ativo">Ativo</option>
                            </TextField>

                            <TextField
                                label="Propriedade do Gerador"
                                select
                                fullWidth
                                margin="dense"
                                SelectProps={{ native: true }}
                                InputLabelProps={{ shrink: true }}
                                value={newGenerator.ownershipType}
                                onChange={(e) =>
                                    setNewGenerator({ ...newGenerator, ownershipType: e.target.value })
                                }
                            >
                                <option value="Empresa">Empresa</option>
                                <option value="Terceiro">Terceiro</option>
                            </TextField>

                            <TextField
                                label="Cliente (Opcional)"
                                select
                                fullWidth
                                margin="dense"
                                SelectProps={{ native: true }}
                                InputLabelProps={{ shrink: true }}
                                value={newGenerator.customerId}
                                onChange={(e) =>
                                    setNewGenerator({ ...newGenerator, customerId: e.target.value })
                                }
                            >
                                <option value="">Sem Cliente</option>
                                {clients.map((client) => (
                                    <option key={client.objectId} value={client.objectId}>
                                        {client.name}
                                    </option>
                                ))}
                            </TextField>
                        </>
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
