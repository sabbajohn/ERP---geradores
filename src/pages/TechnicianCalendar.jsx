import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
    Box,
    Card,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";

import api from "../services/api";

// IMPORTAMOS OS NOVOS COMPONENTES DE MODAL
import GeneratorModal from "../components/GeneratorModal";
import ClientModal from "../components/ClientModal";

// IMPORTS DO MUI PARA O SPEED DIAL
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";

// Ícones para as ações do SpeedDial
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

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

    // Para abrir/fechar o modal
    const [openModal, setOpenModal] = useState(false);

    // Definimos se vamos abrir o modal de "generator" ou "client"
    const [entryType, setEntryType] = useState("generator");

    // --------------------------------------------------------------------
    // Para popular o dropdown de clientes (no GeneratorModal)
    // --------------------------------------------------------------------
    const [clients, setClients] = useState([]);

    // --------------------------------------------------------------------
    // Formulário de Cliente (usado no ClientModal)
    // --------------------------------------------------------------------
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        document: "",
        phone: "",
        email: "",
        address: "",
    });

    // --------------------------------------------------------------------
    // Formulário de Gerador (usado no GeneratorModal)
    // --------------------------------------------------------------------
    const [newGenerator, setNewGenerator] = useState({
        name: "",
        serialNumber: "",
        location: "",
        purchaseDate: "",
        lastMaintenanceDate: "",
        deliveryDate: "",
        horimetroAtual: "",
        status: "disponivel",
        motor: "",
        modelo: "",
        fabricante: "",
        potencia: "",
        customerId: "",
    });

    // Campos adicionais (extraFields) do gerador
    const [newGeneratorExtraFields, setNewGeneratorExtraFields] = useState([]);

    // --------------------------------------------------------------------
    // Efeitos para buscar dados iniciais
    // --------------------------------------------------------------------
    useEffect(() => {
        fetchMaintenancesByTechnician();
        fetchClients();
    }, []);

    // Busca as manutenções do técnico logado
    const fetchMaintenancesByTechnician = async () => {
        try {
            const response = await api.post(
                "/functions/getMaintenancesByTech",
                { technicianId }, // se for preciso passar no body
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );
            if (response.data.result) {
                setMaintenances(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar manutenções:", error.message);
        }
    };

    // Busca todos os clientes para preencher o dropdown do gerador
    const fetchClients = async () => {
        try {
            const response = await api.post(
                "/functions/getAllCustomers",
                {},
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );
            if (response.data.result) {
                setClients(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar clientes:", error.message);
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("role");
        localStorage.removeItem("fullname");
        localStorage.removeItem("currentTechId");
        navigate("/login");
    };

    // Clique em dia do calendário => navega para agenda daquele dia
    const handleDateClick = (value) => {
        const selectedDate = value.toISOString().split("T")[0]; // YYYY-MM-DD
        navigate(`/agenda/${selectedDate}`);
    };

    // Abre o modal definindo qual tipo de cadastro queremos
    const handleOpenModal = (type) => {
        setEntryType(type);
        setOpenModal(true);
    };

    // Fecha o modal e reseta states
    const handleCloseModal = () => {
        setOpenModal(false);
        setEntryType("generator"); // opcional, se quiser resetar

        // Reseta o formulário de gerador
        setNewGenerator({
            name: "",
            serialNumber: "",
            location: "",
            purchaseDate: "",
            lastMaintenanceDate: "",
            deliveryDate: "",
            horimetroAtual: "",
            status: "disponivel",
            motor: "",
            modelo: "",
            fabricante: "",
            potencia: "",
            customerId: "",
        });
        setNewGeneratorExtraFields([]);

        // Reseta o formulário de cliente
        setNewCustomer({
            name: "",
            document: "",
            phone: "",
            email: "",
            address: "",
        });
    };

    // ----------------------------------------------------------------------------
    // SALVAR CLIENTE
    // ----------------------------------------------------------------------------
    const handleSaveClient = async () => {
        try {
            // Remover máscaras (documento e telefone), se tiver
            const payload = {
                ...newCustomer,
                document: newCustomer.document.replace(/\D/g, ""),
                phone: newCustomer.phone.replace(/\D/g, ""),
            };

            await api.post("/functions/createCustomer", payload, {
                headers: {
                    "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                },
            });

            // Fechar modal
            handleCloseModal();
            // Se quiser recarregar lista de clientes
            fetchClients();
        } catch (error) {
            console.error("Erro ao salvar cliente:", error.response?.data || error.message);
        }
    };

    // ----------------------------------------------------------------------------
    // SALVAR GERADOR (com forceSchedule)
    // ----------------------------------------------------------------------------
    // Agora o "GeneratorModal" chamará onSave(forceSchedule).
    const handleSaveGenerator = async (forceSchedule) => {
        // Se o status for "Vendido", cliente é obrigatório
        if (newGenerator.status === "Vendido" && !newGenerator.customerId) {
            alert("É obrigatório informar o Cliente quando o gerador está 'Vendido'.");
            return;
        }

        const payload = {
            ...newGenerator,
            extraFields: newGeneratorExtraFields,
            forceSchedule, // <-- enviamos a flag se for marcada no modal
        };

        try {
            await api.post("/functions/createGenerator", payload, {
                headers: {
                    "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                },
            });
            // Fechar modal
            handleCloseModal();
        } catch (error) {
            console.error("Erro ao salvar gerador:", error.response?.data || error.message);
        }
    };

    // ----------------------------------------------------------------------------
    // FUNÇÕES PARA MANIPULAR OS CAMPOS EXTRAS DO GERADOR
    // ----------------------------------------------------------------------------
    const addNewGeneratorExtraField = () => {
        setNewGeneratorExtraFields((prev) => [
            ...prev,
            { fieldName: "", fieldValue: "" },
        ]);
    };
    const removeNewGeneratorExtraField = (index) => {
        const updated = [...newGeneratorExtraFields];
        updated.splice(index, 1);
        setNewGeneratorExtraFields(updated);
    };
    const handleNewGeneratorExtraFieldChange = (index, key, value) => {
        const updated = [...newGeneratorExtraFields];
        updated[index][key] = value;
        setNewGeneratorExtraFields(updated);
    };

    // ----------------------------------------------------------------------------
    // Marcar no calendário os dias com manutenção
    // ----------------------------------------------------------------------------
    const tileContent = ({ date: dayDate, view }) => {
        if (view === "month") {
            const dayString = dayDate.toISOString().split("T")[0];
            const count = maintenances.filter((m) => {
                let maintDateStr = "";
                if (typeof m.maintenanceDate === "string") {
                    // ex: "2025-02-21T00:00:00.000Z"
                    maintDateStr = m.maintenanceDate.split("T")[0];
                } else if (m.maintenanceDate?.iso) {
                    // ex: { __type: "Date", iso: "2025-02-21T00:00:00.000Z" }
                    maintDateStr = m.maintenanceDate.iso.split("T")[0];
                }
                return maintDateStr === dayString;
            }).length;

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
                                    borderRadius: "50%",
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
                    <IconButton edge="end" color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Card com o título (sem os botões) */}
            <Card sx={{ padding: 2, marginBottom: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Manutenções Programadas
                </Typography>
            </Card>

            {/* Calendário (dando uma margem extra pro FAB não cobrir) */}
            <Card sx={{ padding: 2, marginBottom: 8 }}>
                <Calendar
                    onChange={setDate}
                    value={date}
                    onClickDay={handleDateClick}
                    tileContent={tileContent}
                    locale="pt-BR"
                />
            </Card>

            {/* FAB SpeedDial no canto inferior direito */}
            <SpeedDial
                ariaLabel="SpeedDial para adicionar cadastros"
                sx={{ position: "fixed", bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
            >
                <SpeedDialAction
                    icon={<AddIcon />}
                    tooltipTitle="Adicionar Gerador"
                    onClick={() => handleOpenModal("generator")}
                />
                <SpeedDialAction
                    icon={<PersonAddIcon />}
                    tooltipTitle="Adicionar Cliente"
                    onClick={() => handleOpenModal("client")}
                />
            </SpeedDial>

            {/* MODAL DE GERADOR ou CLIENT, conforme entryType */}
            {entryType === "generator" && (
                <GeneratorModal
                    open={openModal}
                    onClose={handleCloseModal}
                    onSave={handleSaveGenerator}
                    // Formulários/estados do gerador
                    newGenerator={newGenerator}
                    setNewGenerator={setNewGenerator}
                    extraFields={newGeneratorExtraFields}
                    addExtraField={addNewGeneratorExtraField}
                    removeExtraField={removeNewGeneratorExtraField}
                    handleExtraFieldChange={handleNewGeneratorExtraFieldChange}
                    // Lista de clientes (para o dropdown)
                    clients={clients}
                    // Sempre criação => editing = false
                    editing={false}
                />
            )}

            {entryType === "client" && (
                <ClientModal
                    open={openModal}
                    onClose={handleCloseModal}
                    onSave={handleSaveClient}
                    // Formulários/estados do cliente
                    newCustomer={newCustomer}
                    setNewCustomer={setNewCustomer}
                />
            )}
        </Box>
    );
};

export default TechnicianCalendar;
