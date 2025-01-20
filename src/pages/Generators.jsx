import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../services/api";

function Generators() {
  const [generators, setGenerators] = useState([]);
  const [customersMap, setCustomersMap] = useState({});
  const [clients, setClients] = useState([]);

  // Estado para controlar abertura/fechamento do modal
  const [open, setOpen] = useState(false);
  // Armazena o gerador que está sendo editado
  const [editingGenerator, setEditingGenerator] = useState(null);

  // Estado do formulário dentro do modal
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    customerId: "",
    location: "",
    status: "active",
    lastMaintenanceDate: "",
    ownershipType: "Empresa",
    isDeleted: false,
  });

  // Estado para a barra de pesquisa
  const [searchTerm, setSearchTerm] = useState("");

  // 1) Buscar todos os clientes para mapear ID -> Nome
  const fetchCustomers = async () => {
    try {
      const response = await api.post("/functions/getAllCustomers", {}, {
        headers: {
          "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
        },
      });

      if (response.data.result) {
        const customerMap = {};
        response.data.result.forEach((customer) => {
          customerMap[customer.objectId] = customer.name; // Mapeia o ID para o Nome
        });
        setCustomersMap(customerMap);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error.message);
    }
  };

  // 2) Buscar todos os geradores
  const fetchGenerators = async () => {
    try {
      const response = await api.post("/functions/getAllGenerators", {}, {
        headers: {
          "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
        },
      });

      if (response.data.result) {
        setGenerators(response.data.result);
      }
    } catch (error) {
      console.error("Erro ao buscar geradores:", error.message);
    }
  };

  // useEffect para carregar clientes + geradores
  useEffect(() => {
    fetchCustomers();
    fetchGenerators();
  }, []);

  // Buscar lista de clientes para preencher dropdown no modal
  const fetchClients = async () => {
    try {
      const response = await api.post("/functions/getAllCustomers", {}, {
        headers: {
          "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
        },
      });
      if (response.data.result) {
        setClients(response.data.result);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error.message);
    }
  };

  // Carrega novamente geradores e clientes (se desejar)  
  useEffect(() => {
    fetchGenerators();
    fetchClients();
  }, []);

  // --------------------------------------
  // Abertura do modal (criação/edição)
  // --------------------------------------
  const handleOpen = (generator = null) => {
    if (generator) {
      // Edição
      setEditingGenerator(generator);
      setFormData({
        name: generator.name || "",
        serialNumber: generator.serialNumber || "",
        customerId: generator.customerId || "",
        location: generator.location || "",
        status: generator.status || "active",
        // Se lastMaintenanceDate vier em ISO, ex.: "2025-01-20T00:00:00.000Z", converte p/ "YYYY-MM-DD"
        lastMaintenanceDate: generator.lastMaintenanceDate
          ? generator.lastMaintenanceDate.slice(0, 10)
          : "",
        ownershipType: generator.ownershipType || "Empresa",
        isDeleted: false,
      });
    } else {
      // Criação
      setEditingGenerator(null);
      setFormData({
        name: "",
        serialNumber: "",
        customerId: "",
        location: "",
        status: "active",
        lastMaintenanceDate: "",
        ownershipType: "Empresa",
        isDeleted: false,
      });
    }
    setOpen(true);
  };

  // Fechar modal
  const handleClose = () => {
    setOpen(false);
  };

  // --------------------------------------
  // Salvar (Adicionar ou Editar) Gerador
  // --------------------------------------
  const handleSave = async () => {
    try {
      if (editingGenerator) {
        // Atualiza
        await api.post(
          "/functions/updateGenerator",
          {
            generatorId: editingGenerator.objectId,
            ...formData,
          },
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
            },
          }
        );
      } else {
        // Cria
        await api.post(
          "/functions/createGenerator",
          formData,
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
            },
          }
        );
      }
      fetchGenerators();
      handleClose();
    } catch (error) {
      console.error(
        "Erro ao salvar gerador:",
        error.response?.data || error.message
      );
    }
  };

  // --------------------------------------
  // Excluir Gerador (softDelete)
  // --------------------------------------
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

  // --------------------------------------
  // Filtro de busca local
  // --------------------------------------
  // Vamos converter o 'searchTerm' para minúsculo e comparar
  // tanto com o 'generator.name' quanto com o 'generator.customerName'.
  const filteredGenerators = generators.filter((g) => {
    const lowerSearch = searchTerm.toLowerCase();
    const generatorName = (g.name || "").toLowerCase();
    const customerName = (g.customerName || "").toLowerCase();

    return (
      generatorName.includes(lowerSearch) ||
      customerName.includes(lowerSearch)
    );
  });

  // --------------------------------------
  // Render
  // --------------------------------------
  return (
    <Container maxWidth="lg">
      {/* Título e Botão de Novo Gerador */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={4}
        mb={2}
      >
        <Typography variant="h4">Geradores</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Novo Gerador
        </Button>
      </Box>

      {/* Barra de Pesquisa */}
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

      {/* Tabela */}
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Número de Série</strong></TableCell>
              <TableCell><strong>Localização</strong></TableCell>
              {/* Nova coluna: Última Manutenção */}
              <TableCell><strong>Últ. Manutenção</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Propriedade</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredGenerators.map((generator) => (
              <TableRow key={generator.objectId}>
                <TableCell>{generator.name}</TableCell>
                <TableCell>
                  {generator.customerName
                    ? generator.customerName
                    : "Sem Cliente"}
                </TableCell>
                <TableCell>{generator.serialNumber}</TableCell>
                <TableCell>{generator.location}</TableCell>

                {/* Exibir data de última manutenção em DD/MM/YYYY ou "Sem data" */}
                <TableCell>
                  {generator.lastMaintenanceDate ? (
                    new Date(generator.lastMaintenanceDate).toLocaleDateString(
                      "pt-BR"
                    )
                  ) : (
                    "Sem data"
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    label={generator.status === "active" ? "Ativo" : "Inativo"}
                    color={
                      generator.status === "active"
                        ? "success"
                        : "error"
                    }
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={generator.ownershipType}
                    color={
                      generator.ownershipType === "Empresa"
                        ? "primary"
                        : "default"
                    }
                  />
                </TableCell>

                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(generator)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Excluir">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(generator.objectId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {/* Caso não encontre resultados na busca */}
            {filteredGenerators.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhum gerador encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para adicionar/editar geradores */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingGenerator ? "Editar Gerador" : "Adicionar Gerador"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do Gerador"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Número de Série"
            fullWidth
            margin="dense"
            value={formData.serialNumber}
            onChange={(e) =>
              setFormData({ ...formData, serialNumber: e.target.value })
            }
          />
          <TextField
            label="Localização"
            fullWidth
            margin="dense"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
          <TextField
            label="Status"
            select
            fullWidth
            margin="dense"
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </TextField>

          {/* Campo de data: Última Manutenção */}
          <TextField
            label="Última Manutenção"
            fullWidth
            margin="dense"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.lastMaintenanceDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                lastMaintenanceDate: e.target.value,
              })
            }
          />

          {/* Cliente (Opcional) */}
          <TextField
            label="Cliente (Opcional)"
            select
            fullWidth
            margin="dense"
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
            value={formData.customerId}
            onChange={(e) =>
              setFormData({ ...formData, customerId: e.target.value })
            }
          >
            <option value="">Sem Cliente</option>
            {clients.map((client) => (
              <option key={client.objectId} value={client.objectId}>
                {client.name}
              </option>
            ))}
          </TextField>

          {/* Propriedade do Gerador */}
          <TextField
            label="Propriedade do Gerador"
            select
            fullWidth
            margin="dense"
            SelectProps={{ native: true }}
            value={formData.ownershipType || "Empresa"}
            onChange={(e) =>
              setFormData({ ...formData, ownershipType: e.target.value })
            }
          >
            <option value="Empresa">Empresa</option>
            <option value="Terceiro">Terceiro</option>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            {editingGenerator ? "Salvar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Generators;
