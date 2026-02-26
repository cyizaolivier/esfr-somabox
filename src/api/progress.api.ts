import { api } from "./api";
import { parseJsonSafe } from "../utils/storage";
import { addNotification } from "./notifications.api";

// Get all students progress (for facilitators)
// Uses: GET /api/progress/student
// Returns array of progress records with studentId, courseId, progress_percentage, etc.
export const getAllProgress = async () => {
    try {
        const response = await api.get('/progress/student');

        // Only cache to localStorage if data is a genuine array (prevents saving {courses:[...]} objects)
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            localStorage.setItem('soma_student_progress', JSON.stringify(response.data));
        }

        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        // Fallback: get from localStorage
        console.warn('API fetch failed, using localStorage fallback');
        const savedProgress = localStorage.getItem('soma_student_progress');
        const parsed = parseJsonSafe(savedProgress, []);
        return Array.isArray(parsed) ? parsed : [];
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
            const parsed = parseJsonSafe(savedProgress, []);
            const allProgress = Array.isArray(parsed) ? parsed : [];
            return allProgress.filter((p: any) => p.studentId === studentId);
        }
        return null;
    }
}

// Get user's progress (all courses for the authenticated user)
export const getUserProgress = async () => {
    try {
        const response = await api.get('/progress');
        return response.data;
    } catch (error) {
        // Fallback: get from localStorage
        const savedProgress = localStorage.getItem('soma_student_progress');
        return parseJsonSafe(savedProgress, []);
    }
}

// Get progress for a specific student (admin/facilitator use)
export const getStudentProgress = async (studentId: string) => {
    try {
        const response = await api.get(`/progress/student?student_id=${studentId}`);
        return response.data;
    } catch (error) {
        console.error('API fetch failed, using fallback:', error);
        return getStudentProgressById(studentId);
    }
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
    try {
        const response = await api.patch(`/progress/course/${courseId}/complete`);

        // Also update localStorage so facilitator view reflects immediately
        _updateLocalProgressStatus(courseId, 'completed', 100);

        // Trigger notification
        addNotification({
            type: 'COURSE_COMPLETED',
            title: 'Course Completed!',
            message: `You have successfully finished the course. Great job!`,
            data: { courseId }
        });

        return response;
    } catch (error) {
        console.warn('completeCourse API failed, saving locally');
        _updateLocalProgressStatus(courseId, 'completed', 100);

        addNotification({
            type: 'COURSE_COMPLETED',
            title: 'Course Completed!',
            message: `Congratulations on finishing the course!`,
            data: { courseId }
        });

        return { data: { courseId, status: 'completed' } };
    }
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

        // Mirror to localStorage so facilitator can see updates even without a refresh
        _upsertLocalProgress(progressData);

        // If newly completed, trigger notification
        if (progressData.status === 'completed' || progressData.progress_percentage === 100) {
            addNotification({
                type: 'PROGRESS',
                title: 'Learning Milestone',
                message: `You've reached 100% progress in your course!`,
                data: { courseId: progressData.courseId }
            });
        }

        return response;
    } catch (error) {
        // Fallback: save to localStorage
        console.warn('saveProgress API failed, using localStorage fallback');
        _upsertLocalProgress(progressData);
        return { data: progressData };
    }
}

// ─── Internal localStorage helpers ───────────────────────────────────────────

/**
 * Upsert a flat progress record into soma_student_progress.
 * Flat shape: { studentId, courseId, progress_percentage, status, last_topic_id, updatedAt }
 */
function _upsertLocalProgress(progressData: {
    studentId: string;
    courseId: string;
    progress_percentage: number;
    last_topic_id: string;
    last_topic_number: number;
    status: string;
}) {
    const savedProgress = localStorage.getItem('soma_student_progress');
    let allProgress: any[] = parseJsonSafe<any[]>(savedProgress, []);

    const idx = allProgress.findIndex(
        (p: any) => p.studentId === progressData.studentId && p.courseId === progressData.courseId
    );

    const updated = {
        studentId: progressData.studentId,
        courseId: progressData.courseId,
        progress_percentage: progressData.progress_percentage,
        last_topic_id: progressData.last_topic_id,
        last_topic_number: progressData.last_topic_number,
        status: progressData.status,
        updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
        // Only upgrade status (never downgrade completed → in-progress)
        if (allProgress[idx].status !== 'completed' || progressData.status === 'completed') {
            allProgress[idx] = { ...allProgress[idx], ...updated };
        }
    } else {
        allProgress.push(updated);
    }

    localStorage.setItem('soma_student_progress', JSON.stringify(allProgress));
}

/**
 * Mark all progress records for a given courseId as 'completed' at 100%.
 * Used when the student finishes the course.
 */
function _updateLocalProgressStatus(courseId: string, status: string, progress: number) {
    const savedProgress = localStorage.getItem('soma_student_progress');
    let allProgress: any[] = parseJsonSafe<any[]>(savedProgress, []);

    let updated = false;
    allProgress = allProgress.map((p: any) => {
        if (p.courseId === courseId) {
            updated = true;
            return { ...p, status, progress_percentage: progress, updatedAt: new Date().toISOString() };
        }
        return p;
    });

    if (updated) {
        localStorage.setItem('soma_student_progress', JSON.stringify(allProgress));
    }
}
