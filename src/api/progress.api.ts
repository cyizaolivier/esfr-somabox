import { api } from "./api";

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
    const response = await api.post('/progress', progressData);
    return response;
}