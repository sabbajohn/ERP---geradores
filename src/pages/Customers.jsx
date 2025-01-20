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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import jsPDF from "jspdf";
import "jspdf-autotable";
import api from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // Buscar clientes do backend
  const fetchCustomers = async () => {
    try {
      const response = await api.post("/functions/getAllCustomers", {}, {
        headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") },
      });

      if (response.data.result) {
        setCustomers(response.data.result);
        setFilteredCustomers(response.data.result);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error.message);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpen = (customer = null) => {
    console.log("Abrindo modal para:", customer ? "Editar" : "Adicionar");
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: "", phone: "", email: "", address: "" });
    }
    setOpen(true);
  };

  // Fechar modal
  const handleClose = () => {
    setOpen(false);
  };

  // Salvar (Adicionar ou Editar) Cliente
  const handleSave = async () => {
    try {
      if (editingCustomer) {
        await api.post(
          "/functions/updateCustomer",
          { customerId: editingCustomer.objectId, ...formData },
          { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
        );
      } else {
        await api.post(
          "/functions/createCustomer",
          formData,
          { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
        );
      }
      fetchCustomers();
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error.response?.data || error.message);
    }
  };

  // Excluir Cliente
  const handleDelete = async (customerId) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      await api.post(
        "/functions/softDeleteCustomer",
        { customerId },
        { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
      );
      fetchCustomers();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error.message);
    }
  };

  // 🔎 Corrigido: Filtrar clientes corretamente
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredCustomers(customers);
      return;
    }
    const filtered = customers.filter((customer) =>
      customer.name?.toLowerCase().includes(query.toLowerCase()) ||
      customer.email?.toLowerCase().includes(query.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  };

  // Paginação
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 📄 Exportar para PDF (removido "document")
  const exportToPDF = () => {
    if (customers.length === 0) {
      alert("Nenhum cliente para exportar.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Relatório de Clientes", 14, 10);

    doc.autoTable({
      startY: 20,
      head: [["Nome", "Telefone", "Email", "Endereço"]],
      body: customers.map((customer) => [
        customer.name,
        customer.phone,
        customer.email,
        customer.address,
      ]),
    });

    doc.save("clientes.pdf");
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={4}>
        <Typography variant="h4">Clientes</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Novo Cliente
        </Button>
      </Box>

      <TextField
        label="Pesquisar Cliente (Nome, Telefone ou E-mail)"
        fullWidth
        margin="dense"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={exportToPDF}>
        Exportar Clientes (PDF)
      </Button>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Telefone</strong></TableCell>
              <TableCell><strong>E-mail</strong></TableCell>
              <TableCell><strong>Endereço</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => (
                <TableRow key={customer.objectId}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton color="primary" onClick={() => handleOpen(customer)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton color="error" onClick={() => handleDelete(customer.objectId)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Modal para adicionar/editar clientes */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editingCustomer ? "Editar Cliente" : "Adicionar Cliente"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="CNPJ/CPF"
            fullWidth
            margin="dense"
            value={formData.document}
            onChange={(e) => setFormData({ ...formData, document: e.target.value })}
          />
          <TextField
            label="Telefone"
            fullWidth
            margin="dense"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextField
            label="E-mail"
            fullWidth
            margin="dense"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            label="Endereço"
            fullWidth
            margin="dense"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            {editingCustomer ? "Salvar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default Customers;
