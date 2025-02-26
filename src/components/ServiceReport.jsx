import React from "react";
import { format } from "date-fns";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: "#ffffff",
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        textAlign: "center",
        fontWeight: "bold",
    },
    companyInfo: {
        fontSize: 12,
        textAlign: "center",
        marginBottom: 3,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: "bold",
        backgroundColor: "#f0f0f0",
        padding: 5,
    },
    row: {
        flexDirection: "row",
        marginBottom: 5,
    },
    label: {
        width: "30%",
        fontWeight: "bold",
        fontSize: 11,
    },
    value: {
        width: "70%",
        fontSize: 11,
    },
    table: {
        display: "table",
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#000",
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
    },
    tableHeader: {
        backgroundColor: "#f0f0f0",
        fontWeight: "bold",
    },
    tableCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
        flex: 1,
        fontSize: 10,
    },
    checklistItem: {
        marginBottom: 5,
        flexDirection: "row",
        alignItems: "center",
        fontSize: 11,
    },
    bullet: {
        width: 10,
        marginRight: 5,
    },
    signatureSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    signatureContainer: {
        width: "45%",
    },
    signatureBox: {
        border: "1pt solid black",
        padding: 10,
        marginTop: 5,
    },
    signature: {
        width: "100%",
        height: 70,
        objectFit: "contain",
    },
    signatureLabel: {
        fontSize: 12,
        marginBottom: 5,
        textAlign: "center",
    },
    signatureName: {
        fontSize: 10,
        marginTop: 5,
        textAlign: "center",
    },
    attachment: {
        marginBottom: 10,
    },
    attachmentImage: {
        width: "100%",
        height: 150,
        objectFit: "contain",
    },
    attachmentCaption: {
        fontSize: 9,
        textAlign: "center",
        marginTop: 5,
    },
});

const ServiceReport = ({ reportData = {} }) => {
    const report = reportData;

    // Função auxiliar para formatar datas
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Data inválida" : format(date, "dd/MM/yyyy HH:mm");
    };

    // Função auxiliar para formatar o checklist
    const formatChecklistText = (text) => {
        return text.split(", ").map((item) =>
            item
                .replace(/([A-Z])/g, " $1")
                .toLowerCase()
                .replace(/^./, (str) => str.toUpperCase())
        );
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Text style={styles.title}>Relatório de Serviço</Text>
                    <Text style={styles.companyInfo}>Ordem de Serviço Digital</Text>
                    <Text style={styles.companyInfo}>Energimaq</Text>
                    <Text style={styles.companyInfo}>Telefone: (91) 4042-2194</Text>
                    <Text style={styles.companyInfo}>CNPJ: 45.486.401/0001-31</Text>
                    <Text style={styles.companyInfo}>Email: servicosepecas@energimaq.com.br</Text>
                    <Text style={styles.companyInfo}>
                        Endereço: Rodovia Br 316 3262 Almirante Barroso, Castanheira, Belém PA, Cep:66645-00
                    </Text>
                </View>

                {/* Informações do Cliente */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações do Cliente</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nome:</Text>
                        <Text style={styles.value}>{report.customer?.name || "N/A"}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{report.customer?.email || "N/A"}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Endereço:</Text>
                        <Text style={styles.value}>{report.customer?.address || "N/A"}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Telefone:</Text>
                        <Text style={styles.value}>{report.customer?.phone || "N/A"}</Text>
                    </View>
                </View>

                {/* Informações do Gerador */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações do Gerador</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nome:</Text>
                        <Text style={styles.value}>{report.generator?.name || "N/A"}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Número de Série:</Text>
                        <Text style={styles.value}>{report.generator?.serialNumber || "N/A"}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Localização:</Text>
                        <Text style={styles.value}>{report.generator?.location || "N/A"}</Text>
                    </View>
                </View>

                {/* Detalhes do Serviço */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detalhes do Serviço</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Data de Check-in:</Text>
                        <Text style={styles.value}>
                            {report.checkInTime ? formatDate(report.checkInTime) : "N/A"}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Data de Check-out:</Text>
                        <Text style={styles.value}>
                            {report.checkOutTime ? formatDate(report.checkOutTime) : "N/A"}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Horímetro:</Text>
                        <Text style={styles.value}>
                            {report.horimetro ||
                                (report.checklistInputs &&
                                    report.checklistInputs.find((inp) => inp.key === "horimetro")?.value) ||
                                "N/A"}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Descrição:</Text>
                        <Text style={styles.value}>{report.reportDescription || "N/A"}</Text>
                    </View>
                </View>

                {/* Medições (checklistInputs) */}
                {report.checklistInputs && report.checklistInputs.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Medições</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={styles.tableCell}>Parâmetro</Text>
                                <Text style={styles.tableCell}>Valor</Text>
                            </View>
                            {report.checklistInputs.map((input, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>
                                        {input.key
                                            .replace(/([A-Z])/g, " $1")
                                            .toLowerCase()
                                            .replace(/^./, (str) => str.toUpperCase())}
                                    </Text>
                                    <Text style={styles.tableCell}>{input.value}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Peças Utilizadas (partsUsed) */}
                {report.partsUsed && report.partsUsed.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Peças Utilizadas</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={styles.tableCell}>Item</Text>
                                <Text style={styles.tableCell}>Quantidade</Text>
                                <Text style={styles.tableCell}>Preço Unit.</Text>
                                <Text style={styles.tableCell}>Total</Text>
                            </View>
                            {report.partsUsed.map((part, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{part.itemName}</Text>
                                    <Text style={styles.tableCell}>{part.quantity}</Text>
                                    <Text style={styles.tableCell}>R$ {part.salePrice}</Text>
                                    <Text style={styles.tableCell}>R$ {part.totalPrice}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Checklist Text */}
                {report.checklistText && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Checklist de Verificação</Text>
                        {formatChecklistText(report.checklistText).map((item, index) => (
                            <View key={index} style={styles.checklistItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text>{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Assinaturas */}
                {(report.technicianSignature || report.customerSignature) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Assinaturas</Text>
                        <View style={styles.signatureSection}>
                            {/* Assinatura do Técnico */}
                            {report.technicianSignature && (
                                <View style={styles.signatureContainer}>
                                    <Text style={styles.signatureLabel}>Assinatura do Técnico</Text>
                                    <View style={styles.signatureBox}>
                                        <Image
                                            style={styles.signature}
                                            source={{ uri: report.technicianSignature }}
                                        />
                                    </View>
                                    <Text style={styles.signatureName}>
                                        {report.technician?.username || "N/A"}
                                    </Text>
                                </View>
                            )}

                            {/* Assinatura do Cliente */}
                            {report.customerSignature && (
                                <View style={styles.signatureContainer}>
                                    <Text style={styles.signatureLabel}>Assinatura do Cliente</Text>
                                    <View style={styles.signatureBox}>
                                        <Image
                                            style={styles.signature}
                                            source={{ uri: report.customerSignature }}
                                        />
                                    </View>
                                    <Text style={styles.signatureName}>
                                        {report.customer?.name || "N/A"}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Anexos */}
                {report.attachments && report.attachments.length > 0 && (
                    <View style={styles.section} break>
                        <Text style={styles.sectionTitle}>Anexos</Text>
                        {report.attachments.map((attachment, index) => (
                            <View key={index} style={styles.attachment}>
                                <Image
                                    style={styles.attachmentImage}
                                    source={{
                                        uri: attachment.base64
                                            ? attachment.base64
                                            : attachment.fileUrl,
                                    }}
                                />
                                <Text style={styles.attachmentCaption}>{attachment.fileName}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};

export default ServiceReport;
