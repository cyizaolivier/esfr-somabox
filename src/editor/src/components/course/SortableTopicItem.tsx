import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit3, Trash2, CheckCircle2, Eye } from 'lucide-react';
import type { Topic } from '../../state/CourseContext';

interface SortableTopicItemProps {
    topic: Topic;
    index: number;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onPreview: (id: string) => void;
}

export const SortableTopicItem: React.FC<SortableTopicItemProps> = ({ topic, index, onEdit, onDelete, onPreview }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: topic.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between"
        >
            <div className="flex items-center gap-4 flex-1">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-2 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing border-none bg-transparent"
                >
                    <GripVertical size={20} />
                </button>

                <div className="w-10 h-10 bg-gray-50 text-gray-400 group-hover:bg-primary-surface group-hover:text-primary rounded-xl flex items-center justify-center font-bold transition-colors">
                    {index + 1}
                </div>

                <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors uppercase tracking-wide text-sm">{topic.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        {topic.contentHTML ? (
                            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 size={12} /> Content Drafted
                            </span>
                        ) : (
                            <span className="text-gray-300 text-xs font-medium italic">No content yet</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onPreview(topic.id)}
                    className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm border-none cursor-pointer"
                    title="Preview Topic"
                >
                    <Eye size={18} />
                </button>
                <button
                    onClick={() => onEdit(topic.id)}
                    className="p-2.5 bg-primary-surface text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm border-none cursor-pointer"
                    title="Edit Content"
                >
                    <Edit3 size={18} />
                </button>
                <button
                    onClick={() => onDelete(topic.id)}
                    className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm border-none cursor-pointer"
                    title="Delete Topic"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};
