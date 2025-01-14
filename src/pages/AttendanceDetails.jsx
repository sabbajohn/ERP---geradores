import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Grid, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function AttendanceDetails() {
    const [report, setReport] = useState('');
    const [parts, setParts] = useState([]);
    const [newPart, setNewPart] = useState('');
    const navigate = useNavigate();

    const handleAddPart = () => {
        if (newPart.trim()) {
            setParts([...parts, newPart.trim()]);
            setNewPart('');
        }
    };

    const handleDeletePart = (index) => {
        setParts(parts.filter((_, i) => i !== index));
    };

    const handleSaveReport = () => {
        // Simulação de salvamento do relatório
        alert('Relatório salvo com sucesso!');
        navigate('/tecnico'); // Retorna para a página principal após salvar
    };

    return (
        <Container maxWidth="sm" sx={{ padding: { xs: 2, sm: 4 }, mt: 4 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Box>
                    <Typography variant="h5" gutterBottom textAlign="center">
                        Detalhes do Atendimento
                    </Typography>

                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom>
                            Relatório
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            placeholder="Descreva o atendimento realizado"
                            variant="outlined"
                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        />
                    </Box>

                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom>
                            Peças Trocadas
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    value={newPart}
                                    onChange={(e) => setNewPart(e.target.value)}
                                    placeholder="Nome da peça"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleAddPart}
                                    sx={{ height: '100%' }}
                                >
                                    Adicionar Peça
                                </Button>
                            </Grid>
                        </Grid>
                        <List sx={{ mt: 2, maxHeight: 150, overflowY: 'auto' }}>
                            {parts.map((part, index) => (
                                <ListItem key={index} divider secondaryAction={
                                    <IconButton edge="end" color="error" onClick={() => handleDeletePart(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }>
                                    <ListItemText primary={part} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Box mt={4} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/tecnico')}
                            fullWidth
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveReport}
                            fullWidth
                        >
                            Salvar Relatório
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default AttendanceDetails;
