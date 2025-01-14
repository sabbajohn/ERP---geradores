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
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Customers() {
  const [customers] = useState([
    { id: 1, name: 'Empresa ABC', document: '12.345.678/0001-90', phone: '(11) 1234-5678', email: 'contato@abc.com' },
    { id: 2, name: 'Indústria XYZ', document: '98.765.432/0001-10', phone: '(11) 9876-5432', email: 'contato@xyz.com' }
  ]);

  const handleEdit = (id) => {
    alert(`Editar cliente com ID: ${id}`);
  };

  const handleDelete = (id) => {
    alert(`Excluir cliente com ID: ${id}`);
  };

  const handleAddCustomer = () => {
    alert('Adicionar novo cliente');
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={4}>
        <Typography variant="h4">Clientes</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddCustomer}
        >
          Novo Cliente
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>CNPJ/CPF</strong></TableCell>
              <TableCell><strong>Telefone</strong></TableCell>
              <TableCell><strong>E-mail</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.document}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(customer.id)}
                    aria-label="editar"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(customer.id)}
                    aria-label="excluir"
                  >
                    <DeleteIcon />
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

export default Customers;
