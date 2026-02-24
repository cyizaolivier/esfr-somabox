import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopicById, getTopicsByCourseId } from '../api/topic.api';
import { saveProgress, getCourseTopicProgress } from '../api/progress.api';
import { useAuth } from '../auth';
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Circle,
    Clock,
    BookOpen,
    Loader2,
    ArrowLeft,
    PlayCircle
} from 'lucide-react';
import { cn } from '../editor/src/lib/utils';
import { CourseRenderer } from '../editor/src/components/renderer/CourseRenderer';

// Per-topic progress shape returned by GET /progress/course/:courseId/topic
interface TopicProgressItem {
    topicId: string;
    status: 'not_started' | 'in-progress' | 'completed';
}

const StudyTopic: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [topic, setTopic] = useState<any>(null);
    const [allTopics, setAllTopics] = useState<any[]>([]);
    const [topicProgress, setTopicProgress] = useState<TopicProgressItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Fetch per-topic progress for the course
    const refreshProgress = useCallback(async (courseId: string) => {
        try {
            const progressRes = await getCourseTopicProgress(courseId);
            setTopicProgress(progressRes.data ?? []);
        } catch (err) {
            console.error('Error fetching topic progress:', err);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!topicId) return;
            setLoading(true);
            try {
                // Fetch current topic
                const topicRes = await getTopicById(topicId);
                const currentTopic = topicRes.data;
                setTopic(currentTopic);

                // Fetch all topics for the course (for sidebar)
                const topicsRes = await getTopicsByCourseId(currentTopic.courseId);
                setAllTopics(topicsRes.data.sort((a: any, b: any) => a.order - b.order));

                // Fetch per-topic progress
                await refreshProgress(currentTopic.courseId);
            } catch (err) {
                console.error('Error fetching topic data:', err);
                setError('Failed to load topic. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [topicId]);

    // Auto-mark topic as in-progress if not already started
    useEffect(() => {
        const markAsStarted = async () => {
            if (!topic || !user || loading) return;

            const status = getTopicStatus(topic.id);
            if (status === 'not_started') {
                try {
                    const currentIndex = allTopics.findIndex((t: any) => t.id === topic.id);
                    const progressData = {
                        studentId: user.id,
                        courseId: topic.courseId,
                        progress_percentage: Math.round((currentIndex / allTopics.length) * 100),
                        last_topic_id: topic.id,
                        last_topic_number: topic.order,
                        status: 'in-progress' as const
                    };
                    await saveProgress(progressData);
                    await refreshProgress(topic.courseId);
                } catch (err) {
                    console.error('Error auto-starting topic:', err);
                }
            }
        };

        if (topic && user && !loading) {
            markAsStarted();
        }
    }, [topic, user, loading]);

    // Look up status for a given topic using the per-topic list
    const getTopicStatus = (id: string): 'not_started' | 'in-progress' | 'completed' => {
        const entry = topicProgress.find(p => p.topicId === id);
        return entry?.status ?? 'not_started';
    };

    // Correctly count completed topics for progress bar percentage
    const completedCount = topicProgress.filter(p => p.status === 'completed').length;
    const progressPercent = allTopics.length > 0
        ? Math.round((completedCount / allTopics.length) * 100)
        : 0;

    const handleNext = async () => {
        if (!topic || !user) return;

        setSaving(true);
        try {
            const currentIndex = allTopics.findIndex((t: any) => t.id === topic.id);
            const currentStatus = getTopicStatus(topic.id);

            if (currentStatus !== 'completed') {
                const progressData = {
                    studentId: user.id,
                    courseId: topic.courseId,
                    progress_percentage: Math.round(((currentIndex + 1) / allTopics.length) * 100),
                    last_topic_id: topic.id,
                    last_topic_number: topic.order,
                    status: 'completed' as const
                };
                await saveProgress(progressData);
                await refreshProgress(topic.courseId);
            }

            // Navigate to next topic or back to course outline
            if (currentIndex < allTopics.length - 1) {
                navigate(`/student/study_topic/${allTopics[currentIndex + 1].id}`);
            } else {
                navigate(`/study/${topic.courseId}`);
            }
        } catch (err) {
            console.error('Error saving progress:', err);
            setError('Failed to save progress, but you can still continue.');
            // Navigate anyway so the student isn't blocked
            const currentIndex = allTopics.findIndex((t: any) => t.id === topic.id);
            if (currentIndex < allTopics.length - 1) {
                navigate(`/student/study_topic/${allTopics[currentIndex + 1].id}`);
            } else {
                navigate(`/study/${topic.courseId}`);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-primary-surface/30">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Loading topic content...</p>
            </div>
        );
    }

    if (error && !topic) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-primary-surface/30">
                <div className="max-w-md p-8 bg-red-50 rounded-3xl border border-red-100 text-center shadow-xl">
                    <p className="text-red-600 font-bold mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const currentTopicIndex = allTopics.findIndex((t: any) => t.id === topic?.id);

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Minimal Header */}
            <header className="h-16 flex items-center justify-between px-6 bg-primary text-white shadow-lg relative z-30 shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(`/study/${topic?.courseId}`)}
                        className="flex items-center gap-2 text-white/90 hover:text-white font-bold text-sm transition-colors group px-3 py-1.5 rounded-xl hover:bg-white/10"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Course
                    </button>
                    <div className="h-6 w-px bg-white/20" />
                    <h1 className="text-lg font-black truncate max-w-md">{topic?.title || "Study Topic"}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-white/20">
                        <div className="text-right">
                            <div className="text-xs font-bold leading-none">{user?.email.split('@')[0]}</div>
                            <div className="text-[10px] text-white/70 font-black uppercase mt-1 tracking-widest">{user?.role}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/30 overflow-hidden bg-white/10">
                            <img src={`https://ui-avatars.com/api/?name=${user?.email}&background=random`} className="w-full h-full object-cover" alt="Profile" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Fixed Sidebar */}
                <aside className="w-80 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm z-20">
                    <div className="p-6 border-b border-gray-50 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Modules</h2>
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {progressPercent}% Complete
                            </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {allTopics.map((t, idx) => {
                            const status = getTopicStatus(t.id);
                            const isActive = t.id === topicId;

                            return (
                                <button
                                    key={t.id}
                                    onClick={() => navigate(`/student/study_topic/${t.id}`)}
                                    className={cn(
                                        "w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all duration-300 group relative",
                                        isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "hover:bg-slate-50 text-gray-600"
                                    )}
                                >
                                    <div className={cn(
                                        "mt-1 shrink-0",
                                        isActive ? "text-white" : status === 'completed' ? "text-green-500" : "text-gray-300"
                                    )}>
                                        {status === 'completed' ? (
                                            <CheckCircle2 size={16} fill={isActive ? 'white' : 'currentColor'} className={isActive ? 'text-primary' : 'text-white'} />
                                        ) : (
                                            <Circle size={16} strokeWidth={3} />
                                        )}
                                    </div>
                                    <div className="min-w-0 pr-6">
                                        <p className="text-xs font-black uppercase opacity-60 tracking-wider mb-0.5">Topic {idx + 1}</p>
                                        <p className="text-sm font-bold leading-tight truncate">{t.title}</p>
                                    </div>
                                    {isActive && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <PlayCircle size={18} className="animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar flex flex-col relative z-10">
                    <div className="flex-1 p-6 md:p-10 lg:p-14">
                        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 min-h-[calc(100vh-12rem)]">
                            {topic?.content && (
                                <CourseRenderer data={topic.content} topicId={topic.id} />
                            )}
                        </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="p-4 md:p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-between sticky bottom-0 z-20">
                        <button
                            onClick={() => {
                                if (currentTopicIndex > 0) {
                                    navigate(`/student/study_topic/${allTopics[currentTopicIndex - 1].id}`);
                                }
                            }}
                            disabled={currentTopicIndex === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-gray-500 hover:text-primary transition-all disabled:opacity-0 pointer-events-auto"
                        >
                            <ChevronLeft size={20} />
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={saving}
                            className="flex items-center gap-2 px-10 py-3 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 group"
                        >
                            {saving ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <span>
                                        {currentTopicIndex === allTopics.length - 1 ? 'Finish Course' : 'Next Topic'}
                                    </span>
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudyTopic;
