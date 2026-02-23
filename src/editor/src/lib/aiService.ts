/**
 * Mock AI Service for Quiz Generation
 */
export const mockGenerateQuiz = async (text: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple logic to extract some "questions" from text
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);

    const questions = sentences.slice(0, 3).map((s, i) => {
        const words = s.trim().split(' ');
        const subject = words[0];
        const rest = words.slice(1).join(' ');

        return {
            id: `ai-${Date.now()}-${i}`,
            question: `What ${rest.toLowerCase()}?`,
            options: [
                subject,
                "Something else",
                "Not sure",
                "None of the above"
            ],
            correct: 0
        };
    });

    if (questions.length === 0) {
        return {
            questions: [
                {
                    id: 'default',
                    question: 'Could you provide more text for better results?',
                    options: ['Yes', 'No'],
                    correct: 0
                }
            ]
        };
    }

    return { questions };
};

/**
 * Real AI Service for Quiz Generation
 */
export const generateRealQuiz = async (text: string) => {
    try {
        const response = await fetch('http://localhost:3005/api/quizzes/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: text }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate quiz');
        }

        const data = await response.json();

        // The backend returns an array of { question, answer }
        // We need to map this to the frontend format which expects { questions: [...] }
        // where each question has options and a correct index.
        if (Array.isArray(data)) {
            const transformedQuestions = data.map((item, index) => ({
                id: `ai-${Date.now()}-${index}`,
                question: item.question,
                options: [
                    item.answer, // Correct answer as first option
                    "Option B",   // Placeholder distractors
                    "Option C",
                    "Option D"
                ],
                correct: 0
            }));
            return { questions: transformedQuestions };
        }

        return data;
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw error;
    }
};
