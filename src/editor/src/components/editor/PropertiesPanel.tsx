import React from 'react';
import { useEditor } from '../../state/EditorContext';
import { X, Sparkles, Plus, Trash2, Clock, FileText, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { mockGenerateQuiz } from '../../lib/aiService';

export const PropertiesPanel: React.FC = () => {

    const { state, dispatch } = useEditor();
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

                {/* Quiz specialized settings */}
                {selectedElement.type === 'quiz' && (
                    <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase">
                            <Sparkles size={14} />
                            <span>AI Generator</span>
                        </div>
                        <p className="text-[10px] text-purple-600">Paste content below to generate quiz questions using AI.</p>
                        <textarea
                            id="ai-prompt"
                            className="w-full text-sm border border-purple-200 rounded-lg p-2 h-24 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                            placeholder="Paste a paragraph here..."
                        />
                        <button
                            onClick={async () => {
                                const prompt = (document.getElementById('ai-prompt') as HTMLTextAreaElement).value;
                                if (!prompt) return alert('Please paste some text first!');
                                try {
                                    const result = await mockGenerateQuiz(prompt);
                                    dispatch({
                                        type: 'UPDATE_ELEMENT',
                                        payload: { id: selectedElement.id, metadata: result }
                                    });
                                } catch (e) {
                                    alert('Failed to generate quiz');
                                }
                            }}
                            className="w-full py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Sparkles size={14} /> Generate with AI
                        </button>
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

                {/* Video specialized settings */}
                {selectedElement.type === 'video' && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase">
                            <Clock size={14} />
                            <span>Video Markers</span>
                        </div>
                        <div className="space-y-2">
                            {(selectedElement.metadata?.markers || []).map((m: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200 text-xs text-slate-600">
                                    <Clock size={12} className="text-slate-400" />
                                    <span className="font-mono">{m.time}s</span>
                                    <span className="flex-1 truncate">{m.label}</span>
                                    <button
                                        onClick={() => {
                                            const newMarkers = selectedElement.metadata.markers.filter((_: any, idx: number) => idx !== i);
                                            dispatch({ type: 'UPDATE_ELEMENT', payload: { id: selectedElement.id, metadata: { ...selectedElement.metadata, markers: newMarkers } } });
                                        }}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input id="new-marker-time" type="text" placeholder="1:20" className="w-16 text-xs border rounded p-1" />
                            <button
                                onClick={() => {
                                    const timeStr = (document.getElementById('new-marker-time') as HTMLInputElement).value;
                                    const match = timeStr.match(/(\d+):(\d+)/);
                                    const seconds = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : parseInt(timeStr);
                                    if (isNaN(seconds)) return alert('Invalid time format');

                                    const newMarkers = [...(selectedElement.metadata?.markers || []), { time: seconds, label: 'Pause + Quiz' }];
                                    dispatch({ type: 'UPDATE_ELEMENT', payload: { id: selectedElement.id, metadata: { ...selectedElement.metadata, markers: newMarkers } } });
                                }}
                                className="flex-1 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded hover:bg-slate-900 transition-colors"
                            >
                                Add Marker
                            </button>
                        </div>
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
