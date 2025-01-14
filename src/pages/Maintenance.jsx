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
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function Maintenance() {
  const [maintenanceRecords] = useState([
    {
      id: 1,
      generatorId: 'GEN001',
      date: '2024-02-15',
      type: 'Preventiva',
      description: 'Troca de óleo e filtros',
      technician: 'João Silva',
      status: 'Agendada'
    },
    {
      id: 2,
      generatorId: 'GEN002',
      date: '2024-02-10',
      type: 'Corretiva',
      description: 'Substituição de peças do motor',
      technician: 'Maria Santos',
      status: 'Concluída'
    }
  ]);

  const navigate = useNavigate();

  const handleScheduleMaintenance = () => {
    navigate('/maintenance/schedule');
  };

  const handleViewDetails = (id) => {
    navigate(`/maintenance/details/${id}`);
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={4}>
        <Typography variant="h4">Manutenções</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleScheduleMaintenance}
        >
          Agendar Manutenção
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Gerador</strong></TableCell>
              <TableCell><strong>Data</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell><strong>Técnico</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maintenanceRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.generatorId}</TableCell>
                <TableCell>{format(new Date(record.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell>{record.technician}</TableCell>
                <TableCell>
                  <Chip
                    label={record.status}
                    color={record.status === 'Concluída' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<InfoIcon />}
                    onClick={() => handleViewDetails(record.id)}
                  >
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Maintenance;
