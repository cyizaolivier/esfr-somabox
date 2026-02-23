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

export const saveProgress = async (progressData: {
    studentId: string;
    courseId: string;
    progress_percentage: number;
    last_topic_id: string;
    last_topic_number: number;
    status: string;
}) => {
    const response = await api.post('/progress', progressData);
    return response;
}