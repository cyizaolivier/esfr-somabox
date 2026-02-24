import { api } from "./api";

// Get all students progress (for facilitators)
export const getAllProgress = async () => {
    try {
        const response = await api.get('/progress');
        return response.data || [];
    } catch (error) {
        // Fallback: get from localStorage
        console.warn('API fetch failed, using localStorage fallback');
        const savedProgress = localStorage.getItem('soma_student_progress');
        if (savedProgress) {
            return JSON.parse(savedProgress);
        }
        return [];
    }
}

// Get progress by student
export const getStudentProgress = async (studentId: string) => {
    try {
        const response = await api.get(`/progress/student?student_id=${studentId}`);
        return response.data || response;
    } catch (error) {
        // Fallback: get from localStorage
        console.warn('API fetch failed, using localStorage fallback');
        const savedProgress = localStorage.getItem('soma_student_progress');
        if (savedProgress) {
            const allProgress = JSON.parse(savedProgress);
            return allProgress.find((p: any) => p.email === studentId);
        }
        return null;
    }
}

// Get user's progress
export const getUserProgress = async () => {
    try {
        const response = await api.get('/progress');
        return response;
    } catch (error) {
        // Fallback: get from localStorage
        const savedProgress = localStorage.getItem('soma_student_progress');
        if (savedProgress) {
            return JSON.parse(savedProgress);
        }
        return { data: [] };
    }
}

export const saveProgress = async (progressData: {
    studentId: string;
    courseId: string;
    progress_percentage: number;
    last_topic_id: string;
    last_topic_number: number;
    status: string;
}) => {
    try {
        const response = await api.post('/progress', progressData);
        return response;
    } catch (error) {
        // Fallback: save to localStorage
        console.warn('API save failed, using localStorage fallback');
        const savedProgress = localStorage.getItem('soma_student_progress');
        let allProgress = savedProgress ? JSON.parse(savedProgress) : [];
        
        // Find student and update their progress
        const studentIndex = allProgress.findIndex((p: any) => p.email === progressData.studentId);
        if (studentIndex >= 0) {
            const courseIndex = allProgress[studentIndex].courses?.findIndex(
                (c: any) => c.courseId === progressData.courseId
            );
            if (courseIndex >= 0) {
                allProgress[studentIndex].courses[courseIndex] = {
                    ...allProgress[studentIndex].courses[courseIndex],
                    progress: progressData.progress_percentage,
                    status: progressData.status,
                    lastUpdated: new Date().toISOString()
                };
            }
        }
        
        localStorage.setItem('soma_student_progress', JSON.stringify(allProgress));
        return { data: progressData };
    }
}
