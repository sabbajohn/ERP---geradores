import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Link } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import api from "../services/api";
import ChecklistItem from "../components/ChecklistItem";
import PhotoUpload from "../components/PhotoUpload";
import SignaturePad from "../components/SignaturePad"; // Componente de assinatura

// Itens padrão do checklist
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
    "Verificação do Filtro de Ar"
];


function ChecklistLocacao() {
    // Fluxo: "saida" ou "devolucao"
    const [fluxo, setFluxo] = useState("");

    // Dados do BD
    const [geradoresDisponiveis, setGeradoresDisponiveis] = useState([]);
    const [geradoresAlugados, setGeradoresAlugados] = useState([]);
    const [clientes, setClientes] = useState([]);

    // Seleções
    const [geradorSelecionado, setGeradorSelecionado] = useState(null);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [horimetro, setHorimetro] = useState("");

    // Checklist
    const [checklist, setChecklist] = useState(
        checklistItems.map((item) => ({ label: item, status: "", observacao: "" }))
    );

    // Fotos separadas: uma para saída, outra para devolução
    const [fotosSaida, setFotosSaida] = useState([]);
    const [fotosDevolucao, setFotosDevolucao] = useState([]);

    // Modais de Adicionar Gerador/Cliente
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

    // Modal de Assinaturas
    const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
    const [signatureCliente, setSignatureCliente] = useState("");
    const [signatureLoja, setSignatureLoja] = useState("");
    const [checklistIdToSign, setChecklistIdToSign] = useState(null);
    const [modoAssinatura, setModoAssinatura] = useState(""); // "saida" ou "devolucao"

    // Efeito para carregar dados
    useEffect(() => {
        fetchData();
    }, []);

    // =======================
    // 1) fetchData
    // =======================
    const fetchData = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";

            const [respDisponiveis, respAlugados, respClientes] = await Promise.all([
                api.post("/functions/getAvailableGenerators", {}, {
                    headers: { "X-Parse-Session-Token": sessionToken },
                }),
                api.post("/functions/getRentedGenerators", {}, {
                    headers: { "X-Parse-Session-Token": sessionToken },
                }),
                api.post("/functions/getAllCustomers", {}, {
                    headers: { "X-Parse-Session-Token": sessionToken },
                }),
            ]);

            if (respDisponiveis?.data?.result) {
                setGeradoresDisponiveis(respDisponiveis.data.result);
            }
            if (respAlugados?.data?.result) {
                setGeradoresAlugados(respAlugados.data.result);
            }
            if (respClientes?.data?.result) {
                setClientes(respClientes.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    };

    // =======================
    // 2) Manipulação Checklist
    // =======================
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

    // =======================
    // 3) Troca de Fluxo (Saída/Devolução)
    // =======================
    const handleFluxoChange = (event, newFluxo) => {
        if (!newFluxo) return;
        setFluxo(newFluxo);

        // Reseta
        setChecklist(
            checklistItems.map((item) => ({ label: item, status: "", observacao: "" }))
        );
        setFotosSaida([]);
        setFotosDevolucao([]);
        setHorimetro("");
        setGeradorSelecionado(null);
        setClienteSelecionado(null);
    };

    // =======================
    // 4) Converte File -> Base64
    // =======================
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // "data:image/png;base64,AAAB..."
                const base64string = (reader.result || "").toString().split(",")[1];
                resolve(base64string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // =======================
    // 5) uploadFotos => chama "saveChecklistPhotos"
    // =======================
    const uploadFotos = async (checklistId, flow, filesArray) => {
        if (!filesArray || filesArray.length === 0) return;

        const photosBase64 = [];
        for (const file of filesArray) {
            const b64 = await fileToBase64(file);
            photosBase64.push(b64);
        }

        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            await api.post(
                "/functions/saveChecklistPhotos",
                { checklistId, photosBase64, flow }, // <-- flow = "saida" ou "devolucao"
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );
            console.log("Fotos enviadas com sucesso para flow =", flow);
        } catch (error) {
            console.error("Erro ao enviar fotos:", error);
        }
    };

    // =======================
    // 6) Criar Locação (Saída)
    // =======================
    const handleCriarLocacao = async () => {
        if (!geradorSelecionado || !clienteSelecionado || !horimetro) {
            alert("Preencha todos os campos obrigatórios (Gerador, Cliente, Horímetro)!");
            return;
        }
        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const response = await api.post(
                "/functions/rentGenerator",
                {
                    generatorId: geradorSelecionado.objectId,
                    customerId: clienteSelecionado.objectId,
                    horimetroSaida: parseFloat(horimetro),
                    checklistSaida: checklist,
                },
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );

            if (response.data.result) {
                alert("Locação criada com sucesso!");
                const createdChecklist = response.data.result.checklist;
                if (createdChecklist?.objectId) {
                    // Envia fotos da saída
                    await uploadFotos(createdChecklist.objectId, "saida", fotosSaida);

                    // Abre modal de assinatura
                    setChecklistIdToSign(createdChecklist.objectId);
                    setModoAssinatura("saida");
                    setOpenSignatureDialog(true);
                }
            }
            await refreshGeradores();
            // Limpa
            setGeradorSelecionado(null);
            setClienteSelecionado(null);
            setHorimetro("");
            setChecklist(
                checklistItems.map((item) => ({ label: item, status: "", observacao: "" }))
            );
            setFotosSaida([]);
        } catch (error) {
            console.error("Erro ao criar locação (Saída):", error);
            alert("Erro ao criar locação: " + error.message);
        }
    };

    // =======================
    // 7) Finalizar Locação (Devolução)
    // =======================
    const handleFinalizarLocacao = async () => {
        if (!geradorSelecionado || !horimetro) {
            alert("Selecione o gerador alugado e informe o horímetro final!");
            return;
        }
        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const response = await api.post(
                "/functions/returnGenerator",
                {
                    generatorId: geradorSelecionado.objectId,
                    horimetroDevolucao: parseFloat(horimetro),
                    checklistDevolucao: checklist,
                },
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );
            if (response.data.result) {
                alert("Devolução realizada com sucesso!");
                const updatedChecklist = response.data.result.checklist;
                if (updatedChecklist?.objectId) {
                    // Envia fotos da devolução
                    await uploadFotos(updatedChecklist.objectId, "devolucao", fotosDevolucao);

                    // Abre modal de assinatura
                    setChecklistIdToSign(updatedChecklist.objectId);
                    setModoAssinatura("devolucao");
                    setOpenSignatureDialog(true);
                }
            }
            await refreshGeradores();
            // Limpa
            setGeradorSelecionado(null);
            setHorimetro("");
            setChecklist(
                checklistItems.map((item) => ({ label: item, status: "", observacao: "" }))
            );
            setFotosDevolucao([]);
        } catch (error) {
            console.error("Erro ao finalizar locação (Devolução):", error);
            alert("Erro ao finalizar locação: " + error.message);
        }
    };

    // =======================
    // 8) Refresh Geradores
    // =======================
    const refreshGeradores = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const [respDisponiveis, respAlugados] = await Promise.all([
                api.post("/functions/getAvailableGenerators", {}, {
                    headers: { "X-Parse-Session-Token": sessionToken },
                }),
                api.post("/functions/getRentedGenerators", {}, {
                    headers: { "X-Parse-Session-Token": sessionToken },
                }),
            ]);
            if (respDisponiveis?.data?.result) {
                setGeradoresDisponiveis(respDisponiveis.data.result);
            }
            if (respAlugados?.data?.result) {
                setGeradoresAlugados(respAlugados.data.result);
            }
        } catch (err) {
            console.error("Erro ao atualizar geradores:", err);
        }
    };

    // =======================
    // 9) Salvar Assinaturas
    // =======================
    const handleSaveSignatures = async () => {
        if (!checklistIdToSign) {
            alert("Checklist não encontrado para salvar assinaturas.");
            return;
        }
        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            // Monta params
            const params = { checklistId: checklistIdToSign };
            if (modoAssinatura === "saida") {
                params.signatureClienteSaida = signatureCliente;
                params.signatureLojaSaida = signatureLoja;
            } else if (modoAssinatura === "devolucao") {
                params.signatureClienteDevolucao = signatureCliente;
                params.signatureLojaDevolucao = signatureLoja;
            }

            const response = await api.post(
                "/functions/updateChecklistSignatures",
                params,
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );

            if (response.data.result) {
                alert("Assinaturas salvas com sucesso!");
            }
            // Fecha modal e limpa
            setOpenSignatureDialog(false);
            setSignatureCliente("");
            setSignatureLoja("");
            setChecklistIdToSign(null);
            setModoAssinatura("");
        } catch (error) {
            console.error("Erro ao salvar assinaturas:", error);
            alert("Erro ao salvar assinaturas: " + error.message);
        }
    };

    // =======================
    // Render do Checklist
    // =======================
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

    // =======================
    // Abrir/Cerrar modal Gerador
    // =======================
    const handleOpenGeneratorDialog = () => {
        setNewGeneratorData({
            name: "",
            serialNumber: "",
            status: "disponivel",
            location: "",
            purchaseDate: "",
            deliveryDate: "",
            lastMaintenanceDate: "",
        });
        setOpenGeneratorDialog(true);
    };
    const handleCloseGeneratorDialog = () => {
        setOpenGeneratorDialog(false);
    };
    const handleSaveNewGenerator = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const response = await api.post(
                "/functions/createGenerator",
                newGeneratorData,
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );
            if (response.data.result) {
                alert("Gerador criado com sucesso!");
                await refreshGeradores();
            }
            setOpenGeneratorDialog(false);
        } catch (error) {
            console.error("Erro ao criar gerador:", error);
            alert("Erro ao criar gerador: " + error.message);
        }
    };

    // =======================
    // Abrir/Cerrar modal Cliente
    // =======================
    const handleOpenCustomerDialog = () => {
        setNewCustomerData({
            name: "",
            document: "",
            phone: "",
            email: "",
            address: "",
        });
        setOpenCustomerDialog(true);
    };
    const handleCloseCustomerDialog = () => {
        setOpenCustomerDialog(false);
    };
    const handleSaveNewCustomer = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const response = await api.post(
                "/functions/createCustomer",
                newCustomerData,
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );
            if (response.data.result) {
                alert("Cliente criado com sucesso!");
                await fetchData();
            }
            setOpenCustomerDialog(false);
        } catch (error) {
            console.error("Erro ao criar cliente:", error);
            alert("Erro ao criar cliente: " + error.message);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            {/* Botão para Ver Histórico de Checklists */}
            <Box sx={{ textAlign: "right", mb: 2 }}>
                <Button variant="outlined" component={Link} to="/checklists">
                    Ver Histórico de Checklists
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
                <ToggleButton value="saida">Gerador Saindo</ToggleButton>
                <ToggleButton value="devolucao">Gerador Devolvendo</ToggleButton>
            </ToggleButtonGroup>

            {/* FLUXO DE SAÍDA */}
            {fluxo === "saida" && (
                <>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Selecione um Gerador (Disponível)</Typography>
                        <Autocomplete
                            options={geradoresDisponiveis}
                            getOptionLabel={(option) =>
                                `${option.serialNumber || option.numeroSerie || option.name} - ${option.name || "Sem Modelo"
                                }`
                            }
                            value={geradorSelecionado}
                            onChange={(event, newValue) => setGeradorSelecionado(newValue)}
                            renderInput={(params) => (
                                <MUITextField {...params} label="Gerador Disponível" fullWidth />
                            )}
                            sx={{ mt: 2 }}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Button variant="outlined" onClick={handleOpenGeneratorDialog}>
                                + Adicionar Gerador
                            </Button>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Selecione o Cliente</Typography>
                        <Autocomplete
                            options={clientes}
                            getOptionLabel={(option) =>
                                `${option.name || option.razaoSocial} - ${option.cnpj || ""}`
                            }
                            value={clienteSelecionado}
                            onChange={(event, newValue) => setClienteSelecionado(newValue)}
                            renderInput={(params) => (
                                <MUITextField {...params} label="Cliente" fullWidth />
                            )}
                            sx={{ mt: 2 }}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Button variant="outlined" onClick={handleOpenCustomerDialog}>
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
                        {/* Carrega fotos no estado fotosSaida */}
                        <PhotoUpload onFilesChange={(files) => setFotosSaida(files)} />
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

            {/* FLUXO DE DEVOLUÇÃO */}
            {fluxo === "devolucao" && (
                <>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Selecione um Gerador (Alugado)</Typography>
                        <Autocomplete
                            options={geradoresAlugados}
                            getOptionLabel={(option) => {
                                const generatorName = option.serialNumber || option.numeroSerie || option.name;
                                const clienteName =
                                    option.customerId && option.customerId.name
                                        ? option.customerId.name
                                        : "Sem Cliente";
                                return `${generatorName} - ${clienteName}`;
                            }}
                            value={geradorSelecionado}
                            onChange={(event, newValue) => setGeradorSelecionado(newValue)}
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
                        {/* Carrega fotos no estado fotosDevolucao */}
                        <PhotoUpload onFilesChange={(files) => setFotosDevolucao(files)} />
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

            {/* MODAL: Adicionar Gerador */}
            <Dialog
                open={openGeneratorDialog}
                onClose={handleCloseGeneratorDialog}
                maxWidth="xs"
                fullWidth
            >
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
                        onChange={(e) =>
                            setNewGeneratorData({ ...newGeneratorData, serialNumber: e.target.value })
                        }
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
                        onChange={(e) =>
                            setNewGeneratorData({ ...newGeneratorData, purchaseDate: e.target.value })
                        }
                    />
                    <TextField
                        label="Entrega Técnica"
                        type="date"
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        value={newGeneratorData.deliveryDate}
                        onChange={(e) =>
                            setNewGeneratorData({ ...newGeneratorData, deliveryDate: e.target.value })
                        }
                    />
                    <TextField
                        label="Última Manutenção"
                        type="date"
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                        value={newGeneratorData.lastMaintenanceDate}
                        onChange={(e) =>
                            setNewGeneratorData({ ...newGeneratorData, lastMaintenanceDate: e.target.value })
                        }
                    />

                    <TextField
                        label="Status"
                        select
                        fullWidth
                        margin="dense"
                        SelectProps={{ native: true }}
                        value={newGeneratorData.status}
                        onChange={(e) =>
                            setNewGeneratorData({ ...newGeneratorData, status: e.target.value })
                        }
                    >
                        <option value="disponivel">Disponível</option>
                        <option value="alugado">Alugado</option>
                        <option value="manutenção">Em Manutenção</option>
                        <option value="inativo">Inativo</option>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGeneratorDialog} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveNewGenerator} color="primary">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: Adicionar Cliente */}
            <Dialog
                open={openCustomerDialog}
                onClose={handleCloseCustomerDialog}
                maxWidth="xs"
                fullWidth
            >
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
                    <Button onClick={handleCloseCustomerDialog} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveNewCustomer} color="primary">
                        Adicionar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: Coleta de Assinaturas */}
            <Dialog
                open={openSignatureDialog}
                onClose={() => setOpenSignatureDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Coletar Assinaturas ({modoAssinatura})</DialogTitle>
                <DialogContent>
                    <Typography>Assinatura do Cliente</Typography>
                    <SignaturePad onChange={(base64) => setSignatureCliente(base64)} />

                    <Box sx={{ mt: 2 }} />
                    <Typography>Assinatura da Loja</Typography>
                    <SignaturePad onChange={(base64) => setSignatureLoja(base64)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSignatureDialog(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveSignatures} color="primary">
                        Salvar Assinaturas
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default ChecklistLocacao;
