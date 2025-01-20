import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Paper,
    MenuItem,
    Link,
    Select,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function AttendanceDetails() {
    const navigate = useNavigate();
    const { maintenanceId } = useParams();

    const [loading, setLoading] = useState(true);
    const [maintenanceInfo, setMaintenanceInfo] = useState(null);

    const [report, setReport] = useState("");
    const [mileage, setMileage] = useState("");
    const [availableParts, setAvailableParts] = useState([]);
    const [partsUsed, setPartsUsed] = useState([]);
    const [selectedPart, setSelectedPart] = useState("");

    // Relatórios anteriores do gerador
    const [generatorReports, setGeneratorReports] = useState([]);

    // Para uploads de imagens
    const [filesToUpload, setFilesToUpload] = useState([]);

    const [openConfirm, setOpenConfirm] = useState(false);
    const [confirmItemIndex, setConfirmItemIndex] = useState(-1);

    useEffect(() => {
        fetchMaintenanceDetails();
        fetchInventoryItems();
    }, [maintenanceId]);

    // Busca detalhes da manutenção
    const fetchMaintenanceDetails = async () => {
        try {
            setLoading(true);
            const resp = await api.post(
                "/functions/getMaintenanceDetails",
                { maintenanceId },
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken")
                    }
                }
            );
            if (resp.data.result) {
                const data = resp.data.result;
                setMaintenanceInfo(data);
                // Depois de carregar a manutenção, puxa relatórios do gerador
                if (data.generatorId?.objectId) {
                    fetchGeneratorReports(data.generatorId.objectId);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da manutenção:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Busca relatórios anteriores do gerador
    const fetchGeneratorReports = async (generatorId) => {
        try {
            const resp = await api.post(
                "/functions/getReportsByGenerator",
                { generatorId },
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken")
                    }
                }
            );
            if (resp.data.result) {

                setGeneratorReports(resp.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar relatórios do gerador:", error.message);
        }
    };

    // Puxa itens do estoque
    const fetchInventoryItems = async () => {
        try {
            const resp = await api.post(
                "/functions/getAllInventoryItems",
                {},
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken")
                    }
                }
            );
            if (resp.data.result) {
                const mapped = resp.data.result.map((item) => ({
                    objectId: item.objectId,
                    name: item.itemName,
                    quantity: item.quantity || 0,
                    pricePerUnit: item.pricePerUnit || 0
                }));
                setAvailableParts(mapped);
            }
        } catch (error) {
            console.error("Erro ao buscar itens do estoque:", error.message);
        }
    };

    // Adiciona uma peça localmente
    const handleAddPart = () => {
        if (selectedPart) {
            const itemData = availableParts.find((x) => x.objectId === selectedPart);
            if (itemData) {
                setPartsUsed([...partsUsed, { ...itemData, usedQuantity: 1 }]);
            }
            setSelectedPart("");
        }
    };

    // Remove peça da lista local
    const handleRemovePart = (index) => {
        setConfirmItemIndex(index);
        setOpenConfirm(true);
    };

    const confirmRemovePart = () => {
        if (confirmItemIndex >= 0 && confirmItemIndex < partsUsed.length) {
            setPartsUsed(partsUsed.filter((_, i) => i !== confirmItemIndex));
        }
        setOpenConfirm(false);
        setConfirmItemIndex(-1);
    };

    const cancelRemovePart = () => {
        setOpenConfirm(false);
        setConfirmItemIndex(-1);
    };

    // Lida com upload de imagens: guarda no state "filesToUpload"
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFilesToUpload(files);
    };

    // Salva relatório + subtrai estoque + faz upload de anexos
    const handleSaveReport = async () => {
        try {
            // Monta partsUsed com { itemId, quantity }
            const partsPayload = partsUsed.map((p) => ({
                itemId: p.objectId,
                quantity: p.usedQuantity || 1
            }));

            // Chama createMaintenanceReport
            const resp = await api.post(
                "/functions/createMaintenanceReport",
                {
                    maintenanceId,
                    reportDescription: report,
                    mileage,
                    partsUsed: partsPayload
                },
                { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
            );
            if (resp.data.result && resp.data.result.report) {
                const newReportId = resp.data.result.report.objectId;

                // Se houver imagens, chama uploadMaintenanceAttachment para cada
                for (const file of filesToUpload) {
                    await uploadAttachment(newReportId, file);
                }

                alert("Relatório criado com sucesso!");
                navigate("/tecnico");
            } else {
                alert("Não foi possível criar relatório.");
            }
        } catch (error) {
            console.error("Erro ao salvar relatório:", error.message);
            alert("Falha ao salvar relatório. Tente novamente.");
        }
    };

    // Faz upload de um arquivo (convertendo em base64)
    const uploadAttachment = async (reportId, file) => {
        const base64File = await fileToBase64(file);
        await api.post(
            "/functions/uploadMaintenanceAttachment",
            {
                reportId,
                base64File,
                fileName: file.name
            },
            {
                headers: {
                    "X-Parse-Session-Token": localStorage.getItem("sessionToken")
                }
            }
        );
    };

    // Helper para converter File em base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]); // remove "data:<type>;base64,"
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ padding: 2, mt: 4 }}>
                <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
                    <Typography variant="body1">Carregando...</Typography>
                </Paper>
            </Container>
        );
    }

    if (!maintenanceInfo) {
        return (
            <Container maxWidth="sm" sx={{ padding: 2, mt: 4 }}>
                <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
                    <Typography variant="body1" color="error">
                        Manutenção não encontrada.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate("/tecnico")}
                        sx={{ mt: 2 }}
                    >
                        Voltar
                    </Button>
                </Paper>
            </Container>
        );
    }

    // Monta info
    const currentInfo = {
        time: `${maintenanceInfo.startTime} - ${maintenanceInfo.endTime}`,
        location: maintenanceInfo.generatorId?.location || "Endereço não informado",
        contact: maintenanceInfo.generatorId?.customerId
            ? `${maintenanceInfo.generatorId.customerId.name} - ${maintenanceInfo.generatorId.customerId.phone}`
            : "Contato não informado"
    };

    return (
        <Container maxWidth="sm" sx={{ padding: { xs: 2, sm: 4 }, mt: 4 }}>
            <Paper elevation={3} sx={{ padding: 3, backgroundColor: "#f9f9f9" }}>
                <Box>
                    <Typography variant="h5" gutterBottom textAlign="center" color="primary">
                        Detalhes do Atendimento
                    </Typography>

                    <Box mt={3} sx={{ backgroundColor: "#e3f2fd", padding: 2, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom color="primary">
                            Informações do Atendimento
                        </Typography>
                        <Typography>
                            <strong>Horário:</strong> {currentInfo.time}
                        </Typography>
                        <Typography>
                            <strong>Localização:</strong>{" "}
                            <Link
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    currentInfo.location
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="secondary"
                                underline="hover"
                            >
                                {currentInfo.location}
                            </Link>
                        </Typography>
                        <Typography>
                            <strong>Contato:</strong> {currentInfo.contact}
                        </Typography>
                    </Box>

                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom color="primary">
                            Relatórios Anteriores do Gerador
                        </Typography>
                        <List sx={{ maxHeight: 200, overflowY: "auto" }}>
                            {generatorReports.map((rep, idx) => {
                                const dateStr = new Date(rep.createdAt.iso).toLocaleString("pt-BR");

                                console.log(rep.createdAt)
                                console.log(dateStr)
                                const partsUsedStr = (rep.partsUsed || [])
                                    .map((p) => `${p.itemName} (x${p.quantity})`)
                                    .join(", ");
                                return (
                                    <ListItem
                                        key={idx}
                                        divider
                                        sx={{ borderLeft: "4px solid #03a9f4" }}
                                    >
                                        <ListItemText
                                            primary={`Em ${dateStr}`}
                                            secondary={`Relatório: ${rep.reportDescription || ""}. Peças: ${partsUsedStr || "Nenhuma"
                                                }`}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>

                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom color="secondary">
                            Relatório
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            placeholder="Descreva o atendimento realizado"
                            variant="outlined"
                            sx={{ backgroundColor: "#ffffff" }}
                        />
                    </Box>

                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom color="secondary">
                            Quilometragem Percorrida
                        </Typography>
                        <TextField
                            fullWidth
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                            placeholder="Informe a quilometragem (ex.: 120km)"
                            variant="outlined"
                            sx={{ backgroundColor: "#ffffff" }}
                        />
                    </Box>

                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom color="secondary">
                            Peças Trocadas
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                            <FormControl fullWidth>
                                <InputLabel>Selecione a Peça</InputLabel>
                                <Select
                                    label="Selecione a Peça"
                                    value={selectedPart}
                                    onChange={(e) => setSelectedPart(e.target.value)}
                                    variant="outlined"
                                    sx={{ backgroundColor: "#ffffff" }}
                                >
                                    {availableParts.map((partItem) => (
                                        <MenuItem key={partItem.objectId} value={partItem.objectId}>
                                            {partItem.name} (Estoque: {partItem.quantity})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button variant="contained" color="secondary" onClick={handleAddPart}>
                                Adicionar
                            </Button>
                        </Box>
                        <List sx={{ mt: 2, maxHeight: 150, overflowY: "auto" }}>
                            {partsUsed.map((part, index) => (
                                <ListItem
                                    key={index}
                                    divider
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => handleRemovePart(index)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                    sx={{ borderLeft: "4px solid #ff5722" }}
                                >
                                    <ListItemText
                                        primary={`${part.name} (1 unidade)`}
                                        secondary={`Estoque atual: ${part.quantity}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom color="secondary">
                            Anexar Imagens
                        </Typography>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ marginTop: "8px" }}
                        />
                    </Box>

                    <Box mt={4} display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveReport}
                            fullWidth
                        >
                            Salvar Relatório
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate("/tecnico")}
                            fullWidth
                            sx={{ borderColor: "#ff5722", color: "#ff5722" }}
                        >
                            Voltar
                        </Button>
                    </Box>
                </Box>
            </Paper>
            <br />
            <br />
            <br />
            <br />
            <Dialog open={openConfirm} onClose={cancelRemovePart}>
                <DialogTitle>Remover Peça</DialogTitle>
                <DialogContent>
                    <Typography>Tem certeza que deseja remover esta peça da lista?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelRemovePart} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={confirmRemovePart} color="error" variant="contained">
                        Remover
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default AttendanceDetails;
