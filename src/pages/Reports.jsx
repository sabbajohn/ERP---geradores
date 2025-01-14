import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

function Reports() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', technician: '' });
  const [reports] = useState([
    {
      id: 1,
      generatorId: 'GEN001',
      date: '2024-02-10',
      technician: 'João Silva',
      type: 'Preventiva',
      description: 'Troca de óleo e filtros'
    },
    {
      id: 2,
      generatorId: 'GEN002',
      date: '2024-01-20',
      technician: 'Maria Santos',
      type: 'Corretiva',
      description: 'Substituição de peças do motor'
    }
  ]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleViewDetails = (id) => {
    alert(`Visualizando detalhes do relatório com ID: ${id}`);
  };

  const handleExport = (format) => {
    alert(`Exportando relatórios em ${format.toUpperCase()}`);
  };

  return (
    <Container maxWidth="lg">
      <Box mt={5} mb={3}>
        <Typography variant="h4" textAlign="center">Relatórios de Manutenção</Typography>
      </Box>

      {/* Filtros */}
      <Box mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Data Inicial"
              InputLabelProps={{ shrink: true }}
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Data Final"
              InputLabelProps={{ shrink: true }}
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Técnico"
              name="technician"
              value={filters.technician}
              onChange={handleFilterChange}
              placeholder="Nome do técnico"
            />
          </Grid>
        </Grid>
        <Box mt={3} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
          >
            Filtrar Relatórios
          </Button>
        </Box>
      </Box>

      {/* Tabela de Relatórios */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Gerador</strong></TableCell>
              <TableCell><strong>Data</strong></TableCell>
              <TableCell><strong>Técnico</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.generatorId}</TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>{report.technician}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>{report.description}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleViewDetails(report.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleExport('pdf')}
                  >
                    <DownloadIcon />
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

export default Reports;
