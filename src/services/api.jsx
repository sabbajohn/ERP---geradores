// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.seuprojeto.com', // Substituir pela URL correta
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
