import React, { useState } from "react";
import {
    Box,
    TextField,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const GeneratorModal = ({
    open,
    onClose,
    onSave,
    newGenerator,
    setNewGenerator,
    clients,
    extraFields,
    addExtraField,
    removeExtraField,
    handleExtraFieldChange,
}) => {
    // Para controlar o erro do horímetro
    const [horimetroError, setHorimetroError] = useState(false);

    // Função local para tratar "salvar"
    // Ela delega a chamada para a função que vier via props (onSave).
    const handleSaveClick = () => {
        // Se o horímetro estiver vazio, mostramos erro (valor 0 é permitido)
        if (newGenerator.horimetroAtual === "") {
            setHorimetroError(true);
            return;
        }

        // Se passou, não tem erro
        setHorimetroError(false);
        onSave();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Novo Gerador</DialogTitle>
            <DialogContent>
                {/* Nome do Gerador */}
                <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    label="Nome do Gerador"
                    value={newGenerator.name}
                    onChange={(e) =>
                        setNewGenerator({ ...newGenerator, name: e.target.value })
                    }
                />

                {/* Número de Série */}
                <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    label="Número de Série"
                    value={newGenerator.serialNumber}
                    onChange={(e) =>
                        setNewGenerator({ ...newGenerator, serialNumber: e.target.value })
                    }
                />

                {/* Localização */}
                <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    label="Localização"
                    value={newGenerator.location}
                    onChange={(e) =>
                        setNewGenerator({ ...newGenerator, location: e.target.value })
                    }
                />

                {/* Data de Compra */}
                <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    label="Data de Compra"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newGenerator.purchaseDate}
                    onChange={(e) =>
                        setNewGenerator({
                            ...newGenerator,
                            purchaseDate: e.target.value,
                        })
                    }
                />

                {/* Última Manutenção */}
                <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    label="Última Manutenção"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newGenerator.lastMaintenanceDate}
                    onChange={(e) =>
                        setNewGenerator({
                            ...newGenerator,
                            lastMaintenanceDate: e.target.value,
                        })
                    }
                />

                {/* Data de Entrega Técnica (Novo Campo) */}
                <TextField
                    label="Data de Entrega Técnica"
                    fullWidth
                    margin="dense"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newGenerator.deliveryDate}
                    onChange={(e) =>
                        setNewGenerator({
                            ...newGenerator,
                            deliveryDate: e.target.value,
                        })
                    }
                />

                {/* Horímetro (Novo Campo, obrigatório) */}
                <TextField
                    fullWidth
                    margin="dense"
                    label="Horímetro"
                    type="number"
                    value={newGenerator.horimetroAtual}
                    onChange={(e) => {
                        // Sempre que o usuário digitar, limpamos o erro
                        setHorimetroError(false);
                        setNewGenerator({ ...newGenerator, horimetroAtual: e.target.value });
                    }}
                    error={horimetroError}
                    helperText={
                        horimetroError ? "Horímetro é obrigatório" : ""
                    }
                />

                {/* Status */}
                <FormControl fullWidth margin="dense">
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={newGenerator.status}
                        label="Status"
                        onChange={(e) =>
                            setNewGenerator({ ...newGenerator, status: e.target.value })
                        }
                    >
                        <MenuItem value="disponivel">Em estoque</MenuItem>
                        <MenuItem value="alugado">Alugado</MenuItem>
                        <MenuItem value="em manutencao">Em Manutenção</MenuItem>
                        <MenuItem value="Vendido">Vendido</MenuItem>
                        <MenuItem value="Terceiro">Terceiro</MenuItem>
                    </Select>
                </FormControl>

                {/* Cliente (Opcional, a menos que status seja "Vendido") */}
                <FormControl fullWidth margin="dense">
                    <InputLabel>Cliente</InputLabel>
                    <Select
                        value={newGenerator.customerId}
                        label="Cliente"
                        onChange={(e) =>
                            setNewGenerator({ ...newGenerator, customerId: e.target.value })
                        }
                    >
                        <MenuItem value="">Sem Cliente</MenuItem>
                        {clients.map((client) => (
                            <MenuItem key={client.objectId} value={client.objectId}>
                                {client.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Motor */}
                <TextField
                    fullWidth
                    margin="dense"
                    label="Motor"
                    value={newGenerator.motor}
                    onChange={(e) =>
                        setNewGenerator({ ...newGenerator, motor: e.target.value })
                    }
                />

                {/* Modelo */}
                <TextField
                    fullWidth
                    margin="dense"
                    label="Modelo"
                    value={newGenerator.modelo}
                    onChange={(e) =>
                        setNewGenerator({ ...newGenerator, modelo: e.target.value })
                    }
                />

                {/* Fabricante */}
                <TextField
                    fullWidth
                    margin="dense"
                    label="Fabricante"
                    value={newGenerator.fabricante}
                    onChange={(e) =>
                        setNewGenerator({ ...newGenerator, fabricante: e.target.value })
                    }
                />

                {/* Potência */}
                <TextField
                    fullWidth
                    margin="dense"
                    label="Potência"
                    value={newGenerator.potencia}
                    onChange={(e) =>
                        setNewGenerator({ ...newGenerator, potencia: e.target.value })
                    }
                />

                {/* SUB-FORM: Extra Fields */}
                <Box mt={2} mb={1}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                        Campos Adicionais
                    </Typography>
                    {extraFields.map((field, index) => (
                        <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                        >
                            <TextField
                                label="Nome do Campo"
                                size="small"
                                value={field.fieldName}
                                onChange={(e) =>
                                    handleExtraFieldChange(index, "fieldName", e.target.value)
                                }
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Valor"
                                size="small"
                                value={field.fieldValue}
                                onChange={(e) =>
                                    handleExtraFieldChange(index, "fieldValue", e.target.value)
                                }
                                sx={{ flex: 1 }}
                            />
                            <Button
                                color="error"
                                variant="outlined"
                                onClick={() => removeExtraField(index)}
                            >
                                Remover
                            </Button>
                        </Box>
                    ))}
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addExtraField}
                    >
                        Adicionar Campo
                    </Button>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button onClick={handleSaveClick} color="primary" variant="contained">
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GeneratorModal;
