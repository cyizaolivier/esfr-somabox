import type { CSSProperties } from 'react';

export type ElementType = 'text' | 'image' | 'video' | 'container' | 'hero' | 'list' | 'quiz' | 'flashcard' | 'resource' | 'comment';

export interface EditorElement {
    id: string;
    type: ElementType;
    content?: string; // For text, image URL, video URL, etc.
    style: React.CSSProperties;
    position: { x: number; y: number };
    zIndex: number;
    metadata?: any; // For quiz questions, video markers, flashcard state, etc.
}

export type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export interface EditorState {
    elements: EditorElement[];
    selectedElementId: string | null;
    past: EditorElement[][];
    future: EditorElement[][];
    previewMode: PreviewMode;
    view: 'editor' | 'templates';
}

export const initialState: EditorState = {
    elements: [],
    selectedElementId: null,
    past: [],
    future: [],
    previewMode: 'desktop',
    view: 'editor',
};
