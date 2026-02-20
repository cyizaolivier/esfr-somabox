import React from 'react';
import { DraggableSidebarItem } from './DraggableSidebarItem';
import { Type, Image, Video, Layout, Star, List, HelpCircle, Layers, FileText, MessageSquare } from 'lucide-react';

export const Sidebar: React.FC = () => {
    return (
        <div className="w-64 bg-gray-100 p-4 border-r border-gray-200 h-full overflow-y-auto">
            <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Components</h2>

            <div className="flex flex-col gap-2">
                <DraggableSidebarItem
                    type="text"
                    label="Text Block"
                    icon={<Type size={18} />}
                />
                <DraggableSidebarItem
                    type="image"
                    label="Image"
                    icon={<Image size={18} />}
                />
                <DraggableSidebarItem
                    type="video"
                    label="Video"
                    icon={<Video size={18} />}
                />
                <DraggableSidebarItem
                    type="container"
                    label="Container"
                    icon={<Layout size={18} />}
                />
                <div className="border-t border-gray-200 my-2 pt-2">
                    <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Presets</h3>
                    <DraggableSidebarItem
                        type="hero"
                        label="Hero Section"
                        icon={<Star size={18} className="text-amber-500" />}
                    />
                    <DraggableSidebarItem
                        type="list"
                        label="Icon List"
                        icon={<List size={18} className="text-primary" />}
                    />
                </div>
                <div className="border-t border-gray-200 my-2 pt-2">
                    <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Interactions</h3>
                    <DraggableSidebarItem
                        type="quiz"
                        label="Quiz Block"
                        icon={<HelpCircle size={18} className="text-purple-500" />}
                    />
                    <DraggableSidebarItem
                        type="flashcard"
                        label="Flashcard"
                        icon={<Layers size={18} className="text-pink-500" />}
                    />
                    <DraggableSidebarItem
                        type="resource"
                        label="Resource"
                        icon={<FileText size={18} className="text-orange-500" />}
                    />
                    <DraggableSidebarItem
                        type="comment"
                        label="Comment"
                        icon={<MessageSquare size={18} className="text-teal-500" />}
                    />
                </div>
            </div>
        </div>
    );
};
