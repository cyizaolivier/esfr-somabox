import { api } from "./api";
import { parseJsonSafe } from "../utils/storage";
import { addNotification } from "./notifications.api";

// Course type with facilitators
export interface Facilitator {
    id: string;
    name: string;
    email: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    coverPage: string;
    level: string;
    author: string;
    facilitators: Facilitator[];
    students?: number;
}

// requirement 
/*{
  "title": "BIOLOGY",
  "description": "livings",
  "coverPage": "file_url",
  "level": "Senior 2",
  "author": "Maximillien TUYISHIME"
} */

export const createCourse = async (courseData: {
    title: string;
    description: string;
    coverPage: string;
    level: string;
    author: string;
}): Promise<Course> => {
    const newCourse: Course = {
        id: `course_${Date.now()}`, ...courseData,
        facilitators: []
    };

    try {
        const response = await api.post('/courses', courseData);
        // Save to localStorage for backup
        const savedCourses = localStorage.getItem('soma_courses');
        const courses = parseJsonSafe<Course[]>(savedCourses, []);
        courses.push(newCourse);
        localStorage.setItem('soma_courses', JSON.stringify(courses));

        // Trigger notification
        addNotification({
            type: 'COURSE_CREATED',
            title: 'New Course Available!',
            message: `A new course "${courseData.title}" has been published. Start learning now!`,
            data: { title: courseData.title }
        });

        // Return the new course (or response data if available)
        return response.data || newCourse;
    } catch (error) {
        // Fallback: save to localStorage only
        console.warn('API create failed, using localStorage fallback');
        const savedCourses = localStorage.getItem('soma_courses');
        const courses = parseJsonSafe<Course[]>(savedCourses, []);
        courses.push(newCourse);
        localStorage.setItem('soma_courses', JSON.stringify(courses));
        return newCourse;
    }
}

export const getAllCourses = async (): Promise<Course[]> => {
    try {
        const response = await api.get<Course[]>('/courses');

        // Save to localStorage as backup
        if (response.data && response.data.length > 0) {
            localStorage.setItem('soma_courses', JSON.stringify(response.data));
        }

        return response.data;
    } catch (error) {
        // Fallback: get from localStorage
        console.warn('API fetch failed, using localStorage fallback');
        const savedCourses = localStorage.getItem('soma_courses');
        return parseJsonSafe<Course[]>(savedCourses, []);
    }
}

export const getCourseById = async (courseId: string): Promise<Course> => {
    try {
        const response = await api.get<Course>(`/courses/${courseId}`);
        return response.data;
    } catch (error) {
        // Fallback: get from localStorage
        console.warn('API fetch failed, using localStorage fallback');
        const savedCourses = localStorage.getItem('soma_courses');
        if (savedCourses) {
            const courses = parseJsonSafe<Course[]>(savedCourses, []);
            const course = courses.find(c => c.id === courseId);
            if (course) return course;
        }
        throw new Error('Course not found');
    }
}

// Update a course by ID
export const updateCourse = async (courseId: string, courseData: Partial<{
    title: string;
    description: string;
    coverPage: string;
    level: string;
    author: string;
}>): Promise<Course> => {
    try {
        const response = await api.patch<Course>(`/courses/${courseId}`, courseData);
        return response.data;
    } catch (error) {
        // Fallback: update in localStorage
        console.warn('API update failed, using localStorage fallback');
        const savedCourses = localStorage.getItem('soma_courses');
        if (savedCourses) {
            const courses = parseJsonSafe<Course[]>(savedCourses, []);
            const updatedCourses = courses.map(c =>
                c.id === courseId ? { ...c, ...courseData } : c
            );
            localStorage.setItem('soma_courses', JSON.stringify(updatedCourses));
            return updatedCourses.find(c => c.id === courseId) as Course;
        }
        throw error;
    }
}

// Delete a course by ID
export const deleteCourse = async (courseId: string): Promise<void> => {
    try {
        const response = await api.delete<void>(`/courses/${courseId}`);
        console.log('Course deleted from API:', response.data);
    } catch (error: any) {
        // Log the error for debugging
        console.error('API delete error:', error.response?.data || error.message);

        // Fallback: delete from localStorage
        console.warn('API delete failed, using localStorage fallback');
        const savedCourses = localStorage.getItem('soma_courses');
        if (savedCourses) {
            const courses = parseJsonSafe<Course[]>(savedCourses, []);
            const filteredCourses = courses.filter(c => c.id !== courseId);
            localStorage.setItem('soma_courses', JSON.stringify(filteredCourses));
            console.log('Course deleted from localStorage');
        }
    }
}

// Get students enrolled in a specific course
export const getCourseStudents = async (courseId: string): Promise<any[]> => {
    try {
        const response = await api.get<any[]>(`/courses/${courseId}/students`);
        return response.data;
    } catch (error) {
        // Fallback: get from localStorage
        console.warn('API fetch failed, using localStorage fallback');
        const savedEnrollments = localStorage.getItem('soma_enrollments');
        if (savedEnrollments) {
            const enrollments = parseJsonSafe<any[]>(savedEnrollments, []);
            return enrollments.filter((e: any) => e.courseId === courseId);
        }
        return [];
    }
}

// Get all students (for facilitators)
export const getAllStudents = async (): Promise<any[]> => {
    try {
        const response = await api.get<any[]>('/students');
        return response.data;
    } catch (error) {
        // Fallback: get from localStorage
        console.warn('API fetch failed, using localStorage fallback');
        const savedUsers = localStorage.getItem('soma_users');
        if (savedUsers) {
            const users = parseJsonSafe<any[]>(savedUsers, []);
            return users.filter((u: any) => u.role === 'Student');
        }
        return [];
    }
}

// Get courses for the current facilitator (courses they created)
// Falls back to all courses if API returns empty
export const getMyCourses = async (): Promise<Course[]> => {
    try {
        const response = await api.get<Course[]>('/courses/my-courses');
        // If empty, return all courses as fallback
        if (!response.data || response.data.length === 0) {
            const allCourses = await getAllCourses();
            return allCourses;
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching my courses, falling back to all courses:', error);
        // Fallback: return
        const allCourses = await getAllCourses();
        return allCourses;
    }
}

export const getCoursesByLevel = async (level: string): Promise<Course[]> => {
    try {
        const response = await api.get<Course[]>(`/courses/level?level=${level}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching courses by level:', error);
        return [];
    }
}

// Search courses by query — backend endpoint: GET /courses/serch_course?query=...
// Note: 'serch_course' is the exact backend route spelling (not a typo)
export const searchCourses = async (query: string): Promise<Course[]> => {
    try {
        const response = await api.get<Course[]>(`/courses/serch_course?query=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        console.error('Error searching courses:', error);
        return [];
    }
}
