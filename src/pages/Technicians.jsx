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
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../services/api";

function Technicians() {
    const [technicians, setTechnicians] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        availability: true,
        cpfCnpj: "", // Novo campo
    });
    const [credentials, setCredentials] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredTechnicians, setFilteredTechnicians] = useState([]);

    // Buscar técnicos do backend
    const fetchTechnicians = async () => {
        try {
            const response = await api.post("/functions/getAllTechnicians", {}, {
                headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") },
            });

            if (response.data.result) {
                setTechnicians(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar técnicos:", error.message);
        }
    };

    useEffect(() => {
        fetchTechnicians();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredTechnicians(technicians); // Se não houver pesquisa, mostra todos
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredTechnicians(
                technicians.filter(
                    (tech) =>
                        tech.name.toLowerCase().includes(query) ||
                        tech.email.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, technicians]);

    // Abrir modal para adicionar/editar técnico
    const handleOpen = (technician = null) => {
        setCredentials(null); // Resetar credenciais ao abrir o modal

        if (technician) {
            setEditingTechnician(technician);
            setFormData({
                name: technician.name,
                email: technician.email,
                phone: technician.phone,
                specialization: technician.specialization,
                availability: technician.availability,
                cpfCnpj: technician.cpfCnpj || "", // Preencher o CPF/CNPJ existente
            });
        } else {
            setEditingTechnician(null);
            setFormData({ name: "", email: "", phone: "", specialization: "", availability: true, cpfCnpj: "" });
        }
        setOpen(true);
    };

    // Fechar modal
    const handleClose = () => {
        setOpen(false);
    };

    // Salvar (Adicionar ou Editar) Técnico
    const handleSave = async () => {
        try {
            let response;
            const dataToSend = {
                ...formData,
                cpfCnpj: formData.cpfCnpj
            };

            if (editingTechnician) {
                response = await api.post(
                    "/functions/updateTechnician",
                    { technicianId: editingTechnician.objectId, ...dataToSend },
                    { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
                );

                // Se a senha foi alterada, chama a função para atualizar a senha do usuário
                if (formData.password) {
                    await api.post(
                        "/functions/updateTechnicianPassword",
                        { technicianId: editingTechnician.objectId, newPassword: formData.password },
                        { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
                    );
                }
            } else {
                response = await api.post(
                    "/functions/createTechnician",
                    dataToSend, // Envia o CPF/CNPJ
                    { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
                );

                // Se um usuário foi criado, exibir credenciais geradas
                if (response.data.result && response.data.result.credentials) {
                    setCredentials(response.data.result.credentials);
                }
            }

            fetchTechnicians();
            if (editingTechnician) handleClose();
        } catch (error) {
            console.error("Erro ao salvar técnico:", error.message);
        }
    };

    // Excluir Técnico
    const handleDelete = async (technicianId) => {
        if (!window.confirm("Tem certeza que deseja excluir este técnico?")) return;

        try {
            await api.post(
                "/functions/softDeleteTechnician",
                { technicianId },
                { headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") } }
            );
            fetchTechnicians();
        } catch (error) {
            console.error("Erro ao excluir técnico:", error.message);
        }
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4">Técnicos</Typography>
            <TextField
                fullWidth
                label="Pesquisar Técnico (Nome ou Email)"
                margin="dense"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                Novo Técnico
            </Button>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Telefone</strong></TableCell>
                            <TableCell><strong>CPF/CNPJ</strong></TableCell> {/* Nova coluna */}
                            <TableCell align="center"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTechnicians.map((tech) => (
                            <TableRow key={tech.objectId}>
                                <TableCell>{tech.name}</TableCell>
                                <TableCell>{tech.email}</TableCell>
                                <TableCell>{tech.phone}</TableCell>
                                <TableCell>{tech.cpfCnpj}</TableCell> {/* Exibe o CPF/CNPJ */}
                                <TableCell align="center">
                                    <IconButton onClick={() => handleOpen(tech)}><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(tech.objectId)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de criação/edição */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editingTechnician ? "Editar Técnico" : "Novo Técnico"}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Telefone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="CPF/CNPJ" // Novo campo
                        value={formData.cpfCnpj}
                        onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Nova Senha (Opcional)"
                        type="password"
                        value={formData.password || ""}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        margin="dense"
                    />

                    {credentials && (
                        <Alert severity="info">
                            <strong>Credenciais do Técnico:</strong><br />
                            <strong>Email:</strong> {credentials.email}<br />
                            <strong>Senha:</strong> {credentials.password}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancelar</Button>
                    <Button onClick={handleSave} color="primary">Salvar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Technicians;
