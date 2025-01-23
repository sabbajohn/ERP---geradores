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
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import api from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Componente que lista relatórios e exibe detalhes completos em um modal
 * para o administrador visualizar tudo que o técnico preencheu.
 */
function Reports() {
  const [filters, setFilters] = useState({ technician: "", generator: "" });
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  // Estado para o "modal de detalhes"
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  // Campos para exibir anexos / imagens
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  // Busca todos os relatórios
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
        console.log("Relatórios recebidos do backend:", fetched); // <--- Adicione este log
        setAllReports(fetched);
        setFilteredReports(fetched);
      }
    } catch (err) {
      console.error("Erro ao buscar relatórios:", err.message);
      alert("Erro ao buscar relatórios.");
    }
  };


  // Filtro local
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterReports = () => {
    const { technician, generator } = filters;
    const lowerTech = technician.toLowerCase();
    const lowerGen = generator.toLowerCase();

    const temp = allReports.filter((r) => {
      const techName = r.technicianUser?.username?.toLowerCase() || "";
      const genName = r.generatorId?.name?.toLowerCase() || "";
      return techName.includes(lowerTech) && genName.includes(lowerGen);
    });
    setFilteredReports(temp);
  };

  // Abre modal de detalhes
  const handleViewDetails = (rep) => {
    setSelectedReport(rep);
    setAttachments(rep.attachments || []);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedReport(null);
    setAttachments([]);
  };

  // Exportar PDF
  const handleExportPDF = () => {
    const input = document.getElementById("report-detail");

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_${selectedReport.objectId}.pdf`);
    }).catch((error) => {
      console.error("Erro ao gerar PDF:", error);
      alert("Falha ao gerar PDF. Tente novamente.");
    });
  };

  return (
    <Container maxWidth="lg">
      <Box mt={5} mb={3}>
        <Typography variant="h4" textAlign="center">
          Relatórios / Atendimentos
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
              <TableCell><strong>Data Criação</strong></TableCell>
              <TableCell><strong>Técnico</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell><strong>Km</strong></TableCell>
              <TableCell><strong>Checklist</strong></TableCell>
              <TableCell><strong>Assinaturas</strong></TableCell> {/* Nova Coluna */}
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((rep) => {
              const genName = rep.generatorId?.name || "Sem gerador";
              const techName = rep.technicianUser?.username || "Desconhecido";

              // Formatação da data de criação
              let iso = rep.createdAt?.iso || rep.createdAt;
              let createDate = "";
              if (iso) {
                createDate = new Date(iso).toLocaleString("pt-BR");
              }

              // Preparar o conteúdo do checklist para o tooltip
              const checklistItems = rep.checklistText
                ? rep.checklistText.split(",").map(item => item.trim())
                : [];

              // Preparar assinaturas
              const technicianSignatureURL = rep.technicianSignature
                ? `${rep.technicianSignature}`
                : null;

              const customerSignatureURL = rep.customerSignature
                ? `${rep.customerSignature}`
                : null;

              return (
                <TableRow key={rep.objectId}>
                  <TableCell>{genName}</TableCell>
                  <TableCell>{createDate}</TableCell>
                  <TableCell>{techName}</TableCell>
                  <TableCell>{rep.reportDescription}</TableCell>
                  <TableCell>{rep.mileage}</TableCell>
                  <TableCell>
                    <Tooltip
                      title={
                        checklistItems.length > 0 ? (
                          <List>
                            {checklistItems.map((item, idx) => (
                              <ListItem key={idx}>
                                <ListItemText primary={item} />
                              </ListItem>
                            ))}
                            {rep.checklistInputs && rep.checklistInputs.length > 0 && (
                              <>
                                <ListItem>
                                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                    Campos de Entrada:
                                  </Typography>
                                </ListItem>
                                {rep.checklistInputs.map((input, idx) => (
                                  <ListItem key={idx}>
                                    <ListItemText
                                      primary={`${input.key
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, str => str.toUpperCase())}: ${input.value}`}
                                    />
                                  </ListItem>
                                ))}
                              </>
                            )}
                          </List>
                        ) : (
                          "Nenhum item no checklist."
                        )
                      }
                      arrow
                      placement="top"
                      interactive
                    >
                      <IconButton color="info" size="small" title="Ver Checklist">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  {/* Nova Coluna: Assinaturas */}
                  <TableCell>
                    <Tooltip
                      title={
                        <Box>
                          {technicianSignatureURL && (
                            <Box mb={1} textAlign="center">
                              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Assinatura do Técnico</Typography>
                              <img
                                src={technicianSignatureURL}
                                alt="Assinatura do Técnico"
                                style={{ maxWidth: "200px", height: "auto" }}
                              />
                            </Box>
                          )}
                          {customerSignatureURL && (
                            <Box textAlign="center">
                              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>Assinatura do Cliente</Typography>
                              <img
                                src={customerSignatureURL}
                                alt="Assinatura do Cliente"
                                style={{ maxWidth: "200px", height: "auto" }}
                              />
                            </Box>
                          )}
                          {!technicianSignatureURL && !customerSignatureURL && (
                            <Typography>Nenhuma assinatura disponível.</Typography>
                          )}
                        </Box>
                      }
                      arrow
                      placement="right"
                      interactive
                    >
                      <IconButton color="info" size="small" title="Ver Checklist">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  {/* Fim da Coluna: Assinaturas */}
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(rep)}
                      title="Ver Detalhes"
                    >
                      <VisibilityIcon />
                    </IconButton>

                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Detalhes do Relatório */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalhes do Relatório
          <IconButton
            color="inherit"
            onClick={handleCloseDetail}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers id="report-detail">
          {selectedReport ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Cabeçalho do Relatório */}
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Ordem de Serviço Digital
                </Typography>
                <Typography variant="subtitle1">Energimaq</Typography>
                <Typography variant="body2">Telefone: (91) 4042-2194</Typography>
                <Typography variant="body2">CNPJ: 45.486.401/0001-31</Typography>
                <Typography variant="body2">Email: servicosepecas@energimaq.com.br</Typography>
                <Typography variant="body2">Endereço: Rodovia Br 316 3262 Almirante Barroso, Castanheira, Belém PA, Cep:66645-00</Typography>
              </Box>

              {/* Informações do Cliente */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Informações do Cliente
                </Typography>
                <Typography><strong>Nome do Cliente:</strong> {selectedReport.customerId?.name || "N/A"}</Typography>
                <Typography><strong>E-mail:</strong> {selectedReport.customerId?.email || "-"}</Typography>
                <Typography><strong>Endereço:</strong> {selectedReport.customerId?.address || "-"}</Typography>
                <Typography><strong>Telefone:</strong> {selectedReport.customerId?.phone || "-"}</Typography>
              </Paper>

              {/* Informações do Gerador */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Informações do Gerador
                </Typography>
                <Typography><strong>Nome do Gerador:</strong> {selectedReport.generatorId?.name || "N/A"}</Typography>
                <Typography><strong>Localização do Gerador:</strong> {selectedReport.generatorId?.location || "N/A"}</Typography>
              </Paper>

              {/* Detalhes da OS */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Detalhes da Ordem de Serviço
                </Typography>
                <Grid container spacing={2}>
                  {/* Se existir, exiba os campos relevantes */}
                  {/* Exemplo baseado no retorno fornecido */}
                  <Grid item xs={6}>
                    <Typography><strong>Data de Check-in:</strong> {selectedReport.checkInTime ? new Date(selectedReport.checkInTime).toLocaleString("pt-BR") : "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Data de Check-out:</strong> {selectedReport.checkOutTime ? new Date(selectedReport.checkOutTime).toLocaleString("pt-BR") : "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Duração:</strong> {selectedReport.duration || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Quilometragem:</strong> {selectedReport.mileage || "N/A"}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Relato de Execução */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Relato de Execução
                </Typography>
                <Typography>
                  {selectedReport.reportDescription || "Sem relato de execução."}
                </Typography>
              </Paper>

              {/* Checklist de Itens Marcados */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Checklist Gerador de Energia - Itens Marcados
                </Typography>
                {selectedReport.checklistText ? (
                  <Tooltip
                    title={
                      <List>
                        {selectedReport.checklistText.split(",").map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={item.trim()} />
                          </ListItem>
                        ))}
                        {selectedReport.checklistInputs && selectedReport.checklistInputs.length > 0 && (
                          <>
                            <ListItem>
                              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                Campos de Entrada:
                              </Typography>
                            </ListItem>
                            {selectedReport.checklistInputs.map((input, idx) => (
                              <ListItem key={idx}>
                                <ListItemText
                                  primary={`${input.key
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/^./, str => str.toUpperCase())}: ${input.value}`}
                                />
                              </ListItem>
                            ))}
                          </>
                        )}
                      </List>
                    }
                    arrow
                    placement="right"
                    interactive
                  >
                    <Button variant="outlined" startIcon={<InfoIcon />}>
                      Ver Checklist
                    </Button>
                  </Tooltip>
                ) : (
                  <Typography>Nenhum item no checklist.</Typography>
                )}
              </Paper>

              {/* Peças Usadas */}
              {selectedReport.partsUsed && selectedReport.partsUsed.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Peças Trocadas
                  </Typography>
                  <List>
                    {selectedReport.partsUsed.map((p, idx) => (
                      <ListItem key={idx} divider>
                        <ListItemText
                          primary={`${p.itemName} (x${p.quantity})`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {/* Assinatura do Técnico */}
              {selectedReport.technicianSignature && selectedReport.technicianSignature !== "" && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Assinatura do Técnico
                  </Typography>
                  <img
                    src={`${selectedReport.technicianSignature}`}
                    alt="Assinatura do Técnico"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Paper>
              )}

              {/* Assinatura do Cliente */}
              {selectedReport.customerSignature && selectedReport.customerSignature !== "" && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Assinatura do Cliente
                  </Typography>
                  <img
                    src={`${selectedReport.customerSignature}`}
                    alt="Assinatura do Cliente"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Paper>
              )}

              {/* Anexos / Imagens */}
              {attachments.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Fotos
                  </Typography>
                  {attachments.map((att, idx) => (
                    <Box key={idx} mb={2}>
                      <Typography variant="body2">{att.fileName}</Typography>
                      <img
                        src={att.fileUrl}
                        alt={att.fileName}
                        style={{ maxWidth: "100%", marginTop: "8px" }}
                      />
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          ) : (
            <Typography>Selecione um relatório</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleExportPDF}
            color="secondary"
            variant="contained"
            disabled={!selectedReport}
            startIcon={<DownloadIcon />}
          >
            Exportar PDF
          </Button>
          <Button onClick={handleCloseDetail} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Reports;
