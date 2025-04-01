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
  Pagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { IMaskInput } from "react-imask";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const TextMaskCustom = React.forwardRef(function TextMaskCustom(props, ref) {
  const { onChange, mask, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask={mask.mask ? mask.mask : mask}
      dispatch={mask.dispatch}
      unmask={false}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

// Máscara dinâmica para CPF/CNPJ
const docMask = {
  mask: [
    { mask: "000.000.000-00" },         // CPF (11 dígitos)
    { mask: "00.000.000/0000-00" },     // CNPJ (14 dígitos)
  ],
  dispatch: function (appended, dynamicMasked) {
    const number = (dynamicMasked.value + appended).replace(/\D/g, "");
    return number.length > 11
      ? dynamicMasked.compiledMasks[1]
      : dynamicMasked.compiledMasks[0];
  },
};

// Máscara dinâmica para telefone (fixo com 10 dígitos ou celular com 11 dígitos)
const phoneMask = {
  mask: [
    { mask: "(00) 0000-0000" },   // 10 dígitos (fixo)
    { mask: "(00) 00000-0000" },  // 11 dígitos (celular)
  ],
  dispatch: function (appended, dynamicMasked) {
    const number = (dynamicMasked.value + appended).replace(/\D/g, "");
    return number.length > 10
      ? dynamicMasked.compiledMasks[1]
      : dynamicMasked.compiledMasks[0];
  },
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    document: "",
    phone: "",
    email: "",
    address: "",
    bairro: "",
    cidade: "",
    observacao: "",
  });

  // Buscar clientes do backend
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

  // Abre modal para criar/editar
  const handleOpen = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || "",
        document: customer.document || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        bairro: customer.bairro || "",
        cidade: customer.cidade || "",
        observacao: customer.observacao || "",
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        document: "",
        phone: "",
        email: "",
        address: "",
        bairro: "",
        cidade: "",
        observacao: "",
      });
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
      const formattedDocument = formData.document.replace(/\D/g, "");
      const formattedPhone = formData.phone.replace(/\D/g, "");

      const payload = {
        name: formData.name,
        document: formattedDocument,
        phone: formattedPhone,
        email: formData.email,
        address: formData.address,
        bairro: formData.bairro,
        cidade: formData.cidade,
        observacao: formData.observacao,
      };

      if (editingCustomer) {
        // Atualiza
        await api.post(
          "/functions/updateCustomer",
          {
            customerId: editingCustomer.objectId,
            ...payload,
          },
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
            },
          }
        );
      } else {
        // Cria novo
        await api.post(
          "/functions/createCustomer",
          payload,
          {
            headers: {
              "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
            },
          }
        );
      }

      fetchCustomers();
      handleClose();
    } catch (error) {
      console.error(
        "Erro ao salvar cliente:",
        error.response?.data || error.message
      );
    }
  };

  // Excluir (Soft Delete)
  const handleDelete = async (customerId) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      await api.post(
        "/functions/softDeleteCustomer",
        { customerId },
        {
          headers: {
            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
          },
        }
      );
      fetchCustomers();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error.message);
    }
  };

  // Filtrar clientes
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredCustomers(customers);
      return;
    }
    const filtered = customers.filter(
      (customer) =>
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
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  // Exportar para PDF
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
        // Combina address, bairro e cidade para exibir
        [customer.address, customer.bairro, customer.cidade]
          .filter(Boolean)
          .join(", "),
      ]),
    });
    doc.save("clientes.pdf");
  };

  // Ao clicar no nome do cliente, navega para a página de detalhes
  const handleGoToDetails = (id) => {
    navigate(`/customers/${id}`);
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={4}>
        <Typography variant="h4">Clientes</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
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
                  <TableCell
                    style={{
                      cursor: "pointer",
                      color: "#1976d2",
                      textDecoration: "underline",
                    }}
                    onClick={() => handleGoToDetails(customer.objectId)}
                  >
                    {customer.name}
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  {/* Combina address, bairro e cidade em uma única exibição */}
                  <TableCell>
                    {[customer.address, customer.bairro, customer.cidade]
                      .filter(Boolean)
                      .join(", ")}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpen(customer)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(customer.objectId)}
                      >
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

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Modal para adicionar/editar clientes */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingCustomer ? "Editar Cliente" : "Adicionar Cliente"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <TextField
            margin="dense"
            label="CPF/CNPJ"
            name="document"
            fullWidth
            variant="outlined"
            value={formData.document}
            onChange={(e) =>
              setFormData({ ...formData, document: e.target.value })
            }
            InputProps={{
              inputComponent: TextMaskCustom,
              inputProps: {
                mask: docMask,
                name: "document",
              },
            }}
          />

          <TextField
            label="Telefone"
            fullWidth
            margin="dense"
            name="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            InputProps={{
              inputComponent: TextMaskCustom,
              inputProps: {
                mask: phoneMask,
                name: "phone",
              },
            }}
          />

          <TextField
            label="E-mail"
            fullWidth
            margin="dense"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <TextField
            label="Rua"
            fullWidth
            margin="dense"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />

          <TextField
            label="Bairro"
            fullWidth
            margin="dense"
            value={formData.bairro}
            onChange={(e) =>
              setFormData({ ...formData, bairro: e.target.value })
            }
          />

          <TextField
            label="Cidade (UF)"
            fullWidth
            margin="dense"
            value={formData.cidade}
            onChange={(e) =>
              setFormData({ ...formData, cidade: e.target.value })
            }
          />

          <TextField
            label="Observações"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            value={formData.observacao}
            onChange={(e) =>
              setFormData({ ...formData, observacao: e.target.value })
            }
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
