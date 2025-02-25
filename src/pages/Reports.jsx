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
  ListItemIcon,
  Tooltip,
  Paper as MuiPaper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import api from "../services/api";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ServiceReport from "../components/ServiceReport";

// Função utilitária para formatar os itens do checklist
const formatChecklistItem = (item) => {
  let newItem = item.trim().replace(/^verificar/i, "verificado");
  newItem = newItem.replace(/([A-Z])/g, " $1").trim();
  return newItem.charAt(0).toUpperCase() + newItem.slice(1);
};

function Reports() {
  const [filters, setFilters] = useState({ technician: "", generator: "" });
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  // Estados para os modais
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openChecklistModal, setOpenChecklistModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // Estados para PDF
  const [pdfReportData, setPdfReportData] = useState(null);
  const [showPdfDownloadLink, setShowPdfDownloadLink] = useState(false);

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
          headers: {
            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
          },
        }
      );
      if (resp.data.result) {
        const fetched = resp.data.result;
        console.log("Relatórios recebidos do backend:", fetched);
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
      const genSerial = r.generatorId?.serialNumber?.toLowerCase() || "";
      return techName.includes(lowerTech) && genSerial.includes(lowerGen);
    });
    setFilteredReports(temp);
  };

  // Abre modal de detalhes do relatório
  const handleViewDetails = (rep) => {
    setSelectedReport(rep);
    setAttachments(rep.attachments || []);
    setOpenDetail(true);
    setPdfReportData(null);
    setShowPdfDownloadLink(false);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedReport(null);
    setAttachments([]);
    setPdfReportData(null);
    setShowPdfDownloadLink(false);
  };

  // Abre modal de checklist
  const handleOpenChecklistModal = (rep) => {
    setSelectedChecklist(rep);
    setOpenChecklistModal(true);
  };

  // Função para converter uma URL para base64 (caso o anexo não possua base64File)
  const getBase64ImageFromUrl = async (url) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Erro ao converter imagem:", url, error);
      return url; // em caso de erro, devolve a URL original
    }
  };

  // Atualiza os dados para o PDF pré-convertendo as imagens para base64
  const handleExportPDF = async () => {
    if (!selectedReport) {
      alert("Nenhum relatório selecionado.");
      return;
    }

    try {
      // 1) Buscar dados mais completos do relatório
      const response = await api.post(
        "/functions/getMaintenanceReportDetails",
        { reportId: selectedReport.objectId },
        {
          headers: {
            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
          },
        }
      );

      if (!(response.data && response.data.result)) {
        alert("Falha ao obter os dados do relatório para gerar o PDF.");
        return;
      }

      let reportData = response.data.result;

      // Se existir checklistText, formata
      if (reportData.checklistText) {
        const checklistItems = reportData.checklistText
          .split(",")
          .map((item) => item.trim().replace(/^verificar/i, "verificado"));
        reportData.checklistText = checklistItems.join(", ");
      }

      // ----- SE EXISTIR base64File, JÁ UTILIZA -----
      if (reportData.attachments && Array.isArray(reportData.attachments)) {
        reportData.attachments.forEach((att) => {
          // Se o novo campo base64File existir, já monta o data:image
          if (att.base64File) {
            att.fileUrl = `data:image/jpeg;base64,${att.base64File}`;
          }
        });
      }

      // Converte assinaturas se não tiverem data:
      if (reportData.technicianSignature && !reportData.technicianSignature.startsWith("data:")) {
        reportData.technicianSignature = await getBase64ImageFromUrl(
          reportData.technicianSignature
        );
      }
      if (reportData.customerSignature && !reportData.customerSignature.startsWith("data:")) {
        reportData.customerSignature = await getBase64ImageFromUrl(
          reportData.customerSignature
        );
      }

      // Converte anexos que ainda não estejam em data: (p.ex. relatórios antigos)
      if (reportData.attachments && Array.isArray(reportData.attachments)) {
        reportData.attachments = await Promise.all(
          reportData.attachments.map(async (att) => {
            // Se já estiver em data: (ou acabou de ser montado acima), não chamamos fetch
            if (att.fileUrl && !att.fileUrl.startsWith("data:")) {
              att.fileUrl = await getBase64ImageFromUrl(att.fileUrl);
            }
            return att;
          })
        );
      }

      console.log("Dados para PDF (imagens convertidas):", reportData);
      setPdfReportData(reportData);
      setShowPdfDownloadLink(true);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    }
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
              placeholder="Serial Number do gerador"
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
              <TableCell>
                <strong>Gerador</strong>
              </TableCell>
              <TableCell>
                <strong>Data Criação</strong>
              </TableCell>
              <TableCell>
                <strong>Técnico</strong>
              </TableCell>
              <TableCell>
                <strong>Cliente</strong>
              </TableCell>
              <TableCell>
                <strong>Descrição</strong>
              </TableCell>
              <TableCell>
                <strong>Horímetro</strong>
              </TableCell>
              <TableCell>
                <strong>Checklist</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Ações</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((rep) => {
              const genSerial = rep.generatorId?.serialNumber || "Sem gerador";
              const techName = rep.technicianUser?.username || "Desconhecido";
              const iso = rep.createdAt?.iso || rep.createdAt;
              const createDate = iso ? new Date(iso).toLocaleString("pt-BR") : "";
              const horimetroValue =
                rep.horimetro ||
                (rep.checklistInputs &&
                  rep.checklistInputs.find((input) => input.key === "horimetro")?.value) ||
                "N/A";
              const clientName =
                rep.maintenanceCustomer?.name || rep.customerId?.name || "N/A";

              return (
                <TableRow key={rep.objectId}>
                  <TableCell>{genSerial}</TableCell>
                  <TableCell>{createDate}</TableCell>
                  <TableCell>{techName}</TableCell>
                  <TableCell>{clientName}</TableCell>
                  <TableCell>{rep.reportDescription}</TableCell>
                  <TableCell>{horimetroValue}</TableCell>
                  <TableCell>
                    <Tooltip title="Clique para ver o checklist" arrow>
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => handleOpenChecklistModal(rep)}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
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
      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="md" fullWidth>
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
              {/* Cabeçalho */}
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Ordem de Serviço Digital
                </Typography>
                <Typography variant="subtitle1">Energimaq</Typography>
                <Typography variant="body2">Telefone: (91) 4042-2194</Typography>
                <Typography variant="body2">CNPJ: 45.486.401/0001-31</Typography>
                <Typography variant="body2">Email: servicosepecas@energimaq.com.br</Typography>
                <Typography variant="body2">
                  Endereço: Rodovia Br 316 3262 Almirante Barroso, Castanheira, Belém PA, Cep:66645-00
                </Typography>
              </Box>

              {/* Cliente */}
              <MuiPaper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Informações do Cliente
                </Typography>
                <Typography>
                  <strong>Nome do Cliente:</strong>{" "}
                  {selectedReport.maintenanceCustomer?.name ||
                    selectedReport.customerId?.name ||
                    "N/A"}
                </Typography>
                <Typography>
                  <strong>E-mail:</strong> {selectedReport.customerId?.email || "-"}
                </Typography>
                <Typography>
                  <strong>Endereço:</strong> {selectedReport.customerId?.address || "-"}
                </Typography>
                <Typography>
                  <strong>Telefone:</strong> {selectedReport.customerId?.phone || "-"}
                </Typography>
              </MuiPaper>

              {/* Gerador */}
              <MuiPaper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Informações do Gerador
                </Typography>
                <Typography>
                  <strong>Serial Number:</strong>{" "}
                  {selectedReport.generatorId?.serialNumber || "N/A"}
                </Typography>
                <Typography>
                  <strong>Localização do Gerador:</strong>{" "}
                  {selectedReport.generatorId?.location || "N/A"}
                </Typography>
              </MuiPaper>

              {/* Ordem de Serviço */}
              <MuiPaper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Detalhes da Ordem de Serviço
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Data de Check-in:</strong>{" "}
                      {selectedReport.checkInTime
                        ? new Date(selectedReport.checkInTime).toLocaleString("pt-BR")
                        : "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Data de Check-out:</strong>{" "}
                      {selectedReport.checkOutTime
                        ? new Date(selectedReport.checkOutTime).toLocaleString("pt-BR")
                        : "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Duração:</strong> {selectedReport.duration || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Horímetro:</strong>{" "}
                      {selectedReport.horimetro ||
                        (selectedReport.checklistInputs &&
                          selectedReport.checklistInputs.find(
                            (input) => input.key === "horimetro"
                          )?.value) ||
                        "N/A"}
                    </Typography>
                  </Grid>
                </Grid>
              </MuiPaper>

              {/* Relato */}
              <MuiPaper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Relato de Execução
                </Typography>
                <Typography>
                  {selectedReport.reportDescription || "Sem relato de execução."}
                </Typography>
              </MuiPaper>

              {/* Checklist */}
              <MuiPaper sx={{ p: 2, textAlign: "center" }}>
                <Button
                  variant="outlined"
                  startIcon={<InfoIcon />}
                  onClick={() => handleOpenChecklistModal(selectedReport)}
                >
                  Ver Checklist
                </Button>
              </MuiPaper>

              {/* Peças */}
              {selectedReport.partsUsed && selectedReport.partsUsed.length > 0 && (
                <MuiPaper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Peças Trocadas
                  </Typography>
                  <List>
                    {selectedReport.partsUsed.map((p, idx) => (
                      <ListItem key={idx} divider>
                        <ListItemText primary={`${p.itemName} (x${p.quantity})`} />
                      </ListItem>
                    ))}
                  </List>
                </MuiPaper>
              )}

              {/* Assinaturas */}
              {selectedReport.technicianSignature &&
                selectedReport.technicianSignature !== "" && (
                  <MuiPaper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                      Assinatura do Técnico
                    </Typography>
                    <img
                      src={selectedReport.technicianSignature}
                      alt="Assinatura do Técnico"
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  </MuiPaper>
                )}

              {selectedReport.customerSignature &&
                selectedReport.customerSignature !== "" && (
                  <MuiPaper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                      Assinatura do Cliente
                    </Typography>
                    <img
                      src={selectedReport.customerSignature}
                      alt="Assinatura do Cliente"
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  </MuiPaper>
                )}

              {/* Anexos */}
              {attachments.length > 0 && (
                <MuiPaper sx={{ p: 2 }}>
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
                </MuiPaper>
              )}
            </Box>
          ) : (
            <Typography>Selecione um relatório</Typography>
          )}
        </DialogContent>

        {/* DialogActions com PDFDownloadLink */}
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
          >
            Gerar PDF
          </Button>

          {showPdfDownloadLink && pdfReportData && (
            <PDFDownloadLink
              document={<ServiceReport reportData={pdfReportData} />}
              fileName="relatorio_servico.pdf"
            >
              {({ loading }) => (
                <Button
                  color="secondary"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  disabled={loading}
                  onClick={() => {
                    // Fecha após 5s por segurança (opcional)
                    setTimeout(() => {
                      setShowPdfDownloadLink(false);
                      setPdfReportData(null);
                    }, 5000);
                  }}
                >
                  {loading ? "Gerando PDF..." : "Baixar PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          )}
          <Button onClick={handleCloseDetail} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Checklist */}
      <Dialog
        open={openChecklistModal}
        onClose={() => setOpenChecklistModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalhes do Checklist</DialogTitle>
        <DialogContent dividers>
          {selectedChecklist ? (
            <Box>
              {selectedChecklist.checklistText ? (
                <List>
                  {selectedChecklist.checklistText.split(",").map((item, idx) => {
                    const newItem = formatChecklistItem(item);
                    return (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={newItem} />
                      </ListItem>
                    );
                  })}
                  {selectedChecklist.checklistInputs &&
                    selectedChecklist.checklistInputs.length > 0 && (
                      <>
                        <ListItem>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                            Campos de Entrada:
                          </Typography>
                        </ListItem>
                        {selectedChecklist.checklistInputs.map((input, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={`${input.key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}: ${input.value}`}
                            />
                          </ListItem>
                        ))}
                      </>
                    )}
                </List>
              ) : (
                <Typography>Nenhum item no checklist.</Typography>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChecklistModal(false)} color="primary" variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Reports;
