import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert
} from '@mui/material';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === 'admin@domain.com' && password === 'admin123') {
            navigate('/'); // Dashboard Admin
        } else if (email === 'tecnico@domain.com' && password === 'tecnico123') {
            navigate('/tecnico'); // Tela do Técnico
        } else {
            setError('Credenciais inválidas. Tente novamente.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={8} p={4} boxShadow={3} borderRadius={2} textAlign="center">
                <Typography variant="h4" gutterBottom>
                    Login
                </Typography>
                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        fullWidth
                        type="password"
                        label="Senha"
                        variant="outlined"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        sx={{ mt: 3 }}
                    >
                        Entrar
                    </Button>
                </form>
            </Box>
        </Container>
    );
}

export default Login;
