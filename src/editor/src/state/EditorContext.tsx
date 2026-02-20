import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import { type EditorState, initialState } from './types';
import type { Action } from './actions';
import { editorReducer } from './editorReducer';

interface EditorContextType {
    state: EditorState;
    dispatch: React.Dispatch<Action>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(editorReducer, initialState);

    return (
        <EditorContext.Provider value={{ state, dispatch }}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};
