import React, { useState } from 'react';
import { useEditor } from '../../state/EditorContext';
import { X, Sparkles, Plus, Trash2, Clock, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { mockGenerateQuiz, generateRealQuiz } from '../../lib/aiService';

export const PropertiesPanel: React.FC = () => {

    const { state, dispatch } = useEditor();
    const [isGenerating, setIsGenerating] = useState(false);
    const selectedElement = state.elements.find(el => el.id === state.selectedElementId);

    if (!selectedElement) {
        return (
            <div className="w-80 bg-gray-100 p-4 border-l border-gray-200 h-full overflow-y-auto">
                <div className="text-center text-gray-500 mt-10">
                    <p>Select an element to edit properties</p>
                </div>
            </div>
        );
    }

    const handleStyleChange = (property: string, value: any) => {
        dispatch({
            type: 'UPDATE_ELEMENT',
            payload: {
                id: selectedElement.id,
                style: { ...selectedElement.style, [property]: value },
            },
        });
    };

    const handleContentChange = (value: string) => {
        dispatch({
            type: 'UPDATE_ELEMENT',
            payload: {
                id: selectedElement.id,
                style: selectedElement.style,
                content: value,
            },
        });
    }

    const handleDelete = () => {
        dispatch({ type: 'DELETE_ELEMENT', payload: selectedElement.id });
    }

    return (
        <div className="w-80 bg-white p-4 border-l border-gray-200 h-full overflow-y-auto shadow-xl z-20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Properties</h2>
                <button onClick={() => dispatch({ type: 'SELECT_ELEMENT', payload: null })} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                </button>
            </div>

            <div className="space-y-6">

                {/* Content Editor */}
                {(selectedElement.type === 'text' || selectedElement.type === 'image' || selectedElement.type === 'video') && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600">Content</label>
                        {selectedElement.type === 'text' ? (
                            <textarea
                                className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                rows={3}
                                value={selectedElement.content || ''}
                                onChange={(e) => handleContentChange(e.target.value)}
                            />
                        ) : (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={selectedElement.content || ''}
                                    onChange={(e) => handleContentChange(e.target.value)}
                                    placeholder={`Enter ${selectedElement.type} URL or path`}
                                />
                                <div className="flex items-center gap-2">
                                    <label className="flex-1 cursor-pointer bg-primary-surface hover:bg-primary-surface/80 text-primary text-[10px] font-bold py-2 px-3 rounded text-center transition-colors border border-primary/10">
                                        Upload Local File
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept={selectedElement.type === 'image' ? "image/*" : "video/*"}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // In a real app we'd upload here. 
                                                    // For this demo, we'll use the filename as if it was in /public/uploads/
                                                    handleContentChange(`/uploads/${file.name}`);
                                                    alert(`File "${file.name}" would be uploaded to /public/uploads/ in a production environment.`);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">Spacing</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-xs text-gray-400 block mb-1">Padding</span>
                            <input
                                type="text"
                                className="w-full text-sm border border-gray-300 rounded p-2"
                                value={selectedElement.style.padding || ''}
                                onChange={(e) => handleStyleChange('padding', e.target.value)}
                                placeholder="0px"
                            />
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block mb-1">Margin</span>
                            <input
                                type="text"
                                className="w-full text-sm border border-gray-300 rounded p-2"
                                value={selectedElement.style.margin || ''}
                                onChange={(e) => handleStyleChange('margin', e.target.value)}
                                placeholder="0px"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">Typography</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-xs text-gray-400 block mb-1">Font Size</span>
                            <input
                                type="text"
                                className="w-full text-sm border border-gray-300 rounded p-2"
                                value={selectedElement.style.fontSize || ''}
                                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                                placeholder="16px"
                            />
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block mb-1">Color</span>
                            <input
                                type="color"
                                className="w-full h-9 border border-gray-300 rounded p-1 cursor-pointer"
                                value={(selectedElement.style.color as string) || '#000000'}
                                onChange={(e) => handleStyleChange('color', e.target.value)}
                            />
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block mb-1">Align</span>
                            <select
                                className="w-full text-sm border border-gray-300 rounded p-2"
                                value={selectedElement.style.textAlign || 'left'}
                                onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block mb-1">Font Weight</span>
                            <select
                                className="w-full text-sm border border-gray-300 rounded p-2"
                                value={selectedElement.style.fontWeight || 'normal'}
                                onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                            >
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Hero specialized background settings */}
                {selectedElement.type === 'hero' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <label className="text-xs font-semibold text-gray-600 block border-b pb-2 mb-2">Background Style</label>

                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => handleStyleChange('backgroundType', 'solid')}
                                className={cn(
                                    "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all",
                                    ((selectedElement.style as any).backgroundType || 'gradient') === 'solid'
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-white border border-gray-200 text-gray-400 hover:border-primary/50"
                                )}
                            >
                                Solid
                            </button>
                            <button
                                onClick={() => handleStyleChange('backgroundType', 'gradient')}
                                className={cn(
                                    "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all",
                                    ((selectedElement.style as any).backgroundType || 'gradient') === 'gradient'
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-white border border-gray-200 text-gray-400 hover:border-primary/50"
                                )}
                            >
                                Gradient
                            </button>
                        </div>

                        {((selectedElement.style as any).backgroundType || 'gradient') === 'solid' ? (
                            <div className="space-y-1">
                                <span className="text-[10px] text-gray-400 block uppercase font-bold">Fill Color</span>
                                <input
                                    type="color"
                                    className="w-full h-10 border border-gray-200 rounded-lg p-1 cursor-pointer"
                                    value={((selectedElement.style as any).backgroundColor as string) || '#059669'}
                                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Start Color</span>
                                    <input
                                        type="color"
                                        className="w-full h-10 border border-gray-200 rounded-lg p-1 cursor-pointer"
                                        value={((selectedElement.style as any).gradientStart as string) || '#059669'}
                                        onChange={(e) => handleStyleChange('gradientStart', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 block uppercase font-bold">End Color</span>
                                    <input
                                        type="color"
                                        className="w-full h-10 border border-gray-200 rounded-lg p-1 cursor-pointer"
                                        value={((selectedElement.style as any).gradientEnd as string) || '#047857'}
                                        onChange={(e) => handleStyleChange('gradientEnd', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Quiz specialized settings */}
                {selectedElement.type === 'quiz' && (
                    <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="flex items-center justify-between border-b border-purple-100 pb-2 mb-2">
                            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase">
                                <Sparkles size={14} />
                                <span>AI Generator</span>
                            </div>
                            <button
                                onClick={() => {
                                    const content = state.elements
                                        .filter(el => el.id !== selectedElement.id)
                                        .map(el => {
                                            if (el.type === 'text') return (el.content || '').replace(/<[^>]*>?/gm, '');
                                            if (el.type === 'hero') return (el.content || '').replace('\n', ': ');
                                            if (el.type === 'list') return "List items: " + el.content;
                                            return "";
                                        })
                                        .filter(t => t.length > 0)
                                        .join("\n\n");

                                    const textarea = document.getElementById('ai-prompt') as HTMLTextAreaElement;
                                    if (textarea) textarea.value = content;
                                }}
                                className="text-[10px] font-black text-purple-600 hover:text-purple-800 underline"
                            >
                                Scrape from Canvas
                            </button>
                        </div>
                        <p className="text-[10px] text-purple-600">Paste content below or scrape from canvas to generate quiz questions using AI.</p>
                        <textarea
                            id="ai-prompt"
                            className="w-full text-sm border border-purple-200 rounded-lg p-2 h-32 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
                            placeholder="Paste a paragraph here..."
                        />
                        <button
                            disabled={isGenerating}
                            onClick={async () => {
                                const prompt = (document.getElementById('ai-prompt') as HTMLTextAreaElement).value;
                                if (!prompt) return alert('Please provide some text first!');

                                setIsGenerating(true);
                                try {
                                    const result = await generateRealQuiz(prompt);
                                    dispatch({
                                        type: 'UPDATE_ELEMENT',
                                        payload: { id: selectedElement.id, metadata: result }
                                    });
                                } catch (e) {
                                    console.error("AI Generation Error", e);
                                    alert('Failed to generate real quiz. Falling back to mock.');
                                    // Fallback to mock for testing if real fails
                                    const mockResult = await mockGenerateQuiz(prompt);
                                    dispatch({
                                        type: 'UPDATE_ELEMENT',
                                        payload: { id: selectedElement.id, metadata: mockResult }
                                    });
                                } finally {
                                    setIsGenerating(false);
                                }
                            }}
                            className={cn(
                                "w-full py-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg",
                                isGenerating
                                    ? "bg-purple-400 cursor-not-allowed text-white"
                                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/20"
                            )}
                        >
                            {isGenerating ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Sparkles size={16} />
                            )}
                            {isGenerating ? 'Generating...' : 'Generate with Real AI'}
                        </button>

                        <div className="flex flex-col gap-1 opacity-50">
                            <button
                                onClick={async () => {
                                    const prompt = (document.getElementById('ai-prompt') as HTMLTextAreaElement).value;
                                    const result = await mockGenerateQuiz(prompt || "Default content");
                                    dispatch({
                                        type: 'UPDATE_ELEMENT',
                                        payload: { id: selectedElement.id, metadata: result }
                                    });
                                }}
                                className="text-[10px] text-center text-purple-400 hover:underline"
                            >
                                Use Mock Generator (Testing)
                            </button>
                        </div>
                    </div>
                )}

                {/* Resource specialized settings */}
                {selectedElement.type === 'resource' && (
                    <div className="bg-white border-2 border-orange-100 rounded-2xl p-4 shadow-sm space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-widest pb-2 border-b border-orange-50">
                            <FileText size={14} />
                            <span>Resource Settings</span>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Button Label</label>
                                <input
                                    type="text"
                                    value={selectedElement.metadata?.label || ''}
                                    onChange={(e) => dispatch({
                                        type: 'UPDATE_ELEMENT',
                                        payload: { id: selectedElement.id, metadata: { ...selectedElement.metadata, label: e.target.value } }
                                    })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">File/Link URL</label>
                                <input
                                    type="text"
                                    value={selectedElement.metadata?.url || ''}
                                    onChange={(e) => dispatch({
                                        type: 'UPDATE_ELEMENT',
                                        payload: { id: selectedElement.id, metadata: { ...selectedElement.metadata, url: e.target.value } }
                                    })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Display Filename</label>
                                <input
                                    type="text"
                                    value={selectedElement.metadata?.fileName || ''}
                                    onChange={(e) => dispatch({
                                        type: 'UPDATE_ELEMENT',
                                        payload: { id: selectedElement.id, metadata: { ...selectedElement.metadata, fileName: e.target.value } }
                                    })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Icon Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['pdf', 'link', 'video'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => dispatch({
                                                type: 'UPDATE_ELEMENT',
                                                payload: { id: selectedElement.id, metadata: { ...selectedElement.metadata, iconType: type } }
                                            })}
                                            className={cn(
                                                "py-2 px-1 rounded-xl border text-[10px] font-bold uppercase transition-all",
                                                (selectedElement.metadata?.iconType || 'pdf') === type
                                                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                                                    : "bg-white border-gray-200 text-gray-400 hover:border-orange-300"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Comment specialized settings */}
                {selectedElement.type === 'comment' && (
                    <div className="space-y-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase">
                            <MessageSquare size={14} />
                            <span>Discussion Settings</span>
                        </div>
                        <div>
                            <label className="text-[10px] text-amber-400 font-bold uppercase block mb-1">Section Title</label>
                            <input
                                type="text"
                                className="w-full text-sm border border-amber-200 rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-amber-500"
                                value={selectedElement.metadata?.title || 'Discussion'}
                                onChange={(e) => dispatch({
                                    type: 'UPDATE_ELEMENT',
                                    payload: { id: selectedElement.id, metadata: { ...selectedElement.metadata, title: e.target.value } }
                                })}
                            />
                        </div>
                    </div>
                )}

                {/* List specialized settings */}
                {selectedElement.type === 'list' && (
                    <div className="space-y-4 p-4 bg-primary-surface/30 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                            <Plus size={14} />
                            <span>List Content</span>
                        </div>
                        <p className="text-[10px] text-primary/60 mb-2">Each item should be separated by a comma.</p>
                        <textarea
                            className="w-full text-sm border border-gray-200 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-primary h-32"
                            value={selectedElement.content || ''}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Item 1, Item 2, Item 3..."
                        />
                    </div>
                )}



                <div className="pt-6 border-t border-gray-200">
                    <button
                        onClick={handleDelete}
                        className="w-full py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium transition-colors"
                    >
                        Delete Element
                    </button>
                </div>
            </div>
        </div>
    );
};
