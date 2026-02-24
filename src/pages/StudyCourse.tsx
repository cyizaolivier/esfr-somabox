import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getTopicsByCourseId } from '../api/topic.api';
import { getCourseTopicProgress } from '../api/progress.api';
import { useAuth } from '../auth';
import { Book, PlayCircle, Clock, ChevronRight, ArrowLeft, Loader2, BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '../editor/src/lib/utils';

// Per-topic progress shape returned by GET /progress/course/:courseId/topic
interface TopicProgressItem {
    topicId: string;
    status: 'not_started' | 'in-progress' | 'completed';
}

const StudyCourse: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [topics, setTopics] = useState<any[]>([]);
    const [topicProgress, setTopicProgress] = useState<TopicProgressItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!courseId) return;
            try {
                const [topicsRes, progressRes] = await Promise.all([
                    getTopicsByCourseId(courseId),
                    getCourseTopicProgress(courseId)
                ]);
                setTopics(topicsRes.data);
                // Backend returns array: [{ topicId, status }]
                setTopicProgress(progressRes.data ?? []);
            } catch (err) {
                console.error('Error fetching course data:', err);
                setError('Failed to load course content. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    // Look up per-topic status from the dedicated topic progress list
    const getTopicStatus = (topicId: string): 'not_started' | 'in-progress' | 'completed' => {
        const entry = topicProgress.find(p => p.topicId === topicId);
        return entry?.status ?? 'not_started';
    };

    return (
        <DashboardLayout title="Study Course">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate('/library')}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold mb-8 transition-colors border-none bg-transparent cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    Back to Library
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-gray-500 font-medium italic">Preparing your study material...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center max-w-lg mx-auto">
                        <p className="text-red-600 font-bold mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                        >
                            Retry
                        </button>
                    </div>
                ) : topics.length === 0 ? (
                    <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2.5rem] p-12 text-center">
                        <div className="w-20 h-20 bg-primary-surface rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                            <BookOpen size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">No topics found yet</h2>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">This course hasn't been populated with topics yet. Check back later!</p>
                        <button
                            onClick={() => navigate('/library')}
                            className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95"
                        >
                            Explore Other Courses
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex items-end justify-between mb-2">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 mb-2">Course Topics</h1>
                                <p className="text-gray-500 font-medium">Master this course step by step through these modules.</p>
                            </div>
                            <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                                <span className="text-primary font-bold text-sm">{topics.length} Lessons</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {topics.sort((a, b) => a.order - b.order).map((topic, index) => {
                                const status = getTopicStatus(topic.id);
                                return (
                                    <div
                                        key={topic.id}
                                        onClick={() => navigate(`/student/study_topic/${topic.id}`)}
                                        className="group bg-white/40 backdrop-blur-md border border-primary/5 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-surface to-white border border-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner flex-shrink-0">
                                            <span className="text-xl md:text-2xl font-black">{index + 1}</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full">Module {index + 1}</span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                    <Clock size={12} />
                                                    <span>15-20 mins</span>
                                                </div>
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{topic.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{topic.description || 'Start learning this module to master the essentials of this course.'}</p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end hidden md:flex">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">Status</span>
                                                {status === 'completed' ? (
                                                    <span className="text-xs font-black text-green-500 flex items-center gap-1">
                                                        <CheckCircle2 size={12} />
                                                        Completed
                                                    </span>
                                                ) : status === 'in-progress' ? (
                                                    <span className="text-xs font-black text-amber-500">In Progress</span>
                                                ) : (
                                                    <span className="text-xs font-black text-gray-400">Not Started</span>
                                                )}
                                            </div>
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                                status === 'completed'
                                                    ? "bg-green-50 text-green-500 group-hover:bg-green-500 group-hover:text-white"
                                                    : "bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white"
                                            )}>
                                                <PlayCircle size={24} />
                                            </div>
                                        </div>

                                        {/* Success/Hover Gradient */}
                                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudyCourse;
