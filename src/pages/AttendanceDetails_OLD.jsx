
// src/pages/AttendanceDetails.jsx

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
    Checkbox,
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

    // Peças
    const [availableParts, setAvailableParts] = useState([]);
    const [partsUsed, setPartsUsed] = useState([]);
    const [selectedPart, setSelectedPart] = useState("");

    // Fotos
    const [filesToUpload, setFilesToUpload] = useState([]);

    // Relatórios anteriores do gerador
    const [generatorReports, setGeneratorReports] = useState([]);

    // Modal de remover peça
    const [openConfirm, setOpenConfirm] = useState(false);
    const [confirmItemIndex, setConfirmItemIndex] = useState(-1);

    // Assinatura do Técnico (opcional)
    const [signatureData, setSignatureData] = useState(null);
    const sigCanvas = useRef({});

    // Assinatura do Cliente
    const [customerSignature, setCustomerSignature] = useState(null);
    const customerSigCanvas = useRef({});


    // Novos estados para status, startTime, endTime e duration
    const [status, setStatus] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [calculatedDuration, setCalculatedDuration] = useState("");

    useEffect(() => {
        fetchMaintenanceDetails();
        fetchInventoryItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maintenanceId]);

    // Busca dados da manutenção
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

                // Armazena as informações da manutenção no estado
                setMaintenanceInfo(data);

                // Atualiza o status, startTime e endTime
                setStatus(data.status || "Agendada");
                setStartTime(data.startTime || "");
                setEndTime(data.endTime || "");
                setDuration(data.duration || "");

                // Se houver startTime, define checkInTime
                if (data.startTime) {
                    setCheckInTime(data.startTime);
                }

                // Se houver endTime, define checkOutTime
                if (data.endTime) {
                    setCheckOutTime(data.endTime);
                }

                // Busca relatórios anteriores do gerador se houver um ID válido
                if (data.generatorId?.objectId) {
                    fetchGeneratorReports(data.generatorId.objectId);
                }

                // Exibe os dados do técnico autenticado (debug)
                console.log("Técnico Autenticado:", data.technicianUser || "Não identificado");
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

    // Busca relatórios anteriores
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
                const reports = resp.data.result.map(report => {
                    console.log("Relatório recebido:", report); // Inspeciona o relatório completo
                    console.log("Campo createdAt:", report.createdAt); // Inspeciona o campo createdAt

                    let parsedDate = null;

                    // Verifica se createdAt possui a estrutura {__type: "Date", iso: "..." }
                    if (report.createdAt && report.createdAt.iso) {
                        parsedDate = new Date(report.createdAt.iso);
                        if (isNaN(parsedDate)) {
                            console.warn(`Formato de data inválido para o relatório ID ${report.objectId}:`, report.createdAt.iso);
                            parsedDate = null;
                        }
                    } else if (report.createdAt && typeof report.createdAt === "string") {
                        // Caso createdAt seja uma string simples
                        parsedDate = new Date(report.createdAt);
                        if (isNaN(parsedDate)) {
                            console.warn(`Formato de data inválido para o relatório ID ${report.objectId}:`, report.createdAt);
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

    // Busca estoque
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
                }));
                setAvailableParts(mapped);
            }
        } catch (error) {
            console.error("Erro ao buscar itens do estoque:", error.message);
        }
    };

    // Iniciar Atendimento
    const handleStart = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken");
            if (!sessionToken) {
                throw new Error("Sessão inválida. Faça login novamente.");
            }

            // Chama a função startMaintenance no backend
            const response = await api.post(
                '/functions/startMaintenance',
                { maintenanceId },
                {
                    headers: {
                        "X-Parse-Session-Token": sessionToken,
                    },
                }
            );

            if (response.data.result && response.data.result.success) {
                // Atualiza o estado local com o novo status e startTime
                setStatus(response.data.result.status);
                setStartTime(response.data.result.startTime);
                setCheckInTime(response.data.result.startTime);
                alert("Atendimento iniciado com sucesso.");
            } else {
                alert("Falha ao iniciar o atendimento.");
            }
        } catch (error) {
            console.error("Erro ao iniciar atendimento:", error);
            if (error.response && error.response.data) {
                alert(`Erro: ${error.response.data.error}`);
            } else {
                alert("Erro ao iniciar o atendimento.");
            }
        }
    };

    // Finalizar Atendimento
    const handleFinish = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken");
            if (!sessionToken) {
                throw new Error("Sessão inválida. Faça login novamente.");
            }

            // Chama a função finishMaintenance no backend
            const response = await api.post(
                '/functions/finishMaintenance',
                { maintenanceId },
                {
                    headers: {
                        "X-Parse-Session-Token": sessionToken,
                    },
                }
            );

            if (response.data.result && response.data.result.success) {
                // Atualiza o estado local com o novo status, endTime e duration
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
            if (error.response && error.response.data) {
                alert(`Erro: ${error.response.data.error}`);
            } else {
                alert("Erro ao finalizar o atendimento.");
            }
        }
    };

    // Marca/desmarca item checkbox
    const handleToggleChecklist = (itemKey) => {
        if (selectedChecklist.includes(itemKey)) {
            setSelectedChecklist(selectedChecklist.filter((i) => i !== itemKey));
        } else {
            setSelectedChecklist([...selectedChecklist, itemKey]);
        }
    };

    // Atualiza campos input do checklist
    const handleChecklistInputChange = (key, value) => {
        setChecklistInputs({ ...checklistInputs, [key]: value });
    };

    // Peças trocadas
    const handleAddPart = () => {
        if (selectedPart) {
            const itemData = availableParts.find((x) => x.objectId === selectedPart);
            if (itemData) {
                setPartsUsed([...partsUsed, { ...itemData, usedQuantity: 1 }]);
            }
            setSelectedPart("");
        }
    };

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

    // Upload de imagens
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFilesToUpload(files);
    };

    // Função auxiliar para converter dataURL em File (definida apenas uma vez)
    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(',');
        let mimeMatch = arr[0].match(/:(.*?);/);
        let mime = mimeMatch ? mimeMatch[1] : 'image/png';
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    // Função para criar o relatório com partsPayload como parâmetro
    const createReport = async (partsPayload) => {
        try {
            // Adicionar console.log para verificar os dados enviados
            console.log("Enviando dados para createMaintenanceReport:", {
                maintenanceId,
                reportDescription,
                mileage,
                partsUsed: partsPayload,
                checkInTime,
                checkOutTime,
                duration,
                checklistText,
                checklistInputsArray,
                customerId: maintenanceInfo?.generatorId?.customerId?.objectId
            });

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
                    checklistText, // itens marcados
                    checklistInputsArray, // itens digitados
                    customerId: maintenanceInfo?.generatorId?.customerId?.objectId
                },
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );

            console.log("Resposta de createMaintenanceReport:", resp.data);

            if (resp.data.result && resp.data.result.report) {
                return resp.data.result.report.objectId;
            } else {
                console.warn("createMaintenanceReport retornou sem report:", resp.data);
                alert("Falha ao criar relatório.");
                return null;
            }
        } catch (error) {
            console.error("Erro ao criar relatório:", error);
            if (error.response && error.response.data) {
                alert(`Falha ao criar relatório: ${error.response.data.error}`);
            } else {
                alert("Falha ao criar relatório. Verifique os campos e tente novamente.");
            }
            return null;
        }
    };

    // Função para fazer o upload das assinaturas
    const uploadSignatures = async (reportId, technicianSignature, customerSignature) => {
        try {
            // Adicionar console.log para verificar os dados enviados
            console.log("Enviando dados para uploadMaintenanceSignatures:", {
                reportId,
                technicianSignature,
                customerSignature
            });

            await api.post(
                "/functions/uploadMaintenanceSignatures",
                {
                    reportId,
                    technicianSignature, // string Base64
                    customerSignature, // string Base64
                },
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );
            return true;
        } catch (error) {
            console.error("Erro ao fazer upload das assinaturas:", error);
            if (error.response && error.response.data) {
                alert(`Falha ao fazer upload das assinaturas: ${error.response.data.error}`);
            } else {
                alert("Falha ao fazer upload das assinaturas. Tente novamente.");
            }
            return false;
        }
    };

    // Função para salvar o relatório e as assinaturas
    const handleSaveReport = async () => {
        try {
            // Validações básicas
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
            if (!signatureData) {
                alert("Por favor, forneça a assinatura do técnico.");
                return;
            }
            if (!customerSignature) {
                alert("Por favor, forneça a assinatura do cliente.");
                return;
            }

            // Preparar os dados do relatório
            const partsPayload = partsUsed.map((p) => ({
                itemId: p.objectId,
                quantity: p.usedQuantity || 1,
            }));

            // Adicionar console.log para verificar partsPayload
            console.log("partsPayload:", partsPayload);

            // Monta o checklist de checkbox
            const checklistText = selectedChecklist.join(", ");

            // Monta o checklist de inputs
            const checklistInputsArray = Object.entries(checklistInputs).map(
                ([key, value]) => ({
                    key,
                    value,
                })
            );

            // Assinaturas
            const technicianSignatureBase64 = signatureData.split(',')[1]; // Remover 'data:image/png;base64,'
            const customerSignatureBase64 = customerSignature.split(',')[1]; // Remover 'data:image/png;base64,'

            // Adicionar console.log para verificar as assinaturas
            console.log("technicianSignatureBase64:", technicianSignatureBase64);
            console.log("customerSignatureBase64:", customerSignatureBase64);

            // Criar o relatório
            const reportId = await createReport(partsPayload);
            if (!reportId) return;

            // Fazer o upload das assinaturas
            const uploadSuccess = await uploadSignatures(reportId, technicianSignatureBase64, customerSignatureBase64);
            if (!uploadSuccess) return;

            // Fazer o upload das outras imagens
            for (const file of filesToUpload) {
                await uploadAttachment(reportId, file); // Presumindo que uploadAttachment está corretamente configurada
            }

            alert("Relatório e assinaturas salvos com sucesso!");

            // Resetar os estados
            setCheckInTime("");
            setCheckOutTime("");
            setDuration("");
            setSelectedChecklist([]);
            setChecklistInputs({});
            setPartsUsed([]);
            setReportDescription("");
            setMileage("");
            setSignatureData(null);
            sigCanvas.current.clear();
            setCustomerSignature(null);
            customerSigCanvas.current.clear();

            navigate("/tecnico");
        } catch (error) {
            console.error("Erro ao salvar relatório:", error);
            alert("Falha ao salvar relatório. Verifique os campos e tente novamente.");
        }
    };

    const uploadAttachment = async (reportId, file) => {
        try {
            const base64File = await fileToBase64(file);
            console.log(`Uploading attachment: ${file.name}, base64 size: ${base64File.length}`);
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
            console.log(`Arquivo ${file.name} anexado com sucesso ao relatório ${reportId}.`);
        } catch (error) {
            console.error(`Erro ao anexar arquivo ${file.name}:`, error);
            alert(`Falha ao anexar o arquivo ${file.name}. Tente novamente.`);
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                // Verificar se o resultado está no formato esperado
                if (result.startsWith('data:image/')) {
                    resolve(result.split(",")[1]);
                } else {
                    console.warn("Formato de arquivo não suportado:", file.name);
                    reject(new Error("Formato de arquivo não suportado."));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Funções para a assinatura do técnico
    const clearSignature = () => {
        sigCanvas.current.clear();
        setSignatureData(null);
    };

    const saveSignature = () => {
        if (!sigCanvas.current.isEmpty()) {
            const dataURL = sigCanvas.current.toDataURL("image/png");
            setSignatureData(dataURL);
            console.log("Assinatura do técnico salva:", dataURL);
        } else {
            alert("Por favor, desenhe sua assinatura antes de salvar.");
        }
    };

    // Funções para a assinatura do cliente
    const clearCustomerSignature = () => {
        customerSigCanvas.current.clear();
        setCustomerSignature(null);
    };

    const saveCustomerSignature = () => {
        if (!customerSigCanvas.current.isEmpty()) {
            const dataURL = customerSigCanvas.current.toDataURL("image/png");
            setCustomerSignature(dataURL);
            console.log("Assinatura do cliente salva:", dataURL);
        } else {
            alert("Por favor, desenhe a assinatura do cliente antes de salvar.");
        }
    };

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

    // Extrai informações automáticas
    const generator = maintenanceInfo.generatorId || {};
    const customer = generator.customerId || {};
    const technician = maintenanceInfo.technicianUser || {};

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
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Informações Automáticas
                </Typography>
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
                {status === "Em andamento" && checkInTime && (
                    <Typography>
                        <strong>Hora de Início:</strong> {new Date(checkInTime).toLocaleString("pt-BR")}
                    </Typography>
                )}
                {status === "Concluída" && checkOutTime && (
                    <>
                        <Typography>
                            <strong>Hora de Início:</strong> {new Date(checkInTime).toLocaleString("pt-BR")}
                        </Typography>
                        <Typography>
                            <strong>Hora de Finalização:</strong> {new Date(checkOutTime).toLocaleString("pt-BR")}
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
                        disabled={status === "Em andamento" || status === "Concluída"} // Desativa se já iniciado ou finalizado
                    >
                        Iniciar Atendimento
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleFinish}
                        disabled={!checkInTime || status === "Concluída"} // Ativa somente após iniciar e desativa se já finalizado
                    >
                        Finalizar Atendimento
                    </Button>
                </Box>
            </Paper>

            {/* Relatórios anteriores do gerador */}
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

            {/* Relato de Execução e Quilometragem */}
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

            {/* Checklist de checkbox */}
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

            {/* Checklist de inputs */}
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

            {/* Peças trocadas */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Peças Trocadas
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
                                    {part.name} (Estoque: {part.quantity})
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
                        >
                            <ListItemText
                                primary={`${part.name}`}
                                secondary={`Quantidade Utilizada: ${part.usedQuantity}`}
                            />
                        </ListItem>
                    ))}
                </List>
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
                        <Typography variant="subtitle2">Assinatura Salva:</Typography>
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
                    ref={customerSigCanvas}
                    penColor="black"
                    canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
                    onEnd={() => {
                        const dataURL = customerSigCanvas.current.toDataURL("image/png");
                        setCustomerSignature(dataURL);
                        console.log("Assinatura do cliente capturada:", dataURL);
                    }}
                />
                <Box mt={2} display="flex" gap={2}>
                    <Button variant="outlined" onClick={clearCustomerSignature}>
                        Limpar Assinatura
                    </Button>
                    <Button
                        variant="contained"
                        onClick={saveCustomerSignature}
                    >
                        Salvar Assinatura
                    </Button>
                </Box>
                {customerSignature && (
                    <Box mt={2}>
                        <Typography variant="subtitle2">Assinatura do Cliente Salva:</Typography>
                        <img
                            src={`data:image/png;base64,${customerSignature}`}
                            alt="Assinatura do Cliente"
                            style={{ maxWidth: "100%", height: "auto" }}
                        />
                    </Box>
                )}
            </Paper>

            {/* Botão de Salvar */}
            <Box textAlign="center" mb={3}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveReport}
                >
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
                    <Button
                        onClick={confirmRemovePart}
                        color="error"
                        variant="contained"
                    >
                        Remover
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default AttendanceDetails;
