import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Card, CardContent, Button, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function TechnicianAttendances() {
    const [attendances, setAttendances] = useState([
        { id: 1, client: 'Empresa ABC', generator: 'GEN001', status: 'Pendente' },
        { id: 2, client: 'Empresa XYZ', generator: 'GEN002', status: 'Concluído' }
    ]);

    const location = useLocation();
    const date = new URLSearchParams(location.search).get('date');
    const navigate = useNavigate();

    return (
        <Container maxWidth="md">
            <Box mt={5}>
                <Typography variant="h4" gutterBottom>Atendimentos - {date}</Typography>
                <Grid container spacing={3}>
                    {attendances.map((att) => (
                        <Grid item xs={12} sm={6} key={att.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{att.client}</Typography>
                                    <Typography>Gerador: {att.generator}</Typography>
                                    <Typography>Status: {att.status}</Typography>
                                    <Box mt={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => navigate(`/tecnico/atendimentos/${att.id}`)}
                                        >
                                            Ver Detalhes
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
}

export default TechnicianAttendances;
