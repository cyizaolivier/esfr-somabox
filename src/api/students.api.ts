import { api } from "./api";

// Create user with role using POST /auth/register
// Role can be: 'Student', 'Facilitator', or 'Admin'
export const createUser = async (userData: { 
    email: string; 
    password: string; 
    role: string; 
    name?: string 
}) => {
    const response = await api.post('/auth/register', userData);
    return response;
}
