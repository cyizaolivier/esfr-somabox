import React from 'react';
import { useEditor } from '../../state/EditorContext';
import { templates } from '../../lib/templates';
import { LayoutTemplate, ArrowRight, X } from 'lucide-react';

export const TemplateGallery: React.FC = () => {
    const { dispatch } = useEditor();

    const templateData = [
        {
            id: 'basic',
            title: 'Basic Setup',
            description: 'A clean, simple start with a header, image, and text block.',
            icon: '📝',
            color: 'bg-primary'
        },
        {
            id: 'portfolio',
            title: 'Personal Portfolio',
            description: 'Showcase your skills and work with a premium dark-themed preset.',
            icon: '🎨',
            color: 'bg-indigo-600'
        },
        {
            id: 'business',
            title: 'Business Pitch',
            description: 'Conversion-focused landing page with video and feature lists.',
            icon: '🚀',
            color: 'bg-emerald-600'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg text-white">
                        <LayoutTemplate size={20} />
                    </div>
                    <h2 className="font-bold text-xl text-gray-800">Choose a Template</h2>
                </div>
                <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'editor' })}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {templateData.map((template) => (
                            <div
                                key={template.id}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col"
                            >
                                <div className={`h-40 ${template.color} flex items-center justify-center text-6xl`}>
                                    {template.icon}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-xl text-gray-800 mb-2">{template.title}</h3>
                                    <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">
                                        {template.description}
                                    </p>
                                    <button
                                        onClick={() => dispatch({ type: 'LOAD_TEMPLATE', payload: templates[template.id] })}
                                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-primary transition-colors shadow-lg"
                                    >
                                        Use This Template
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-gray-400 text-sm">
                            More templates coming soon! Want to suggest one? <span className="text-primary cursor-pointer hover:underline font-medium">Contact Support</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
