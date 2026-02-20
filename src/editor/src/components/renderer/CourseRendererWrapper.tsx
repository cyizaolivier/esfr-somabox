import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../../state/CourseContext';
import { CourseRenderer } from './CourseRenderer';

export const CourseRendererWrapper: React.FC = () => {
    const { topicId } = useParams();
    const { state } = useCourse();

    const topic = state.topics.find(t => t.id === topicId);

    if (!topic || !topic.layoutJSON) {
        return <div className="p-10 text-center">Topic data not found. Save it in the editor first.</div>;
    }

    try {
        const data = JSON.parse(topic.layoutJSON);
        return <CourseRenderer data={data} topicId={topicId || ''} />;
    } catch (e) {
        return <div className="p-10 text-center text-red-500">Failed to parse course data.</div>;
    }
};
