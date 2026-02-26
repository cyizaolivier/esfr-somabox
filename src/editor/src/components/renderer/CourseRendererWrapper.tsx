import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../../state/CourseContext';
import { CourseRenderer } from './CourseRenderer';
import { ArrowLeft } from 'lucide-react';

export const CourseRendererWrapper: React.FC = () => {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { state } = useCourse();

    const topic = state.topics.find(t => t.id === topicId);

    if (!topic || !topic.layoutJSON) {
        return <div className="p-10 text-center">Topic data not found. Save it in the editor first.</div>;
    }

    try {
        const data = JSON.parse(topic.layoutJSON);
        return (
            <div className="min-h-screen bg-slate-50">
                {/* Back Button */}
                <div className="fixed top-4 left-4 z-50">
                    <button
                        onClick={() => navigate('/facilitator/course-outline')}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-all border border-gray-200"
                    >
                        <ArrowLeft size={18} />
                        Back to Course
                    </button>
                </div>
                <CourseRenderer data={data} topicId={topicId || ''} />
            </div>
        );
    } catch (e) {
        return <div className="p-10 text-center text-red-500">Failed to parse course data.</div>;
    }
};
