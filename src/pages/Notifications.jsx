import React, { useState } from 'react';
import {
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Typography,
  Box,
  Grid
} from '@mui/material';

function Notifications() {
  const [emailReminder, setEmailReminder] = useState('');
  const [smsReminder, setSmsReminder] = useState('');
  const [sendReports, setSendReports] = useState(false);

  const handleEmailChange = (event) => setEmailReminder(event.target.value);
  const handleSmsChange = (event) => setSmsReminder(event.target.value);
  const handleReportsChange = (event) => setSendReports(event.target.checked);

  const handleSave = () => {
    alert('Configurações salvas com sucesso!');
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Configuração de Notificações
      </Typography>

      {/* Notificações de Garantia */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Notificações por Garantia
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FormControlLabel
              control={<Checkbox />}
              label="Ativar Notificação"
            />
          </Grid>
          <Grid item>
            <FormControl variant="outlined" sx={{ minWidth: 200 }}>
              <InputLabel>Antecedência</InputLabel>
              <Select
                value={emailReminder}
                onChange={handleEmailChange}
                label="Antecedência"
              >
                <MenuItem value={30}>30 dias antes</MenuItem>
                <MenuItem value={15}>15 dias antes</MenuItem>
                <MenuItem value={7}>7 dias antes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControlLabel control={<Checkbox />} label="Enviar por E-mail" />
          </Grid>
          <Grid item>
            <FormControlLabel control={<Checkbox />} label="Enviar por SMS" />
          </Grid>
        </Grid>
      </Box>

      {/* Notificações de Manutenção */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Notificações de Manutenção
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FormControlLabel
              control={<Checkbox />}
              label="Manutenção Preventiva"
            />
          </Grid>
          <Grid item>
            <FormControl variant="outlined" sx={{ minWidth: 200 }}>
              <InputLabel>Antecedência</InputLabel>
              <Select
                value={smsReminder}
                onChange={handleSmsChange}
                label="Antecedência"
              >
                <MenuItem value={7}>7 dias antes</MenuItem>
                <MenuItem value={3}>3 dias antes</MenuItem>
                <MenuItem value={1}>1 dia antes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControlLabel control={<Checkbox />} label="Enviar por E-mail" />
          </Grid>
          <Grid item>
            <FormControlLabel control={<Checkbox />} label="Enviar por SMS" />
          </Grid>
        </Grid>
      </Box>

      {/* Relatórios Mensais */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Relatórios Mensais
        </Typography>
        <FormControlLabel
          control={<Checkbox checked={sendReports} onChange={handleReportsChange} />}
          label="Enviar Relatórios Automáticos"
        />
        {sendReports && (
          <Box mt={2}>
            <FormControl variant="outlined" sx={{ minWidth: 200 }}>
              <InputLabel>Formato</InputLabel>
              <Select defaultValue="pdf" label="Formato">
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {/* Botão de Salvamento */}
      <Button variant="contained" color="primary" onClick={handleSave}>
        Salvar Configurações
      </Button>
    </Box>
  );
}

export default Notifications;
