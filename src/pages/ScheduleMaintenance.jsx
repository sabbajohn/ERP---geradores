import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    MenuItem,
    Grid
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

function ScheduleMaintenance() {
    const [generatorId, setGeneratorId] = useState('');
    const [date, setDate] = useState(null);
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [technician, setTechnician] = useState('');
    const navigate = useNavigate();

    const handleSchedule = () => {
        // Simulação de salvamento da manutenção
        alert('Manutenção agendada com sucesso!');
        navigate('/maintenance'); // Redireciona para a página de manutenções
    };

    return (
        <Container maxWidth="sm">
            <Box mt={5} mb={3} textAlign="center">
                <Typography variant="h4">Agendar Manutenção</Typography>
            </Box>

            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSchedule(); }} noValidate>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Gerador"
                            value={generatorId}
                            onChange={(e) => setGeneratorId(e.target.value)}
                            required
                        >
                            {/* Simulação de geradores disponíveis */}
                            <MenuItem value="GEN001">GEN001 - PowerMax 2000</MenuItem>
                            <MenuItem value="GEN002">GEN002 - UltraPower 3000</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
                            <DatePicker
                                label="Data da Manutenção"
                                value={date}
                                onChange={(newDate) => setDate(newDate)}
                                renderInput={(params) => <TextField {...params} fullWidth required />}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Tipo de Manutenção"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                        >
                            <MenuItem value="Preventiva">Preventiva</MenuItem>
                            <MenuItem value="Corretiva">Corretiva</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Descrição"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={4}
                            placeholder="Descreva a manutenção a ser realizada"
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Técnico Responsável"
                            value={technician}
                            onChange={(e) => setTechnician(e.target.value)}
                            placeholder="Nome do técnico"
                            required
                        />
                    </Grid>

                    <Grid item xs={12} textAlign="center">
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                        >
                            Agendar Manutenção
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}

export default ScheduleMaintenance;
