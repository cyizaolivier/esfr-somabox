import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../../state/CourseContext';
import { useAuth } from '../../../../auth';
import { BookOpen, ArrowRight, Layers, Tag as TagIcon, Award, User, Upload, Image as ImageIcon, X } from 'lucide-react';
import { createCourse } from '../../../../api/course.api';

export const MetadataForm: React.FC = () => {
    const { state, dispatch } = useCourse();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        ...state.metadata,
        author: state.metadata.author || (user as any)?.name || user?.email?.split('@')[0] || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const course = await createCourse(formData);
            const course_id = course.id;
            localStorage.setItem('course_id', course_id);
            dispatch({ type: 'UPDATE_METADATA', payload: formData });
            navigate('/facilitator/course-outline');
        } catch (error) {
            console.error('Failed to create course:', error);
            // Optionally add user feedback here (e.g., toast)
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center p-6 bg-[radial-gradient(#274C46_0.5px,transparent_0.5px)] [background-size:24px_24px] [background-opacity:0.05]">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(39,76,70,0.1)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-gradient-to-br from-primary to-primary-dark p-10 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                                <BookOpen size={28} />
                            </div>
                            <button
                                onClick={() => navigate('/facilitator/dashboard')}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 text-white backdrop-blur-sm cursor-pointer group"
                                title="Back to Dashboard"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Course Creator</h1>
                        <p className="text-primary-surface/80 mt-3 font-medium text-lg">Let's set up the foundation of your new learning module.</p>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <BookOpen size={16} className="text-primary" /> Course Title
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                placeholder="e.g. BIOLOGY"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <User size={16} className="text-primary" /> Author
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                placeholder="e.g. Maximillien TUYISHIME"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Award size={16} className="text-primary" /> Grade / Level
                            </label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                            >
                                <option value="Senior 1">Senior 1</option>
                                <option value="Senior 2">Senior 2</option>
                                <option value="Senior 3">Senior 3</option>
                                <option value="Senior 4">Senior 4</option>
                                <option value="Senior 5">Senior 5</option>
                                <option value="Senior 6">Senior 6</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <TagIcon size={16} className="text-primary" /> Category (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                placeholder="e.g. Science"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <ImageIcon size={16} className="text-primary" /> Cover Page
                            </label>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={formData.coverPage}
                                        onChange={(e) => setFormData({ ...formData, coverPage: e.target.value })}
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                        placeholder="Enter image URL"
                                    />
                                    <label className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded-xl cursor-pointer transition-all border border-gray-200 font-semibold text-sm">
                                        <Upload size={18} />
                                        <span>Upload local</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // For demo purposes, we'll use base64 or a fake URL
                                                    // In production, you'd upload this to a server
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData({ ...formData, coverPage: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                {formData.coverPage && (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 group">
                                        <img src={formData.coverPage} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, coverPage: '' })}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Layers size={16} className="text-primary" /> Description
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none min-h-[120px]"
                                placeholder="What will students learn in this course?"
                            />
                        </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/facilitator/dashboard')}
                            className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 hover:text-gray-600 transition-all border border-gray-100 active:scale-95 text-sm uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-[0_10px_30px_rgba(39,76,70,0.3)] active:scale-95 text-sm uppercase tracking-widest"
                        >
                            Save and Continue to Outline
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
