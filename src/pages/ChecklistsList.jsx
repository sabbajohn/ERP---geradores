import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Collapse,
    Box,
    Paper
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import jsPDF from "jspdf";
import "jspdf-autotable";
import api from "../services/api";

function ChecklistsList() {
    const [checklists, setChecklists] = useState([]);
    const [expandedChecklistId, setExpandedChecklistId] = useState(null);

    useEffect(() => {
        fetchChecklists();
    }, []);

    // 1) Buscar checklists e suas fotos
    const fetchChecklists = async () => {
        try {
            const sessionToken = localStorage.getItem("sessionToken") || "";
            const response = await api.post(
                "/functions/getAllChecklists",
                {},
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );
            if (response.data.result) {
                const all = response.data.result;
                const enriched = await Promise.all(
                    all.map(async (ch) => {
                        const photosResp = await api.post(
                            "/functions/getChecklistPhotos",
                            { checklistId: ch.objectId },
                            { headers: { "X-Parse-Session-Token": sessionToken } }
                        );
                        const fotos = photosResp.data.result || [];
                        return { ...ch, _photos: fotos };
                    })
                );
                setChecklists(enriched);
            }
        } catch (error) {
            console.error("Erro ao buscar checklists:", error);
        }
    };

    // 2) Expandir/recolher detalhes do checklist
    const toggleExpand = (checklistId) => {
        setExpandedChecklistId(expandedChecklistId === checklistId ? null : checklistId);
    };

    // 3) Função auxiliar: Obter content-type da imagem (para diferenciar PNG e JPEG)
    const getContentType = async (url) => {
        const res = await fetch(url, { method: "HEAD" });
        return res.headers.get("content-type") || "";
    };

    // 4) Converter uma URL (Parse.File) em dataURL (base64)
    const fetchFileAsBase64 = async (fileUrl) => {
        const res = await fetch(fileUrl);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // 5) Função auxiliar: Adicionar imagem ao PDF, detectando o formato
    const addImageFromURL = async (doc, url, x, y, width, height) => {
        try {
            const ct = await getContentType(url);
            const base64 = await fetchFileAsBase64(url);
            let format = "PNG";
            if (ct.includes("jpeg") || ct.includes("jpg")) {
                format = "JPEG";
            }
            doc.addImage(base64, format, x, y, width, height);
        } catch (err) {
            console.error("Erro ao adicionar imagem ao PDF:", err);
        }
    };

    // 6) Exportar PDF Resumido (todos os checklists em forma de tabela)
    const exportAllToPDF = async () => {
        if (checklists.length === 0) {
            alert("Não há checklists para exportar!");
            return;
        }
        const doc = new jsPDF();
        doc.text("Relatório de Checklists (Resumido)", 14, 10);

        const tableData = checklists.map((ch) => [
            ch.objectId,
            ch.horimetroSaida || "",
            ch.horimetroDevolucao || "",
            ch.dataSaida ? new Date(ch.dataSaida.iso).toLocaleString() : "",
            ch.dataDevolucao ? new Date(ch.dataDevolucao.iso).toLocaleString() : "",
        ]);

        doc.autoTable({
            startY: 20,
            head: [
                ["ID", "Horímetro Saída", "Horímetro Devolução", "Data Saída", "Data Devolução"]
            ],
            body: tableData,
        });

        doc.save("checklists_resumido.pdf");
    };

    // 7) Exportar PDF Detalhado de um checklist, agrupando Saída e Devolução
    const exportSingleChecklistToPDF = async (checklist) => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(12);
            doc.text(`Checklist: ${checklist.objectId}`, 14, 10);
            let cursorY = 20;

            // 7.1) Informações Gerais (Exibidas apenas uma vez)
            const infoBody = [
                ["Gerador", checklist.gerador?.serialNumber || "Sem Gerador"],
                ["Cliente", checklist.cliente?.name || "Sem Cliente"],
                ["Horímetro Saída", checklist.horimetroSaida || ""],
                ["Horímetro Devolução", checklist.horimetroDevolucao || ""],
                [
                    "Data Saída",
                    checklist.dataSaida ? new Date(checklist.dataSaida.iso).toLocaleString() : ""
                ],
                [
                    "Data Devolução",
                    checklist.dataDevolucao ? new Date(checklist.dataDevolucao.iso).toLocaleString() : ""
                ],
            ];
            doc.autoTable({
                startY: cursorY,
                head: [["Campo", "Valor"]],
                body: infoBody,
                margin: { left: 14 },
            });
            cursorY = doc.lastAutoTable.finalY + 10;

            // 7.2) Seção SAÍDA
            doc.text("Seção: Saída", 14, cursorY);
            cursorY += 5;

            if (checklist.checklistSaida?.length > 0) {
                doc.text("Checklist de Saída", 14, cursorY);
                cursorY += 5;
                const saidaData = checklist.checklistSaida.map((item) => [
                    item.label || "",
                    item.status || "",
                    item.observacao || "",
                ]);
                doc.autoTable({
                    startY: cursorY,
                    head: [["Item", "Status", "Observação"]],
                    body: saidaData,
                    margin: { left: 14 },
                });
                cursorY = doc.lastAutoTable.finalY + 10;
            }

            if (checklist.signatureClienteSaida) {
                doc.text("Assinatura Cliente (Saída):", 14, cursorY);
                cursorY += 5;
                await addImageFromURL(doc, checklist.signatureClienteSaida.url, 14, cursorY, 50, 20);
                cursorY += 30;
            }
            if (checklist.signatureLojaSaida) {
                doc.text("Assinatura Loja (Saída):", 14, cursorY);
                cursorY += 5;
                await addImageFromURL(doc, checklist.signatureLojaSaida.url, 14, cursorY, 50, 20);
                cursorY += 30;
            }
            if (checklist._photos?.length > 0) {
                const fotosSaida = checklist._photos.filter((p) => p.flow === "saida");
                if (fotosSaida.length > 0) {
                    doc.text("Fotos Anexadas - Saída:", 14, cursorY);
                    cursorY += 5;
                    for (let i = 0; i < fotosSaida.length; i++) {
                        const photo = fotosSaida[i];
                        if (photo.photo && photo.photo.url) {
                            await addImageFromURL(doc, photo.photo.url, 14, cursorY, 50, 30);
                            cursorY += 40;
                            if (cursorY > 260) {
                                doc.addPage();
                                cursorY = 20;
                            }
                        }
                    }
                }
            }

            // 7.3) Seção DEVOLUÇÃO
            doc.text("Seção: Devolução", 14, cursorY);
            cursorY += 5;

            if (checklist.checklistDevolucao?.length > 0) {
                doc.text("Checklist de Devolução", 14, cursorY);
                cursorY += 5;
                const devData = checklist.checklistDevolucao.map((item) => [
                    item.label || "",
                    item.status || "",
                    item.observacao || "",
                ]);
                doc.autoTable({
                    startY: cursorY,
                    head: [["Item", "Status", "Observação"]],
                    body: devData,
                    margin: { left: 14 },
                });
                cursorY = doc.lastAutoTable.finalY + 10;
            }

            if (checklist.signatureClienteDevolucao) {
                doc.text("Assinatura Cliente (Devolução):", 14, cursorY);
                cursorY += 5;
                await addImageFromURL(doc, checklist.signatureClienteDevolucao.url, 14, cursorY, 50, 20);
                cursorY += 30;
            }
            if (checklist.signatureLojaDevolucao) {
                doc.text("Assinatura Loja (Devolução):", 14, cursorY);
                cursorY += 5;
                await addImageFromURL(doc, checklist.signatureLojaDevolucao.url, 14, cursorY, 50, 20);
                cursorY += 30;
            }
            if (checklist._photos?.length > 0) {
                const fotosDevolucao = checklist._photos.filter((p) => p.flow === "devolucao");
                if (fotosDevolucao.length > 0) {
                    doc.text("Fotos Anexadas - Devolução:", 14, cursorY);
                    cursorY += 5;
                    for (let i = 0; i < fotosDevolucao.length; i++) {
                        const photo = fotosDevolucao[i];
                        if (photo.photo && photo.photo.url) {
                            await addImageFromURL(doc, photo.photo.url, 14, cursorY, 50, 30);
                            cursorY += 40;
                            if (cursorY > 260) {
                                doc.addPage();
                                cursorY = 20;
                            }
                        }
                    }
                }
            }

            doc.save(`checklist_${checklist.objectId}_detalhado.pdf`);
            console.log("PDF gerado com sucesso!");
        } catch (error) {
            console.error("Erro ao gerar PDF detalhado:", error);
            alert("Erro ao gerar PDF detalhado: " + error.message);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Lista de Checklists
            </Typography>

            <Button variant="contained" onClick={exportAllToPDF} sx={{ mb: 2 }}>
                Exportar TODOS (Resumido) PDF
            </Button>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell><strong>Gerador</strong></TableCell>
                        <TableCell><strong>Cliente</strong></TableCell>
                        <TableCell><strong>Data Saída</strong></TableCell>
                        <TableCell><strong>Data Devolução</strong></TableCell>
                        <TableCell><strong>Ações</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {checklists.map((ch) => {
                        const isExpanded = expandedChecklistId === ch.objectId;
                        return (
                            <React.Fragment key={ch.objectId}>
                                <TableRow>
                                    <TableCell>{ch.objectId}</TableCell>
                                    <TableCell>
                                        {ch.gerador
                                            ? ch.gerador.serialNumber || ch.gerador.name || "Gerador sem nome"
                                            : "Sem Gerador"}
                                    </TableCell>
                                    <TableCell>
                                        {ch.cliente
                                            ? ch.cliente.name || "Cliente sem nome"
                                            : "Sem Cliente"}
                                    </TableCell>
                                    <TableCell>
                                        {ch.dataSaida
                                            ? new Date(ch.dataSaida.iso).toLocaleString()
                                            : ""}
                                    </TableCell>
                                    <TableCell>
                                        {ch.dataDevolucao
                                            ? new Date(ch.dataDevolucao.iso).toLocaleString()
                                            : ""}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            onClick={() => exportSingleChecklistToPDF(ch)}
                                            sx={{ mr: 1 }}
                                        >
                                            PDF Detalhado
                                        </Button>
                                        <Button
                                            variant="text"
                                            onClick={() => toggleExpand(ch.objectId)}
                                        >
                                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </Button>
                                    </TableCell>
                                </TableRow>

                                {/* Linha Expandida com detalhes */}
                                <TableRow>
                                    <TableCell colSpan={6} style={{ padding: 0 }}>
                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                            <Box sx={{ m: 2 }}>
                                                {/* Horímetros */}
                                                <Typography variant="subtitle1">
                                                    Horímetro Saída: {ch.horimetroSaida || "--"}
                                                </Typography>
                                                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                                    Horímetro Devolução: {ch.horimetroDevolucao || "--"}
                                                </Typography>

                                                {/* Seção SAÍDA */}
                                                <Paper sx={{ p: 2, mb: 2 }}>
                                                    <Typography variant="h6">Seção: Saída</Typography>
                                                    {ch.checklistSaida?.length > 0 && (
                                                        <>
                                                            <Typography variant="subtitle1">
                                                                Checklist de Saída:
                                                            </Typography>
                                                            {ch.checklistSaida.map((item, idx) => (
                                                                <Box key={idx} sx={{ ml: 1 }}>
                                                                    <strong>{item.label}:</strong> {item.status}
                                                                    {item.observacao && ` (${item.observacao})`}
                                                                </Box>
                                                            ))}
                                                        </>
                                                    )}
                                                    {ch.signatureClienteSaida && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="subtitle1">
                                                                Assinatura Cliente (Saída):
                                                            </Typography>
                                                            <img
                                                                src={ch.signatureClienteSaida.url}
                                                                alt="Ass. Cliente Saída"
                                                                style={{ width: 180, border: "1px solid #ccc" }}
                                                            />
                                                        </Box>
                                                    )}
                                                    {ch.signatureLojaSaida && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="subtitle1">
                                                                Assinatura Loja (Saída):
                                                            </Typography>
                                                            <img
                                                                src={ch.signatureLojaSaida.url}
                                                                alt="Ass. Loja Saída"
                                                                style={{ width: 180, border: "1px solid #ccc" }}
                                                            />
                                                        </Box>
                                                    )}
                                                    {ch._photos && ch._photos.filter((p) => p.flow === "saida").length > 0 && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="subtitle1">
                                                                Fotos da Saída:
                                                            </Typography>
                                                            <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                                                                {ch._photos
                                                                    .filter((p) => p.flow === "saida")
                                                                    .map((photoObj) => {
                                                                        const photoUrl = photoObj.photo?.url;
                                                                        if (!photoUrl) return null;
                                                                        return (
                                                                            <img
                                                                                key={photoObj.objectId}
                                                                                src={photoUrl}
                                                                                alt="Foto Saída"
                                                                                style={{
                                                                                    width: 120,
                                                                                    height: "auto",
                                                                                    border: "1px solid #ccc"
                                                                                }}
                                                                            />
                                                                        );
                                                                    })}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Paper>

                                                {/* Seção DEVOLUÇÃO */}
                                                <Paper sx={{ p: 2, mb: 2 }}>
                                                    <Typography variant="h6">Seção: Devolução</Typography>
                                                    {ch.checklistDevolucao?.length > 0 && (
                                                        <>
                                                            <Typography variant="subtitle1">
                                                                Checklist de Devolução:
                                                            </Typography>
                                                            {ch.checklistDevolucao.map((item, idx) => (
                                                                <Box key={idx} sx={{ ml: 1 }}>
                                                                    <strong>{item.label}:</strong> {item.status}
                                                                    {item.observacao && ` (${item.observacao})`}
                                                                </Box>
                                                            ))}
                                                        </>
                                                    )}
                                                    {ch.signatureClienteDevolucao && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="subtitle1">
                                                                Assinatura Cliente (Devolução):
                                                            </Typography>
                                                            <img
                                                                src={ch.signatureClienteDevolucao.url}
                                                                alt="Ass. Cliente Devolução"
                                                                style={{ width: 180, border: "1px solid #ccc" }}
                                                            />
                                                        </Box>
                                                    )}
                                                    {ch.signatureLojaDevolucao && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="subtitle1">
                                                                Assinatura Loja (Devolução):
                                                            </Typography>
                                                            <img
                                                                src={ch.signatureLojaDevolucao.url}
                                                                alt="Ass. Loja Devolução"
                                                                style={{ width: 180, border: "1px solid #ccc" }}
                                                            />
                                                        </Box>
                                                    )}
                                                    {ch._photos && ch._photos.filter((p) => p.flow === "devolucao").length > 0 && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="subtitle1">
                                                                Fotos da Devolução:
                                                            </Typography>
                                                            <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                                                                {ch._photos
                                                                    .filter((p) => p.flow === "devolucao")
                                                                    .map((photoObj) => {
                                                                        const photoUrl = photoObj.photo?.url;
                                                                        if (!photoUrl) return null;
                                                                        return (
                                                                            <img
                                                                                key={photoObj.objectId}
                                                                                src={photoUrl}
                                                                                alt="Foto Devolução"
                                                                                style={{
                                                                                    width: 120,
                                                                                    height: "auto",
                                                                                    border: "1px solid #ccc"
                                                                                }}
                                                                            />
                                                                        );
                                                                    })}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Paper>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        );
                    })}
                    {checklists.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                Nenhum checklist encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Container>
    );
}

export default ChecklistsList;
