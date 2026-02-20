import type { EditorElement } from '../state/types';
import type { CourseState } from '../state/CourseContext';

export interface SerializedTopic {
    id: string;
    title: string;
    elements: EditorElement[];
}

export interface SerializedCourse {
    metadata: {
        title: string;
        description?: string;
        category?: string;
        level?: string;
    };
    topics: SerializedTopic[];
}

/**
 * Serializes the entire course state into a structured JSON object.
 */
export const serializeFullCourse = (course: CourseState): SerializedCourse => {
    return {
        metadata: {
            title: course.metadata.title,
            description: course.metadata.description,
            category: course.metadata.category,
            level: course.metadata.level,
        },
        topics: course.topics.map(topic => {
            let elements = [];
            try {
                const parsed = JSON.parse(topic.layoutJSON || '{"elements":[]}');
                elements = parsed.elements || parsed; // Handle both old and new format
            } catch (e) {
                elements = [];
            }
            return {
                id: topic.id,
                title: topic.title,
                elements: elements
            };
        })
    };
};

/**
 * Serializes a single topic's editor state.
 */
export const serializeTopicState = (elements: EditorElement[], topicId: string, title: string): SerializedTopic => {
    return {
        id: topicId,
        title: title,
        elements: elements
    };
};
