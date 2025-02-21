import React, { useState, useEffect } from "react";
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
    Switch,
    FormControlLabel,
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
    editing, // true se for edição, false para novo
}) => {
    const [horimetroError, setHorimetroError] = useState(false);

    // Flag local para indicar se o usuário quer gerar manutenções automáticas
    const [forceSchedule, setForceSchedule] = useState(false);

    // Sempre que abrir o modal, resetamos o forceSchedule (pode ajustar se quiser outra lógica)
    useEffect(() => {
        setForceSchedule(false);
    }, [open]);

    const handleSaveClick = () => {
        if (newGenerator.horimetroAtual === "") {
            setHorimetroError(true);
            return;
        }
        setHorimetroError(false);

        // Chama a função onSave do pai, passando se o usuário quer gerar manutenções ou não
        onSave(forceSchedule);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editing ? "Editar Gerador" : "Novo Gerador"}</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    label="Nome do Gerador"
                    value={newGenerator.name}
                    onChange={(e) => setNewGenerator({ ...newGenerator, name: e.target.value })}
                />
                <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    label="Número de Série"
                    value={newGenerator.serialNumber}
                    onChange={(e) => setNewGenerator({ ...newGenerator, serialNumber: e.target.value })}
                />
                <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    label="Localização"
                    value={newGenerator.location}
                    onChange={(e) => setNewGenerator({ ...newGenerator, location: e.target.value })}
                />
                <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    label="Data de Compra"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newGenerator.purchaseDate}
                    onChange={(e) => setNewGenerator({ ...newGenerator, purchaseDate: e.target.value })}
                />
                <TextField
                    fullWidth
                    sx={{ marginTop: 2 }}
                    label="Última Manutenção"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newGenerator.lastMaintenanceDate}
                    onChange={(e) => setNewGenerator({ ...newGenerator, lastMaintenanceDate: e.target.value })}
                />
                <TextField
                    label="Data de Entrega Técnica"
                    fullWidth
                    margin="dense"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newGenerator.deliveryDate}
                    onChange={(e) => setNewGenerator({ ...newGenerator, deliveryDate: e.target.value })}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Horímetro"
                    type="number"
                    value={newGenerator.horimetroAtual}
                    onChange={(e) => {
                        setHorimetroError(false);
                        setNewGenerator({ ...newGenerator, horimetroAtual: e.target.value });
                    }}
                    error={horimetroError}
                    helperText={horimetroError ? "Horímetro é obrigatório" : ""}
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={newGenerator.status}
                        label="Status"
                        onChange={(e) => setNewGenerator({ ...newGenerator, status: e.target.value })}
                    >
                        <MenuItem value="disponivel">Em estoque</MenuItem>
                        <MenuItem value="alugado">Alugado</MenuItem>
                        <MenuItem value="em manutencao">Em Manutenção</MenuItem>
                        <MenuItem value="Vendido">Vendido</MenuItem>
                        <MenuItem value="Terceiro">Terceiro</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="dense">
                    <InputLabel>Cliente</InputLabel>
                    <Select
                        value={newGenerator.customerId}
                        label="Cliente"
                        onChange={(e) => setNewGenerator({ ...newGenerator, customerId: e.target.value })}
                    >
                        <MenuItem value="">Sem Cliente</MenuItem>
                        {clients.map((client) => (
                            <MenuItem key={client.objectId} value={client.objectId}>
                                {client.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    margin="dense"
                    label="Motor"
                    value={newGenerator.motor}
                    onChange={(e) => setNewGenerator({ ...newGenerator, motor: e.target.value })}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Modelo"
                    value={newGenerator.modelo}
                    onChange={(e) => setNewGenerator({ ...newGenerator, modelo: e.target.value })}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Fabricante"
                    value={newGenerator.fabricante}
                    onChange={(e) => setNewGenerator({ ...newGenerator, fabricante: e.target.value })}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Potência"
                    value={newGenerator.potencia}
                    onChange={(e) => setNewGenerator({ ...newGenerator, potencia: e.target.value })}
                />

                <Box mt={2} mb={1}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                        Campos Adicionais
                    </Typography>
                    {extraFields.map((field, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                            <TextField
                                label="Nome do Campo"
                                size="small"
                                value={field.fieldName}
                                onChange={(e) => handleExtraFieldChange(index, "fieldName", e.target.value)}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Valor"
                                size="small"
                                value={field.fieldValue}
                                onChange={(e) => handleExtraFieldChange(index, "fieldValue", e.target.value)}
                                sx={{ flex: 1 }}
                            />
                            <Button color="error" variant="outlined" onClick={() => removeExtraField(index)}>
                                Remover
                            </Button>
                        </Box>
                    ))}
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={addExtraField}>
                        Adicionar Campo
                    </Button>
                </Box>

                {/* Só mostra a opção de gerar manutenções se houver uma data de entrega */}
                {newGenerator.deliveryDate && (
                    <FormControlLabel
                        sx={{ marginTop: 2 }}
                        control={
                            <Switch
                                checked={forceSchedule}
                                onChange={(e) => setForceSchedule(e.target.checked)}
                            />
                        }
                        label="Gerar Manutenções de 3, 6 e 12 meses"
                    />
                )}
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
