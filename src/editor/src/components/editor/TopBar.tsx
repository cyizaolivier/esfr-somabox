import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor } from '../../state/EditorContext';
import { useCourse } from '../../state/CourseContext';
import { cn } from '../../lib/utils';
import { generateHtml } from '../../lib/htmlGenerator';
import { serializeTopicState } from '../../lib/serialization';
import { Save, ArrowLeft, LayoutTemplate, Undo2, Redo2, Trash2, Monitor, Tablet, Smartphone, FileJson, Check } from 'lucide-react';
import { createTopic } from '../../../../api/topic.api';
import { Topic } from '../../state/CourseContext';

export const TopBar: React.FC = () => {
    const { state, dispatch } = useEditor();
    const { state: courseState, dispatch: courseDispatch } = useCourse();
    const navigate = useNavigate();
    const { topicId } = useParams();

    const handleSaveTopic = async () => {
        if (!topicId) return;
        const html = generateHtml(state);
        const layoutJSON = JSON.stringify({ elements: state.elements });

        // Local state update
        courseDispatch({
            type: 'UPDATE_TOPIC_CONTENT',
            payload: { id: topicId, contentHTML: html, layoutJSON }
        });

        // Backend Integration
        const backendCourseId = courseState.backendCourseId || localStorage.getItem('course_id');

        if (backendCourseId) {
            try {
                const currentTopic = courseState.topics.find((t: Topic) => t.id === topicId);
                const orderIndex = courseState.topics.findIndex((t: Topic) => t.id === topicId) + 1;

                const topicData = {
                    title: currentTopic?.title || "Untitled Topic",
                    content: { elements: state.elements },
                    order: orderIndex,
                    courseId: backendCourseId
                };

                await createTopic(topicData);
                console.log("Topic saved to backend successfully.");
            } catch (error) {
                console.error("Error saving topic to backend:", error);
                alert("Failed to sync topic to cloud. Please check your connection or ensure the course is saved.");
            }
        } else {
            console.log("Topic saved locally. No backend course ID found to sync.");
        }

        navigate('/facilitator/course-outline');
    };

    const handlePrintJSON = () => {
        const serialized = serializeTopicState(state.elements, topicId || 'temp', "Demo Topic");
        console.log("Serialized JSON Output:", JSON.stringify(serialized, null, 2));
        alert("JSON printed to console! Open DevTools to view.");
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            dispatch({ type: 'CLEAR_CANVAS' });
        }
    };

    return (
        <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-10 relative shadow-sm">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => navigate('/facilitator/course-outline')}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold text-sm transition-all border-none bg-transparent cursor-pointer active:scale-95 px-2 py-1 rounded-lg hover:bg-primary-surface"
                >
                    <ArrowLeft size={18} />
                    Back to Outline
                </button>

                <div className="flex items-center gap-1 border-l border-gray-200 pl-6">
                    <button
                        onClick={() => dispatch({ type: 'UNDO' })}
                        disabled={state.past.length === 0}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent border-none bg-transparent cursor-pointer"
                        title="Undo"
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        onClick={() => dispatch({ type: 'REDO' })}
                        disabled={state.future.length === 0}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent border-none bg-transparent cursor-pointer"
                        title="Redo"
                    >
                        <Redo2 size={18} />
                    </button>
                    <button
                        onClick={handleClear}
                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded border-none bg-transparent cursor-pointer"
                        title="Clear Canvas"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-1 border-l border-gray-200 pl-6 bg-gray-50 rounded-lg p-1">
                    <button
                        onClick={() => dispatch({ type: 'SET_PREVIEW_MODE', payload: 'desktop' })}
                        className={cn(
                            "p-1.5 rounded-md transition-all border-none bg-transparent cursor-pointer",
                            state.previewMode === 'desktop' ? "bg-white shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"
                        )}
                        title="Desktop View"
                    >
                        <Monitor size={18} />
                    </button>
                    <button
                        onClick={() => dispatch({ type: 'SET_PREVIEW_MODE', payload: 'tablet' })}
                        className={cn(
                            "p-1.5 rounded-md transition-all border-none bg-transparent cursor-pointer",
                            state.previewMode === 'tablet' ? "bg-white shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"
                        )}
                        title="Tablet View"
                    >
                        <Tablet size={18} />
                    </button>
                    <button
                        onClick={() => dispatch({ type: 'SET_PREVIEW_MODE', payload: 'mobile' })}
                        className={cn(
                            "p-1.5 rounded-md transition-all border-none bg-transparent cursor-pointer",
                            state.previewMode === 'mobile' ? "bg-white shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"
                        )}
                        title="Mobile View"
                    >
                        <Smartphone size={18} />
                    </button>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'templates' })}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                    <LayoutTemplate size={16} />
                    Templates
                </button>

                <button
                    onClick={handlePrintJSON}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                    <FileJson size={16} />
                    Print JSON
                </button>

                <button
                    onClick={handleSaveTopic}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-primary border-none rounded-xl hover:bg-primary-dark shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                    <Save size={16} />
                    Save Topic Content
                </button>
            </div>
        </div>
    );
};
