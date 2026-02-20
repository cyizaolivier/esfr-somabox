import type { EditorState } from '../state/types';
import { generateId } from './utils';

export const templates: Record<string, EditorState> = {
    basic: {
        elements: [
            {
                id: generateId(),
                type: 'text',
                content: 'Welcome to the Course',
                position: { x: 150, y: 50 },
                zIndex: 1,
                style: {
                    fontSize: '32px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    padding: '10px',
                    width: '600px'
                },
            },
            {
                id: generateId(),
                type: 'image',
                content: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
                position: { x: 100, y: 150 },
                zIndex: 2,
                style: {
                    padding: '0px',
                    borderRadius: '8px',
                    width: '700px',
                    height: '400px'
                },
            },
            {
                id: generateId(),
                type: 'text',
                content: 'This is the introduction to the course content. You can edit this text directly on the canvas.',
                position: { x: 150, y: 580 },
                zIndex: 3,
                style: {
                    fontSize: '16px',
                    padding: '10px',
                    textAlign: 'center',
                    color: '#666',
                    width: '600px'
                },
            },
        ],
        selectedElementId: null,
        past: [],
        future: [],
        previewMode: 'desktop',
        view: 'editor'
    },
    portfolio: {
        elements: [
            {
                id: generateId(),
                type: 'hero',
                content: 'Creative Designer & Developer\nHelping brands build digital experiences that matter.',
                position: { x: 150, y: 80 },
                zIndex: 1,
                style: {
                    textAlign: 'center',
                    width: '600px'
                }
            },
            {
                id: generateId(),
                type: 'image',
                content: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=60',
                position: { x: 50, y: 250 },
                zIndex: 2,
                style: {
                    width: '800px',
                    height: '450px',
                    borderRadius: '12px'
                }
            },
            {
                id: generateId(),
                type: 'text',
                content: 'My Skills & Expertise',
                position: { x: 300, y: 720 },
                zIndex: 3,
                style: {
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    width: '300px'
                }
            },
            {
                id: generateId(),
                type: 'list',
                content: 'Modern UI/UX Design with Tailwind CSS, React & Next.js Development, Brand Identity & Strategy, Responsive Web Applications',
                position: { x: 150, y: 780 },
                zIndex: 4,
                style: {
                    padding: '20px',
                    width: '600px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px'
                }
            }
        ],
        selectedElementId: null,
        past: [],
        future: [],
        previewMode: 'desktop',
        view: 'editor'
    },
    business: {
        elements: [
            {
                id: generateId(),
                type: 'hero',
                content: 'Revolutionizing Team Collaboration\nThe ultimate platform for modern distributed teams.',
                position: { x: 150, y: 50 },
                zIndex: 1,
                style: {
                    textAlign: 'center',
                    width: '600px'
                }
            },
            {
                id: generateId(),
                type: 'video',
                content: 'YouTube: Product Walkthrough 2024',
                position: { x: 150, y: 200 },
                zIndex: 2,
                style: {
                    width: '600px',
                    height: '340px'
                }
            },
            {
                id: generateId(),
                type: 'list',
                content: 'Real-time synchronization across all devices, Enterprise-grade security and encryption, Seamless integration with your favorite tools, Advanced analytics and reporting',
                position: { x: 150, y: 580 },
                zIndex: 3,
                style: {
                    padding: '24px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '16px',
                    width: '600px',
                    color: '#1e40af'
                }
            }
        ],
        selectedElementId: null,
        past: [],
        future: [],
        previewMode: 'desktop',
        view: 'editor'
    }
};
