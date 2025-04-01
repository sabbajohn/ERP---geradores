import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import api from "../services/api";

// Função para formatar CPF (até 11 dígitos) ou CNPJ (até 14 dígitos)
function formatCpfCnpj(doc) {
    if (!doc) return "";
    // Remove tudo que não seja dígito
    const cleaned = doc.replace(/\D/g, "");

    // Se tiver até 11 dígitos, formata como CPF
    if (cleaned.length <= 11) {
        // Ex: 12345678901 => 123.456.789-01
        return cleaned.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4"
        );
    } else {
        // Se tiver mais de 11 dígitos, formata como CNPJ
        // Ex: 12345678000199 => 12.345.678/0001-99
        return cleaned.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            "$1.$2.$3/$4-$5"
        );
    }
}

function CustomerDetails() {
    const { id } = useParams(); // /customers/:id
    const [customer, setCustomer] = useState(null);
    const [generators, setGenerators] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchCustomerDetails(id);
            fetchGeneratorsByCustomer(id);
        }
    }, [id]);

    // 1) Buscar detalhes do cliente
    const fetchCustomerDetails = async (customerId) => {
        try {
            const response = await api.post(
                "/functions/getCustomerById",
                { customerId },
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );
            if (response.data.result) {
                setCustomer(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes do cliente:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2) Buscar geradores do cliente (usando a função getGeneratorsByCustomer no backend)
    const fetchGeneratorsByCustomer = async (customerId) => {
        try {
            const response = await api.post(
                "/functions/getGeneratorsByCustomer",
                { customerId },
                {
                    headers: {
                        "X-Parse-Session-Token": localStorage.getItem("sessionToken"),
                    },
                }
            );
            if (response.data.result) {
                setGenerators(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar geradores do cliente:", error);
        }
    };

    if (loading) {
        return (
            <Container>
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Carregando...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 3 }}>
            {!customer ? (
                <Typography variant="h6">Cliente não encontrado.</Typography>
            ) : (
                <>
                    {/* Cabeçalho do cliente */}
                    <Box
                        component={Paper}
                        sx={{
                            p: 3,
                            mb: 3,
                            backgroundColor: "#f1f5f9", // cor de fundo clara
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{ color: "#1976d2", fontWeight: "bold", mb: 1 }}
                        >
                            {customer.name}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>CPF/CNPJ:</strong>{" "}
                            {customer.document ? formatCpfCnpj(customer.document) : "Não informado"}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Telefone:</strong>{" "}
                            {customer.phone || "Não informado"}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>E-mail:</strong>{" "}
                            {customer.email || "Não informado"}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Logradouro:</strong>{" "}
                            {customer.address || "Não informado"}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Bairro:</strong>{" "}
                            {customer.bairro || "Não informado"}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Cidade:</strong>{" "}
                            {customer.cidade || "Não informado"}
                        </Typography>
                    </Box>

                    {/* Observações */}
                    <Box component={Paper} sx={{ p: 3, mb: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{ color: "#374151", fontWeight: "bold", mb: 1 }}
                        >
                            Observação
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                whiteSpace: "pre-line", // para exibir quebras de linha, se houver
                            }}
                        >
                            {customer.observacao
                                ? customer.observacao
                                : "Nenhuma observação registrada."}
                        </Typography>
                    </Box>

                    {/* Lista de geradores */}
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Geradores do Cliente
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table>
                            <TableHead
                                sx={{ backgroundColor: "#1f2937" }}
                            >
                                <TableRow>
                                    <TableCell sx={{ color: "#fff" }}><strong>Nome</strong></TableCell>
                                    <TableCell sx={{ color: "#fff" }}><strong>Localização</strong></TableCell>
                                    <TableCell sx={{ color: "#fff" }}><strong>Status</strong></TableCell>
                                    <TableCell sx={{ color: "#fff" }}><strong>Nº Série</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {generators.length > 0 ? (
                                    generators.map((gen) => (
                                        <TableRow key={gen.objectId}>
                                            <TableCell>{gen.name}</TableCell>
                                            <TableCell>{gen.location || "N/A"}</TableCell>
                                            <TableCell>{gen.status || "N/A"}</TableCell>
                                            <TableCell>{gen.serialNumber || "N/A"}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            Nenhum gerador encontrado para este cliente.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Container>
    );
}

export default CustomerDetails;
