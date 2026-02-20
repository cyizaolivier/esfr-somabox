import type { EditorElement, EditorState } from './types';

export type Action =
    | { type: 'ADD_ELEMENT'; payload: EditorElement }
    | { type: 'UPDATE_ELEMENT'; payload: { id: string; style?: React.CSSProperties; content?: string; metadata?: any; position?: { x: number; y: number }; zIndex?: number } }
    | { type: 'MOVE_ELEMENT'; payload: { id: string; x: number; y: number } }
    | { type: 'SELECT_ELEMENT'; payload: string | null }
    | { type: 'REORDER_ELEMENTS'; payload: EditorElement[] }
    | { type: 'DELETE_ELEMENT'; payload: string }
    | { type: 'LOAD_TEMPLATE'; payload: EditorState }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'CLEAR_CANVAS' }
    | { type: 'SET_PREVIEW_MODE'; payload: 'desktop' | 'tablet' | 'mobile' }
    | { type: 'SET_VIEW'; payload: 'editor' | 'templates' }
    | { type: 'LOAD_STATE'; payload: { elements: EditorElement[] } };
