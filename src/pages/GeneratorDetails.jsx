import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Card,
    CardHeader,
    CardContent,
    Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import api from "../services/api";

// Linha estilizada para alternar cores
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
        backgroundColor: theme.palette.action.focus,
    },
}));

function GeneratorDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [generator, setGenerator] = useState(null);
    const [maintenances, setMaintenances] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Para exibir imagens em um modal
    const [selectedImage, setSelectedImage] = useState(null);

    // ------------------------------
    // 1) Buscar dados do gerador
    // ------------------------------
    useEffect(() => {
        const fetchGeneratorDetails = async () => {
            try {
                const response = await api.post(
                    "/functions/getGeneratorById",
                    { generatorId: id },
                    {
                        headers: {
                            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                        },
                    }
                );
                if (response.data?.result) {
                    setGenerator(response.data.result);
                }
            } catch (error) {
                console.error("Erro ao buscar detalhes do gerador:", error);
            }
        };
        fetchGeneratorDetails();
    }, [id]);

    // ------------------------------
    // 2) Buscar Manutenções
    // ------------------------------
    useEffect(() => {
        const fetchMaintenances = async () => {
            try {
                if (!id) return;
                const res = await api.post(
                    "/functions/getMaintenancesByGenerator",
                    { generatorId: id },
                    {
                        headers: {
                            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                        },
                    }
                );
                if (res.data?.result) {
                    setMaintenances(res.data.result);
                }
            } catch (error) {
                console.error("Erro ao buscar manutenções:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaintenances();
    }, [id]);

    // ------------------------------
    // 3) Buscar Relatórios completos
    // ------------------------------
    useEffect(() => {
        const fetchReports = async () => {
            try {
                if (!id) return;
                const res = await api.post(
                    "/functions/getFullReportsByGenerator",
                    { generatorId: id },
                    {
                        headers: {
                            "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                        },
                    }
                );
                if (res.data?.result) {
                    setReports(res.data.result);
                }
            } catch (error) {
                console.error("Erro ao buscar relatórios do gerador:", error);
            }
        };
        fetchReports();
    }, [id]);

    // Se estiver carregando
    if (loading) {
        return (
            <Container sx={{ mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    // Se o gerador não foi encontrado
    if (!generator) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h6" color="error">
                    Não foi possível carregar os dados do gerador.
                </Typography>
            </Container>
        );
    }

    // ------------------------------
    // Funções de formatação
    // ------------------------------
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const parsed = new Date(dateString);
        if (isNaN(parsed.getTime())) return "—";
        return parsed.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Formata data e hora (DD/MM/AAAA HH:MM)
    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        const parsed = new Date(dateString);
        if (isNaN(parsed.getTime())) return dateString; // Retorna string crua se inválido
        return parsed.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    // Para abrir/fechar modal de imagens
    const handleOpenImage = (url) => setSelectedImage(url);
    const handleCloseImage = () => setSelectedImage(null);

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            {/* Botão de Voltar */}
            <Box sx={{ mb: 2 }}>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    Voltar
                </Button>
            </Box>

            {/* -------------------------------------
          Detalhes do Gerador (Card)
      -------------------------------------- */}
            <Card sx={{ mb: 3 }}>
                <CardHeader title="Detalhes do Gerador" />
                <CardContent>
                    <Grid container spacing={2}>
                        {/* Coluna 1 */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Nome: {generator.name}
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Número de Série: {generator.serialNumber}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Localização:</strong>{" "}
                                {generator.location || "Não informado"}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Status:</strong> {generator.status}
                            </Typography>

                            <Typography sx={{ mb: 1 }}>
                                <strong>Cliente:</strong>{" "}
                                {generator.customer ? generator.customer.name : "Sem Cliente"}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Data de Compra:</strong>{" "}
                                {formatDate(generator.purchaseDate)}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Data de Entrega Técnica:</strong>{" "}
                                {formatDate(generator.deliveryDate)}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Última Manutenção:</strong>{" "}
                                {formatDate(generator.lastMaintenanceDate)}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Adicionado por:</strong>{" "}
                                {generator.creatorName || "Não informado"}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Horímetro Atual:</strong>{" "}
                                {generator.horimetroAtual !== undefined
                                    ? generator.horimetroAtual
                                    : "—"}
                            </Typography>
                        </Grid>

                        {/* Coluna 2 */}
                        <Grid item xs={12} md={6}>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Motor:</strong> {generator.motor || "—"}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Modelo:</strong> {generator.modelo || "—"}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Fabricante:</strong> {generator.fabricante || "—"}
                            </Typography>
                            <Typography sx={{ mb: 1 }}>
                                <strong>Potência:</strong> {generator.potencia || "—"}
                            </Typography>

                            {/* BLOCO PARA EXIBIR CAMPOS EXTRAS, SE EXISTIREM */}
                            {generator.extraFields && generator.extraFields.length > 0 && (
                                <Box mt={2}>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}
                                    >
                                        Campos Adicionais
                                    </Typography>
                                    {generator.extraFields.map((field) => (
                                        <Typography key={field.objectId} sx={{ mb: 0.5 }}>
                                            <strong>{field.fieldName}:</strong> {field.fieldValue}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* -------------------------------------
          Manutenções Relacionadas (Card)
      -------------------------------------- */}
            <Card sx={{ mb: 3 }}>
                <CardHeader title="Manutenções Relacionadas" />
                <CardContent>
                    {maintenances.length === 0 ? (
                        <Typography>
                            Nenhuma manutenção cadastrada para este gerador.
                        </Typography>
                    ) : (
                        <Table component={Paper}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <strong>Data</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Início</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Término</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Status</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {maintenances.map((maintenance) => {
                                    const maintenanceDate = maintenance?.maintenanceDate?.iso
                                        ? maintenance.maintenanceDate.iso
                                        : maintenance.maintenanceDate;
                                    return (
                                        <StyledTableRow key={maintenance.objectId}>
                                            <TableCell>
                                                {formatDate(maintenanceDate)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(maintenance.startTime)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(maintenance.endTime)}
                                            </TableCell>
                                            <TableCell>{maintenance.status || "—"}</TableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* -------------------------------------
          Relatórios de Manutenção (completos)
      -------------------------------------- */}
            <Card>
                <CardHeader title="Relatórios de Manutenção" />
                <CardContent>
                    {reports.length === 0 ? (
                        <Typography>
                            Nenhum relatório cadastrado para este gerador.
                        </Typography>
                    ) : (
                        <Table component={Paper}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <strong>Descrição</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Check-in</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Check-out</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Peças Usadas</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Anexos</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Cliente</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Técnico</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reports.map((report) => {
                                    // Peças Usadas
                                    const partsUsed =
                                        report.partsUsed?.map((part, idx) => (
                                            <div key={idx}>
                                                {part.itemName} - {part.quantity}x
                                            </div>
                                        )) || "—";

                                    // Anexos -> miniaturas clicáveis
                                    const attachments =
                                        report.attachments?.map((att) => (
                                            <div
                                                key={att.objectId}
                                                style={{ marginBottom: 4 }}
                                            >
                                                <img
                                                    src={att.fileUrl}
                                                    alt={att.fileName}
                                                    style={{
                                                        maxWidth: 60,
                                                        maxHeight: 60,
                                                        cursor: "pointer",
                                                        borderRadius: 4,
                                                    }}
                                                    onClick={() => handleOpenImage(att.fileUrl)}
                                                />
                                            </div>
                                        )) || "—";

                                    // Nome do cliente e do técnico
                                    const customerName = report.customerId?.name || "—";
                                    const technicianName =
                                        report.technicianUser?.name ||
                                        report.technicianUser?.username ||
                                        "—";

                                    return (
                                        <StyledTableRow key={report.objectId}>
                                            <TableCell>
                                                {report.reportDescription || "—"}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(report.checkInTime)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(report.checkOutTime)}
                                            </TableCell>
                                            <TableCell>
                                                {Array.isArray(partsUsed) && partsUsed.length
                                                    ? partsUsed
                                                    : "—"}
                                            </TableCell>
                                            <TableCell>
                                                {Array.isArray(attachments) && attachments.length
                                                    ? attachments
                                                    : "—"}
                                            </TableCell>
                                            <TableCell>{customerName}</TableCell>
                                            <TableCell>{technicianName}</TableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Modal para exibir imagem em tamanho grande */}
            <Dialog
                open={!!selectedImage}
                onClose={handleCloseImage}
                maxWidth="lg"
            >
                <DialogContent sx={{ textAlign: "center" }}>
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Anexo"
                            style={{ maxWidth: "100%", maxHeight: "80vh" }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseImage}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default GeneratorDetails;
