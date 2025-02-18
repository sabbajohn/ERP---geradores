import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";
import InputMask from "react-input-mask";

const ClientModal = ({
    open,
    onClose,
    onSave,
    newCustomer,
    setNewCustomer,
}) => {
    const handleSaveClick = () => {
        onSave();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Nome do Cliente"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />

                {/* CPF/CNPJ com máscara dinâmica */}
                <InputMask
                    mask={
                        newCustomer.document.replace(/\D/g, "").length > 11
                            ? "99.999.999/9999-99"
                            : "999.999.999-99"
                    }
                    value={newCustomer.document}
                    onChange={(e) =>
                        setNewCustomer({ ...newCustomer, document: e.target.value })
                    }
                >
                    {(inputProps) => (
                        <TextField
                            {...inputProps}
                            fullWidth
                            margin="normal"
                            label="CPF/CNPJ"
                        />
                    )}
                </InputMask>

                {/* Telefone com máscara */}
                <InputMask
                    mask="(99) 99999-9999"
                    value={newCustomer.phone}
                    onChange={(e) =>
                        setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                >
                    {(inputProps) => (
                        <TextField
                            {...inputProps}
                            fullWidth
                            margin="normal"
                            label="Telefone"
                        />
                    )}
                </InputMask>

                <TextField
                    fullWidth
                    margin="normal"
                    label="E-mail"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Endereço"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button onClick={handleSaveClick} variant="contained" color="primary">
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClientModal;
