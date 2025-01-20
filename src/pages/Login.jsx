import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
} from "@mui/material";
import api from "../services/api"; // Importa a instância do Axios configurada

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Chama a API REST do Back4App para autenticar o usuário
            const response = await api.post("/functions/login", {
                email: email.trim().toLowerCase(),
                password,
            });

            if (response.data.result && response.data.result.user) {
                const { token, role, fullname } = response.data.result.user;

                // Armazena os dados do usuário no localStorage
                localStorage.setItem("sessionToken", token);
                localStorage.setItem("role", role);
                localStorage.setItem("fullname", fullname);

                // Redireciona com base no cargo do usuário
                if (role === "admin") {
                    navigate("/dashboard");
                } else if (role === "technician") {
                    navigate("/tecnico");
                } else {
                    setError("Permissão inválida. Contate o suporte.");
                }
            } else {
                throw new Error("Login falhou. Verifique suas credenciais.");
            }
        } catch (err) {
            console.error("Erro no login:", err);
            setError("Credenciais inválidas. Tente novamente.");
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
