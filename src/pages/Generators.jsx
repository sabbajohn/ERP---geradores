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
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import BuildIcon from '@mui/icons-material/Build';

function Generators() {
  const [generators] = useState([
    {
      id: 1,
      client: 'Empresa ABC',
      serialNumber: 'GEN001',
      model: 'PowerMax 2000',
      power: '200kVA',
      manufacturer: 'GenCorp',
      installationDate: '2023-12-15',
      warrantyStatus: 'valid'
    },
    {
      id: 2,
      client: 'Indústria XYZ',
      serialNumber: 'GEN002',
      model: 'UltraPower 3000',
      power: '300kVA',
      manufacturer: 'GenTech',
      installationDate: '2023-10-20',
      warrantyStatus: 'expired'
    }
  ]);

  const handleViewHistory = (id) => {
    alert(`Visualizar histórico de manutenção do gerador com ID: ${id}`);
  };

  const handleRegisterMaintenance = (id) => {
    alert(`Registrar manutenção para o gerador com ID: ${id}`);
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={4}>
        <Typography variant="h4">Geradores dos Clientes</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Novo Gerador
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Número de Série</strong></TableCell>
              <TableCell><strong>Modelo</strong></TableCell>
              <TableCell><strong>Potência</strong></TableCell>
              <TableCell><strong>Fabricante</strong></TableCell>
              <TableCell><strong>Data de Instalação</strong></TableCell>
              <TableCell><strong>Status Garantia</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {generators.map((generator) => (
              <TableRow key={generator.id}>
                <TableCell>{generator.client}</TableCell>
                <TableCell>{generator.serialNumber}</TableCell>
                <TableCell>{generator.model}</TableCell>
                <TableCell>{generator.power}</TableCell>
                <TableCell>{generator.manufacturer}</TableCell>
                <TableCell>{generator.installationDate}</TableCell>
                <TableCell>
                  <Chip
                    label={generator.warrantyStatus === 'valid' ? 'Válida' : 'Expirada'}
                    color={generator.warrantyStatus === 'valid' ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleViewHistory(generator.id)}
                    aria-label="histórico"
                  >
                    <HistoryIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleRegisterMaintenance(generator.id)}
                    aria-label="manutenção"
                  >
                    <BuildIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Generators;
