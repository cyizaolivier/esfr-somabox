import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../../state/CourseContext';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type {
    DragStartEvent,
    DragEndEvent,
    DropAnimation,
} from '@dnd-kit/core';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { useEditor } from '../../state/EditorContext';
import { generateId } from '../../lib/utils';
import type { ElementType, EditorElement } from '../../state/types';
import { Type, Image, Video, Layout, Star, List } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TopBar } from './TopBar';
import { TemplateGallery } from './TemplateGallery';
import { HelpCircle, Layers, FileText, MessageSquare } from 'lucide-react';

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export const EditorLayout: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const { state: courseState } = useCourse();
    const { state, dispatch } = useEditor();

    // Sync topic content to editor on load
    useEffect(() => {
        const topic = courseState.topics.find(t => t.id === topicId);
        if (topic) {
            try {
                const parsed = JSON.parse(topic.layoutJSON || '{"elements":[]}');
                const elements = parsed.elements || (Array.isArray(parsed) ? parsed : []);
                dispatch({ type: 'LOAD_STATE', payload: { elements } });
            } catch (e) {
                console.error("Failed to parse topic layout", e);
                dispatch({ type: 'LOAD_STATE', payload: { elements: [] } });
            }
        }
    }, [topicId, courseState.topics]);

    if (!topicId || !courseState.topics.find(t => t.id === topicId)) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Topic not found</h2>
                    <button onClick={() => navigate('/facilitator/course-outline')} className="px-6 py-2 bg-primary text-white rounded-lg font-bold shadow-lg hover:bg-primary-dark transition-all">Return to Outline</button>
                </div>
            </div>
        );
    }
    const [activeSidebarItem, setActiveSidebarItem] = useState<ElementType | null>(null);
    const [activeCanvasItem, setActiveCanvasItem] = useState<EditorElement | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.isSidebarItem) {
            setActiveSidebarItem(event.active.data.current.type as ElementType);
        } else {
            // It's a canvas item
            const element = state.elements.find((el) => el.id === event.active.id);
            if (element) {
                setActiveCanvasItem(element);
            }
        }
    };

    const handleDragOver = () => {
        // const { active, over } = event;
        // If dragging from sidebar to no where, do nothing special
        // If dragging sortable item, the SortableContext handles the visuals via logic in Canvas usually, but here we just need to ensure we don't crash
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;

        setActiveSidebarItem(null);
        setActiveCanvasItem(null);

        if (!over) return;

        // Handle Sidebar Item Drop
        if (active.data.current?.isSidebarItem) {
            const type = active.data.current.type as ElementType;
            if (over.id === 'canvas-droppable' || state.elements.some(el => el.id === over.id)) {

                // Calculate drop position relative to canvas
                // dnd-kit gives delta, but we need absolute position within the droppable
                // We'll use a simplified version: drop at mouse cursor minus canvas offset
                const canvasElement = document.getElementById('canvas-droppable');
                let x = 20;
                let y = 20;

                if (canvasElement) {
                    const rect = canvasElement.getBoundingClientRect();
                    // We don't have direct access to mouse event here, but we can approximate 
                    // or use the transform delta if we know the start point.
                    // For now, let's use a default or try to get it from the activator
                    const activatorEvent = event.activatorEvent as MouseEvent;
                    if (activatorEvent) {
                        x = activatorEvent.clientX - rect.left + delta.x;
                        y = activatorEvent.clientY - rect.top + delta.y;
                    }
                }

                // Snap to grid
                x = Math.round(x / 10) * 10;
                y = Math.round(y / 10) * 10;

                const newElement: EditorElement = {
                    id: generateId(),
                    type,
                    content: type === 'text' ? 'New Text' : '',
                    position: { x, y },
                    zIndex: state.elements.length + 1,
                    style: {
                        padding: '10px',
                        backgroundColor: type === 'comment' ? '#fffbeb' : 'transparent',
                        width: (type === 'hero' || type === 'video') ? '600px' : '200px',
                        height: type === 'video' ? '340px' : 'auto',
                    },
                };

                if (type === 'hero') {
                    newElement.content = 'Big Awesome Title\nSmall interesting subtitle goes here';
                } else if (type === 'list') {
                    newElement.content = 'Item 1,Item 2,Item 3';
                }

                dispatch({ type: 'ADD_ELEMENT', payload: newElement });
                dispatch({ type: 'SELECT_ELEMENT', payload: newElement.id });
            }
        } else if (active.id && !active.data.current?.isSidebarItem) {
            // Select item if not dragging from sidebar
            dispatch({ type: 'SELECT_ELEMENT', payload: active.id as string });
        }
    };

    // Helper to get icon for overlay
    const getIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type size={18} />;
            case 'image': return <Image size={18} />;
            case 'video': return <Video size={18} />;
            case 'container': return <Layout size={18} />;
            case 'hero': return <Star size={18} />;
            case 'list': return <List size={18} />;
            case 'quiz': return <HelpCircle size={18} />;
            case 'flashcard': return <Layers size={18} />;
            case 'resource': return <FileText size={18} />;
            case 'comment': return <MessageSquare size={18} />;
            default: return null;
        }
    }


    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            {state.view === 'templates' && <TemplateGallery />}

            <div className={cn(
                "flex flex-col h-screen overflow-hidden transition-all duration-500",
                state.view === 'templates' ? "opacity-0 pointer-events-none scale-95 blur-sm" : "opacity-100 scale-100 blur-0"
            )}>
                <TopBar />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <Canvas />
                    <PropertiesPanel />
                </div>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeSidebarItem ? (
                    <div className="flex items-center gap-3 p-4 bg-white border-2 border-primary rounded-xl shadow-2xl scale-110 rotate-2 transition-transform cursor-grabbing z-50">
                        {getIcon(activeSidebarItem)}
                        <span className="font-bold text-primary truncate max-w-[150px]">
                            {activeSidebarItem === 'text' ? 'New Text Block' : `New ${activeSidebarItem.charAt(0).toUpperCase() + activeSidebarItem.slice(1)}`}
                        </span>
                    </div>
                ) : null}
                {activeCanvasItem ? (
                    <div className="opacity-90 scale-[1.02] shadow-2xl rounded-lg overflow-hidden border-2 border-primary/50 bg-white cursor-grabbing z-50 pointer-events-none p-4">
                        <div className="flex items-center gap-2">
                            {getIcon(activeCanvasItem.type)}
                            <span className="font-bold text-primary">Moving {activeCanvasItem.type}</span>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
