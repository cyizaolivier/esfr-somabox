// import * as dotenv from 'dotenv';
import axios from 'axios';
// dotenv.config();
const BACKEND_URL = "192.168.1.86:3000"

console.log('Using backend URL:', BACKEND_URL);

export const api = axios.create({
    baseURL: `http://${BACKEND_URL}/api`,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('soma_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
})