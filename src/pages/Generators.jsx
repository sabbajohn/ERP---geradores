import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import ConstructionIcon from "@mui/icons-material/Construction";
import { Link } from "react-router-dom";
import api from "../services/api";

import GeneratorModal from "../components/GeneratorModal";

function Generators() {
  const [generators, setGenerators] = useState([]);
  const [customersMap, setCustomersMap] = useState({});
  const [clients, setClients] = useState([]);

  // Estado para controle do modal "Novo Gerador" / "Editar Gerador"
  const [open, setOpen] = useState(false);

  // Guarda o gerador que está sendo editado (ou null para novo)
  const [editingGenerator, setEditingGenerator] = useState(null);

  // Estado principal para preencher o modal
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

  // Sub-form: extraFields
  const [extraFields, setExtraFields] = useState([]);

  // Campo de busca
  const [searchTerm, setSearchTerm] = useState("");

  // Snackbar para notificação com aviso maior
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Função auxiliar para formatar data no formato DD/MM/YYYY sem conversão de fuso horário
  const formatDateOnly = (dateString) => {
    if (!dateString) return "—";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  // --------------------------------------------
  // 1) BUSCAR CLIENTES E GERADORES
  // --------------------------------------------
  const fetchCustomers = async () => {
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
        const cMap = {};
        response.data.result.forEach((cust) => {
          cMap[cust.objectId] = cust.name;
        });
        setCustomersMap(cMap);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error.message);
    }
  };

  const fetchGenerators = async () => {
    try {
      const response = await api.post(
        "/functions/getAllGenerators",
        {},
        {
          headers: {
            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
          },
        }
      );
      if (response.data.result) {
        setGenerators(response.data.result);
      }
    } catch (error) {
      console.error("Erro ao buscar geradores:", error.message);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchGenerators();
    fetchClients();
    fetchInventoryItems();
  }, []);

  // Buscar lista de clientes para o dropdown
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

  // ----------------------------------------------
  // BUSCAR ITENS DO ESTOQUE
  // ----------------------------------------------
  const [inventoryItems, setInventoryItems] = useState([]);

  const fetchInventoryItems = async () => {
    try {
      const sessionToken = localStorage.getItem("sessionToken") || "";
      const res = await api.post(
        "/functions/getAllInventoryItems",
        {},
        { headers: { "X-Parse-Session-Token": sessionToken } }
      );
      if (res.data.result) {
        setInventoryItems(res.data.result);
      }
    } catch (error) {
      console.error("Erro ao buscar itens do estoque:", error.message);
    }
  };

  // --------------------------------------------
  // 2) FUNÇÃO PARA ABRIR O MODAL (novo ou editar)
  // --------------------------------------------
  const handleOpen = (generator = null) => {
    if (generator) {
      // Modo Edição: carrega todos os campos previamente preenchidos
      setEditingGenerator(generator);
      setNewGenerator({
        name: generator.name || "",
        serialNumber: generator.serialNumber || "",
        location: generator.location || "",
        purchaseDate: generator.purchaseDate ? generator.purchaseDate.slice(0, 10) : "",
        lastMaintenanceDate: generator.lastMaintenanceDate ? generator.lastMaintenanceDate.slice(0, 10) : "",
        deliveryDate: generator.deliveryDate ? generator.deliveryDate.slice(0, 10) : "",
        // Converte o horímetro para string, caso seja numérico
        horimetroAtual:
          generator.horimetroAtual !== undefined && generator.horimetroAtual !== null
            ? String(generator.horimetroAtual)
            : "",
        status: generator.status || "disponivel",
        motor: generator.motor || "",
        modelo: generator.modelo || "",
        fabricante: generator.fabricante || "",
        potencia: generator.potencia || "",
        // Se a API retornar o cliente em customerId ou dentro de um objeto customer
        customerId: generator.customerId || (generator.customer ? generator.customer.objectId : ""),
      });
      setExtraFields(generator.extraFields || []);
    } else {
      // Modo Novo
      setEditingGenerator(null);
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
      setExtraFields([]);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // --------------------------------------------
  // 3) SALVAR (Create ou Update)
  // --------------------------------------------
  const handleSave = async () => {
    try {
      if (newGenerator.status === "Vendido" && !newGenerator.customerId) {
        alert("É obrigatório informar o cliente ao vender o gerador.");
        return;
      }

      const payload = { ...newGenerator, extraFields };

      if (editingGenerator) {
        await api.post(
          "/functions/updateGenerator",
          {
            generatorId: editingGenerator.objectId,
            ...payload,
          },
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
            },
          }
        );
      } else {
        await api.post("/functions/createGenerator", payload, {
          headers: {
            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
          },
        });
      }

      fetchGenerators();
      handleClose();

      if (newGenerator.deliveryDate) {
        const deliveryDate = new Date(newGenerator.deliveryDate + "T12:00:00");
        const threeMonths = new Date(deliveryDate);
        threeMonths.setMonth(threeMonths.getMonth() + 3);
        const sixMonths = new Date(deliveryDate);
        sixMonths.setMonth(sixMonths.getMonth() + 6);
        const twelveMonths = new Date(deliveryDate);
        twelveMonths.setMonth(twelveMonths.getMonth() + 12);
        const message = `Manutenções agendadas para: ${threeMonths.toLocaleDateString("pt-BR")}, ${sixMonths.toLocaleDateString("pt-BR")} e ${twelveMonths.toLocaleDateString("pt-BR")}.`;
        setSnackbarMessage(message);
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Erro ao salvar gerador:", error.response?.data || error.message);
    }
  };

  // --------------------------------------------
  // 4) SOFT DELETE
  // --------------------------------------------
  const handleDelete = async (generatorId) => {
    if (!window.confirm("Tem certeza que deseja excluir este gerador?")) return;
    try {
      await api.post(
        "/functions/softDeleteGenerator",
        { generatorId },
        {
          headers: {
            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
          },
        }
      );
      fetchGenerators();
    } catch (error) {
      console.error("Erro ao excluir gerador:", error.message);
    }
  };

  // --------------------------------------------
  // 5) LÓGICA SUB-FORM EXTRA FIELDS
  // --------------------------------------------
  const addExtraField = () => {
    setExtraFields([...extraFields, { fieldName: "", fieldValue: "" }]);
  };

  const removeExtraField = (index) => {
    const updated = [...extraFields];
    updated.splice(index, 1);
    setExtraFields(updated);
  };

  const handleExtraFieldChange = (index, key, value) => {
    const updated = [...extraFields];
    updated[index][key] = value;
    setExtraFields(updated);
  };

  // --------------------------------------------
  // 6) PEÇAS DE DESGASTE (modal separado)
  // --------------------------------------------
  const [openPartsModal, setOpenPartsModal] = useState(false);
  const [partsGenerator, setPartsGenerator] = useState(null);
  const [generatorParts, setGeneratorParts] = useState([]);
  const [newPartData, setNewPartData] = useState({
    inventoryItemId: "",
    partName: "",
    intervalHours: "",
  });

  const handleOpenParts = async (generator) => {
    setPartsGenerator(generator);
    setOpenPartsModal(true);
    await loadGeneratorParts(generator.objectId);
  };

  const handleCloseParts = () => {
    setOpenPartsModal(false);
    setPartsGenerator(null);
    setGeneratorParts([]);
    setNewPartData({
      inventoryItemId: "",
      partName: "",
      intervalHours: "",
    });
  };

  const loadGeneratorParts = async (generatorId) => {
    try {
      const sessionToken = localStorage.getItem("sessionToken") || "";
      const res = await api.post(
        "/functions/getGeneratorParts",
        { generatorId },
        { headers: { "X-Parse-Session-Token": sessionToken } }
      );
      if (res.data.result) {
        setGeneratorParts(res.data.result);
      }
    } catch (error) {
      console.error("Erro ao buscar peças de desgaste:", error.message);
    }
  };

  const handleAddGeneratorPart = async () => {
    if (!newPartData.inventoryItemId && !newPartData.partName) {
      alert("Selecione um item do estoque ou informe um nome de peça.");
      return;
    }
    if (!newPartData.intervalHours) {
      alert("Defina o intervalo de horas de substituição.");
      return;
    }

    try {
      const sessionToken = localStorage.getItem("sessionToken") || "";
      const payload = {
        generatorId: partsGenerator.objectId,
        intervalHours: Number(newPartData.intervalHours) || 0,
      };

      if (newPartData.inventoryItemId) {
        payload.inventoryItemId = newPartData.inventoryItemId;
      } else {
        payload.partName = newPartData.partName;
      }

      await api.post("/functions/createGeneratorPart", payload, {
        headers: { "X-Parse-Session-Token": sessionToken },
      });
      alert("Peça adicionada com sucesso!");

      setNewPartData({
        inventoryItemId: "",
        partName: "",
        intervalHours: "",
      });

      loadGeneratorParts(partsGenerator.objectId);
    } catch (error) {
      console.error("Erro ao criar GeneratorPart:", error.message);
    }
  };

  const handleDeleteGeneratorPart = async (partId) => {
    if (!window.confirm("Tem certeza que deseja remover esta peça?")) return;
    try {
      const sessionToken = localStorage.getItem("sessionToken") || "";
      await api.post(
        "/functions/softDeleteGeneratorPart",
        { partId },
        { headers: { "X-Parse-Session-Token": sessionToken } }
      );
      loadGeneratorParts(partsGenerator.objectId);
    } catch (error) {
      console.error("Erro ao excluir peça:", error.message);
    }
  };

  // --------------------------------------------
  // FILTRO DE BUSCA
  // --------------------------------------------
  const filteredGenerators = generators.filter((g) => {
    const lowerSearch = searchTerm.toLowerCase();
    const generatorName = (g.name || "").toLowerCase();
    const customerName = (g.customerName || "").toLowerCase();
    return (
      generatorName.includes(lowerSearch) ||
      customerName.includes(lowerSearch)
    );
  });

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  return (
    <Container maxWidth="lg">
      {/* TÍTULO E BOTÃO CRIAR */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
        <Typography variant="h4">Geradores</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen(null)}>
          Novo Gerador
        </Button>
      </Box>

      {/* BARRA DE BUSCA */}
      <Box mb={2}>
        <TextField
          label="Buscar por Nome ou Cliente"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* TABELA DE GERADORES */}
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Número de Série</strong></TableCell>
              <TableCell><strong>Localização</strong></TableCell>
              <TableCell><strong>Data de Compra</strong></TableCell>
              <TableCell><strong>Entrega Técnica</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGenerators.map((generator) => (
              <TableRow key={generator.objectId}>
                <TableCell>
                  <Link to={`/generator/${generator.objectId}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {generator.name}
                  </Link>
                </TableCell>
                <TableCell>{generator.customerName || "Sem Cliente"}</TableCell>
                <TableCell>
                  <Link to={`/generator/${generator.objectId}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {generator.serialNumber}
                  </Link>
                </TableCell>
                <TableCell>{generator.location}</TableCell>
                <TableCell>{formatDateOnly(generator.purchaseDate)}</TableCell>
                <TableCell>{formatDateOnly(generator.deliveryDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      generator.status === "disponivel"
                        ? "Em estoque"
                        : generator.status === "alugado"
                          ? "Alugado"
                          : generator.status === "em manutencao"
                            ? "Em Manutenção"
                            : generator.status === "Vendido"
                              ? "Vendido"
                              : generator.status === "Terceiro"
                                ? "Terceiro"
                                : generator.status
                    }
                    color={
                      generator.status === "disponivel"
                        ? "primary"
                        : generator.status === "alugado"
                          ? "warning"
                          : generator.status === "em manutencao"
                            ? "error"
                            : generator.status === "Vendido"
                              ? "success"
                              : generator.status === "Terceiro"
                                ? "info"
                                : "default"
                    }
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => handleOpen(generator)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Peças de Desgaste">
                    <IconButton color="secondary" onClick={() => handleOpenParts(generator)}>
                      <ConstructionIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton color="error" onClick={() => handleDelete(generator.objectId)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredGenerators.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">Nenhum gerador encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para gerador */}
      <GeneratorModal
        open={open}
        onClose={handleClose}
        onSave={handleSave}
        newGenerator={newGenerator}
        setNewGenerator={setNewGenerator}
        clients={clients}
        extraFields={extraFields}
        addExtraField={addExtraField}
        removeExtraField={removeExtraField}
        handleExtraFieldChange={handleExtraFieldChange}
        editing={!!editingGenerator}
      />

      {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" variant="filled" sx={{ fontSize: "1.2rem", padding: "16px" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Modal para peças de desgaste */}
      <Dialog open={openPartsModal} onClose={handleCloseParts} maxWidth="sm" fullWidth>
        <DialogTitle>Peças de Desgaste</DialogTitle>
        <DialogContent>
          {partsGenerator && (
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Gerador: <strong>{partsGenerator.name}</strong> - Serial: <strong>{partsGenerator.serialNumber}</strong>
            </Typography>
          )}
          {generatorParts.map((part) => (
            <Box key={part.objectId} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography>
                <strong>{part.partName}</strong> : Intervalo: {part.intervalHours}h | Horas Usadas: {part.currentHours || 0}
              </Typography>
              <IconButton color="error" onClick={() => handleDeleteGeneratorPart(part.objectId)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Box sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: "4px" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Adicionar Nova Peça</Typography>
            <TextField
              select
              label="Selecione um Item do Estoque (opcional)"
              variant="outlined"
              margin="dense"
              fullWidth
              value={newPartData.inventoryItemId}
              onChange={(e) =>
                setNewPartData({ ...newPartData, inventoryItemId: e.target.value })
              }
            >
              <MenuItem value=""><em>Nenhum selecionado</em></MenuItem>
              {inventoryItems.map((item) => (
                <MenuItem key={item.objectId} value={item.objectId}>
                  {item.itemName} (Estoque: {item.quantity})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Intervalo de Horas"
              fullWidth
              margin="dense"
              type="number"
              value={newPartData.intervalHours}
              onChange={(e) =>
                setNewPartData({ ...newPartData, intervalHours: e.target.value })
              }
            />
            <Box sx={{ textAlign: "right", mt: 2 }}>
              <Button variant="contained" onClick={handleAddGeneratorPart}>
                Adicionar Peça
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseParts} color="secondary">Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Generators;
