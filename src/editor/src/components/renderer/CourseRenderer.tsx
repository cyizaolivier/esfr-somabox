import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { EditorElement } from '../../state/types';
import { cn } from '../../lib/utils';
import { FileText, ArrowRight, Video, HelpCircle, Loader2, CheckCircle2, XCircle, RefreshCw, PlayCircle } from 'lucide-react';
import { mockGenerateQuiz, generateRealQuiz } from '../../lib/aiService';

/**
 * Converts a YouTube or Vimeo watch URL to an embeddable iframe URL.
 * Returns null if the URL is a direct video file (mp4, webm, etc.)
 */
function getVideoEmbedUrl(url: string): string | null {
    if (!url) return null;

    // YouTube: https://www.youtube.com/watch?v=ID  or  https://youtu.be/ID
    const youtubeMatch =
        url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo: https://vimeo.com/ID
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Already an embed URL — pass it through
    if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/')) {
        return url;
    }

    // Direct file URL — use native <video> tag
    return null;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// VideoGatePlayer — auto quiz every 5 minutes using AI
// ─────────────────────────────────────────────────────────────────────────────

const QUIZ_INTERVAL_SECONDS = 300; // 5 minutes

interface Question {
    id: string;
    question: string;
    options: string[];
    correct: number;
}

type GateState = 'playing' | 'loading' | 'quiz' | 'pass' | 'fail';

interface VideoGatePlayerProps {
    src: string;
    /** All text content from the canvas, used as AI context */
    courseContext: string;
    style: React.CSSProperties;
}

