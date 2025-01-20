import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
    Box,
    Modal,
    Typography,
    Button,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputLabel
} from "@mui/material";
import api from "../services/api";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

const mensagens = {
    date: "Data",
    time: "Hora",
    event: "Evento",
    allDay: "Dia Inteiro",
    week: "Semana",
    work_week: "Semana de Trabalho",
    day: "Dia",
    month: "Mês",
    previous: "Anterior",
    next: "Próximo",
    yesterday: "Ontem",
    tomorrow: "Amanhã",
    today: "Hoje",
    agenda: "Agenda",
    noEventsInRange: "Não há eventos neste período.",
    showMore: (total) => `+ (${total}) eventos`
};

function CalendarioManutencoes() {
    const [eventos, setEventos] = useState([]);
    const [geradores, setGeradores] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [novoEvento, setNovoEvento] = useState({
        generatorId: "",
        technicianId: "",
        maintenanceDate: "",
        startTime: "",
        endTime: "",
        status: "Agendada"
    });

    useEffect(() => {
        buscarManutencoes();
        buscarGeradores();
        buscarTecnicos();
    }, []);

    const buscarManutencoes = async () => {
        try {
            const response = await api.post(
                "/functions/getMaintenances",
                {},
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken")
                    }
                }
            );

            if (response.data.result) {
                const formatados = response.data.result.map((m) => {
                    const isoString = m.maintenanceDate?.iso || "";
                    const startTime = m.startTime || "12:00"; // Horário padrão caso não exista
                    const endTime = m.endTime || "13:00"; // Horário padrão caso não exista

                    // Criar uma data fixa sem que o fuso altere o dia
                    const dataBase = moment.utc(isoString).startOf('day'); // Mantém a data original

                    // Definir horário de início corretamente
                    const dataInicio = dataBase.clone().set({
                        hour: parseInt(startTime.split(":")[0], 10),
                        minute: parseInt(startTime.split(":")[1], 10),
                        second: 0
                    }).toDate();

                    // Definir horário de término corretamente
                    const dataFim = dataBase.clone().set({
                        hour: parseInt(endTime.split(":")[0], 10),
                        minute: parseInt(endTime.split(":")[1], 10),
                        second: 0
                    }).toDate();

                    console.log("ISO String:", isoString);
                    console.log("Data Início Ajustada:", dataInicio);

                    return {
                        id: m.objectId,
                        title: `${m.generatorId?.name || "Sem Gerador"} - ${m.technicianId?.name || "Sem Técnico"}`,
                        start: dataInicio,
                        end: dataFim,
                        startTime: m.startTime || "",
                        endTime: m.endTime || "",
                        status: m.status || "Agendada"
                    };
                });


                setEventos(formatados);
            }
        } catch (error) {
            console.error("Erro ao buscar manutenções:", error.message);
        }
    };

    const buscarGeradores = async () => {
        try {
            const response = await api.post(
                "/functions/getAllGenerators",
                {},
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken")
                    }
                }
            );
            if (response.data.result) {
                setGeradores(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar geradores:", error.message);
        }
    };

    const buscarTecnicos = async () => {
        try {
            const response = await api.post(
                "/functions/getAllTechnicians",
                {},
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken")
                    }
                }
            );
            if (response.data.result) {
                setTecnicos(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar técnicos:", error.message);
        }
    };

    const aoSelecionarDia = (infoSlot) => {
        const dataStr = moment(infoSlot.start).format("YYYY-MM-DD");
        setNovoEvento({
            generatorId: "",
            technicianId: "",
            maintenanceDate: dataStr,
            startTime: "",
            endTime: "",
            status: "Agendada"
        });
        setModalAberto(true);
    };

    const aoEnviar = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                generatorId: {
                    __type: "Pointer",
                    className: "Generators",
                    objectId: novoEvento.generatorId
                },
                technicianId: {
                    __type: "Pointer",
                    className: "Technicians",
                    objectId: novoEvento.technicianId
                },
                maintenanceDate: {
                    __type: "Date",
                    iso: new Date(novoEvento.maintenanceDate).toISOString()
                },
                startTime: novoEvento.startTime,
                endTime: novoEvento.endTime,
                status: novoEvento.status
            };

            await api.post("/functions/createMaintenance", payload, {
                headers: {
                    "X-Parse-Session-Token": localStorage.getItem("sessionToken")
                }
            });

            buscarManutencoes();
            setModalAberto(false);
        } catch (error) {
            console.error("Erro ao criar manutenção:", error.message);
        }
    };

    const fecharModal = () => {
        setModalAberto(false);
    };

    const textoTooltip = (evento) => {
        return `Técnico: ${evento.technicianName}\nCliente: ${evento.clientName}\nHorário: ${evento.startTime || "?"
            } - ${evento.endTime || "?"}`;
    };

    const coresPorStatus = {
        Agendada: ["#2196f3", "#1E88E5", "#1565C0"],
        "Em Andamento": ["#ff9800", "#F57C00", "#EF6C00"],
        Concluída: ["#4caf50", "#43A047", "#388E3C"],
        Cancelada: ["#f44336", "#E53935", "#D32F2F"]
    };
    const corPadrao = ["#9c27b0", "#8E24AA", "#7B1FA2"];

    const estiloEvento = (evento) => {
        const paleta = coresPorStatus[evento.status] || corPadrao;
        const index = parseInt(evento.id, 36) % paleta.length;
        return {
            style: {
                backgroundColor: paleta[index],
                color: "#fff",
                borderRadius: "4px",
                margin: "3px 0"
            }
        };
    };

    return (
        <Box sx={{ height: "80vh", margin: "20px" }}>
            <Calendar
                localizer={localizer}
                culture="pt-BR"
                messages={mensagens}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={aoSelecionarDia}
                tooltipAccessor={textoTooltip}
                eventPropGetter={estiloEvento}
                style={{
                    height: "100%",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px"
                }}
            />

            <Modal open={modalAberto} onClose={fecharModal}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "#fff",
                        p: 4,
                        borderRadius: 2,
                        boxShadow: 24
                    }}
                >
                    <Typography variant="h5" mb={2}>
                        Agendar Manutenção
                    </Typography>
                    <form onSubmit={aoEnviar}>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Gerador</InputLabel>
                            <Select
                                value={novoEvento.generatorId}
                                label="Gerador"
                                onChange={(e) =>
                                    setNovoEvento({ ...novoEvento, generatorId: e.target.value })
                                }
                            >
                                {geradores.map((gen) => (
                                    <MenuItem key={gen.objectId} value={gen.objectId}>
                                        {gen.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="dense">
                            <InputLabel>Técnico</InputLabel>
                            <Select
                                value={novoEvento.technicianId}
                                label="Técnico"
                                onChange={(e) =>
                                    setNovoEvento({ ...novoEvento, technicianId: e.target.value })
                                }
                            >
                                {tecnicos.map((tech) => (
                                    <MenuItem key={tech.objectId} value={tech.objectId}>
                                        {tech.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            margin="dense"
                            label="Horário de Início"
                            type="time"
                            value={novoEvento.startTime}
                            onChange={(e) =>
                                setNovoEvento({ ...novoEvento, startTime: e.target.value })
                            }
                        />

                        <TextField
                            fullWidth
                            margin="dense"
                            label="Horário de Término"
                            type="time"
                            value={novoEvento.endTime}
                            onChange={(e) =>
                                setNovoEvento({ ...novoEvento, endTime: e.target.value })
                            }
                        />

                        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                            <Button variant="outlined" onClick={fecharModal}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="contained" color="primary">
                                Salvar
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
}

export default CalendarioManutencoes;
