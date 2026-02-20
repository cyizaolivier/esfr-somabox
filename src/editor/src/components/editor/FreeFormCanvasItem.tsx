import React from 'react';
import { Rnd } from 'react-rnd';
import { GripVertical, Trash2 } from 'lucide-react';
import { useEditor } from '../../state/EditorContext';
import type { EditorElement } from '../../state/types';
import { QuizBlock, FlashcardBlock, ResourceButton, CommentSection } from './ActionBlocks';
import { cn } from '../../lib/utils';

interface FreeFormCanvasItemProps {
    element: EditorElement;
}

export const FreeFormCanvasItem: React.FC<FreeFormCanvasItemProps> = ({ element }) => {
    const { state, dispatch } = useEditor();
    const isSelected = state.selectedElementId === element.id;
    const contentRef = React.useRef<HTMLDivElement>(null);

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'SELECT_ELEMENT', payload: element.id });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'DELETE_ELEMENT', payload: element.id });
    };

    const handleContentUpdate = (newContent: string) => {
        dispatch({
            type: 'UPDATE_ELEMENT',
            payload: {
                id: element.id,
                content: newContent,
            },
        });
    };

    // Auto-sync height for complex components
    React.useEffect(() => {
        if (!contentRef.current || (element.type !== 'quiz' && element.type !== 'comment')) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const newHeight = `${Math.min(600, Math.ceil(entry.contentRect.height) + 40)}px`; // padding buffer + cap
                if (element.style.height !== newHeight) {
                    dispatch({
                        type: 'UPDATE_ELEMENT',
                        payload: {
                            id: element.id,
                            style: { ...element.style, height: newHeight }
                        },
                    });
                }
            }
        });

        observer.observe(contentRef.current);
        return () => observer.disconnect();
    }, [element.id, element.type, element.style.height, dispatch]);

    const renderContent = () => {
        switch (element.type) {
            case 'text':
                return (
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleContentUpdate(e.currentTarget.textContent || '')}
                        className="outline-none focus:ring-1 focus:ring-primary-light rounded px-1 w-full h-full min-h-[1.5em]"
                    >
                        {element.content || 'Text Element'}
                    </div>
                );
            case 'hero': {
                const parts = (element.content || '').split('\n');
                return (
                    <div className="text-center w-full h-full flex flex-col justify-center">
                        <h1
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                                const newParts = [...parts];
                                newParts[0] = e.currentTarget.textContent || '';
                                handleContentUpdate(newParts.join('\n'));
                            }}
                            className="text-4xl font-extrabold mb-2 outline-none"
                        >
                            {parts[0] || 'Hero Title'}
                        </h1>
                        <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                                const newParts = [...parts];
                                newParts[1] = e.currentTarget.textContent || '';
                                handleContentUpdate(newParts.join('\n'));
                            }}
                            className="text-xl text-gray-500 outline-none"
                        >
                            {parts[1] || 'Subtext goes here'}
                        </p>
                    </div>
                );
            }
            case 'image':
                return (
                    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {element.content ? (
                            <img src={element.content} alt="Content" className="w-full h-full object-cover pointer-events-none" />
                        ) : (
                            <span className="text-gray-400 p-2 text-center italic text-xs">Image Placeholder</span>
                        )}
                    </div>
                );
            case 'video':
                return (
                    <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center text-white overflow-hidden pointer-events-none relative">
                        {element.content ? (
                            <div className="p-4 text-center">
                                <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest font-bold">Video Clip</p>
                                <p className="font-mono text-xs truncate max-w-full">{element.content}</p>
                            </div>
                        ) : (
                            <span className="italic text-gray-500 text-xs">Video Placeholder</span>
                        )}
                    </div>
                );
            case 'comment':
                return <CommentSection element={element} onUpdate={(meta: any) => dispatch({ type: 'UPDATE_ELEMENT', payload: { id: element.id, metadata: meta } })} />;
            case 'list': {
                const items = (element.content || '').split(',').filter(i => i.trim());
                return (
                    <div className="w-full h-full p-2">
                        <ul className="list-disc list-inside space-y-2">
                            {items.length === 0 ? (
                                <li className="text-gray-400 italic">No items (use comma to separate)</li>
                            ) : (
                                items.map((item: string, idx: number) => (
                                    <li key={idx} className="text-gray-700 text-sm font-medium">
                                        <span
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const newItems = [...items];
                                                newItems[idx] = e.currentTarget.textContent || '';
                                                handleContentUpdate(newItems.join(','));
                                            }}
                                            className="outline-none"
                                        >
                                            {item.trim()}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                );
            }
            case 'quiz':
                return <QuizBlock element={element} onUpdate={(meta: any) => dispatch({ type: 'UPDATE_ELEMENT', payload: { id: element.id, metadata: meta } })} />;
            case 'flashcard':
                return <FlashcardBlock element={element} onUpdate={(meta: any) => dispatch({ type: 'UPDATE_ELEMENT', payload: { id: element.id, metadata: meta } })} />;
            case 'resource':
                return <ResourceButton element={element} onUpdate={(meta: any) => dispatch({ type: 'UPDATE_ELEMENT', payload: { id: element.id, metadata: meta } })} />;

            default:
                return (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded text-gray-400 text-xs italic">
                        {element.type} Component
                    </div>
                );
        }
    };

    return (
        <Rnd
            size={{ width: element.style.width as string || 'auto', height: element.style.height as string || 'auto' }}
            position={{ x: element.position.x, y: element.position.y }}
            onDragStop={(_: any, d: any) => {
                dispatch({ type: 'MOVE_ELEMENT', payload: { id: element.id, x: d.x, y: d.y } });
            }}
            onResizeStop={(_, __, ref, ___, position) => {
                dispatch({
                    type: 'UPDATE_ELEMENT',
                    payload: {
                        id: element.id,
                        style: { ...element.style, width: ref.style.width, height: ref.style.height },
                        position: position
                    }
                });
            }}
            dragHandleClassName="move-handle"
            bounds="#canvas-droppable"
            grid={[10, 10]}
            className={cn(
                "group hover:ring-2 hover:ring-primary-light transition-all",
                isSelected && "ring-2 ring-primary z-50",
                !isSelected && "z-[attr(zIndex)]"
            )}
            style={{ zIndex: element.zIndex }}
            onPointerDown={handleSelect}
        >
            {/* Move Handle (Top-Left) */}
            <div className={cn(
                "move-handle absolute -top-3 -left-3 w-7 h-7 bg-white border border-gray-200 shadow-md rounded-lg flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-[60]",
                isSelected && "opacity-100"
            )}>
                <GripVertical size={14} className="text-gray-500" />
            </div>

            {/* Delete Button (Top-Right) */}
            {isSelected && (
                <button
                    onClick={handleDelete}
                    className="absolute -top-3 -right-3 w-7 h-7 bg-white border border-red-100 shadow-md rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors z-[60]"
                >
                    <Trash2 size={14} />
                </button>
            )}

            <div ref={contentRef} className="w-full h-full p-2">
                {renderContent()}
            </div>
        </Rnd>
    );
};
