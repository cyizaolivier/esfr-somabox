import { api } from "./api";

export const createTopic = async (topicData: {
    title: string;
    content: any;
    order: number;
    courseId: string;
}) => {
    const response = await api.post('/topic', topicData);
    return response;
};
export const getTopicsByCourseId = async (courseId: string) => {
    const response = await api.get(`/topic/bycourse?query=${courseId}`);
    return response;
};

export const getTopicById = async (topicId: string) => {
    const response = await api.get(`/topic/${topicId}`);
    return response;
};
