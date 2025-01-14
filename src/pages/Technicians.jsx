import React, { useState } from 'react';
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
    DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Technicians() {
    const [technicians, setTechnicians] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentTechnician, setCurrentTechnician] = useState({ id: null, name: '', email: '', phone: '' });

    const handleOpen = (technician = { id: null, name: '', email: '', phone: '' }) => {
        setCurrentTechnician(technician);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSave = () => {
        if (currentTechnician.id) {
            setTechnicians((prev) =>
                prev.map((tech) =>
                    tech.id === currentTechnician.id ? currentTechnician : tech
                )
            );
        } else {
            setTechnicians((prev) => [
                ...prev,
                { ...currentTechnician, id: Date.now() }
            ]);
        }
        handleClose();
    };

    const handleDelete = (id) => {
        setTechnicians((prev) => prev.filter((tech) => tech.id !== id));
    };

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={4}>
                <Typography variant="h4">Técnicos</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Novo Técnico
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Telefone</strong></TableCell>
                            <TableCell align="center"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {technicians.map((technician) => (
                            <TableRow key={technician.id}>
                                <TableCell>{technician.name}</TableCell>
                                <TableCell>{technician.email}</TableCell>
                                <TableCell>{technician.phone}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleOpen(technician)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(technician.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{currentTechnician.id ? 'Editar Técnico' : 'Novo Técnico'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nome"
                        value={currentTechnician.name}
                        onChange={(e) => setCurrentTechnician({ ...currentTechnician, name: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        value={currentTechnician.email}
                        onChange={(e) => setCurrentTechnician({ ...currentTechnician, email: e.target.value })}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Telefone"
                        value={currentTechnician.phone}
                        onChange={(e) => setCurrentTechnician({ ...currentTechnician, phone: e.target.value })}
                        margin="dense"
                    />
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
