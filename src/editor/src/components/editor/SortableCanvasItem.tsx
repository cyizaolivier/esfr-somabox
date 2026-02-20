import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { EditorElement } from '../../state/types';
import { cn } from '../../lib/utils';
import { useEditor } from '../../state/EditorContext';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

interface SortableCanvasItemProps {
    element: EditorElement;
}

export const SortableCanvasItem: React.FC<SortableCanvasItemProps> = ({ element }) => {
    const { state, dispatch } = useEditor();
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const startStyle = useRef({ ...element.style });

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: element.id,
        disabled: !!isResizing // Disable sorting while resizing
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isResizing ? 'none' : transition,
    };

    const isSelected = state.selectedElementId === element.id;

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (state.selectedElementId !== element.id) {
            dispatch({ type: 'SELECT_ELEMENT', payload: element.id });
        }
    };

    const handleContentUpdate = (newContent: string) => {
        dispatch({
            type: 'UPDATE_ELEMENT',
            payload: {
                id: element.id,
                style: element.style,
                content: newContent,
            },
        });
    };

    const handleStyleUpdate = (newStyle: React.CSSProperties) => {
        dispatch({
            type: 'UPDATE_ELEMENT',
            payload: {
                id: element.id,
                style: newStyle,
            },
        });
    };

    // Resize Logic
    const onMouseDown = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(direction);
        startPos.current = { x: e.clientX, y: e.clientY };
        startStyle.current = { ...element.style };
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startPos.current.x;
            const deltaY = e.clientY - startPos.current.y;
            const newStyle = { ...startStyle.current };

            if (isResizing === 'right' || isResizing === 'left') {
                const startWidth = parseInt((startStyle.current.width as string) || '100');
                const multiplier = isResizing === 'right' ? 1 : -1;
                // Move approx 0.2% per pixel for width
                const newWidth = Math.min(100, Math.max(20, startWidth + (deltaX * 0.2 * multiplier)));
                newStyle.width = `${newWidth}%`;
            }

            if (isResizing === 'bottom' || isResizing === 'top') {
                const paddingKey = isResizing === 'bottom' ? 'paddingBottom' : 'paddingTop';
                const startPadding = parseInt((startStyle.current[paddingKey] as string) || '10');
                const multiplier = isResizing === 'bottom' ? 1 : -1;
                const newPadding = Math.max(0, startPadding + (deltaY * multiplier));
                newStyle[paddingKey] = `${newPadding}px`;
            }

            handleStyleUpdate(newStyle);
        };

        const onMouseUp = () => {
            setIsResizing(null);
        };

        if (isResizing) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isResizing]);

    const renderContent = () => {
        switch (element.type) {
            case 'text':
                return (
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleContentUpdate(e.currentTarget.textContent || '')}
                        className="outline-none focus:ring-1 focus:ring-primary-light rounded px-1"
                    >
                        {element.content || 'Text Element'}
                    </div>
                );
            case 'hero': {
                const parts = (element.content || '').split('\n');
                return (
                    <div className="py-8 text-center">
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
            case 'list': {
                const items = (element.content || '').split(',');
                return (
                    <div className="space-y-4">
                        <ul className="space-y-2">
                            {items.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 group/item px-4 relative">
                                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                    <span
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => {
                                            const newItems = [...items];
                                            newItems[i] = e.currentTarget.textContent || '';
                                            handleContentUpdate(newItems.join(','));
                                        }}
                                        className="outline-none flex-1 py-1"
                                    >
                                        {item.trim() || `Item ${i + 1}`}
                                    </span>
                                    {items.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newItems = items.filter((_, index) => index !== i);
                                                handleContentUpdate(newItems.join(','));
                                            }}
                                            className="opacity-0 group-hover/item:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
                                            title="Remove Item"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const newItems = [...items, `New Item ${items.length + 1}`];
                                handleContentUpdate(newItems.join(','));
                            }}
                            className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark px-4 py-2 bg-primary-surface rounded-lg transition-colors w-fit ml-4"
                        >
                            <Plus size={14} />
                            Add Item
                        </button>
                    </div>
                );
            }
            case 'image':
                return (
                    <div className="w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[100px]">
                        {element.content ? (
                            <img src={element.content} alt="Content" className="w-full h-auto object-cover pointer-events-none" />
                        ) : (
                            <span className="text-gray-400 p-8 text-center italic">Image Placeholder</span>
                        )}
                    </div>
                );
            case 'video':
                return (
                    <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white overflow-hidden pointer-events-none">
                        {element.content ? (
                            <div className="p-4 text-center">
                                <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-bold">Video Clip</p>
                                <p className="font-mono text-sm">{element.content}</p>
                            </div>
                        ) : (
                            <span className="italic text-gray-500">Video Placeholder</span>
                        )}
                    </div>
                );
            case 'container':
                return <div className="min-h-[60px] border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-gray-400 italic">Empty Container</div>;
            default:
                return null;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, ...element.style }}
            onClick={handleSelect}
            className={cn(
                'relative group mb-4 mx-auto',
                isSelected ? 'ring-2 ring-primary ring-offset-2 z-10' : 'hover:ring-1 hover:ring-primary-light',
                isDragging && 'opacity-50 z-50',
                isResizing && 'cursor-grabbing'
            )}
        >
            {/* Move Handle */}
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    "absolute -left-10 top-1/2 -translate-y-1/2 p-2 bg-white border border-gray-200 shadow-sm rounded-lg opacity-0 group-hover:opacity-100 cursor-move active:cursor-grabbing transition-opacity z-20",
                    isDragging && "opacity-100"
                )}
            >
                <GripVertical size={16} className="text-gray-400" />
            </div>

            <div className="p-1">
                {renderContent()}
            </div>

            {/* Resize Handles */}
            {isSelected && (
                <>
                    <div className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize" onMouseDown={(e) => onMouseDown(e, 'top')} />
                    <div className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize" onMouseDown={(e) => onMouseDown(e, 'bottom')} />
                    <div className="absolute top-0 bottom-0 -left-1 w-2 cursor-ew-resize" onMouseDown={(e) => onMouseDown(e, 'left')} />
                    <div className="absolute top-0 bottom-0 -right-1 w-2 cursor-ew-resize" onMouseDown={(e) => onMouseDown(e, 'right')} />

                    {/* Visual indicators for handles */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100" />
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 h-8 w-1 bg-primary rounded-full opacity-0 group-hover:opacity-100" />
                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 h-8 w-1 bg-primary rounded-full opacity-0 group-hover:opacity-100" />
                </>
            )}
        </div>
    );
};
