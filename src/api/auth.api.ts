import { api } from "./api";

export type UserRole = 'Student' | 'Facilitator' | 'Admin';

export interface SignUpData {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

// Registration with role support - for admin to register users
// Role values: 'Student', 'Facilitator', 'Admin'
export const registerUser = async (data: SignUpData) => {
    const response = await api.post('/auth/register', data);
    return response;
}

// Regular signup - defaults to Student role
export const signup = async (data: SignUpData)=>{
    const response = await api.post('/auth/register', data);
    return response;
}

export const signin = async (email: string, password: string)=>{
    const response = await api.post('/auth/login', { email, password });
    return response;
}
