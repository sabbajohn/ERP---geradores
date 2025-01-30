import React, { useState, useEffect, useRef } from "react";
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Checkbox
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import SignatureCanvas from "react-signature-canvas";

const CHECKLIST_ITEMS = [
    { key: "verificarNivelLiquido", label: "Verificar e corrigir o nível do líquido de arrefecimento" },
    { key: "verificarVazamentos", label: "Verificar possíveis vazamentos" },
    // ... outros itens
];

const CHECKLIST_ITEMS_INPUT = [
    { key: "temperaturaLiquido", label: "Temperatura do líquido (Cº)" },
    { key: "pressaoOleo", label: "Pressão do óleo (Bar)" },
    // ... mantenha outros campos conforme necessário
];

function AttendanceDetails() {
    const navigate = useNavigate();
    const { maintenanceId } = useParams();

    const [loading, setLoading] = useState(true);
    const [maintenanceInfo, setMaintenanceInfo] = useState(null);

    // Campos do novo relatório
    const [checkInTime, setCheckInTime] = useState("");
    const [checkOutTime, setCheckOutTime] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [mileage, setMileage] = useState("");
    const [duration, setDuration] = useState("");

    // Checklist de checkboxes
    const [selectedChecklist, setSelectedChecklist] = useState([]);
    // Checklist de inputs
    const [checklistInputs, setChecklistInputs] = useState({});

    // Peças (inventory)
    const [availableParts, setAvailableParts] = useState([]);
    const [partsUsed, setPartsUsed] = useState([]); // array de objetos { objectId, name, salePrice, usedQuantity, ... }
    const [selectedPart, setSelectedPart] = useState("");

    // Fotos
    const [filesToUpload, setFilesToUpload] = useState([]);

    // Relatórios anteriores do gerador
    const [generatorReports, setGeneratorReports] = useState([]);

    // Modal de remover peça
    const [openConfirm, setOpenConfirm] = useState(false);
    const [confirmItemIndex, setConfirmItemIndex] = useState(-1);

    // Assinatura do Técnico
    const [signatureData, setSignatureData] = useState(null);
    const sigCanvas = useRef({});

    // Assinatura do Cliente
    const [clientSignatureData, setClientSignatureData] = useState(null);
    const clientSigCanvas = useRef({});

    // Novos estados para status, startTime, endTime e duration
    const [status, setStatus] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [calculatedDuration, setCalculatedDuration] = useState("");

    // =========================
    // useEffect - carrega dados
    // =========================
    useEffect(() => {
        fetchMaintenanceDetails();
        fetchInventoryItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maintenanceId]);

    // =========================
    // 1) Buscar dados da manutenção
    // =========================
    const fetchMaintenanceDetails = async () => {
        try {
            setLoading(true);
            const sessionToken = localStorage.getItem("sessionToken");
            if (!sessionToken) {
                throw new Error("Sessão inválida. Faça login novamente.");
            }

            const resp = await api.post(
                "/functions/getMaintenanceDetails",
                { maintenanceId },
                {
                    headers: {
                        "X-Parse-Session-Token": sessionToken,
                    },
                }
            );

            if (resp.data.result) {
                const data = resp.data.result;
                console.log("Dados da manutenção carregados:", data);

                setMaintenanceInfo(data);

                setStatus(data.status || "Agendada");
                setStartTime(data.startTime || "");
                setEndTime(data.endTime || "");
                setDuration(data.duration || "");

                if (data.startTime) setCheckInTime(data.startTime);
                if (data.endTime) setCheckOutTime(data.endTime);

                // Se houver gerador, busca relatórios anteriores
                if (data.generatorId?.objectId) {
                    fetchGeneratorReports(data.generatorId.objectId);
                }
            } else {
                alert("Erro: Nenhum dado de manutenção encontrado.");
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes da manutenção:", error);
            let errorMessage = "Erro ao buscar detalhes da manutenção.";
            if (error.response?.data?.error) {
                errorMessage += ` Detalhes: ${error.response.data.error}`;
            }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // 2) Buscar relatórios anteriores
    // =========================
    const fetchGeneratorReports = async (generatorId) => {
        try {
            const resp = await api.post(
                "/functions/getReportsByGenerator",
                { generatorId },
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );
            if (resp.data.result) {
                const reports = resp.data.result.map((report) => {
                    let parsedDate = null;
                    if (report.createdAt && report.createdAt.iso) {
                        parsedDate = new Date(report.createdAt.iso);
                        if (isNaN(parsedDate)) {
                            console.warn(`Formato de data inválido para relatório ID ${report.objectId}`);
                            parsedDate = null;
                        }
                    } else if (report.createdAt && typeof report.createdAt === "string") {
                        parsedDate = new Date(report.createdAt);
                        if (isNaN(parsedDate)) {
                            console.warn(`Formato de data inválido:`, report.createdAt);
                            parsedDate = null;
                        }
                    }
                    return { ...report, createdAt: parsedDate };
                });
                setGeneratorReports(reports);
            }
        } catch (error) {
            console.error("Erro ao buscar relatórios do gerador:", error.message);
        }
    };

    // =========================
    // 3) Buscar peças do estoque
    // =========================
    const fetchInventoryItems = async () => {
        try {
            const resp = await api.post(
                "/functions/getAllInventoryItems",
                {},
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );
            if (resp.data.result) {
                const mapped = resp.data.result.map((item) => ({
                    objectId: item.objectId,
                    name: item.itemName,
                    quantity: item.quantity || 0,
                    salePrice: item.salePrice || 0, // <--- importante para mostrar preço
                }));
                setAvailableParts(mapped);
            }
        } catch (error) {
            console.error("Erro ao buscar itens do estoque:", error.message);
        }
    };

    // =========================
    // 4) Iniciar e Finalizar Atendimento
    // =========================
    const handleStart = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken");
            if (!sessionToken) throw new Error("Sessão inválida. Faça login novamente.");

            const response = await api.post(
                "/functions/startMaintenance",
                { maintenanceId },
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );

            if (response.data.result && response.data.result.success) {
                setStatus(response.data.result.status);
                setStartTime(response.data.result.startTime);
                setCheckInTime(response.data.result.startTime);
                alert("Atendimento iniciado com sucesso.");
            } else {
                alert("Falha ao iniciar o atendimento.");
            }
        } catch (error) {
            console.error("Erro ao iniciar atendimento:", error);
            if (error.response?.data) {
                alert(`Erro: ${error.response.data.error}`);
            } else {
                alert("Erro ao iniciar o atendimento.");
            }
        }
    };

    const handleFinish = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken");
            if (!sessionToken) throw new Error("Sessão inválida. Faça login novamente.");

            const response = await api.post(
                "/functions/finishMaintenance",
                { maintenanceId },
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );

            if (response.data.result && response.data.result.success) {
                setStatus(response.data.result.status);
                setEndTime(response.data.result.endTime);
                setCalculatedDuration(response.data.result.duration);
                setCheckOutTime(response.data.result.endTime);
                setDuration(response.data.result.duration);
                alert("Atendimento finalizado com sucesso.");
            } else {
                alert("Falha ao finalizar o atendimento.");
            }
        } catch (error) {
            console.error("Erro ao finalizar atendimento:", error);
            if (error.response?.data) {
                alert(`Erro: ${error.response.data.error}`);
            } else {
                alert("Erro ao finalizar o atendimento.");
            }
        }
    };

    // =========================
    // 5) Checklist
    // =========================
    const handleToggleChecklist = (itemKey) => {
        if (selectedChecklist.includes(itemKey)) {
            setSelectedChecklist(selectedChecklist.filter((i) => i !== itemKey));
        } else {
            setSelectedChecklist([...selectedChecklist, itemKey]);
        }
    };

    const handleChecklistInputChange = (key, value) => {
        setChecklistInputs({ ...checklistInputs, [key]: value });
    };

    // =========================
    // 6) Peças trocadas (PartsUsed)
    // =========================

    // Adicionar peça com usedQuantity = 1
    const handleAddPart = () => {
        if (selectedPart) {
            const itemData = availableParts.find((x) => x.objectId === selectedPart);
            if (itemData) {
                setPartsUsed([...partsUsed, { ...itemData, usedQuantity: 1 }]);
            }
            setSelectedPart("");
        }
    };

    // Remover peça com confirmação
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

    // Ajustar quantidade (usedQuantity) da peça
    const handleQuantityChange = (index, newQty) => {
        if (newQty < 1) return; // não deixa zero ou negativo
        const updated = [...partsUsed];
        updated[index].usedQuantity = newQty;
        setPartsUsed(updated);
    };

    // =========================
    // 7) Upload de imagens
    // =========================
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFilesToUpload(files);
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const uploadAttachment = async (reportId, file) => {
        const base64File = await fileToBase64(file);
        await api.post(
            "/functions/uploadMaintenanceAttachment",
            {
                reportId,
                base64File,
                fileName: file.name,
            },
            {
                headers: {
                    "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                },
            }
        );
    };

    // =========================
    // 8) Assinaturas
    // =========================
    const clearSignature = () => {
        sigCanvas.current.clear();
        setSignatureData(null);
    };
    const saveSignature = () => {
        if (!sigCanvas.current.isEmpty()) {
            const dataURL = sigCanvas.current.toDataURL("image/png");
            setSignatureData(dataURL);
        } else {
            alert("Por favor, desenhe sua assinatura antes de salvar.");
        }
    };

    const clearClientSignature = () => {
        clientSigCanvas.current.clear();
        setClientSignatureData(null);
    };
    const saveClientSignature = () => {
        if (!clientSigCanvas.current.isEmpty()) {
            const dataURL = clientSigCanvas.current.toDataURL("image/png");
            setClientSignatureData(dataURL);
        } else {
            alert("Por favor, desenhe a assinatura do cliente antes de salvar.");
        }
    };

    // =========================
    // 9) Salvar Relatório
    // =========================
    const handleSaveReport = async () => {
        try {
            if (!checkInTime) {
                alert("Por favor, inicie o atendimento antes de salvar o relatório.");
                return;
            }
            if (!checkOutTime) {
                alert("Por favor, finalize o atendimento antes de salvar o relatório.");
                return;
            }
            if (!reportDescription) {
                alert("Por favor, descreva o atendimento realizado.");
                return;
            }

            // Verifica se assinaturas foram salvas
            if (!signatureData) {
                alert("Por favor, salve a assinatura do técnico antes de salvar o relatório.");
                return;
            }
            if (!clientSignatureData) {
                alert("Por favor, salve a assinatura do cliente antes de salvar o relatório.");
                return;
            }

            // Monta array de peças no formato que o backend espera
            const partsPayload = partsUsed.map((p) => ({
                itemId: p.objectId,
                quantity: p.usedQuantity || 1,
            }));

            // Checklist checkbox
            const checklistText = selectedChecklist.join(", ");

            // Checklist inputs
            const checklistInputsArray = Object.entries(checklistInputs).map(
                ([key, value]) => ({ key, value })
            );

            // Assinaturas em base64
            const technicianSignatureBase64 = signatureData;
            const customerSignatureBase64 = clientSignatureData;

            const resp = await api.post(
                "/functions/createMaintenanceReport",
                {
                    maintenanceId,
                    reportDescription,
                    mileage,
                    partsUsed: partsPayload,
                    checkInTime,
                    checkOutTime,
                    duration,
                    checklistText,
                    checklistInputsArray,
                    technicianSignature: technicianSignatureBase64,
                    customerSignature: customerSignatureBase64,
                    customerId: maintenanceInfo?.generatorId?.customerId?.objectId
                },
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );

            if (resp.data.result && resp.data.result.report) {
                const reportId = resp.data.result.report.objectId;
                // Sobe as fotos
                for (const file of filesToUpload) {
                    await uploadAttachment(reportId, file);
                }
                alert("Relatório salvo com sucesso!");

                // Reseta estados
                setCheckInTime("");
                setCheckOutTime("");
                setDuration("");
                setSelectedChecklist([]);
                setChecklistInputs({});
                setPartsUsed([]);
                setReportDescription("");
                setMileage("");
                setSignatureData(null);
                setClientSignatureData(null);
                sigCanvas.current.clear();
                clientSigCanvas.current.clear();

                navigate("/tecnico");
            } else {
                alert("Falha ao criar relatório.");
            }
        } catch (error) {
            console.error("Erro ao salvar relatório:", error);
            if (error.response?.data) {
                alert(`Falha ao salvar relatório: ${error.response.data.error}`);
            } else {
                alert("Falha ao salvar relatório. Verifique os campos e tente novamente.");
            }
        }
    };

    // =========================
    // Render Condicional
    // =========================
    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography>Carregando...</Typography>
                </Paper>
            </Container>
        );
    }

    if (!maintenanceInfo) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography color="error">Manutenção não encontrada.</Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/tecnico")}
                        sx={{ mt: 2 }}
                    >
                        Voltar
                    </Button>
                </Paper>
            </Container>
        );
    }

    // Extrai informações
    const generator = maintenanceInfo.generatorId || {};
    const customer = generator.customerId || {};
    const technician = maintenanceInfo.technicianUser || {};

    // Calcula total em peças
    const totalPartsCost = partsUsed.reduce(
        (acc, part) => acc + part.salePrice * part.usedQuantity,
        0
    );

    return (
        <Container maxWidth="sm" sx={{ mt: 2, mb: 2 }}>
            {/* Cabeçalho */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Ordem de Serviço - {maintenanceId}</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/tecnico")}
                    >
                        Voltar
                    </Button>
                </Box>
            </Paper>

            {/* Informações Automáticas */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography>
                    <strong>Localização:</strong> {generator.location || "Sem localização"}
                </Typography>
                <Typography>
                    <strong>Nome do Técnico:</strong> {technician.name || technician.username || "Técnico não identificado"}
                </Typography>
                <Typography>
                    <strong>Nome do Cliente:</strong> {customer.name || "Cliente não identificado"}
                </Typography>
                <Typography>
                    <strong>Status:</strong> {status}
                </Typography>
                {status === "Em andamento" && startTime && (
                    <Typography>
                        <strong>Hora de Início:</strong>{" "}
                        {new Date(startTime).toLocaleString("pt-BR")}
                    </Typography>
                )}
                {status === "Concluída" && endTime && (
                    <>
                        <Typography>
                            <strong>Hora de Início:</strong>{" "}
                            {new Date(startTime).toLocaleString("pt-BR")}
                        </Typography>
                        <Typography>
                            <strong>Hora de Finalização:</strong>{" "}
                            {new Date(endTime).toLocaleString("pt-BR")}
                        </Typography>
                        <Typography>
                            <strong>Duração:</strong> {calculatedDuration || duration}
                        </Typography>
                    </>
                )}
            </Paper>

            {/* Check-in / Check-out */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Check-in: {checkInTime ? new Date(checkInTime).toLocaleString("pt-BR") : "Não iniciado"}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 1 }}>
                    Check-out: {checkOutTime ? new Date(checkOutTime).toLocaleString("pt-BR") : "Não finalizado"}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 1 }}>
                    Duração: {duration || "N/A"}
                </Typography>

                <Box display="flex" gap={2} mt={2}>
                    <Button
                        variant="contained"
                        onClick={handleStart}
                        disabled={status === "Em andamento" || status === "Concluída"}
                    >
                        Iniciar Atendimento
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleFinish}
                        disabled={!checkInTime || status === "Concluída"}
                    >
                        Finalizar Atendimento
                    </Button>
                </Box>
            </Paper>

            {/* Relatórios Anteriores */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Relatórios Anteriores
                </Typography>
                <List sx={{ maxHeight: 150, overflowY: "auto" }}>
                    {generatorReports.map((rep, idx) => {
                        const dateStr = rep.createdAt
                            ? rep.createdAt.toLocaleString("pt-BR")
                            : "Data não encontrada";

                        const partsUsedStr = (rep.partsUsed || [])
                            .map((p) => `${p.itemName}(x${p.quantity})`)
                            .join(", ");

                        return (
                            <ListItem key={idx} divider>
                                <ListItemText
                                    primary={`Data: ${dateStr}`}
                                    secondary={`Relatório: ${rep.reportDescription || ""} | Peças: ${partsUsedStr}`}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>

            {/* Relato e Quilometragem */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Relato de Execução
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Descreva o atendimento realizado"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Quilometragem
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Informe a quilometragem"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                />
            </Paper>

            {/* Checklist de Marcar */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Checklist - Itens de Marcar
                </Typography>
                {CHECKLIST_ITEMS.map((item) => (
                    <Box key={item.key} display="flex" alignItems="center" mb={1}>
                        <Checkbox
                            checked={selectedChecklist.includes(item.key)}
                            onChange={() => handleToggleChecklist(item.key)}
                        />
                        <Typography>{item.label}</Typography>
                    </Box>
                ))}
            </Paper>

            {/* Checklist de Inputs */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Checklist - Campos de Entrada
                </Typography>
                {CHECKLIST_ITEMS_INPUT.map((inputItem) => (
                    <Box key={inputItem.key} mb={2}>
                        <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                            {inputItem.label}
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Digite o valor"
                            value={checklistInputs[inputItem.key] || ""}
                            onChange={(e) =>
                                handleChecklistInputChange(inputItem.key, e.target.value)
                            }
                        />
                    </Box>
                ))}
            </Paper>

            {/* Peças Trocadas (com preço e quantidade) */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Peças Trocadas / Solicitadas
                </Typography>
                <Box display="flex" gap={2}>
                    <FormControl fullWidth>
                        <InputLabel>Selecione a Peça</InputLabel>
                        <Select
                            value={selectedPart}
                            label="Selecione a Peça"
                            onChange={(e) => setSelectedPart(e.target.value)}
                        >
                            {availableParts.map((part) => (
                                <MenuItem key={part.objectId} value={part.objectId}>
                                    {/* Exibe também o preço unitário */}
                                    {part.name} - R$ {part.salePrice.toFixed(2)} (Estoque: {part.quantity})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        onClick={handleAddPart}
                        disabled={!selectedPart}
                    >
                        Adicionar
                    </Button>
                </Box>

                {/* Lista de peças adicionadas */}
                <List sx={{ mt: 2, maxHeight: 150, overflowY: "auto" }}>
                    {partsUsed.map((part, index) => {
                        const totalValue = part.salePrice * part.usedQuantity;

                        return (
                            <ListItem key={index} divider>
                                <ListItemText
                                    primary={`${part.name} (R$ ${part.salePrice.toFixed(2)} un.)`}
                                    secondary={
                                        `Qtde: ${part.usedQuantity} | Total: R$ ${totalValue.toFixed(2)}`
                                    }
                                />
                                {/* Botão - */}
                                <IconButton
                                    onClick={() => handleQuantityChange(index, part.usedQuantity - 1)}
                                >
                                    -
                                </IconButton>

                                {/* Botão + */}
                                <IconButton
                                    onClick={() => handleQuantityChange(index, part.usedQuantity + 1)}
                                >
                                    +
                                </IconButton>

                                {/* Botão Remover */}
                                <IconButton
                                    edge="end"
                                    color="error"
                                    onClick={() => handleRemovePart(index)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                        );
                    })}
                </List>

                {/* Total Final das Peças */}
                <Typography sx={{ mt: 2, fontWeight: "bold" }}>
                    Valor Total das Peças: R$ {totalPartsCost.toFixed(2)}
                </Typography>
            </Paper>

            {/* Upload de imagens */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Anexar Imagens
                </Typography>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ marginTop: "8px" }}
                />
            </Paper>

            {/* Assinatura do Técnico */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Assinatura do Técnico
                </Typography>
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
                />
                <Box mt={2} display="flex" gap={2}>
                    <Button variant="outlined" onClick={clearSignature}>
                        Limpar Assinatura
                    </Button>
                    <Button variant="contained" onClick={saveSignature}>
                        Salvar Assinatura
                    </Button>
                </Box>
                {signatureData && (
                    <Box mt={2}>
                        <Typography variant="subtitle2">Assinatura do Técnico Salva:</Typography>
                        <img
                            src={`data:image/png;base64,${signatureData}`}
                            alt="Assinatura do Técnico"
                            style={{ maxWidth: "100%", height: "auto" }}
                        />
                    </Box>
                )}
            </Paper>

            {/* Assinatura do Cliente */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Assinatura do Cliente
                </Typography>
                <SignatureCanvas
                    ref={clientSigCanvas}
                    penColor="blue"
                    canvasProps={{ width: 500, height: 200, className: "clientSigCanvas" }}
                />
                <Box mt={2} display="flex" gap={2}>
                    <Button variant="outlined" onClick={clearClientSignature}>
                        Limpar Assinatura
                    </Button>
                    <Button variant="contained" onClick={saveClientSignature}>
                        Salvar Assinatura
                    </Button>
                </Box>
                {clientSignatureData && (
                    <Box mt={2}>
                        <Typography variant="subtitle2">Assinatura do Cliente Salva:</Typography>
                        <img
                            src={`data:image/png;base64,${clientSignatureData}`}
                            alt="Assinatura do Cliente"
                            style={{ maxWidth: "100%", height: "auto" }}
                        />
                    </Box>
                )}
            </Paper>

            {/* Botão de Salvar Relatório */}
            <Box textAlign="center" mb={3}>
                <Button variant="contained" color="primary" onClick={handleSaveReport}>
                    Salvar Relatório
                </Button>
            </Box>

            {/* Modal para remover peça */}
            <Dialog open={openConfirm} onClose={cancelRemovePart}>
                <DialogTitle>Remover Peça</DialogTitle>
                <DialogContent>Deseja remover esta peça da lista?</DialogContent>
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
