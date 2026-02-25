import { api } from "./api";

// Get all students progress (for facilitators)
// Uses: GET /api/progress/student
// Returns array of progress records with studentId, courseId, progress_percentage, etc.
export const getAllProgress = async () => {
    try {
        const response = await api.get('/progress/student');
        
        // Save to localStorage as backup
        if (response.data && response.data.length > 0) {
            localStorage.setItem('soma_student_progress', JSON.stringify(response.data));
        }
        
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

// Get progress by student ID
// Uses: GET /api/progress/student/{id}
export const getStudentProgressById = async (studentId: string) => {
    try {
        const response = await api.get(`/progress/student/${studentId}`);
        return response.data || null;
    } catch (error) {
        // Fallback: get from localStorage
        console.warn('API fetch failed, using localStorage fallback');
        const savedProgress = localStorage.getItem('soma_student_progress');
        if (savedProgress) {
            const allProgress = JSON.parse(savedProgress);
            return allProgress.filter((p: any) => p.studentId === studentId);
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
// Get user's progress (all courses)
export const getUserProgress = async () => {
    const response = await api.get('/progress');
    return response;
}

// Get progress for a specific student (admin/facilitator use)
export const getStudentProgress = async (studentId: string) => {
    const response = await api.get(`/progress/student?student_id=${studentId}`);
    return response;
}

// Get course-level progress summary for the authenticated student
// Returns: { courseId, status, progress_percentage, last_topic_id, last_topic_number }
export const getCourseProgress = async (courseId: string) => {
    const response = await api.get(`/progress/course/${courseId}`);
    return response;
}

// Get per-topic progress list for the authenticated student within a course
// Returns: [{ topicId, status: 'not_started' | 'in-progress' | 'completed' }]
export const getCourseTopicProgress = async (courseId: string) => {
    const response = await api.get(`/progress/course/${courseId}/topic`);
    return response;
}

// Mark an entire course as completed — called when student finishes the last topic
export const completeCourse = async (courseId: string) => {
    const response = await api.patch(`/progress/course/${courseId}/complete`);
    return response;
}

// Create or update progress (upsert by studentId + courseId + topicId)
export const saveProgress = async (progressData: {
    studentId: string;
    courseId: string;
    progress_percentage: number;
    last_topic_id: string;
    last_topic_number: number;
    status: 'in-progress' | 'completed' | 'pending';
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
