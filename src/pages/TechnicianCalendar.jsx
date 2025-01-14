import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function TechnicianCalendar() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();

    const handleDateChange = (date) => {
        setSelectedDate(date);
        navigate(`/tecnico/atendimentos?date=${format(date, 'dd/MM/yyyy')}`);
    };

    const attendances = [
        { date: '13/01/2025', count: 3 },
        { date: '14/01/2025', count: 5 },
        { date: '15/01/2025', count: 2 },
        { date: '16/01/2025', count: 4 },
        { date: '17/01/2025', count: 1 }
    ];

    const chartData = {
        labels: attendances.map((item) => item.date),
        datasets: [
            {
                label: 'Atendimentos Realizados',
                data: attendances.map((item) => item.count),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Permite ajustar a altura conforme a largura
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 10 // Reduz o tamanho da fonte da legenda
                    }
                }
            },
            title: {
                display: true,
                text: 'Histórico de Atendimentos',
                font: {
                    size: 16 // Reduz o tamanho do título em telas menores
                }
            }
        },
        layout: {
            padding: {
                top: 10,
                bottom: 10
            }
        }
    };

    const dailyAttendances = [
        { id: 1, client: 'Empresa ABC', generator: 'GEN001', status: 'Pendente' },
        { id: 2, client: 'Empresa XYZ', generator: 'GEN002', status: 'Concluído' }
    ];

    const handleViewDetails = (id) => {
        navigate(`/tecnico/atendimentos/${id}`);
    };

    return (
        <Container maxWidth="md">
            <Box mt={5} textAlign="center">
                <Typography variant="h4" gutterBottom>Agenda de Atendimentos</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
                    <DateCalendar
                        value={selectedDate}
                        onChange={handleDateChange}
                    />
                </LocalizationProvider>
            </Box>

            <Box mt={5}>
                <Typography variant="h5" gutterBottom>Atendimentos do Dia</Typography>
                <Grid container spacing={3}>
                    {dailyAttendances.map((att) => (
                        <Grid item xs={12} sm={6} key={att.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{att.client}</Typography>
                                    <Typography>Gerador: {att.generator}</Typography>
                                    <Typography>Status: {att.status}</Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleViewDetails(att.id)}
                                        sx={{ mt: 2 }}
                                    >
                                        Ver Detalhes
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Box mt={5}>
                <Typography variant="h5" gutterBottom>Histórico de Atendimentos</Typography>
                <Box
                    sx={{
                        height: { xs: 300, sm: 400 }, // Altura variável conforme o tamanho da tela
                        width: '100%'
                    }}
                >
                    <Bar data={chartData} options={chartOptions} />
                </Box>
            </Box>
        </Container>
    );
}

export default TechnicianCalendar;
