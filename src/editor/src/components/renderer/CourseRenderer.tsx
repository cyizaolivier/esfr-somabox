import React, { useState } from 'react';
import type { EditorElement } from '../../state/types';
import { cn } from '../../lib/utils';
import { FileText, ArrowRight, Video, HelpCircle } from 'lucide-react';

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
                        <RenderElement key={el.id} element={el} topicId={topicId} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const RenderElement: React.FC<{ element: EditorElement; topicId: string }> = ({ element, topicId }) => {
    // Basic scaling logic: if we assume editor was ~800px and we want to be responsive,
    // we can use absolute positioning with transform or calc.
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        zIndex: element.zIndex,
        ...element.style,
        // Ensure no drag handles appear in renderer
    };

    switch (element.type) {
        case 'text':
            return <div style={style} dangerouslySetInnerHTML={{ __html: element.content || '' }} />;
        case 'image':
            return <img src={element.content} style={style} alt="" className="object-cover rounded-lg" />;
        case 'video':
            return (
                <div style={style} className="bg-black rounded-xl overflow-hidden shadow-lg">
                    <video src={element.content} controls className="w-full h-full" />
                </div>
            );
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
