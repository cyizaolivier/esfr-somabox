import { useDroppable } from '@dnd-kit/core';
import { useEditor } from '../../state/EditorContext';
import { FreeFormCanvasItem } from './FreeFormCanvasItem';
import { cn } from '../../lib/utils';

export const Canvas: React.FC = () => {
    const { state, dispatch } = useEditor();
    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas-droppable',
    });

    const handleBackgroundClick = (e: React.MouseEvent) => {
        // Only deselect if we clicked the background itself, not a child
        if (e.target === e.currentTarget) {
            dispatch({ type: 'SELECT_ELEMENT', payload: null });
        }
    };

    // Calculate canvas height based on lowest element
    const canvasMinHeight = Math.max(
        ...state.elements.map(el => el.position.y + (parseInt(el.style.height as string) || 50) + 100),
        0
    );

    const getCanvasScale = () => {
        switch (state.previewMode) {
            case 'mobile': return 0.45; // Approx 375/800
            case 'tablet': return 0.85; // Approx 768/900
            default: return 1;
        }
    };

    const scale = getCanvasScale();
    const scaledHeight = canvasMinHeight * scale;

    return (
        <div
            className="flex-1 h-full bg-gray-50 overflow-y-auto p-4 md:p-8 transition-all duration-300 scrollbar-hide flex justify-center"
            onPointerDown={handleBackgroundClick}
        >
            <div
                className="relative transition-all duration-500 flex justify-center w-full"
                style={{ height: `${scaledHeight}px`, minHeight: '100%' }}
            >
                <div
                    id="canvas-droppable"
                    ref={setNodeRef}
                    style={{
                        minHeight: canvasMinHeight > 0 ? `${canvasMinHeight}px` : '800px',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        width: '800px' // Base editor width (Match renderer)
                    }}
                    className={cn(
                        "bg-white shadow-2xl border border-gray-100 p-8 transition-all duration-300 relative z-0",
                        isOver && "bg-primary-surface/50 border-primary/30 ring-4 ring-primary/5"
                    )}
                >
                    {/* Device Indicator */}
                    <div className="absolute -top-6 left-0 right-0 flex justify-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                            {state.previewMode} View
                        </span>
                    </div>

                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />

                    {state.elements.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <p className="text-lg">Drag components here</p>
                            <p className="text-sm opacity-60">Components will be placed where you drop them</p>
                        </div>
                    ) : (
                        state.elements.map((element) => (
                            <FreeFormCanvasItem key={element.id} element={element} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
