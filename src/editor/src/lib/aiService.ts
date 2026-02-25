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
        // Use the same IP/Port as the standard API
        const BACKEND_URL = "192.168.1.86:3000";

        const response = await fetch(`http://${BACKEND_URL}/api/quizzes/generate`, {
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

        // The backend returns an array of { question, answer, distractors }
        if (Array.isArray(data)) {
            const transformedQuestions = data.map((item, index) => {
                // Combine answer and distractors, then shuffle
                const allOptions = [item.answer, ...(item.distractors || [])];

                // Simple Fisher-Yates shuffle
                for (let i = allOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
                }

                // Find the index of the correct answer after shuffling
                const correctIndex = allOptions.indexOf(item.answer);

                return {
                    id: `ai-${Date.now()}-${index}`,
                    question: item.question,
                    options: allOptions,
                    correct: correctIndex
                };
            });
            return { questions: transformedQuestions };
        }

        return data;
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw error;
    }
};
