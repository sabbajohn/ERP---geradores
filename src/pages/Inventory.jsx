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

    // Histórico
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [historySearchQuery, setHistorySearchQuery] = useState("");
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    // Modal de adicionar/editar item
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Formulário do modal
    // >>> SEM pricePerUnit <<<
    const [formData, setFormData] = useState({
        itemName: "",
        itemCode: "",
        supplier: "",
        quantity: "",
        costPrice: "",
        salePrice: "",
        profitMargin: "",
        // se tiver category, minStockLevel, etc. adicione aqui
    });

    // Ordenação
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // =====================================
    // FETCH INVENTORY
    // =====================================
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

    // FETCH HISTORY
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
        fetchInventory();
        fetchInventoryHistory();
    }, []);

    // =====================================
    // FUNÇÕES DE FILTRO, ORDENAR, ETC.
    // =====================================
    const handleInventorySearch = (query) => {
        setSearchQuery(query);
        const filtered = inventory.filter(
            (item) =>
                item.itemName.toLowerCase().includes(query.toLowerCase()) ||
                item.itemCode.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredInventory(filtered);
    };

    const handleSort = (column) => {
        const newDirection =
            sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
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
        return quantity <= 5
            ? { backgroundColor: "#FFEBEE", fontWeight: "bold" }
            : {};
    };

    // =====================================
    // FUNÇÕES DE HISTÓRICO
    // =====================================
    const handleHistorySearch = (query) => {
        setHistorySearchQuery(query);
        const filtered = history.filter(
            (record) =>
                record.itemName.toLowerCase().includes(query.toLowerCase()) ||
                record.updatedAt.iso.includes(query)
        );
        setFilteredHistory(filtered);
    };

    const handleOpenHistoryModal = () => setHistoryModalOpen(true);
    const handleCloseHistoryModal = () => setHistoryModalOpen(false);

    // =====================================
    // EXPORTAR PDF (Remover pricePerUnit do corpo)
    // =====================================
    const exportToPDF = () => {
        if (inventory.length === 0) {
            alert("Nenhum item no estoque para exportar.");
            return;
        }

        const doc = new jsPDF();
        doc.text("Relatório de Estoque", 14, 10);

        // Exemplo de colunas: Nome, Código, Quantidade, Custo, Venda, etc.
        doc.autoTable({
            startY: 20,
            head: [["Nome", "Código", "Quantidade", "Custo (R$)", "Venda (R$)"]],
            body: inventory.map((item) => [
                item.itemName,
                item.itemCode,
                item.quantity,
                item.costPrice,
                item.salePrice,
            ]),
        });

        doc.save("estoque.pdf");
    };

    // =====================================
    // SOFT DELETE
    // =====================================
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

    // =====================================
    // HISTÓRICO (LOG) DE MUDANÇAS
    // =====================================
    const logInventoryChange = async (
        itemId,
        itemName,
        action,
        quantityChange,
        newQuantity
    ) => {
        try {
            await api.post(
                "/functions/createInventoryHistory",
                { itemId, itemName, action, quantityChange, newQuantity },
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );
            fetchInventoryHistory();
        } catch (error) {
            console.error("Erro ao salvar histórico:", error.response?.data || error.message);
        }
    };

    // =====================================
    // RETIRAR DO ESTOQUE
    // =====================================
    const handleWithdraw = async (item) => {
        const withdrawAmount = prompt(
            `Quantas unidades de "${item.itemName}" deseja retirar?`
        );
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
            await api.post(
                "/functions/updateInventoryItem",
                { itemId: item.objectId, quantity: newQuantity },
                { headers: { "X-Parse-Session-Token": sessionToken } }
            );
            await logInventoryChange(
                item.objectId,
                item.itemName,
                "withdrawn",
                -parseInt(withdrawAmount, 10),
                newQuantity
            );
            fetchInventory();
        } catch (error) {
            console.error("Erro ao retirar item:", error.response?.data || error.message);
        }
    };

    // =====================================
    // MODAL (ABRIR, FECHAR, FORM)
    // =====================================
    const handleOpen = (item = null) => {
        if (item) {
            // EDIÇÃO
            setEditingItem(item);
            setFormData({
                itemName: item.itemName || "",
                itemCode: item.itemCode || "",
                supplier: item.supplier || "",
                quantity: item.quantity ? String(item.quantity) : "",
                costPrice: item.costPrice ? String(item.costPrice) : "",
                salePrice: item.salePrice ? String(item.salePrice) : "",
                profitMargin: item.profitMargin ? String(item.profitMargin) : "",
            });
        } else {
            // CRIAÇÃO
            setEditingItem(null);
            setFormData({
                itemName: "",
                itemCode: "",
                supplier: "",
                quantity: "",
                costPrice: "",
                salePrice: "",
                profitMargin: "",
            });
        }
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    // =====================================
    // CALCULAR MARGEM (OPCIONAL)
    // =====================================
    const calculateProfitMargin = (cost, sale) => {
        const c = parseFloat(cost) || 0;
        const s = parseFloat(sale) || 0;
        if (c > 0 && s > 0) {
            return (((s - c) / c) * 100).toFixed(2);
        }
        return "0";
    };
    const handleCostPriceChange = (e) => {
        const newCost = e.target.value;
        const margin = calculateProfitMargin(newCost, formData.salePrice);
        setFormData({
            ...formData,
            costPrice: newCost,
            profitMargin: margin,
        });
    };
    const handleSalePriceChange = (e) => {
        const newSale = e.target.value;
        const margin = calculateProfitMargin(formData.costPrice, newSale);
        setFormData({
            ...formData,
            salePrice: newSale,
            profitMargin: margin,
        });
    };

    // =====================================
    // SALVAR ITEM (CRIAR/EDITAR)
    // =====================================
    const handleSave = async () => {
        const formattedData = {
            itemName: formData.itemName,
            itemCode: formData.itemCode,
            supplier: formData.supplier,
            quantity: parseInt(formData.quantity, 10) || 0,
            costPrice: parseFloat(formData.costPrice) || 0,
            salePrice: parseFloat(formData.salePrice) || 0,
            profitMargin: parseFloat(formData.profitMargin) || 0,
            lastRestocked: new Date().toISOString(),
        };

        try {
            if (editingItem) {
                // Atualizar
                await api.post(
                    "/functions/updateInventoryItem",
                    { itemId: editingItem.objectId, ...formattedData },
                    { headers: { "X-Parse-Session-Token": sessionToken } }
                );
                // Log: updated (quantidadeChange = 0 se não mudou a quantity)
                await logInventoryChange(
                    editingItem.objectId,
                    formData.itemName,
                    "updated",
                    0,
                    formattedData.quantity
                );
            } else {
                // Criar
                const response = await api.post(
                    "/functions/createInventoryItem",
                    formattedData,
                    { headers: { "X-Parse-Session-Token": sessionToken } }
                );
                // Log: added
                await logInventoryChange(
                    response.data.result.item.objectId,
                    formData.itemName,
                    "added",
                    formattedData.quantity,
                    formattedData.quantity
                );
            }
            fetchInventory();
            handleClose();
        } catch (error) {
            console.error("Erro ao salvar item:", error.response?.data || error.message);
        }
    };

    // =====================================
    // PAGINAÇÃO
    // =====================================
    const paginatedInventory = filteredInventory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // =====================================
    // RENDER
    // =====================================
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

            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2, mr: 2 }}
                onClick={() => handleOpen()}
            >
                Adicionar Item
            </Button>

            <Button
                variant="outlined"
                color="secondary"
                sx={{ mt: 2 }}
                onClick={handleOpenHistoryModal}
            >
                Ver Histórico de Movimentações
            </Button>
            <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 2, ml: 2 }}
                onClick={exportToPDF}
            >
                Exportar Estoque (PDF)
            </Button>

            <Box sx={{ overflowX: "auto", width: "100%" }}>
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    onClick={() => handleSort("itemName")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Nome{" "}
                                    {sortColumn === "itemName"
                                        ? sortDirection === "asc"
                                            ? "↑"
                                            : "↓"
                                        : ""}
                                </TableCell>
                                <TableCell
                                    onClick={() => handleSort("itemCode")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Código{" "}
                                    {sortColumn === "itemCode"
                                        ? sortDirection === "asc"
                                            ? "↑"
                                            : "↓"
                                        : ""}
                                </TableCell>
                                <TableCell
                                    onClick={() => handleSort("quantity")}
                                    style={{ cursor: "pointer" }}
                                >
                                    Quantidade{" "}
                                    {sortColumn === "quantity"
                                        ? sortDirection === "asc"
                                            ? "↑"
                                            : "↓"
                                        : ""}
                                </TableCell>

                                {/* REMOVIDO pricePerUnit */}
                                {/* CAMPOS DE CUSTO, VENDA, MARGEM */}
                                <TableCell>Custo (R$)</TableCell>
                                <TableCell>Venda (R$)</TableCell>
                                <TableCell>Margem (%)</TableCell>

                                <TableCell>Fornecedor</TableCell>
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedInventory.length > 0 ? (
                                paginatedInventory.map((item) => (
                                    <TableRow
                                        key={item.objectId}
                                        style={getRowStyle(item.quantity)}
                                    >
                                        <TableCell>{item.itemName}</TableCell>
                                        <TableCell>{item.itemCode}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>

                                        <TableCell>R$ {item.costPrice}</TableCell>
                                        <TableCell>R$ {item.salePrice}</TableCell>
                                        <TableCell>{item.profitMargin}%</TableCell>

                                        <TableCell>{item.supplier}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleOpen(item)}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Excluir">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(item.objectId)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Retirar Estoque">
                                                <IconButton
                                                    color="warning"
                                                    onClick={() => handleWithdraw(item)}
                                                >
                                                    <RemoveShoppingCart />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Nenhum item encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* PAGINAÇÃO */}
            <Container sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                    variant="outlined"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Anterior
                </Button>
                <Typography sx={{ mx: 2 }}>
                    Página {currentPage} de{" "}
                    {Math.ceil(filteredInventory.length / itemsPerPage)}
                </Typography>
                <Button
                    variant="outlined"
                    disabled={
                        currentPage >=
                        Math.ceil(filteredInventory.length / itemsPerPage)
                    }
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Próxima
                </Button>
            </Container>

            {/* MODAL CRIAR/EDITAR ITEM */}
            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {editingItem ? "Editar Item" : "Adicionar Item"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nome do Item"
                        fullWidth
                        margin="dense"
                        value={formData.itemName}
                        onChange={(e) =>
                            setFormData({ ...formData, itemName: e.target.value })
                        }
                    />
                    <TextField
                        label="Código"
                        fullWidth
                        margin="dense"
                        value={formData.itemCode}
                        onChange={(e) =>
                            setFormData({ ...formData, itemCode: e.target.value })
                        }
                    />
                    <TextField
                        label="Quantidade"
                        fullWidth
                        margin="dense"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                            setFormData({ ...formData, quantity: e.target.value })
                        }
                    />

                    {/* CAMPOS DE CUSTO, VENDA, MARGEM */}
                    <TextField
                        label="Custo (R$)"
                        fullWidth
                        margin="dense"
                        type="number"
                        value={formData.costPrice}
                        onChange={handleCostPriceChange}
                    />
                    <TextField
                        label="Venda (R$)"
                        fullWidth
                        margin="dense"
                        type="number"
                        value={formData.salePrice}
                        onChange={handleSalePriceChange}
                    />
                    <TextField
                        label="Margem (%)"
                        fullWidth
                        margin="dense"
                        type="number"
                        value={formData.profitMargin}
                        // Se não quiser edição manual, deixe readOnly
                        InputProps={{ readOnly: true }}
                        onChange={(e) =>
                            setFormData({ ...formData, profitMargin: e.target.value })
                        }
                    />

                    <TextField
                        label="Fornecedor"
                        fullWidth
                        margin="dense"
                        value={formData.supplier}
                        onChange={(e) =>
                            setFormData({ ...formData, supplier: e.target.value })
                        }
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

            {/* MODAL HISTÓRICO */}
            <Dialog
                open={historyModalOpen}
                onClose={handleCloseHistoryModal}
                maxWidth="md"
                fullWidth
            >
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
                                            <TableCell>
                                                {record.action === "added"
                                                    ? "Adicionado"
                                                    : record.action === "withdrawn"
                                                        ? "Retirado"
                                                        : "Editado"}
                                            </TableCell>
                                            <TableCell>
                                                {record.quantityChange > 0
                                                    ? `+${record.quantityChange}`
                                                    : record.quantityChange}
                                            </TableCell>
                                            <TableCell>{record.newQuantity}</TableCell>
                                            <TableCell>
                                                {record.updatedAt && record.updatedAt.iso
                                                    ? new Date(record.updatedAt.iso).toLocaleString()
                                                    : "Data inválida"}
                                            </TableCell>
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
