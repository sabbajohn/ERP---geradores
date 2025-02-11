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
import InputMask from "react-input-mask";
import api from "../services/api";

function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [formData, setFormData] = useState({
        name: "",
        document: "",
        phone: "",
        email: "",
        address: "",
    });

    // Buscar fornecedores do backend
    const fetchSuppliers = async () => {
        try {
            const response = await api.post(
                "/functions/getAllSuppliers",
                {},
                {
                    headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") },
                }
            );
            if (response.data.result) {
                setSuppliers(response.data.result);
                setFilteredSuppliers(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar fornecedores:", error.message);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleOpen = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                document: supplier.document || "",
                phone: supplier.phone,
                email: supplier.email,
                address: supplier.address || "",
            });
        } else {
            setEditingSupplier(null);
            setFormData({ name: "", document: "", phone: "", email: "", address: "" });
        }
        setOpen(true);
    };

    // Fechar modal
    const handleClose = () => {
        setOpen(false);
    };

    // Salvar (Adicionar ou Editar) Fornecedor
    const handleSave = async () => {
        // Verificar se todos os campos estão preenchidos
        const { name, document, phone, email, address } = formData;
        if (!name.trim() || !document.trim() || !phone.trim() || !email.trim() || !address.trim()) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // Remove qualquer caractere não numérico de document e phone
        const formattedFormData = {
            ...formData,
            document: formData.document.replace(/\D/g, ""),
            phone: formData.phone.replace(/\D/g, ""),
        };

        try {
            if (editingSupplier) {
                await api.post(
                    "/functions/updateSupplier",
                    { supplierId: editingSupplier.objectId, ...formattedFormData },
                    { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
                );
            } else {
                await api.post(
                    "/functions/createSupplier",
                    formattedFormData,
                    { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
                );
            }
            fetchSuppliers();
            handleClose();
        } catch (error) {
            console.error("Erro ao salvar fornecedor:", error.response?.data || error.message);
        }
    };

    // Excluir Fornecedor (soft delete)
    const handleDelete = async (supplierId) => {
        if (!window.confirm("Tem certeza que deseja excluir este fornecedor?")) return;

        try {
            await api.post(
                "/functions/softDeleteSupplier",
                { supplierId },
                { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
            );
            fetchSuppliers();
        } catch (error) {
            console.error("Erro ao excluir fornecedor:", error.message);
        }
    };

    // Filtrar fornecedores
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query) {
            setFilteredSuppliers(suppliers);
            return;
        }
        const filtered = suppliers.filter(
            (supplier) =>
                supplier.name?.toLowerCase().includes(query.toLowerCase()) ||
                supplier.email?.toLowerCase().includes(query.toLowerCase()) ||
                supplier.phone?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredSuppliers(filtered);
        setCurrentPage(1);
    };

    // Paginação
    const paginatedSuppliers = filteredSuppliers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Exportar para PDF
    const exportToPDF = () => {
        if (suppliers.length === 0) {
            alert("Nenhum fornecedor para exportar.");
            return;
        }

        const doc = new jsPDF();
        doc.text("Relatório de Fornecedores", 14, 10);

        doc.autoTable({
            startY: 20,
            head: [["Nome", "Telefone", "Email", "Endereço"]],
            body: suppliers.map((supplier) => [
                supplier.name,
                supplier.phone,
                supplier.email,
                supplier.address,
            ]),
        });

        doc.save("fornecedores.pdf");
    };

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={4}>
                <Typography variant="h4">Fornecedores</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Novo Fornecedor
                </Button>
            </Box>

            <TextField
                label="Pesquisar Fornecedor (Nome, Telefone ou E-mail)"
                fullWidth
                margin="dense"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
            />

            <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={exportToPDF}>
                Exportar Fornecedores (PDF)
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
                        {paginatedSuppliers.length > 0 ? (
                            paginatedSuppliers.map((supplier) => (
                                <TableRow key={supplier.objectId}>
                                    <TableCell>{supplier.name}</TableCell>
                                    <TableCell>{supplier.phone}</TableCell>
                                    <TableCell>{supplier.email}</TableCell>
                                    <TableCell>{supplier.address}</TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Editar">
                                            <IconButton color="primary" onClick={() => handleOpen(supplier)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton color="error" onClick={() => handleDelete(supplier.objectId)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Nenhum fornecedor encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para adicionar/editar fornecedor */}
            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {editingSupplier ? "Editar Fornecedor" : "Adicionar Fornecedor"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nome"
                        required
                        fullWidth
                        margin="dense"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <InputMask
                        mask={
                            formData.document.replace(/\D/g, "").length > 11
                                ? "99.999.999/9999-99"
                                : "999.999.999-99"
                        }
                        value={formData.document}
                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    >
                        {(inputProps) => (
                            <TextField
                                {...inputProps}
                                label="CPF/CNPJ"
                                required
                                fullWidth
                                margin="dense"
                            />
                        )}
                    </InputMask>

                    <InputMask
                        mask="(99) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    >
                        {(inputProps) => (
                            <TextField
                                {...inputProps}
                                label="Telefone"
                                required
                                fullWidth
                                margin="dense"
                            />
                        )}
                    </InputMask>

                    <TextField
                        label="E-mail"
                        required
                        fullWidth
                        margin="dense"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <TextField
                        label="Endereço"
                        required
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
                        {editingSupplier ? "Salvar" : "Adicionar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Suppliers;
