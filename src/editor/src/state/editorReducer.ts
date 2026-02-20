import { type EditorState, initialState } from './types';
import type { Action } from './actions';

export const editorReducer = (state: EditorState, action: Action): EditorState => {
    switch (action.type) {
        case 'ADD_ELEMENT':
            return {
                ...state,
                past: [...state.past, state.elements],
                elements: [...state.elements, action.payload],
                selectedElementId: action.payload.id,
                future: [],
            };
        case 'UPDATE_ELEMENT': {
            const newElements = state.elements.map((el) =>
                el.id === action.payload.id
                    ? {
                        ...el,
                        style: { ...el.style, ...action.payload.style },
                        content: action.payload.content ?? el.content,
                        metadata: action.payload.metadata !== undefined ? { ...el.metadata, ...action.payload.metadata } : el.metadata,
                        position: action.payload.position ?? el.position,
                        zIndex: action.payload.zIndex ?? el.zIndex
                    }
                    : el
            );
            return {
                ...state,
                past: [...state.past, state.elements],
                elements: newElements,
                future: [],
            };
        }
        case 'SELECT_ELEMENT':
            return {
                ...state,
                selectedElementId: action.payload,
            };
        case 'MOVE_ELEMENT': {
            const newElements = state.elements.map((el) =>
                el.id === action.payload.id
                    ? { ...el, position: { x: action.payload.x, y: action.payload.y } }
                    : el
            );
            return {
                ...state,
                elements: newElements,
            };
        }
        case 'REORDER_ELEMENTS':
            return {
                ...state,
                past: [...state.past, state.elements],
                elements: action.payload,
                future: [],
            };
        case 'DELETE_ELEMENT':
            return {
                ...state,
                past: [...state.past, state.elements],
                elements: state.elements.filter((el) => el.id !== action.payload),
                selectedElementId: state.selectedElementId === action.payload ? null : state.selectedElementId,
                future: [],
            };
        case 'LOAD_TEMPLATE':
            return {
                ...action.payload,
                past: [...state.past, state.elements],
                future: [],
                view: 'editor',
            };
        case 'UNDO': {
            if (state.past.length === 0) return state;
            const previous = state.past[state.past.length - 1];
            const newPast = state.past.slice(0, state.past.length - 1);
            return {
                ...state,
                past: newPast,
                elements: previous,
                future: [state.elements, ...state.future],
            };
        }
        case 'REDO': {
            if (state.future.length === 0) return state;
            const next = state.future[0];
            const newFuture = state.future.slice(1);
            return {
                ...state,
                past: [...state.past, state.elements],
                elements: next,
                future: newFuture,
            };
        }
        case 'CLEAR_CANVAS':
            return {
                ...state,
                past: [...state.past, state.elements],
                elements: [],
                selectedElementId: null,
                future: [],
            };
        case 'SET_PREVIEW_MODE':
            return {
                ...state,
                previewMode: action.payload,
            };
        case 'SET_VIEW':
            return {
                ...state,
                view: action.payload,
            };
        case 'LOAD_STATE':
            return {
                ...initialState,
                elements: action.payload.elements,
                view: 'editor',
            };
        default:
            return state;
    }
};
