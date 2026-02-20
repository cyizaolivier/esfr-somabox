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
