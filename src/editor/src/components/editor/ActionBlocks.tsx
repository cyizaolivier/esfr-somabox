import React, { useState } from 'react';
import { HelpCircle, Layers, FileText, MessageSquare, Plus, Trash2, ArrowRight, Video } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ActionBlockProps {
    element: any;
    onUpdate: (metadata: any) => void;
}

export const QuizBlock: React.FC<ActionBlockProps> = ({ element, onUpdate }) => {
    const metadata = element.metadata || { questions: [{ id: '1', question: 'New Question', options: ['Option 1', 'Option 2'], correct: 0 }] };

    const updateQuestion = (qIdx: number, updates: any) => {
        const newQuestions = [...metadata.questions];
        newQuestions[qIdx] = { ...newQuestions[qIdx], ...updates };
        onUpdate({ questions: newQuestions });
    };

    const addOption = (qIdx: number) => {
        const newQuestions = [...metadata.questions];
        newQuestions[qIdx].options.push(`New Option ${newQuestions[qIdx].options.length + 1}`);
        onUpdate({ questions: newQuestions });
    };

    const removeOption = (qIdx: number, oIdx: number) => {
        const newQuestions = [...metadata.questions];
        newQuestions[qIdx].options = newQuestions[qIdx].options.filter((_: any, i: number) => i !== oIdx);
        if (newQuestions[qIdx].correct >= newQuestions[qIdx].options.length) {
            newQuestions[qIdx].correct = 0;
        }
        onUpdate({ questions: newQuestions });
    };

    const updateOption = (qIdx: number, oIdx: number, val: string) => {
        const newQuestions = [...metadata.questions];
        newQuestions[qIdx].options[oIdx] = val;
        onUpdate({ questions: newQuestions });
    };

    const addQuestion = () => {
        const newQuestions = [...metadata.questions, { id: Date.now().toString(), question: 'New Question', options: ['Option 1', 'Option 2'], correct: 0 }];
        onUpdate({ questions: newQuestions });
    };

    const removeQuestion = (qIdx: number) => {
        const newQuestions = metadata.questions.filter((_: any, i: number) => i !== qIdx);
        onUpdate({ questions: newQuestions });
    };

    return (
        <div className="w-full bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-4 select-text">
            <div className="flex items-center gap-2 text-primary font-bold border-b pb-2 sticky top-0 bg-white z-10">
                <HelpCircle size={18} />
                <span>Quiz Editor</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px] custom-scrollbar">
                {metadata.questions.map((q: any, qIdx: number) => (
                    <div key={q.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4 relative group/q">
                        <button
                            onClick={() => removeQuestion(qIdx)}
                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/q:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Question</label>
                            <input
                                type="text"
                                value={q.question}
                                onPointerDown={(e) => e.stopPropagation()}
                                onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Options</label>
                            {q.options.map((opt: string, oIdx: number) => (
                                <div key={oIdx} className="flex items-center gap-2 group/opt">
                                    <button
                                        onClick={() => updateQuestion(qIdx, { correct: oIdx })}
                                        className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                            q.correct === oIdx ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-primary-light"
                                        )}
                                    >
                                        {q.correct === oIdx && <ArrowRight size={12} />}
                                    </button>
                                    <input
                                        type="text"
                                        value={opt}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                        className={cn(
                                            "flex-1 bg-white border rounded-lg p-2 text-xs outline-none transition-all",
                                            q.correct === oIdx ? "border-green-200 ring-1 ring-green-100" : "border-gray-200 focus:border-primary-light"
                                        )}
                                    />
                                    <button
                                        onClick={() => removeOption(qIdx, oIdx)}
                                        className="text-gray-300 hover:text-red-400 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => addOption(qIdx)}
                            className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1 mt-1"
                        >
                            <Plus size={10} /> Add Option
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 text-sm font-bold mt-2"
            >
                <Plus size={16} /> Add New Question
            </button>
        </div>
    );
};

export const FlashcardBlock: React.FC<ActionBlockProps> = ({ element }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const metadata = element.metadata || { front: 'Question/Term', back: 'Answer/Definition' };

    return (
        <div
            className="w-full h-full perspective-1000 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={cn(
                "relative w-full h-full transition-all duration-500 preserve-3d shadow-xl rounded-xl",
                isFlipped ? "rotate-y-180" : ""
            )}>
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl flex flex-col items-center justify-center p-6 text-center">
                    <Layers size={32} className="mb-4 opacity-50" />
                    <h3 className="text-xl font-bold">{metadata.front}</h3>
                    <p className="text-xs mt-4 opacity-70 uppercase tracking-widest font-bold">Click to Flip</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden bg-white border-2 border-primary rounded-xl flex flex-col items-center justify-center p-6 text-center rotate-y-180">
                    <p className="text-primary text-lg font-medium">{metadata.back}</p>
                    <p className="text-xs mt-4 text-gray-400 uppercase tracking-widest font-bold">Click to Flip</p>
                </div>
            </div>
        </div>
    );
};

export const ResourceButton: React.FC<ActionBlockProps> = ({ element }) => {
    const metadata = element.metadata || { label: 'Download Resource', fileName: 'guide.pdf', url: '#', iconType: 'pdf' };

    const renderIcon = () => {
        switch (metadata.iconType) {
            case 'link': return <ArrowRight size={24} />;
            case 'video': return <Video size={24} />;
            default: return <FileText size={24} />;
        }
    };

    const getIconColor = () => {
        switch (metadata.iconType) {
            case 'link': return 'bg-primary-surface text-primary hover:bg-primary';
            case 'video': return 'bg-purple-50 text-purple-500 hover:bg-purple-500';
            default: return 'bg-red-50 text-red-500 hover:bg-red-500';
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            <a
                href={metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-4 px-6 py-4 bg-white border border-gray-200 shadow-xl rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all group w-full max-w-sm"
            >
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center group-hover:text-white transition-colors",
                    getIconColor()
                )}>
                    {renderIcon()}
                </div>
                <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-800 truncate">{metadata.label}</p>
                    <p className="text-[10px] text-gray-400 font-mono truncate">{metadata.fileName}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-surface group-hover:text-primary transition-colors">
                    <ArrowRight size={16} />
                </div>
            </a>
        </div>
    );
};

export const CommentSection: React.FC<ActionBlockProps> = ({ element, onUpdate }) => {
    const metadata = element.metadata || { title: 'Discussion', comments: [] };
    const [newComment, setNewComment] = useState('');

    const addComment = () => {
        if (!newComment.trim()) return;
        const comment = {
            id: Date.now().toString(),
            user: 'You (Preview)',
            text: newComment,
            date: new Date().toLocaleDateString()
        };
        onUpdate({ ...metadata, comments: [...(metadata.comments || []), comment] });
        setNewComment('');
    };

    return (
        <div className="w-full h-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex flex-col gap-4 shadow-inner select-text max-h-[600px]">
            <div className="flex items-center justify-between text-amber-600 font-black text-xs uppercase tracking-widest border-b border-amber-200/50 pb-2">
                <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>{metadata.title || 'Discussion Area'}</span>
                </div>
                <span className="bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">{(metadata.comments || []).length} Comments</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-1 scrollbar-hide">
                {(metadata.comments || []).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-amber-300 italic text-xs text-center p-8">
                        <MessageSquare size={32} className="mb-2 opacity-20" />
                        <p>No comments yet. Start the conversation!</p>
                    </div>
                ) : (
                    metadata.comments.map((c: any) => (
                        <div key={c.id} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-amber-100 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-[10px] text-amber-800">{c.user}</span>
                                <span className="text-[8px] text-amber-400 font-mono">{c.date}</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">{c.text}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="flex gap-2 bg-white p-1 rounded-xl shadow-md border border-amber-100">
                <input
                    type="text"
                    value={newComment}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type a comment..."
                    className="flex-1 bg-transparent text-xs p-2 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addComment()}
                />
                <button
                    onClick={addComment}
                    className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
};
