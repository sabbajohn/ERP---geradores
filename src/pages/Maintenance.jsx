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
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../services/api";

function Maintenance() {
  const [maintenances, setMaintenances] = useState([]);
  const [generators, setGenerators] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);

  const [formData, setFormData] = useState({
    generatorId: "",
    technicianId: "",
    maintenanceDate: "",
    startTime: "",
    endTime: "",
    status: "Agendada",
  });

  // Converte "HH:MM" em minutos
  const timeStringToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  // Busca manutenções
  const fetchMaintenances = async () => {
    try {
      const response = await api.post(
        "/functions/getMaintenances",
        {},
        {
          headers: {
            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
          }
        }
      );

      if (response.data.result) {
        const formatted = response.data.result.map((m) => {
          const isoString = m.maintenanceDate?.iso || "";
          const justDate = isoString.split("T")[0]; // ex: "2025-02-21"
          return {
            objectId: m.objectId,
            generatorId: m.generatorId?.objectId || "",
            generatorName: m.generatorId?.name || "N/A",
            clientName: m.generatorId?.customerId?.name || "N/A", // Novo campo para nome do cliente
            technicianId: m.technicianId?.objectId || "",
            technicianName: m.technicianId?.name || "N/A",
            maintenanceDate: justDate,
            startTime: m.startTime || "",
            endTime: m.endTime || "",
            status: m.status,
          };
        });
        setMaintenances(formatted);
      }
    } catch (error) {
      console.error("Erro ao buscar manutenções:", error.message);
    }
  };

  // Busca geradores
  const fetchGenerators = async () => {
    try {
      const response = await api.post(
        "/functions/getAllGenerators",
        {},
        {
          headers: {
            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
          }
        }
      );

      if (response.data.result) {
        setGenerators(response.data.result);
      }
    } catch (error) {
      console.error("Erro ao buscar geradores:", error.message);
    }
  };

  // Busca técnicos
  const fetchTechnicians = async () => {
    try {
      const response = await api.post(
        "/functions/getAllTechnicians",
        {},
        {
          headers: {
            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
          }
        }
      );

      if (response.data.result) {
        setTechnicians(response.data.result);
      }
    } catch (error) {
      console.error("Erro ao buscar técnicos:", error.message);
    }
  };

  // Carrega dados iniciais
  useEffect(() => {
    fetchMaintenances();
    fetchGenerators();
    fetchTechnicians();
  }, []);

  // Abre modal (criação ou edição)
  const handleOpen = (maintenance = null) => {
    if (maintenance) {
      console.log("Editando manutenção:", maintenance); // <-- LOG do objeto a ser editado

      setEditingMaintenance(maintenance);
      setFormData({
        generatorId: maintenance.generatorId || "",
        technicianId: maintenance.technicianId || "",
        maintenanceDate: maintenance.maintenanceDate || "",
        startTime: maintenance.startTime || "",
        endTime: maintenance.endTime || "",
        status: maintenance.status || "Agendada",
      });
    } else {
      setEditingMaintenance(null);
      setFormData({
        generatorId: "",
        technicianId: "",
        maintenanceDate: "",
        startTime: "",
        endTime: "",
        status: "Agendada",
      });
    }
    setOpen(true);
  };

  // Fecha modal
  const handleClose = () => {
    setOpen(false);
  };

  // Cria/Atualiza Manutenção. Se criar nova, gera OS
  const handleSave = async () => {
    try {
      if (!formData.startTime || !formData.endTime) {
        alert("Informe horário de início e término.");
        return;
      }
      const newStartMin = timeStringToMinutes(formData.startTime);
      const newEndMin = timeStringToMinutes(formData.endTime);
      if (newStartMin >= newEndMin) {
        alert("Horário de início deve ser menor que o horário de término.");
        return;
      }

      // Verifica sobreposição de horário no mesmo dia e mesmo técnico
      const sameDay = maintenances.filter(
        (m) =>
          m.technicianId === formData.technicianId &&
          m.maintenanceDate === formData.maintenanceDate &&
          m.objectId !== editingMaintenance?.objectId // descarta a que está sendo editada
      );

      for (const m of sameDay) {
        if (m.status === "Concluída" || m.status === "Cancelada") continue;
        const existStart = timeStringToMinutes(m.startTime);
        const existEnd = timeStringToMinutes(m.endTime);
        const overlap = newStartMin < existEnd && newEndMin > existStart;
        if (overlap) {
          alert("Este técnico já possui manutenção neste horário!");
          return;
        }
      }

      const maintenancePayload = {
        generatorId: {
          __type: "Pointer",
          className: "Generators",
          objectId: formData.generatorId,
        },
        technicianId: {
          __type: "Pointer",
          className: "Technicians",
          objectId: formData.technicianId,
        },
        maintenanceDate: {
          __type: "Date",
          iso: new Date(formData.maintenanceDate).toISOString(),
        },
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status,
      };

      console.log("Dados da manutenção para salvar:", {
        editingMaintenance,
        ...maintenancePayload,
      }); // <-- LOG do que está sendo enviado no save

      let newMaintenanceId = null;

      // Se já estiver editando uma manutenção existente, chama update
      if (editingMaintenance) {
        await api.post(
          "/functions/updateMaintenance",
          {
            maintenanceId: editingMaintenance.objectId,
            ...maintenancePayload,
          },
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
            }
          }
        );
      } else {
        // Caso contrário, cria manutenção nova
        const respCreate = await api.post(
          "/functions/createMaintenance",
          maintenancePayload,
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
            }
          }
        );
        newMaintenanceId = respCreate.data?.result?.objectId;
      }

      // Se for nova manutenção e criou com sucesso, gera uma Ordem de Serviço (OS)
      if (!editingMaintenance && newMaintenanceId) {
        await api.post(
          "/functions/createOrder",
          {
            maintenanceId: {
              __type: "Pointer",
              className: "Maintenances",
              objectId: newMaintenanceId,
            },
            generatorId: {
              __type: "Pointer",
              className: "Generators",
              objectId: formData.generatorId,
            },
            technicianId: {
              __type: "Pointer",
              className: "Technicians",
              objectId: formData.technicianId,
            },
            status: "pending",
            description: "OS gerada automaticamente",
            date: new Date(formData.maintenanceDate).toISOString(),
          },
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
            }
          }
        );
      }

      // Atualiza a tabela
      fetchMaintenances();
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar manutenção:", error.message);
    }
  };

  // Exclui manutenção (soft delete)
  const handleDelete = async (maintenanceId) => {
    console.log("Excluindo manutenção ID:", maintenanceId); // <-- LOG do ID que está sendo excluído
    try {
      await api.post(
        "/functions/softDeleteMaintenance",
        { maintenanceId },
        {
          headers: {
            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
          }
        }
      );
      fetchMaintenances();
    } catch (error) {
      console.error("Erro ao deletar manutenção:", error.message);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={4}>
        <Typography variant="h4">Manutenções</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Agendar Manutenção
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Gerador</strong>
              </TableCell>
              <TableCell>
                <strong>Cliente</strong>
              </TableCell>
              <TableCell>
                <strong>Técnico</strong>
              </TableCell>
              <TableCell>
                <strong>Data</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Ações</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {maintenances.map((m) => (
              <TableRow key={m.objectId}>
                <TableCell>{m.generatorName}</TableCell>
                <TableCell>{m.clientName}</TableCell>
                <TableCell>{m.technicianName}</TableCell>
                <TableCell>
                  <Tooltip
                    title={
                      <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                        Horário: {m.startTime} - {m.endTime}
                      </span>
                    }
                  >
                    <span>
                      {m.maintenanceDate
                        ? m.maintenanceDate.split("-").reverse().join("/")
                        : "Sem Data"}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={m.status}
                    color={
                      m.status === "Concluída" || m.status === "completed"
                        ? "success"
                        : "warning"
                    }
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpen(m)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(m.objectId)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de criação/edição de manutenção */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingMaintenance ? "Editar Manutenção" : "Nova Manutenção"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Gerador"
            value={formData.generatorId}
            onChange={(e) => setFormData({ ...formData, generatorId: e.target.value })}
            margin="dense"
            InputLabelProps={{ shrink: true }}
            SelectProps={{ native: true }}
          >
            <option value="">Selecione um gerador</option>
            {generators.map((gen) => (
              <option key={gen.objectId} value={gen.objectId}>
                {gen.name}
              </option>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Técnico"
            value={formData.technicianId}
            onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
            margin="dense"
            InputLabelProps={{ shrink: true }}
            SelectProps={{ native: true }}
          >
            <option value="">Selecione um técnico</option>
            {technicians.map((tech) => (
              <option key={tech.objectId} value={tech.objectId}>
                {tech.name}
              </option>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Data da Manutenção"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.maintenanceDate}
            onChange={(e) => setFormData({ ...formData, maintenanceDate: e.target.value })}
            margin="dense"
          />

          <TextField
            fullWidth
            label="Horário de Início"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            margin="dense"
          />

          <TextField
            fullWidth
            label="Horário de Término"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            margin="dense"
          />

          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            margin="dense"
            SelectProps={{ native: true }}
          >
            <option value="Agendada">Agendada</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluída">Concluída</option>
            <option value="Cancelada">Cancelada</option>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            {editingMaintenance ? "Salvar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Maintenance;
