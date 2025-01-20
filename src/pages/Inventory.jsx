import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../services/api";

import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    Tooltip,
    Box
} from "@mui/material";
import { Edit, Delete, RemoveShoppingCart } from "@mui/icons-material";




const Inventory = () => {
    const sessionToken = localStorage.getItem("sessionToken");

    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [historySearchQuery, setHistorySearchQuery] = useState("");
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        itemName: "",
        itemCode: "",
        quantity: "",
        pricePerUnit: "",
        supplier: "",
    });
    const [editingItem, setEditingItem] = useState(null);

    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Número de itens por página

    const paginatedInventory = filteredInventory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };



    // Buscar estoques
    const fetchInventory = async () => {
        try {
            const response = await api.post(
                "/functions/getAllInventoryItems",
                {},
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );

            if (response.data.result) {
                setInventory(response.data.result);
                setFilteredInventory(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar estoque:", error.message);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleSort = (column) => {
        const newDirection = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
        setSortColumn(column);
        setSortDirection(newDirection);

        const sortedData = [...filteredInventory].sort((a, b) => {
            if (a[column] < b[column]) return newDirection === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newDirection === "asc" ? 1 : -1;
            return 0;
        });

        setFilteredInventory(sortedData);
    };

    const getRowStyle = (quantity) => {
        return quantity <= 5 ? { backgroundColor: "#FFEBEE", fontWeight: "bold" } : {};
    };


    // Buscar histórico de movimentação
    const fetchInventoryHistory = async () => {
        try {
            const response = await api.post(
                "/functions/getInventoryHistory",
                {},
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );

            if (response.data.result) {
                setHistory(response.data.result);
                setFilteredHistory(response.data.result);
            }
        } catch (error) {
            console.error("Erro ao buscar histórico:", error.message);
        }
    };

    useEffect(() => {
        fetchInventoryHistory();
    }, []);

    const exportToPDF = () => {
        if (inventory.length === 0) {
            alert("Nenhum item no estoque para exportar.");
            return;
        }

        const doc = new jsPDF();
        doc.text("Relatório de Estoque", 14, 10);

        // 🛠️ Adicionando corretamente a tabela ao PDF
        doc.autoTable({
            startY: 20,
            head: [["Nome", "Código", "Quantidade", "Preço (R$)", "Fornecedor"]],
            body: inventory.map(item => [
                item.itemName,
                item.itemCode,
                item.quantity,
                `R$ ${item.pricePerUnit}`,
                item.supplier
            ]),
        });

        doc.save("estoque.pdf");
    };


    // Filtrar estoque por nome ou código
    const handleInventorySearch = (query) => {
        setSearchQuery(query);
        const filtered = inventory.filter(item =>
            item.itemName.toLowerCase().includes(query.toLowerCase()) ||
            item.itemCode.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredInventory(filtered);
    };

    // Filtrar histórico por nome, código ou data
    const handleHistorySearch = (query) => {
        setHistorySearchQuery(query);
        const filtered = history.filter(record =>
            record.itemName.toLowerCase().includes(query.toLowerCase()) ||
            record.updatedAt.iso.includes(query)
        );
        setFilteredHistory(filtered);
    };

    // Abrir modal de adicionar/editar item
    const handleOpen = (item = null) => {
        if (item) {
            console.log("Editando item:", item);
            setEditingItem(item);
            setFormData({
                itemName: item.itemName || "",
                itemCode: item.itemCode || "",
                quantity: item.quantity ? item.quantity.toString() : "",
                pricePerUnit: item.pricePerUnit ? item.pricePerUnit.toString() : "",
                supplier: item.supplier || "",
            });
        } else {
            console.log("Adicionando novo item");
            setEditingItem(null);
            setFormData({
                itemName: "",
                itemCode: "",
                quantity: "",
                pricePerUnit: "",
                supplier: "",
            });
        }


        setTimeout(() => {
            setOpen(true);
        }, 100);
    };


    // Fechar modal
    const handleClose = () => {
        setOpen(false);
    };

    // Abrir modal do histórico
    const handleOpenHistoryModal = () => {
        setHistoryModalOpen(true);
    };

    // Fechar modal do histórico
    const handleCloseHistoryModal = () => {
        setHistoryModalOpen(false);
    };

    //softdelete
    const handleDelete = async (itemId) => {
        if (!window.confirm("Tem certeza que deseja excluir este item?")) return;

        try {
            await api.post(
                "/functions/softDeleteInventoryItem",
                { itemId },
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );
            fetchInventory();
        } catch (error) {
            console.error("Erro ao excluir item:", error.message);
        }
    };
    const logInventoryChange = async (itemId, itemName, action, quantityChange, newQuantity) => {
        try {
            await api.post(
                "/functions/createInventoryHistory",
                { itemId, itemName, action, quantityChange, newQuantity },
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );
            console.log("Movimentação registrada:", { itemId, itemName, action, quantityChange, newQuantity });
            fetchInventoryHistory();
        } catch (error) {
            console.error("Erro ao salvar histórico:", error.response?.data || error.message);
        }
    };

    //Retirar um Item do Estoque
    const handleWithdraw = async (item) => {
        const withdrawAmount = prompt(`Quantas unidades de "${item.itemName}" deseja retirar?`);

        if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
            alert("Quantidade inválida.");
            return;
        }

        const newQuantity = item.quantity - parseInt(withdrawAmount, 10);

        if (newQuantity < 0) {
            alert("Quantidade insuficiente no estoque.");
            return;
        }

        try {
            console.log(`Retirando ${withdrawAmount} unidades de ${item.itemName}`);

            await api.post(
                "/functions/updateInventoryItem",
                { itemId: item.objectId, quantity: newQuantity },
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );

            await logInventoryChange(item.objectId, item.itemName, "withdrawn", -parseInt(withdrawAmount, 10), newQuantity);

            fetchInventory();
        } catch (error) {
            console.error("Erro ao retirar item:", error.response?.data || error.message);
        }
    };


    const handleSave = async () => {
        const formattedData = {
            itemName: formData.itemName,
            itemCode: formData.itemCode,
            quantity: parseInt(formData.quantity, 10),
            pricePerUnit: parseFloat(formData.pricePerUnit),
            supplier: formData.supplier,
            lastRestocked: new Date().toISOString(),
        };

        console.log("Enviando dados para API:", formattedData);

        try {
            if (editingItem) {
                console.log("Atualizando item ID:", editingItem.objectId);
                await api.post(
                    "/functions/updateInventoryItem",
                    { itemId: editingItem.objectId, ...formattedData },
                    { headers: { "X-Parse-Session-Token": sessionToken } }
                );
                await logInventoryChange(editingItem.objectId, formData.itemName, "updated", 0, formattedData.quantity);
            } else {
                console.log("Criando novo item:", formattedData);
                const response = await api.post(
                    "/functions/createInventoryItem",
                    formattedData,
                    { headers: { "X-Parse-Session-Token": sessionToken } }
                );
                await logInventoryChange(response.data.result.item.objectId, formData.itemName, "added", formattedData.quantity, formattedData.quantity);
            }
            fetchInventory();
            handleClose();
        } catch (error) {
            console.error("Erro ao salvar item:", error.response?.data || error.message);
        }
    };



    return (
        <Container>
            <Typography variant="h4" sx={{ my: 3 }}>
                Estoque
            </Typography>

            <TextField
                label="Pesquisar Estoque (Nome ou Código)"
                fullWidth
                margin="dense"
                value={searchQuery}
                onChange={(e) => handleInventorySearch(e.target.value)}
            />

            <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2 }} onClick={() => handleOpen()}>
                Adicionar Item
            </Button>

            <Button variant="outlined" color="secondary" sx={{ mt: 2 }} onClick={handleOpenHistoryModal}>
                Ver Histórico de Movimentações
            </Button>
            <Button variant="contained" color="secondary" sx={{ mt: 2, ml: 2 }} onClick={exportToPDF}>
                Exportar Estoque (PDF)
            </Button>

            <Box sx={{ overflowX: "auto", width: "100%" }}>
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell onClick={() => handleSort("itemName")} style={{ cursor: "pointer" }}>
                                    Nome {sortColumn === "itemName" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                                </TableCell>
                                <TableCell onClick={() => handleSort("itemCode")} style={{ cursor: "pointer" }}>
                                    Código {sortColumn === "itemCode" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                                </TableCell>
                                <TableCell onClick={() => handleSort("quantity")} style={{ cursor: "pointer" }}>
                                    Quantidade {sortColumn === "quantity" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                                </TableCell>
                                <TableCell>Preço (unidade)</TableCell>
                                <TableCell>Fornecedor</TableCell>
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedInventory.length > 0 ? (
                                paginatedInventory.map((item) => (
                                    <TableRow key={item.objectId} style={getRowStyle(item.quantity)}>


                                        <TableCell>{item.itemName}</TableCell>
                                        <TableCell>{item.itemCode}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>R$ {item.pricePerUnit}</TableCell>
                                        <TableCell>{item.supplier}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Editar">
                                                <IconButton color="primary" onClick={() => handleOpen(item)}>
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Excluir">
                                                <IconButton color="error" onClick={() => handleDelete(item.objectId)}>
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Retirar Estoque">
                                                <IconButton color="warning" onClick={() => handleWithdraw(item)}>
                                                    <RemoveShoppingCart />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>

                                    </TableRow>

                                )
                                )

                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Nenhum item encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                    </Table>
                </TableContainer>
            </Box>
            <Container sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                    variant="outlined"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Anterior
                </Button>

                <Typography sx={{ mx: 2 }}>
                    Página {currentPage} de {Math.ceil(filteredInventory.length / itemsPerPage)}
                </Typography>

                <Button
                    variant="outlined"
                    disabled={currentPage >= Math.ceil(filteredInventory.length / itemsPerPage)}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Próxima
                </Button>
            </Container>

            {/* Modal para adicionar/editar itens */}
            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>

                <DialogTitle>{editingItem ? "Editar Item" : "Adicionar Item"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nome do Item"
                        fullWidth
                        margin="dense"
                        value={formData.itemName}
                        onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    />
                    <TextField
                        label="Código"
                        fullWidth
                        margin="dense"
                        value={formData.itemCode}
                        onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                    />
                    <TextField
                        label="Quantidade"
                        fullWidth
                        margin="dense"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                    <TextField
                        label="Preço por Unidade"
                        fullWidth
                        margin="dense"
                        type="number"
                        value={formData.pricePerUnit}
                        onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                    />
                    <TextField
                        label="Fornecedor"
                        fullWidth
                        margin="dense"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        {editingItem ? "Salvar" : "Adicionar"}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Modal do Histórico de Movimentações */}
            <Dialog open={historyModalOpen} onClose={handleCloseHistoryModal} maxWidth="md" fullWidth>
                <DialogTitle>Histórico de Movimentações</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Pesquisar Histórico (Nome, Código ou Data)"
                        fullWidth
                        margin="dense"
                        value={historySearchQuery}
                        onChange={(e) => handleHistorySearch(e.target.value)}
                    />
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Item</TableCell>
                                    <TableCell>Ação</TableCell>
                                    <TableCell>Quantidade</TableCell>
                                    <TableCell>Nova Quantidade</TableCell>
                                    <TableCell>Data</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((record, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{record.itemName}</TableCell>
                                            <TableCell>{record.action === "added" ? "Adicionado" :
                                                record.action === "withdrawn" ? "Retirado" : "Editado"}</TableCell>
                                            <TableCell>{record.quantityChange > 0 ? `+${record.quantityChange}` : record.quantityChange}</TableCell>
                                            <TableCell>{record.newQuantity}</TableCell>
                                            <TableCell>{record.updatedAt && record.updatedAt.iso ? new Date(record.updatedAt.iso).toLocaleString() : "Data inválida"}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            Nenhuma movimentação registrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseHistoryModal} color="secondary">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Inventory;
