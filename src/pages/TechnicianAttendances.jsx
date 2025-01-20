import React, { useState } from 'react';
import {
    Container,
    Typography,
    Button,
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
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const TechnicianAttendances = () => {
    const [attendances, setAttendances] = useState([]);
    const [openGeneratorModal, setOpenGeneratorModal] = useState(false);
    const [newGenerator, setNewGenerator] = useState({ name: '', client: '' });
    const [clients, setClients] = useState(['Cliente A', 'Cliente B']); // Simulação de clientes existentes

    const handleOpenGeneratorModal = () => setOpenGeneratorModal(true);
    const handleCloseGeneratorModal = () => setOpenGeneratorModal(false);

    const handleSaveGenerator = () => {
        console.log('Gerador cadastrado:', newGenerator);
        setAttendances((prev) => [
            ...prev,
            { id: Date.now(), ...newGenerator }
        ]);
        setOpenGeneratorModal(false);
        setNewGenerator({ name: '', client: '' });
    };

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={4}>
                <Typography variant="h4">Atendimentos dos Técnicos</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenGeneratorModal}
                >
                    Novo Gerador
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nome do Gerador</strong></TableCell>
                            <TableCell><strong>Cliente</strong></TableCell>
                            <TableCell><strong>Data</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attendances.map((attendance) => (
                            <TableRow key={attendance.id}>
                                <TableCell>{attendance.name}</TableCell>
                                <TableCell>{attendance.client}</TableCell>
                                <TableCell>{new Date(attendance.id).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para cadastro de novo gerador */}
            <Dialog open={openGeneratorModal} onClose={handleCloseGeneratorModal}>
                <DialogTitle>Cadastrar Novo Gerador</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nome do Gerador"
                        value={newGenerator.name}
                        onChange={(e) => setNewGenerator({ ...newGenerator, name: e.target.value })}
                        margin="dense"
                        required
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Cliente</InputLabel>
                        <Select
                            value={newGenerator.client}
                            onChange={(e) => setNewGenerator({ ...newGenerator, client: e.target.value })}
                            required
                        >
                            {clients.map((client, index) => (
                                <MenuItem key={index} value={client}>
                                    {client}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGeneratorModal} color="secondary">Cancelar</Button>
                    <Button onClick={handleSaveGenerator} color="primary">Salvar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TechnicianAttendances;
