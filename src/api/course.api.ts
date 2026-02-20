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