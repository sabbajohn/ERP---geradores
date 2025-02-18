import React from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function ChecklistItem({ item, index, onStatusChange, onObservacaoChange }) {
    const { label, status, observacao } = item;

    // Define cor do título no Accordion (verde ou vermelho) baseado no status
    const getTitleColor = () => {
        if (status === "conforme") return "green";
        if (status === "nao-conforme") return "red";
        return "inherit";
    };

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ color: getTitleColor() }}>{label}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <RadioGroup
                    row
                    value={status}
                    onChange={(e) => onStatusChange(index, e.target.value)}
                >
                    <FormControlLabel
                        value="conforme"
                        control={<Radio color="success" />}
                        label="Conforme"
                    />
                    <FormControlLabel
                        value="nao-conforme"
                        control={<Radio color="error" />}
                        label="Não Conforme"
                    />
                </RadioGroup>

                {/* AGORA SEM CONDIÇÃO: campo de observação sempre aparece */}
                <TextField
                    fullWidth
                    label="Observações"
                    multiline
                    rows={2}
                    sx={{ mt: 2 }}
                    value={observacao}
                    onChange={(e) => onObservacaoChange(index, e.target.value)}
                />
            </AccordionDetails>
        </Accordion>
    );
}

export default ChecklistItem;
