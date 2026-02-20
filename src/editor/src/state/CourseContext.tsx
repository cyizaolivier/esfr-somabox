import React, { createContext, useContext, useReducer, type ReactNode } from 'react';

export interface CourseMetadata {
    title: string;
    description: string;
    level: string;
    author: string;
    coverPage: string;
    // Keeping category/subtitle for internal use if needed, but not for API
    subtitle?: string;
    category?: string;
}

export interface Topic {
    id: string;
    title: string;
    contentHTML: string;
    layoutJSON: string; // Serialized EditorElement[]
}

export interface CourseState {
    metadata: CourseMetadata;
    topics: Topic[];
    backendCourseId: string | null;
}

type CourseAction =
    | { type: 'UPDATE_METADATA'; payload: Partial<CourseMetadata> }
    | { type: 'ADD_TOPIC'; payload: { title: string } }
    | { type: 'UPDATE_TOPIC_CONTENT'; payload: { id: string; contentHTML: string; layoutJSON: string } }
    | { type: 'DELETE_TOPIC'; payload: string }
    | { type: 'REORDER_TOPICS'; payload: Topic[] }
    | { type: 'SET_BACKEND_COURSE_ID'; payload: string };

const initialState: CourseState = {
    metadata: {
        title: '',
        description: '',
        level: 'Senior 2',
        author: '',
        coverPage: '',
        subtitle: '',
        category: '',
    },
    topics: [],
    backendCourseId: null,
};

function courseReducer(state: CourseState, action: CourseAction): CourseState {
    switch (action.type) {
        case 'UPDATE_METADATA':
            return {
                ...state,
                metadata: { ...state.metadata, ...action.payload },
            };
        case 'ADD_TOPIC': {
            const newTopic: Topic = {
                id: Math.random().toString(36).substr(2, 9),
                title: action.payload.title,
                contentHTML: '',
                layoutJSON: '{"elements":[]}',
            };
            return {
                ...state,
                topics: [...state.topics, newTopic],
            };
        }
        case 'UPDATE_TOPIC_CONTENT':
            return {
                ...state,
                topics: state.topics.map((t) =>
                    t.id === action.payload.id
                        ? { ...t, contentHTML: action.payload.contentHTML, layoutJSON: action.payload.layoutJSON }
                        : t
                ),
            };
        case 'DELETE_TOPIC':
            return {
                ...state,
                topics: state.topics.filter((t) => t.id !== action.payload),
            };
        case 'REORDER_TOPICS':
            return {
                ...state,
                topics: action.payload,
            };
        case 'SET_BACKEND_COURSE_ID':
            return {
                ...state,
                backendCourseId: action.payload,
            };
        default:
            return state;
    }
}

interface CourseContextType {
    state: CourseState;
    dispatch: React.Dispatch<CourseAction>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(courseReducer, initialState);
    return (
        <CourseContext.Provider value={{ state, dispatch }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) throw new Error('useCourse must be used within a CourseProvider');
    return context;
};
