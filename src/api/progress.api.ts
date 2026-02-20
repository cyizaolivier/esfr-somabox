import { api } from "./api";

// Get user's progress
export const getUserProgress = async () => {
    const response = await api.get('/progress');
    return response;
}

export const getStudentProgress = async (studentId: string) => {
    const response = await api.get(`/progress/student?student_id=${studentId}`);
    return response;
}