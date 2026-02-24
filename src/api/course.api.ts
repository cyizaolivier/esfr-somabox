import { api } from "./api";

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
}) => {
    const response = await api.post('/courses', courseData);
    return response;
}


export const getAllCourses = async () => {
    const response = await api.get('/courses');
    return response;
}

export const getCoursesByLevel = async (level: string) => {
    const response = await api.get(`/courses/level?level=${level}`);
    console.log(response.data);

    return response;
}

export const getCourseById = async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response;
}

// Search courses by query — backend endpoint: GET /courses/serch_course?query=...
// Note: 'serch_course' is the exact backend route spelling (not a typo)
export const searchCourses = async (query: string) => {
    const response = await api.get(`/courses/serch_course?query=${encodeURIComponent(query)}`);
    return response;
}