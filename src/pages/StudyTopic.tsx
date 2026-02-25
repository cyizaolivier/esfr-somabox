import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopicById, getTopicsByCourseId } from '../api/topic.api';
import { saveProgress, getCourseTopicProgress, completeCourse } from '../api/progress.api';
import { useAuth } from '../auth';
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Circle,
    Loader2,
    ArrowLeft,
    PlayCircle,
    Sparkles,
    Brain
} from 'lucide-react';
import { generateRealQuiz } from '../editor/src/lib/aiService';
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
    const [aiQuiz, setAiQuiz] = useState<any>(null);
    const [generatingAiQuiz, setGeneratingAiQuiz] = useState(false);
    const [showAiQuiz, setShowAiQuiz] = useState(false);
    const [selectedAiAnswers, setSelectedAiAnswers] = useState<Record<number, number>>({});
    const [showAiResults, setShowAiResults] = useState(false);

    // Standalone progress refresher (used after save)
    const refreshProgress = useCallback(async (courseId: string) => {
        try {
            const progressRes = await getCourseTopicProgress(courseId);
            setTopicProgress(progressRes.data ?? []);
        } catch (err) {
            console.error('Error refreshing topic progress:', err);
        }
    }, []);

    useEffect(() => {
        if (!topicId || !user) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch current topic
                const topicRes = await getTopicById(topicId);
                const currentTopic = topicRes.data;
                setTopic(currentTopic);

                // 2. Fetch all topics for sidebar
                const topicsRes = await getTopicsByCourseId(currentTopic.courseId);
                const sorted = topicsRes.data.sort((a: any, b: any) => a.order - b.order);
                setAllTopics(sorted);

                // 3. Fetch per-topic progress — use LOCAL variable, NOT state
                //    This prevents the race condition where auto-start fires before
                //    topicProgress state has been updated.
                let currentProgress: TopicProgressItem[] = [];
                try {
                    const progressRes = await getCourseTopicProgress(currentTopic.courseId);
                    currentProgress = progressRes.data ?? [];
                } catch {
                    // First-time student — no progress yet, currentProgress stays []
                }
                setTopicProgress(currentProgress);

                // 4. Auto-mark as in-progress using LOCAL currentProgress (no race condition)
                const existingEntry = currentProgress.find(p => p.topicId === currentTopic.id);
                const alreadyTracked = existingEntry && existingEntry.status !== 'not_started';

                if (!alreadyTracked) {
                    const currentIndex = sorted.findIndex((t: any) => t.id === currentTopic.id);
                    try {
                        await saveProgress({
                            studentId: user.id,
                            courseId: currentTopic.courseId,
                            progress_percentage: Math.round((currentIndex / sorted.length) * 100),
                            last_topic_id: currentTopic.id,
                            last_topic_number: currentTopic.order,
                            status: 'in-progress',
                        });
                        // Update local state to reflect the new in-progress status
                        setTopicProgress(prev => {
                            const filtered = prev.filter(p => p.topicId !== currentTopic.id);
                            return [...filtered, { topicId: currentTopic.id, status: 'in-progress' }];
                        });
                    } catch (err) {
                        console.error('Error auto-starting topic:', err);
                    }
                }
            } catch (err) {
                console.error('Error fetching topic data:', err);
                setError('Failed to load topic. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [topicId, user]); // user is included so we re-run if user loads after mount

    // Stable status lookup
    const getTopicStatus = (id: string): 'not_started' | 'in-progress' | 'completed' => {
        const entry = topicProgress.find(p => p.topicId === id);
        return entry?.status ?? 'not_started';
    };

    // Progress bar: count only completed topics
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

            // Only save if not already completed — avoids redundant writes
            if (currentStatus !== 'completed') {
                await saveProgress({
                    studentId: user.id,
                    courseId: topic.courseId,
                    progress_percentage: Math.round(((currentIndex + 1) / allTopics.length) * 100),
                    last_topic_id: topic.id,
                    last_topic_number: topic.order,
                    status: 'completed',
                });
                // Optimistically update local state so sidebar reflects immediately
                setTopicProgress(prev => {
                    const filtered = prev.filter(p => p.topicId !== topic.id);
                    return [...filtered, { topicId: topic.id, status: 'completed' }];
                });
            }

            // If this was the last topic, mark the entire course as completed
            const isLastTopic = currentIndex === allTopics.length - 1;
            if (isLastTopic) {
                try {
                    await completeCourse(topic.courseId);
                } catch (err) {
                    console.error('Error marking course complete:', err);
                    // Don't block navigation — course completion is best-effort
                }
                navigate(`/study/${topic.courseId}`);
            } else {
                navigate(`/student/study_topic/${allTopics[currentIndex + 1].id}`);
            }
        } catch (err) {
            console.error('Error saving progress:', err);
            setError('Failed to save progress. You can still continue.');
            // Don't block navigation on a save error
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

    const handleGenerateAiQuiz = async () => {
        if (!topic?.content?.elements) return;

        setGeneratingAiQuiz(true);
        try {
            // Extract text from elements
            const content = topic.content.elements
                .map((el: any) => {
                    if (el.type === 'text') return (el.content || '').replace(/<[^>]*>?/gm, '');
                    if (el.type === 'hero') return (el.content || '').split('\n').join(': ');
                    if (el.type === 'list') return "List items: " + el.content;
                    return "";
                })
                .filter((t: string) => t.length > 0)
                .join("\n\n");

            if (!content) {
                alert("This topic doesn't have enough text content to generate a quiz.");
                return;
            }

            const result = await generateRealQuiz(content);
            setAiQuiz(result);
            setShowAiQuiz(true);
            setSelectedAiAnswers({});
            setShowAiResults(false);
        } catch (err) {
            console.error('Error generating AI quiz:', err);
            alert('Failed to generate AI quiz. Please try again later.');
        } finally {
            setGeneratingAiQuiz(false);
        }
    };

    const handleAiOptionSelect = (qIdx: number, oIdx: number) => {
        if (showAiResults) return;
        setSelectedAiAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
    };

    const calculateAiScore = () => {
        if (!aiQuiz) return 0;
        let score = 0;
        aiQuiz.questions.forEach((q: any, i: number) => {
            if (selectedAiAnswers[i] === q.correct) score++;
        });
        return score;
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
            {/* Header */}
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
                    <h1 className="text-lg font-black truncate max-w-md">{topic?.title || 'Study Topic'}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleGenerateAiQuiz}
                        disabled={generatingAiQuiz || !topic}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all border border-white/20",
                            generatingAiQuiz && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {generatingAiQuiz ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Sparkles size={16} className="text-yellow-300" />
                        )}
                        <span>{generatingAiQuiz ? 'Generating AI Quiz...' : 'Practice with AI'}</span>
                    </button>
                    <div className="hidden sm:flex items-center gap-3 pr-4">
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
                {/* Sidebar */}
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
                                className="h-full bg-primary transition-all duration-700"
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
                                        'w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all duration-300 group relative',
                                        isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'hover:bg-slate-50 text-gray-600'
                                    )}
                                >
                                    <div className={cn(
                                        'mt-1 shrink-0',
                                        isActive ? 'text-white' : status === 'completed' ? 'text-green-500' : 'text-gray-300'
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

                {/* Main content */}
                <main className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar flex flex-col relative z-10">
                    <div className="flex-1 p-6 md:p-10 lg:p-14">
                        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 min-h-[calc(100vh-12rem)]">
                            {topic?.content && (
                                <CourseRenderer data={topic.content} topicId={topic.id} />
                            )}

                            {showAiQuiz && aiQuiz && (
                                <div className="mt-12 pt-12 border-t-4 border-dashed border-primary/10">
                                    <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/20 shadow-inner">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                                    <Brain size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-800">AI Practice Quiz</h3>
                                                    <p className="text-sm text-gray-500 font-medium">Test your knowledge on this topic</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowAiQuiz(false)}
                                                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                                            >
                                                Close Quiz
                                            </button>
                                        </div>

                                        <div className="space-y-8">
                                            {aiQuiz.questions.map((q: any, qIdx: number) => (
                                                <div key={qIdx} className="space-y-4">
                                                    <div className="flex gap-4">
                                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-sm">
                                                            {qIdx + 1}
                                                        </span>
                                                        <p className="text-lg font-bold text-gray-800 pt-0.5">{q.question}</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                                                        {q.options.map((opt: string, oIdx: number) => {
                                                            const isSelected = selectedAiAnswers[qIdx] === oIdx;
                                                            const isCorrect = q.correct === oIdx;
                                                            return (
                                                                <button
                                                                    key={oIdx}
                                                                    onClick={() => handleAiOptionSelect(qIdx, oIdx)}
                                                                    className={cn(
                                                                        "w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 font-bold",
                                                                        isSelected
                                                                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                                                                            : "border-gray-100 bg-white text-gray-600 hover:border-primary/30 hover:bg-primary/5",
                                                                        showAiResults && isCorrect && "border-green-500 bg-green-50 text-green-700",
                                                                        showAiResults && isSelected && !isCorrect && "border-red-500 bg-red-50 text-red-700"
                                                                    )}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {!showAiResults ? (
                                            <button
                                                onClick={() => setShowAiResults(true)}
                                                className="w-full mt-12 py-5 bg-primary text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all text-xl"
                                            >
                                                Check Results
                                            </button>
                                        ) : (
                                            <div className="mt-12 p-8 bg-white rounded-[2rem] border-2 border-primary/20 text-center animate-in zoom-in-95 duration-500">
                                                <p className="text-lg font-bold text-gray-500 mb-2 uppercase tracking-widest">Your Result</p>
                                                <p className="text-6xl font-black text-primary mb-6">
                                                    {calculateAiScore()} <span className="text-2xl text-gray-300">/</span> {aiQuiz.questions.length}
                                                </p>
                                                <div className="flex gap-4 justify-center">
                                                    <button
                                                        onClick={() => { setShowAiResults(false); setSelectedAiAnswers({}); }}
                                                        className="px-8 py-3 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all"
                                                    >
                                                        Retry Quiz
                                                    </button>
                                                    <button
                                                        onClick={handleGenerateAiQuiz}
                                                        className="px-8 py-3 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                                                    >
                                                        <Sparkles size={18} />
                                                        Generate New Quiz
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom navigation */}
                    <div className="p-4 md:p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-between sticky bottom-0 z-20">
                        <button
                            onClick={() => {
                                if (currentTopicIndex > 0) {
                                    navigate(`/student/study_topic/${allTopics[currentTopicIndex - 1].id}`);
                                }
                            }}
                            disabled={currentTopicIndex <= 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-gray-500 hover:text-primary transition-all disabled:opacity-0"
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
