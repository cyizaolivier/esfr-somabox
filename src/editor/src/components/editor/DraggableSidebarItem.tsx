import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '../../lib/utils';
import type { ElementType } from '../../state/types';

interface DraggableSidebarItemProps {
    type: ElementType;
    label: string;
    icon: React.ReactNode;
}

export const DraggableSidebarItem: React.FC<DraggableSidebarItemProps> = ({ type, label, icon }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${type}`,
        data: {
            type,
            isSidebarItem: true,
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                'flex items-center gap-2 p-3 mb-2 bg-white border rounded cursor-grab hover:bg-gray-50 transition-colors',
                isDragging && 'opacity-50 ring-2 ring-primary'
            )}
        >
            {icon}
            <span>{label}</span>
        </div>
    );
};
