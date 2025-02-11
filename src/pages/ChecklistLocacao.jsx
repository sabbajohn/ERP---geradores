import React, { useState, useEffect, useRef } from "react";
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Autocomplete,
    TextField as MUITextField,
    ToggleButton,
    ToggleButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import api from "../services/api";
import ChecklistItem from "../components/ChecklistItem";
import PhotoUpload from "../components/PhotoUpload";
import SignaturePad from "../components/SignaturePad";

const checklistItems = [
    "Verificação do Nível de Combustível no Tanque",
    "Verificação do Nível de Fluido de Arrefecimento no Radiador",
    "Verificação do Nível de Óleo no Cárter",
    "Partida do Gerador",
    "Verificação de Vazamentos no Radiador",
    "Verificação de Vazamentos na Bomba Injetora",
    "Verificação de Vazamentos no Bloco do Motor",
    "Verificação de Vazamentos no Cárter",
    "Verificação da Frequência",
    "Verificação do Módulo de Controle",
    "Verificação dos Terminais da Bateria",
    "Verificação dos Polos da Bateria",
    "Verificação dos Disjuntores de Comando e Força",
    "Verificação dos Filtros de Diesel",
    "Verificação dos Filtros de Óleo",
    "Verificação do Filtro de Ar",
];

function ChecklistLocacao() {
    const [fluxo, setFluxo] = useState("");
    const [geradoresDisponiveis, setGeradoresDisponiveis] = useState([]);
    const [geradoresAlugados, setGeradoresAlugados] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [geradorSelecionado, setGeradorSelecionado] = useState(null);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [horimetro, setHorimetro] = useState("");
    const [checklist, setChecklist] = useState(
        checklistItems.map((item) => ({ label: item, status: "", observacao: "" }))
    );
    const [fotosSaida, setFotosSaida] = useState([]);
    const [fotosDevolucao, setFotosDevolucao] = useState([]);
    const [openGeneratorDialog, setOpenGeneratorDialog] = useState(false);
    const [newGeneratorData, setNewGeneratorData] = useState({
        name: "",
        serialNumber: "",
        status: "disponivel",
        location: "",
        purchaseDate: "",
        deliveryDate: "",
        lastMaintenanceDate: "",
    });
    const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({
        name: "",
        document: "",
        phone: "",
        email: "",
        address: "",
    });
    const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
    const [signatureCliente, setSignatureCliente] = useState("");
    const [signatureLoja, setSignatureLoja] = useState("");
    const [checklistIdToSign, setChecklistIdToSign] = useState(null);
    const [modoAssinatura, setModoAssinatura] = useState("");
    const [signatureStep, setSignatureStep] = useState(1);
    const [signatureDimensions, setSignatureDimensions] = useState({
        width: 400,
        height: 200
    });

    const clientSignaturePadRef = useRef(null);
    const storeSignaturePadRef = useRef(null);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        fetchData();
        const updateDimensions = () => {
            if (window.matchMedia("(orientation: portrait)").matches) {
                setSignatureDimensions({
                    width: window.innerHeight * 0.7,
                    height: window.innerWidth * 0.5
                });
            } else {
                setSignatureDimensions({
                    width: window.innerWidth * 0.7,
                    height: window.innerHeight * 0.5
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const fetchData = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const [respDisponiveis, respAlugados, respClientes] = await Promise.all([
                api.post("/functions/getAvailableGenerators", {}, { headers: { "X-Parse-Session-Token": sessionToken } }),
                api.post("/functions/getRentedGenerators", {}, { headers: { "X-Parse-Session-Token": sessionToken } }),
                api.post("/functions/getAllCustomers", {}, { headers: { "X-Parse-Session-Token": sessionToken } })
            ]);

            setGeradoresDisponiveis(respDisponiveis?.data?.result || []);
            setGeradoresAlugados(respAlugados?.data?.result || []);
            setClientes(respClientes?.data?.result || []);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    };

    const handleStatusChange = (index, status) => {
        const updated = [...checklist];
        updated[index].status = status;
        setChecklist(updated);
    };

    const handleObservacaoChange = (index, obs) => {
        const updated = [...checklist];
        updated[index].observacao = obs;
        setChecklist(updated);
    };

    const handleFluxoChange = (event, newFluxo) => {
        if (!newFluxo) return;
        setFluxo(newFluxo);
        setChecklist(checklistItems.map((item) => ({ label: item, status: "", observacao: "" })));
        setFotosSaida([]);
        setFotosDevolucao([]);
        setHorimetro("");
        setGeradorSelecionado(null);
        setClienteSelecionado(null);
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result || "").toString().split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const uploadFotos = async (checklistId, flow, filesArray) => {
        if (!filesArray?.length) return;
        try {
            const photosBase64 = await Promise.all(filesArray.map(fileToBase64));
            const sessionToken = localStorage.getItem("sessionToken") || "";
            await api.post("/functions/saveChecklistPhotos",
                { checklistId, photosBase64, flow },
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );
        } catch (error) {
            console.error("Erro ao enviar fotos:", error);
        }
    };

    const handleCriarLocacao = async () => {
        if (!geradorSelecionado || !clienteSelecionado || !horimetro) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }
        if (checklist.some((item) => item.status === "")) {
            alert("Preencha todos os itens do checklist!");
            return;
        }

        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const response = await api.post("/functions/rentGenerator", {
                generatorId: geradorSelecionado.objectId,
                customerId: clienteSelecionado.objectId,
                horimetroSaida: parseFloat(horimetro),
                checklistSaida: checklist
            }, { headers: { "X-Parse-Session-Token": sessionToken } });

            if (response.data.result) {
                const createdChecklist = response.data.result.checklist;
                if (createdChecklist?.objectId) {
                    await uploadFotos(createdChecklist.objectId, "saida", fotosSaida);
                    setChecklistIdToSign(createdChecklist.objectId);
                    setModoAssinatura("saida");
                    setSignatureStep(1);
                    setOpenSignatureDialog(true);
                }
                await refreshGeradores();
                resetFormState();
            }
        } catch (error) {
            console.error("Erro ao criar locação:", error);
            alert("Erro: " + error.message);
        }
    };

    const handleFinalizarLocacao = async () => {
        if (!geradorSelecionado || !horimetro) {
            alert("Selecione o gerador e informe o horímetro!");
            return;
        }
        if (checklist.some((item) => item.status === "")) {
            alert("Preencha todos os itens do checklist!");
            return;
        }

        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const response = await api.post("/functions/returnGenerator", {
                generatorId: geradorSelecionado.objectId,
                horimetroDevolucao: parseFloat(horimetro),
                checklistDevolucao: checklist
            }, { headers: { "X-Parse-Session-Token": sessionToken } });

            if (response.data.result) {
                const updatedChecklist = response.data.result.checklist;
                if (updatedChecklist?.objectId) {
                    await uploadFotos(updatedChecklist.objectId, "devolucao", fotosDevolucao);
                    setChecklistIdToSign(updatedChecklist.objectId);
                    setModoAssinatura("devolucao");
                    setSignatureStep(1);
                    setOpenSignatureDialog(true);
                }
                await refreshGeradores();
                resetFormState();
            }
        } catch (error) {
            console.error("Erro na devolução:", error);
            alert("Erro: " + error.message);
        }
    };

    const refreshGeradores = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const [respDisponiveis, respAlugados] = await Promise.all([
                api.post("/functions/getAvailableGenerators", {}, { headers: { "X-Parse-Session-Token": sessionToken } }),
                api.post("/functions/getRentedGenerators", {}, { headers: { "X-Parse-Session-Token": sessionToken } })
            ]);
            setGeradoresDisponiveis(respDisponiveis?.data?.result || []);
            setGeradoresAlugados(respAlugados?.data?.result || []);
        } catch (err) {
            console.error("Erro ao atualizar geradores:", err);
        }
    };

    const handleSaveSignatures = async () => {
        if (!checklistIdToSign) {
            alert("Checklist não encontrado!");
            return;
        }

        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const params = {
                checklistId: checklistIdToSign,
                ...(modoAssinatura === "saida" ? {
                    signatureClienteSaida: signatureCliente,
                    signatureLojaSaida: signatureLoja
                } : {
                    signatureClienteDevolucao: signatureCliente,
                    signatureLojaDevolucao: signatureLoja
                })
            };

            await api.post("/functions/updateChecklistSignatures", params,
                { headers: { "X-Parse-Session-Token": sessionToken } });

            alert("Assinaturas salvas com sucesso!");
            closeSignatureDialog();
        } catch (error) {
            console.error("Erro ao salvar assinaturas:", error);
            alert("Erro: " + error.message);
        }
    };

    const resetFormState = () => {
        setGeradorSelecionado(null);
        setClienteSelecionado(null);
        setHorimetro("");
        setChecklist(checklistItems.map(item => ({ label: item, status: "", observacao: "" })));
        setFotosSaida([]);
        setFotosDevolucao([]);
    };

    const closeSignatureDialog = () => {
        setOpenSignatureDialog(false);
        setSignatureCliente("");
        setSignatureLoja("");
        setChecklistIdToSign(null);
        setModoAssinatura("");
        setSignatureStep(1);
        if (clientSignaturePadRef.current) clientSignaturePadRef.current.clear();
        if (storeSignaturePadRef.current) storeSignaturePadRef.current.clear();
    };

    const renderChecklist = () => (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">Checklist de Inspeção</Typography>
            <Box sx={{ mt: 2 }}>
                {checklist.map((item, index) => (
                    <ChecklistItem
                        key={index}
                        item={item}
                        index={index}
                        onStatusChange={handleStatusChange}
                        onObservacaoChange={handleObservacaoChange}
                    />
                ))}
            </Box>
        </Paper>
    );

    const renderSignatureContent = () => {
        const signatureStyle = {
            width: signatureDimensions.width,
            height: signatureDimensions.height,
            backgroundColor: '#f0f0f0',
            margin: 'auto'
        };

        if (signatureStep === 1) {
            return (
                <>
                    <Typography variant="h5" align="center" gutterBottom>
                        Assinatura do Cliente
                    </Typography>
                    <SignaturePad
                        key="client"
                        ref={clientSignaturePadRef}
                        onChange={setSignatureCliente}
                        style={signatureStyle}
                    />
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                        <Button variant="outlined" onClick={closeSignatureDialog} color="secondary">
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (!signatureCliente) {
                                    alert("Por favor, assine antes de avançar.");
                                    return;
                                }
                                setSignatureStep(2);
                            }}
                        >
                            Avançar
                        </Button>
                    </Box>
                </>
            );
        } else {
            return (
                <>
                    <Typography variant="h5" align="center" gutterBottom>
                        Assinatura da Loja
                    </Typography>
                    <SignaturePad
                        key="store"
                        ref={storeSignaturePadRef}
                        onChange={setSignatureLoja}
                        style={signatureStyle}
                    />
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setSignatureStep(1);
                                setSignatureLoja("");
                                if (storeSignaturePadRef.current) {
                                    storeSignaturePadRef.current.clear();
                                }
                            }}
                            color="secondary"
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveSignatures}
                            disabled={!signatureLoja}
                        >
                            Salvar Assinaturas
                        </Button>
                    </Box>
                </>
            );
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ textAlign: "right", mb: 2 }}>
                <Button variant="outlined" component={Link} to="/checklists">
                    Ver Histórico de Checklists
                </Button>
                <Button variant="outlined" component={Link} to="/dashboard" sx={{ ml: 2 }}>
                    Voltar
                </Button>
            </Box>

            <Typography variant="h4" gutterBottom>
                Checklist de Locação de Geradores
            </Typography>

            <ToggleButtonGroup
                color="primary"
                value={fluxo}
                exclusive
                onChange={handleFluxoChange}
                sx={{ mb: 3 }}
            >
                <ToggleButton value="saida">Saída</ToggleButton>
                <ToggleButton value="devolucao">Devolução</ToggleButton>
            </ToggleButtonGroup>

            {fluxo === "saida" && (
                <>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Selecione um Gerador (Disponível)</Typography>
                        <Autocomplete
                            options={geradoresDisponiveis}
                            getOptionLabel={(option) =>
                                `${option.serialNumber || option.name} - ${option.name || "Sem Modelo"}`
                            }
                            value={geradorSelecionado}
                            onChange={(_, newValue) => setGeradorSelecionado(newValue)}
                            renderInput={(params) => (
                                <MUITextField {...params} label="Gerador Disponível" fullWidth />
                            )}
                            sx={{ mt: 2 }}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Button variant="outlined" onClick={() => setOpenGeneratorDialog(true)}>
                                + Adicionar Gerador
                            </Button>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Selecione o Cliente</Typography>
                        <Autocomplete
                            options={clientes}
                            getOptionLabel={(option) =>
                                `${option.name} - ${option.document}`
                            }
                            value={clienteSelecionado}
                            onChange={(_, newValue) => setClienteSelecionado(newValue)}
                            renderInput={(params) => (
                                <MUITextField {...params} label="Cliente" fullWidth />
                            )}
                            sx={{ mt: 2 }}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Button variant="outlined" onClick={() => setOpenCustomerDialog(true)}>
                                + Adicionar Cliente
                            </Button>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Horímetro Inicial</Typography>
                        <TextField
                            fullWidth
                            type="number"
                            value={horimetro}
                            onChange={(e) => setHorimetro(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                    </Paper>

                    {renderChecklist()}

                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="h6">Evidências Fotográficas (Saída)</Typography>
                        <PhotoUpload onFilesChange={setFotosSaida} />
                    </Paper>

                    <Box textAlign="center" sx={{ mt: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<CheckIcon />}
                            onClick={handleCriarLocacao}
                        >
                            Confirmar Saída
                        </Button>
                    </Box>
                </>
            )}

            {fluxo === "devolucao" && (
                <>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Selecione um Gerador (Alugado)</Typography>
                        <Autocomplete
                            options={geradoresAlugados}
                            getOptionLabel={(option) =>
                                `${option.serialNumber || option.name} - ${option.customerId?.name || "Sem Cliente"}`
                            }
                            value={geradorSelecionado}
                            onChange={(_, newValue) => setGeradorSelecionado(newValue)}
                            renderInput={(params) => (
                                <MUITextField {...params} label="Gerador Alugado" fullWidth />
                            )}
                            sx={{ mt: 2 }}
                        />
                    </Paper>

                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Horímetro Final</Typography>
                        <TextField
                            fullWidth
                            type="number"
                            value={horimetro}
                            onChange={(e) => setHorimetro(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                    </Paper>

                    {renderChecklist()}

                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="h6">Evidências Fotográficas (Devolução)</Typography>
                        <PhotoUpload onFilesChange={setFotosDevolucao} />
                    </Paper>

                    <Box textAlign="center" sx={{ mt: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<CheckIcon />}
                            onClick={handleFinalizarLocacao}
                        >
                            Confirmar Devolução
                        </Button>
                    </Box>
                </>
            )}

            {/* Modais */}
            <Dialog open={openGeneratorDialog} onClose={() => setOpenGeneratorDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Adicionar Novo Gerador</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nome"
                        fullWidth
                        margin="dense"
                        value={newGeneratorData.name}
                        onChange={(e) => setNewGeneratorData({ ...newGeneratorData, name: e.target.value })}
                    />
                    <TextField
                        label="Número de Série"
                        fullWidth
                        margin="dense"
                        value={newGeneratorData.serialNumber}
                        onChange={(e) => setNewGeneratorData({ ...newGeneratorData, serialNumber: e.target.value })}
                    />
                    <TextField
                        label="Localização"
                        fullWidth
                        margin="dense"
                        value={newGeneratorData.location}
                        onChange={(e) => setNewGeneratorData({ ...newGeneratorData, location: e.target.value })}
                    />
                    <TextField
                        label="Data de Compra"
                        type="date"
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        value={newGeneratorData.purchaseDate}
                        onChange={(e) => setNewGeneratorData({ ...newGeneratorData, purchaseDate: e.target.value })}
                    />
                    <TextField
                        label="Entrega Técnica"
                        type="date"
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        value={newGeneratorData.deliveryDate}
                        onChange={(e) => setNewGeneratorData({ ...newGeneratorData, deliveryDate: e.target.value })}
                    />
                    <TextField
                        label="Última Manutenção"
                        type="date"
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        value={newGeneratorData.lastMaintenanceDate}
                        onChange={(e) => setNewGeneratorData({ ...newGeneratorData, lastMaintenanceDate: e.target.value })}
                    />
                    <TextField
                        label="Status"
                        select
                        fullWidth
                        margin="dense"
                        SelectProps={{ native: true }}
                        value={newGeneratorData.status}
                        onChange={(e) => setNewGeneratorData({ ...newGeneratorData, status: e.target.value })}
                    >
                        <option value="disponivel">Disponível</option>
                        <option value="alugado">Alugado</option>
                        <option value="manutenção">Em Manutenção</option>
                        <option value="inativo">Inativo</option>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenGeneratorDialog(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={async () => {
                            try {
                                const sessionToken = localStorage.getItem("sessionToken") || "";
                                await api.post("/functions/createGenerator", newGeneratorData, {
                                    headers: { "X-Parse-Session-Token": sessionToken }
                                });
                                await refreshGeradores();
                                setOpenGeneratorDialog(false);
                            } catch (error) {
                                alert("Erro ao criar gerador: " + error.message);
                            }
                        }}
                        color="primary"
                    >
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openCustomerDialog} onClose={() => setOpenCustomerDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nome"
                        fullWidth
                        margin="dense"
                        value={newCustomerData.name}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                    />
                    <TextField
                        label="CNPJ/CPF"
                        fullWidth
                        margin="dense"
                        value={newCustomerData.document}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, document: e.target.value })}
                    />
                    <TextField
                        label="Telefone"
                        fullWidth
                        margin="dense"
                        value={newCustomerData.phone}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                    />
                    <TextField
                        label="E-mail"
                        fullWidth
                        margin="dense"
                        value={newCustomerData.email}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                    />
                    <TextField
                        label="Endereço"
                        fullWidth
                        margin="dense"
                        value={newCustomerData.address}
                        onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCustomerDialog(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={async () => {
                            try {
                                const sessionToken = localStorage.getItem("sessionToken") || "";
                                await api.post("/functions/createCustomer", newCustomerData, {
                                    headers: { "X-Parse-Session-Token": sessionToken }
                                });
                                await fetchData();
                                setOpenCustomerDialog(false);
                            } catch (error) {
                                alert("Erro ao criar cliente: " + error.message);
                            }
                        }}
                        color="primary"
                    >
                        Adicionar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Assinaturas */}
            <Dialog
                open={openSignatureDialog}
                onClose={closeSignatureDialog}
                fullScreen={fullScreen}
                sx={{
                    "& .MuiDialog-paper": {
                        maxWidth: "100vw",
                        maxHeight: "100vh",
                        margin: 0,
                        borderRadius: 0,
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100vh",
                        padding: 2,
                        backgroundColor: "#fff",
                    }}
                >
                    {/* Cabeçalho */}
                    <Typography
                        variant="h5"
                        align="center"
                        sx={{
                            mb: 2,
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                        }}
                    >
                        {signatureStep === 1 ? "Assinatura do Cliente" : "Assinatura da Loja"}
                    </Typography>

                    {/* Área de Assinatura */}
                    <Box
                        sx={{
                            flex: 1,
                            border: "2px dashed #ccc",
                            borderRadius: 2,
                            mb: 2,
                            position: "relative",
                        }}
                    >
                        <SignaturePad
                            key={signatureStep}
                            ref={signatureStep === 1 ? clientSignaturePadRef : storeSignaturePadRef}
                            onChange={signatureStep === 1 ? setSignatureCliente : setSignatureLoja}
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: "#f8f9fa",
                            }}
                        />
                    </Box>

                    {/* Botões */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            justifyContent: "space-between",
                            "& button": {
                                flex: 1,
                                py: 1.5,
                                fontSize: "1rem",
                            },
                        }}
                    >
                        {signatureStep === 1 ? (
                            <>
                                <Button variant="outlined" onClick={closeSignatureDialog} color="secondary">
                                    Cancelar
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        if (!signatureCliente) {
                                            alert("Por favor, assine antes de avançar.");
                                            return;
                                        }
                                        setSignatureStep(2);
                                    }}
                                >
                                    Avançar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setSignatureStep(1);
                                        setSignatureLoja("");
                                        if (storeSignaturePadRef.current) {
                                            storeSignaturePadRef.current.clear();
                                        }
                                    }}
                                    color="secondary"
                                >
                                    Voltar
                                </Button>
                                <Button variant="contained" onClick={handleSaveSignatures} disabled={!signatureLoja}>
                                    Confirmar
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Dialog>
        </Container>
    );
}

export default ChecklistLocacao;
