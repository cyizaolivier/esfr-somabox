import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourse } from '../../state/CourseContext';
import { List, Plus, Home, Download, FileJson, Cloud, ArrowLeft, Users, Trash2 } from 'lucide-react';
import { createCourse, getCourseById, getCourseStudents, deleteCourse, getAllCourses } from '../../../../api/course.api';
import { generateCourseExport } from '../../lib/htmlGenerator';
import { serializeFullCourse } from '../../lib/serialization';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTopicItem } from './SortableTopicItem';

export const CourseOutline: React.FC = () => {
    const { state, dispatch } = useCourse();
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId?: string }>();
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [showStudents, setShowStudents] = useState(false);

    // Load course data if courseId is provided
    useEffect(() => {
        const loadCourse = async () => {
            if (courseId) {
                try {
                    setLoading(true);
                    const course = await getCourseById(courseId);
                    // Update context with course metadata
                    dispatch({ 
                        type: 'UPDATE_METADATA', 
                        payload: {
                            title: course.title,
                            description: course.description,
                            level: course.level,
                            author: course.author,
                            coverPage: course.coverPage
                        }
                    });
                    dispatch({ type: 'SET_BACKEND_COURSE_ID', payload: course.id });
                    
                    // Load students enrolled in this course
                    const courseStudents = await getCourseStudents(courseId);
                    setStudents(courseStudents);
                } catch (error) {
                    console.error('Failed to load course:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadCourse();
    }, [courseId, dispatch]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddTopic = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Adding topic:", newTopicTitle);
        if (!newTopicTitle.trim()) {
            console.log("Empty title, ignoring.");
            return;
        }
        dispatch({ type: 'ADD_TOPIC', payload: { title: newTopicTitle } });
        setNewTopicTitle('');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = state.topics.findIndex((t) => t.id === active.id);
            const newIndex = state.topics.findIndex((t) => t.id === over.id);

            const newTopics = arrayMove(state.topics, oldIndex, newIndex);
            dispatch({ type: 'REORDER_TOPICS', payload: newTopics });
        }
    };

    const handleExport = () => {
        const html = generateCourseExport(state);
        const fileName = (state.metadata.title || 'course-export').toLowerCase().replace(/\s+/g, '-');

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDelete = async () => {
        if (!courseId) {
            alert('No course ID found. Course may not be saved yet.');
            return;
        }
        
        const confirmDelete = window.confirm(`Are you sure you want to delete this course? This will delete course ID: ${courseId}`);
        if (!confirmDelete) return;

        try {
            setLoading(true);
            
            // First, sync courses from API to localStorage (in case they aren't there)
            try {
                const allCourses = await getAllCourses();
                console.log('Synced courses to localStorage:', allCourses.length);
            } catch (syncError) {
                console.log('Could not sync courses:', syncError);
            }
            
            // Debug: Check what's in localStorage before delete
            console.log('=== DELETE DEBUG ===');
            console.log('Course ID to delete:', courseId);
            const savedCoursesBefore = localStorage.getItem('soma_courses');
            console.log('Courses in localStorage before:', savedCoursesBefore ? JSON.parse(savedCoursesBefore) : 'No courses found');
            
            // Try API delete first
            let apiDeleted = false;
            try {
                await deleteCourse(courseId);
                console.log('API delete called');
                apiDeleted = true;
            } catch (apiError: any) {
                console.log('API delete failed:', apiError.message);
            }
            
            // Always try to delete from localStorage directly
            const savedCourses = localStorage.getItem('soma_courses');
            if (savedCourses) {
                const courses = JSON.parse(savedCourses);
                const courseExists = courses.find((c: any) => c.id === courseId);
                console.log('Course exists in localStorage:', !!courseExists);
                
                const filteredCourses = courses.filter((c: any) => c.id !== courseId);
                localStorage.setItem('soma_courses', JSON.stringify(filteredCourses));
                console.log('Deleted from localStorage. Remaining courses:', filteredCourses.length);
            } else {
                console.log('No courses in localStorage - cannot delete from localStorage');
            }
            
            // Also remove enrollments for this course
            const savedEnrollments = localStorage.getItem('soma_enrollments');
            if (savedEnrollments) {
                const enrollments = JSON.parse(savedEnrollments);
                const filteredEnrollments = enrollments.filter((e: any) => e.courseId !== courseId);
                localStorage.setItem('soma_enrollments', JSON.stringify(filteredEnrollments));
            }
            
            // Verify deletion
            const savedCoursesAfter = localStorage.getItem('soma_courses');
            const coursesAfter = savedCoursesAfter ? JSON.parse(savedCoursesAfter) : [];
            const courseStillExists = coursesAfter.find((c: any) => c.id === courseId);
            
            console.log('Course still exists after delete:', !!courseStillExists);
            console.log('===================');
            
            if (courseStillExists && !apiDeleted) {
                alert('Warning: Course may not have been fully deleted. Check console for details.');
            } else {
                alert('Course deleted successfully!');
            }
            
            // Force a full page navigation to ensure fresh data
            window.location.href = '/facilitator/courses';
        } catch (error: any) {
            console.error('Failed to delete course:', error);
            alert('Failed to delete course: ' + (error.message || 'Unknown error'));
            setLoading(false);
        }
    };

    const handleSaveJSON = () => {
        const serialized = serializeFullCourse(state);
        const json = JSON.stringify(serialized, null, 2);
        const fileName = (state.metadata.title || 'course-data').toLowerCase().replace(/\s+/g, '-');

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("Full Course Serialized:", serialized);
    };

    const handleSaveToBackend = async () => {
        try {
            const courseData = {
                title: state.metadata.title,
                description: state.metadata.description,
                coverPage: state.metadata.coverPage,
                level: state.metadata.level,
                author: state.metadata.author,
            };

            const newCourse = await createCourse(courseData);
            const backendId = newCourse.id;

            dispatch({ type: 'SET_BACKEND_COURSE_ID', payload: backendId });
            alert("Course saved to cloud successfully!");
        } catch (error) {
            console.error("Error saving course to backend:", error);
            alert("Failed to save course to cloud.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="h-24 bg-white border-b border-gray-100 px-8 flex items-center justify-between shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/facilitator/dashboard')}
                            className="p-3 bg-gray-50 hover:bg-primary-surface text-gray-400 hover:text-primary rounded-xl transition-all border border-gray-100 cursor-pointer group"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/facilitator/create-course')}
                            className="p-3 bg-gray-50 hover:bg-primary-surface text-gray-400 hover:text-primary rounded-xl transition-all border border-gray-100 cursor-pointer"
                            title="Edit Metadata"
                        >
                            <Home size={20} />
                        </button>
                    </div>
                    <div className="h-10 w-px bg-gray-100 mx-2" />
                    <div>
                        <h1 className="font-black text-2xl text-gray-900 tracking-tight">{state.metadata.title || 'Untitled Course'}</h1>
                        <p className="text-primary font-bold text-xs mt-1 uppercase tracking-widest opacity-60">
                            {state.metadata.level} • {state.metadata.category || 'Standard'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSaveToBackend}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-surface text-primary rounded-xl font-bold hover:bg-primary-surface/80 transition-all border-none cursor-pointer active:scale-95"
                    >
                        <Cloud size={18} />
                        Save to Cloud
                    </button>
                    <button
                        onClick={handleSaveJSON}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all border-none cursor-pointer active:scale-95"
                    >
                        <FileJson size={18} />
                        Save JSON
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={state.topics.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:bg-primary disabled:active:scale-100 border-none cursor-pointer"
                    >
                        <Download size={18} />
                        Export HTML
                    </button>
                    {courseId && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border-none cursor-pointer active:scale-95"
                        >
                            <Trash2 size={18} />
                            Delete
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 p-12 max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-surface text-primary p-2 rounded-lg">
                            <List size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Course Outline</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-medium">{state.topics.length} Topics Total</span>
                        {courseId && (
                            <button
                                onClick={() => setShowStudents(!showStudents)}
                                className="ml-4 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold flex items-center gap-2 hover:bg-green-100 transition-all"
                            >
                                <Users size={18} />
                                Students ({students.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Students Panel */}
                {showStudents && (
                    <div className="mb-8 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                            <h3 className="font-bold text-green-800">Enrolled Students</h3>
                        </div>
                        {students.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {students.map((student: any, index: number) => (
                                    <div key={index} className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                                            {student.name?.charAt(0) || student.email?.charAt(0) || 'S'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{student.name || 'Student'}</p>
                                            <p className="text-sm text-gray-500">{student.email}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            Enrolled
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-8 text-center text-gray-500">
                                No students enrolled in this course yet.
                            </div>
                        )}
                    </div>
                )}

                {/* Add Topic Form */}
                <form onSubmit={handleAddTopic} className="mb-12 flex gap-3">
                    <input
                        type="text"
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        placeholder="Enter topic title... (e.g. Introduction to React)"
                        className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary transition-all outline-none text-gray-700"
                    />
                    <button
                        type="submit"
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md active:scale-95 border-none cursor-pointer"
                    >
                        <Plus size={20} />
                        Add Topic
                    </button>
                </form>

                {/* Topic List */}
                <div className="space-y-4">
                    {state.topics.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus size={32} className="text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-medium">No topics added yet. Start by adding your first milestone!</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={state.topics.map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-4">
                                    {state.topics.map((topic, index) => (
                                        <SortableTopicItem
                                            key={topic.id}
                                            topic={topic}
                                            index={index}
                                            onEdit={(id) => navigate(`/facilitator/editor/${id}`)}
                                            onDelete={(id) => dispatch({ type: 'DELETE_TOPIC', payload: id })}
                                            onPreview={(id) => navigate(`/facilitator/preview/${id}`)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </main>
        </div>
    );
};