const VideoGatePlayer: React.FC<VideoGatePlayerProps> = ({ src, courseContext, style }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const triggeredGates = useRef<Set<number>>(new Set());

    const [gateState, setGateState] = useState<GateState>('playing');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [gateMinute, setGateMinute] = useState(0);
    const [score, setScore] = useState<{ got: number; total: number } | null>(null);

    const handleTimeUpdate = useCallback(async () => {
        const video = videoRef.current;
        if (!video || gateState !== 'playing') return;

        const currentSecond = Math.floor(video.currentTime);

        // Check every 5-minute interval (300, 600, 900, ...)
        if (
            currentSecond > 0 &&
            currentSecond % QUIZ_INTERVAL_SECONDS === 0 &&
            !triggeredGates.current.has(currentSecond)
        ) {
            triggeredGates.current.add(currentSecond);
            video.pause();

            const minuteMark = Math.floor(currentSecond / 60);
            setGateMinute(minuteMark);
            setGateState('loading');
            setAnswers({});
            setScore(null);

            // Build prompt from course content
            const prompt = courseContext || 'General knowledge check based on the video content';

            try {
                const result = await generateRealQuiz(prompt);
                setQuestions(result.questions || []);
            } catch {
                const result = await mockGenerateQuiz(prompt);
                setQuestions(result.questions || []);
            }

            setGateState('quiz');
        }
    }, [gateState, courseContext]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [handleTimeUpdate]);

    const handleSubmit = () => {
        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correct) correct++;
        });
        const total = questions.length;
        const passed = total > 0 && correct / total >= 0.5; // 50% pass threshold

        setScore({ got: correct, total });

        if (passed) {
            setGateState('pass');
        } else {
            setGateState('fail');
        }
    };

    const handleContinue = () => {
        setGateState('playing');
        videoRef.current?.play();
    };

    const handleRestart = () => {
        const video = videoRef.current;
        if (!video) return;
        triggeredGates.current.clear();
        video.currentTime = 0;
        setGateState('playing');
        video.play();
    };

    const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

    return (
        <div style={style} className="relative bg-black rounded-xl overflow-hidden shadow-lg">
            {/* Native video */}
            <video
                ref={videoRef}
                key={src}
                src={src}
                controls={gateState === 'playing'}
                className="w-full h-full"
            />

            {/* ── LOADING OVERLAY ── */}
            {gateState === 'loading' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-20">
                    <Loader2 size={40} className="text-white animate-spin" />
                    <p className="text-white font-bold text-lg">Generating quiz with AI…</p>
                    <p className="text-gray-400 text-sm">Answer correctly to continue watching</p>
                </div>
            )}

            {/* ── QUIZ OVERLAY ── */}
            {gateState === 'quiz' && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95 flex flex-col z-20 overflow-y-auto">
                    <div className="flex-1 p-6 space-y-5">
                        {/* Header */}
                        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <HelpCircle size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm">Knowledge Check</p>
                                <p className="text-gray-400 text-xs">
                                    At {gateMinute} min · Answer to continue
                                </p>
                            </div>
                        </div>

                        {/* Questions */}
                        {questions.map((q, qIdx) => (
                            <div key={q.id} className="space-y-2">
                                <p className="text-white text-sm font-semibold leading-snug">
                                    <span className="text-purple-400 font-black mr-1">{qIdx + 1}.</span>
                                    {q.question}
                                </p>
                                <div className="space-y-1.5">
                                    {q.options.map((opt, oIdx) => {
                                        const selected = answers[qIdx] === oIdx;
                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                                className={cn(
                                                    'w-full text-left text-xs font-medium px-4 py-2.5 rounded-xl border transition-all',
                                                    selected
                                                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                                                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                                )}
                                            >
                                                <span className={cn(
                                                    'inline-flex w-5 h-5 rounded-full border-2 items-center justify-center mr-2 shrink-0 align-middle',
                                                    selected ? 'border-white bg-white/20' : 'border-gray-500'
                                                )}>
                                                    {selected && <span className="w-2 h-2 rounded-full bg-white inline-block" />}
                                                </span>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={handleSubmit}
                            disabled={!allAnswered}
                            className={cn(
                                'w-full py-3 rounded-xl font-black text-sm transition-all',
                                allAnswered
                                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/30'
                                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                            )}
                        >
                            Submit Answers
                        </button>
                        {!allAnswered && (
                            <p className="text-center text-gray-500 text-xs mt-1">Answer all questions to submit</p>
                        )}
                    </div>
                </div>
            )}

            {/* ── PASS OVERLAY ── */}
            {gateState === 'pass' && score && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/95 to-emerald-900/95 flex flex-col items-center justify-center gap-5 z-20 p-8">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
                        <CheckCircle2 size={48} className="text-green-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-black text-2xl mb-1">Great job! 🎉</p>
                        <p className="text-green-300 text-sm">
                            You scored <span className="font-black text-white">{score.got}/{score.total}</span>
                        </p>
                        <p className="text-gray-400 text-xs mt-1">The video will continue from where you left off</p>
                    </div>
                    <button
                        onClick={handleContinue}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg shadow-green-500/30"
                    >
                        <PlayCircle size={18} />
                        Continue Watching
                    </button>
                </div>
            )}

            {/* ── FAIL OVERLAY ── */}
            {gateState === 'fail' && score && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/95 to-rose-900/95 flex flex-col items-center justify-center gap-5 z-20 p-8">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                        <XCircle size={48} className="text-red-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-black text-2xl mb-1">Keep Learning! 📚</p>
                        <p className="text-red-300 text-sm">
                            You scored <span className="font-black text-white">{score.got}/{score.total}</span>
                        </p>
                        <p className="text-gray-300 text-sm mt-2 max-w-xs">
                            Don't worry — the video will restart so you can review the material and try again.
                        </p>
                    </div>
                    <button
                        onClick={handleRestart}
                        className="flex items-center gap-2 bg-white hover:bg-gray-100 text-red-700 font-black px-8 py-3 rounded-xl transition-all shadow-lg"
                    >
                        <RefreshCw size={18} />
                        Restart &amp; Review
                    </button>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────

interface CourseRendererProps {
    data: {
        elements: EditorElement[];
    };
    topicId: string;
}

export const CourseRenderer: React.FC<CourseRendererProps> = ({ data, topicId }) => {
    const [containerWidth, setContainerWidth] = useState(800);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Calculate total height needed for elements
    const totalContentHeight = Math.max(
        ...data.elements.map(el => {
            const elHeight = parseInt(el.style.height as string) || 100;
            return el.position.y + elHeight;
        }),
        800
    ) + 100;

    const scale = Math.min(containerWidth / 800, 1);

    // Build course text context for AI quiz generation
    const courseContext = data.elements
        .filter(el => el.type === 'text' || el.type === 'hero' || el.type === 'list')
        .map(el => {
            if (el.type === 'text') return (el.content || '').replace(/<[^>]*>/g, '');
            if (el.type === 'hero') return (el.content || '');
            if (el.type === 'list') return 'Key points: ' + (el.content || '');
            return '';
        })
        .filter(t => t.length > 0)
        .join('\n\n');

    return (
        <div className="w-full bg-slate-50 min-h-screen p-4 md:p-8 flex justify-center">
            <div
                ref={containerRef}
                className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl relative overflow-hidden"
                style={{ height: `${totalContentHeight * scale}px`, minHeight: '500px' }}
            >
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        width: '800px', // Base width for coordinates
                        height: `${totalContentHeight}px`,
                        position: 'absolute'
                    }}
                >
                    {data.elements.sort((a, b) => a.zIndex - b.zIndex).map((el) => (
                        <RenderElement key={el.id} element={el} topicId={topicId} courseContext={courseContext} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const RenderElement: React.FC<{ element: EditorElement; topicId: string; courseContext: string }> = ({ element, topicId, courseContext }) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        zIndex: element.zIndex,
        ...element.style,
    };

    switch (element.type) {
        case 'text':
            return <div style={style} dangerouslySetInnerHTML={{ __html: element.content || '' }} />;
        case 'image':
            return <img src={element.content} style={style} alt="" className="object-cover rounded-lg" />;
        case 'video': {
            const src = element.content || '';
            const embedUrl = getVideoEmbedUrl(src);


            // YouTube/Vimeo: can't control with JS, show as iframe (no gate)
            if (embedUrl) {
                return (
                    <div style={style} className="bg-black rounded-xl overflow-hidden shadow-lg">
                        <iframe
                            key={embedUrl}
                            src={embedUrl}
                            className="w-full h-full"
                            style={{ border: 'none', minHeight: '100%' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                );
            }

            // Direct file: use VideoGatePlayer with AI quiz gates
            if (src) {
                return (
                    <VideoGatePlayer
                        key={src}
                        src={src}
                        courseContext={courseContext}
                        style={style}
                    />
                );
            }

            return (
                <div style={style} className="bg-black rounded-xl overflow-hidden shadow-lg flex items-center justify-center text-gray-500 text-sm">
                    No video URL set
                </div>
            );
        }
        case 'quiz':
            return <QuizComponent element={element} style={style} />;
        case 'resource':
            return <ResourceComponent element={element} style={style} />;
        case 'comment':
            return <CommentComponent element={element} style={style} topicId={topicId} />;
        case 'hero':
            return <HeroComponent element={element} style={style} />;
        case 'list':
            return (
                <ul style={style} className="list-disc pl-5 space-y-1">
                    {(element.content?.split(',') || []).map((item, i) => (
                        <li key={i}>{item.trim()}</li>
                    ))}
                </ul>
            );
        default:
            return <div style={style}>Unknown Component: {element.type}</div>;
    }
};

const HeroComponent: React.FC<{ element: EditorElement; style: React.CSSProperties }> = ({ element, style }) => {
    const parts = (element.content || '').split('\n');
    const isGradient = ((element.style as any).backgroundType || 'gradient') === 'gradient';
    const bg = isGradient
        ? `linear-gradient(to bottom right, ${(element.style as any).gradientStart || '#059669'}, ${(element.style as any).gradientEnd || '#047857'})`
        : ((element.style as any).backgroundColor || '#059669');

    return (
        <div style={{ ...style, background: bg }} className="text-center w-full h-full flex flex-col justify-center p-8 text-white rounded-3xl shadow-xl overflow-hidden">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 drop-shadow-md">
                {parts[0] || 'Hero Title'}
            </h1>
            <p className="text-lg opacity-90 font-medium max-w-2xl mx-auto">
                {parts[1] || 'Subtext goes here'}
            </p>
        </div>
    );
};

const QuizComponent: React.FC<{ element: EditorElement; style: React.CSSProperties }> = ({ element, style }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);
    const questions = element.metadata?.questions || [];

    const handleOptionSelect = (qIdx: number, oIdx: number) => {
        if (showResults) return;
        setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q: any, i: number) => {
            if (selectedAnswers[i] === q.correct) score++;
        });
        return score;
    };

    return (
        <div style={style} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                <HelpCircle size={20} /> Quiz Block
            </h3>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {questions.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="space-y-3">
                        <p className="font-medium text-gray-800">{q.question}</p>
                        <div className="space-y-2">
                            {q.options.map((opt: string, oIdx: number) => {
                                const isSelected = selectedAnswers[qIdx] === oIdx;
                                const isCorrect = q.correct === oIdx;
                                return (
                                    <button
                                        key={oIdx}
                                        onClick={() => handleOptionSelect(qIdx, oIdx)}
                                        className={cn(
                                            "w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3",
                                            isSelected ? "border-primary bg-primary-surface" : "border-gray-100 hover:border-primary-light",
                                            showResults && isCorrect && "border-green-500 bg-green-50",
                                            showResults && isSelected && !isCorrect && "border-red-500 bg-red-50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                            isSelected ? "border-primary" : "border-gray-300"
                                        )}>
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                        <span className="flex-1">{opt}</span>
                                        {showResults && isCorrect && <span className="text-green-600 font-bold">✓</span>}
                                        {showResults && isSelected && !isCorrect && <span className="text-red-600 font-bold">✗</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            {!showResults ? (
                <button
                    onClick={() => setShowResults(true)}
                    className="w-full mt-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                    Check Results
                </button>
            ) : (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
                    <p className="font-bold text-gray-700 text-lg">
                        Your Score: <span className="text-primary">{calculateScore()} / {questions.length}</span>
                    </p>
                    <button onClick={() => { setShowResults(false); setSelectedAnswers({}); }} className="mt-2 text-sm text-primary hover:underline font-bold">Retry Quiz</button>
                </div>
            )}
        </div>
    );
};

const ResourceComponent: React.FC<{ element: EditorElement; style: React.CSSProperties }> = ({ element, style }) => {
    const metadata = element.metadata || {};
    const icon = metadata.iconType === 'video' ? <Video /> : metadata.iconType === 'link' ? <ArrowRight /> : <FileText />;

    return (
        <a
            href={metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            style={style}
            className="flex items-center gap-4 px-6 py-4 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
        >
            <div className="w-12 h-12 bg-primary-surface text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                {icon}
            </div>
            <div className="text-left">
                <p className="font-bold text-gray-800">{metadata.label || 'View Resource'}</p>
                <p className="text-[10px] text-gray-400 font-mono italic">{metadata.fileName}</p>
            </div>
        </a>
    );
};

const CommentComponent: React.FC<{ element: EditorElement; style: React.CSSProperties; topicId: string }> = ({ topicId, style }) => {
    const [comments, setComments] = useState<{ user: string, text: string, date: string }[]>([]);
    const [newComment, setNewComment] = useState('');

    const handlePost = () => {
        if (!newComment.trim()) return;
        console.log(`[API PLACEHOLDER] POST /comments - Topic: ${topicId}`, { text: newComment });

        const comment = {
            user: "Guest Student",
            text: newComment,
            date: "Just now"
        };
        setComments([...comments, comment]);
        setNewComment('');
    };

    return (
        <div style={style} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">Comments</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-2">
                {comments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No comments yet. Start the discussion!</p>
                ) : (
                    comments.map((c, i) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black uppercase text-primary">{c.user}</span>
                                <span className="text-[10px] text-gray-400">{c.date}</span>
                            </div>
                            <p className="text-sm text-gray-700">{c.text}</p>
                        </div>
                    ))
                )}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handlePost()}
                />
                <button
                    onClick={handlePost}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                    Post
                </button>
            </div>
        </div>
    );
};
