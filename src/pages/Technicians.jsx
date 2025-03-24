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
import InputMask from "react-input-mask"; // Utilizado para telefone (máscara estática)
import { IMaskInput } from "react-imask"; // Utilizado para CPF/CNPJ (máscara dinâmica)
import api from "../services/api";

// Componente customizado para integrar o IMask com o TextField do MUI
const TextMaskCustom = React.forwardRef(function TextMaskCustom(props, ref) {
    const { onChange, mask, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask={mask.mask ? mask.mask : mask}
            dispatch={mask.dispatch}
            unmask={false}
            inputRef={ref}
            onAccept={(value) =>
                onChange({ target: { name: props.name, value } })
            }
            overwrite
        />
    );
});

// Máscara dinâmica para CPF/CNPJ
const docMask = {
    mask: [
        { mask: "000.000.000-00" },   // CPF (11 dígitos)
        { mask: "00.000.000/0000-00" }, // CNPJ (14 dígitos)
    ],
    dispatch: function (appended, dynamicMasked) {
        const number = (dynamicMasked.value + appended).replace(/\D/g, "");
        return number.length > 11
            ? dynamicMasked.compiledMasks[1]
            : dynamicMasked.compiledMasks[0];
    },
};

function Technicians() {
    const [technicians, setTechnicians] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        availability: true,
        cpfCnpj: "",
    });
    const [credentials, setCredentials] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredTechnicians, setFilteredTechnicians] = useState([]);

    // Buscar técnicos do backend
    const fetchTechnicians = async () => {
        try {
            const response = await api.post(
                "/functions/getAllTechnicians",
                {},
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );

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
            setFilteredTechnicians(technicians);
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
                availability: technician.availability,
                cpfCnpj: technician.cpfCnpj || "",
            });
        } else {
            setEditingTechnician(null);
            setFormData({
                name: "",
                email: "",
                phone: "",
                availability: true,
                cpfCnpj: "",
            });
        }
        setOpen(true);
    };

    // Fechar modal
    const handleClose = () => {
        setOpen(false);
    };

    // Salvar (Adicionar ou Editar) Técnico
    const handleSave = async () => {
        // Verificação dos campos obrigatórios
        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.phone.trim() ||
            !formData.cpfCnpj.trim()
        ) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        try {
            let response;
            const dataToSend = {
                ...formData,
                cpfCnpj: formData.cpfCnpj,
            };

            if (editingTechnician) {
                response = await api.post(
                    "/functions/updateTechnician",
                    { technicianId: editingTechnician.objectId, ...dataToSend },
                    {
                        headers: {
                            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                        },
                    }
                );

                // Se a senha foi alterada, atualiza a senha do usuário
                if (formData.password) {
                    await api.post(
                        "/functions/updateTechnicianPassword",
                        {
                            technicianId: editingTechnician.objectId,
                            newPassword: formData.password,
                        },
                        {
                            headers: {
                                "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                            },
                        }
                    );
                }
            } else {
                response = await api.post(
                    "/functions/createTechnician",
                    dataToSend,
                    {
                        headers: {
                            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                        },
                    }
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
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
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
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
            >
                Novo Técnico
            </Button>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Telefone</strong></TableCell>
                            <TableCell><strong>CPF/CNPJ</strong></TableCell>
                            <TableCell align="center"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTechnicians.map((tech) => (
                            <TableRow key={tech.objectId}>
                                <TableCell>{tech.name}</TableCell>
                                <TableCell>{tech.email}</TableCell>
                                <TableCell>{tech.phone}</TableCell>
                                <TableCell>{tech.cpfCnpj}</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleOpen(tech)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(tech.objectId)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de criação/edição */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {editingTechnician ? "Editar Técnico" : "Novo Técnico"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        required
                        label="Nome"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        required
                        label="Email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        margin="dense"
                    />
                    <InputMask
                        mask="(99) 99999-9999"
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                        }
                    >
                        {(inputProps) => (
                            <TextField
                                {...inputProps}
                                label="Telefone"
                                fullWidth
                                margin="dense"
                                required
                            />
                        )}
                    </InputMask>
                    {/* Atualizando o campo CPF/CNPJ para usar react-imask com máscara dinâmica */}
                    <TextField
                        margin="dense"
                        label="CPF/CNPJ"
                        name="cpfCnpj"
                        fullWidth
                        variant="outlined"
                        required
                        value={formData.cpfCnpj}
                        onChange={(e) =>
                            setFormData({ ...formData, cpfCnpj: e.target.value })
                        }
                        InputProps={{
                            inputComponent: TextMaskCustom,
                            inputProps: {
                                mask: docMask,
                                name: "cpfCnpj",
                            },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Nova Senha (Opcional)"
                        type="password"
                        value={formData.password || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        margin="dense"
                    />
                    {credentials && (
                        <Alert severity="info">
                            <strong>Credenciais do Técnico:</strong>
                            <br />
                            <strong>Email:</strong> {credentials.email}
                            <br />
                            <strong>Senha:</strong> {credentials.password}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Technicians;
