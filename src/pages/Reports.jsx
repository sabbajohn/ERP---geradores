import React, { useState, useEffect } from "react";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import api from "../services/api";

function Reports() {
  const [filters, setFilters] = useState({ technician: "", generator: "" });
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [openAttachments, setOpenAttachments] = useState(false);


  useEffect(() => {
    loadReports();
  }, []);

  // Função que busca todos os relatórios no backend
  const loadReports = async () => {
    try {
      const resp = await api.post(
        "/functions/getAllMaintenanceReports",
        {},
        {
          headers: { "X-Parse-Session-Token": localStorage.getItem("sessionToken") }
        }
      );
      if (resp.data.result) {

        const fetched = resp.data.result;
        setAllReports(fetched);
        setFilteredReports(fetched);
      }
    } catch (err) {
      console.error("Erro ao buscar relatórios:", err.message);
    }
  };

  // Altera filtros
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Aplica filtro local
  const handleFilterReports = () => {
    const { technician, generator } = filters;
    const lowerTech = technician.toLowerCase();
    const lowerGen = generator.toLowerCase();

    const temp = allReports.filter((r) => {
      const techName = r.technicianUser?.username?.toLowerCase() || "";
      const genName = r.generatorId?.name?.toLowerCase() || "";
      const matchTech = techName.includes(lowerTech);
      const matchGen = genName.includes(lowerGen);
      return matchTech && matchGen;
    });
    setFilteredReports(temp);
  };

  // Visualizar imagens
  const handleViewImages = (report) => {
    setAttachments(report.attachments || []);
    setOpenAttachments(true);
  };

  const handleCloseAttachments = () => {
    setOpenAttachments(false);
    setAttachments([]);
  };


  const handleExport = (format) => {
    alert(`Exportando relatórios em ${format.toUpperCase()}`);
  };

  return (
    <Container maxWidth="lg">
      <Box mt={5} mb={3}>
        <Typography variant="h4" textAlign="center">
          Relatórios de Manutenção
        </Typography>
      </Box>

      {/* Campos de Filtro */}
      <Box mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Técnico"
              name="technician"
              value={filters.technician}
              onChange={handleFilterChange}
              placeholder="Nome do técnico"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Gerador"
              name="generator"
              value={filters.generator}
              onChange={handleFilterChange}
              placeholder="Nome do gerador"
            />
          </Grid>
        </Grid>
        <Box mt={3} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleFilterReports}
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
              <TableCell><strong>Criado em</strong></TableCell>
              <TableCell><strong>Técnico</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell><strong>Km</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((rep) => {
              const genName = rep.generatorId?.name || "Sem gerador";
              const techName = rep.technicianUser?.username || "Desconhecido";
              const createDate = new Date(rep.createdAt.iso).toLocaleDateString("pt-BR");
              return (
                <TableRow key={rep.objectId}>
                  <TableCell>{genName}</TableCell>
                  <TableCell>{createDate}</TableCell>
                  <TableCell>{techName}</TableCell>
                  <TableCell>{rep.reportDescription}</TableCell>
                  <TableCell>{rep.mileage}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewImages(rep)}
                      title="Ver Imagens"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleExport("pdf")}
                      title="Exportar PDF"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para Visualizar Imagens */}
      <Dialog open={openAttachments} onClose={handleCloseAttachments} maxWidth="md" fullWidth>
        <DialogTitle>
          Imagens do Relatório
          <IconButton
            color="inherit"
            onClick={handleCloseAttachments}
            style={{ float: "right" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {attachments.length > 0 ? (
            attachments.map((att, idx) => (
              <Box key={idx} mb={2}>
                <Typography variant="body2">{att.fileName}</Typography>
                {/* Se for uma imagem: */}
                <img
                  src={att.fileUrl}
                  alt={att.fileName}
                  style={{ maxWidth: "100%", marginTop: "8px" }}
                />
              </Box>
            ))
          ) : (
            <Typography>Nenhuma imagem anexada.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttachments} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Reports;
