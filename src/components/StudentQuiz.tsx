import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  FileQuestion, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { 
  Video, 
  Quiz, 
  QuizQuestion,
  fetchVideos, 
  fetchQuizQuestions, 
  submitQuiz,
  QuizResult,
  fetchStudentProgressById
} from '../api/media.api';

interface StudentQuizProps {
  studentId: string;
  courseId?: string;
}

export const StudentQuiz: React.FC<StudentQuizProps> = ({ studentId, courseId }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);

  // Fetch available videos
  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        const fetchedVideos = await fetchVideos();
        setVideos(fetchedVideos);
        
        // Load student's existing progress
        const progress = await fetchStudentProgressById(studentId);
        setStudentProgress(progress);
      } catch (error) {
        console.error('Failed to load videos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, [studentId]);

  // Check if student has already passed a video
  const hasPassedVideo = (videoId: string) => {
    const progress = studentProgress.find(p => p.video_id === videoId && p.passed);
    return !!progress;
  };

  // Get last attempt score for a video
  const getLastScore = (videoId: string) => {
    const progress = studentProgress.find(p => p.video_id === videoId);
    return progress?.quiz_score;
  };

  // Handle video selection
  const handleSelectVideo = async (video: Video) => {
    setSelectedVideo(video);
    setQuiz(null);
    setQuizResult(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);

    // Check if already passed
    if (hasPassedVideo(video.id)) {
      // Load quiz anyway for review
      try {
        const quizData = await fetchQuizQuestions(video.id);
        setQuiz(quizData);
      } catch (error) {
        console.error('Failed to load quiz:', error);
      }
      return;
    }

    // Load quiz
    try {
      const quizData = await fetchQuizQuestions(video.id);
      setQuiz(quizData);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handle quiz submission
  const handleSubmitQuiz = async () => {
    if (!selectedVideo || answers.length !== quiz?.questions.length) {
      alert('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitQuiz({
        student_id: studentId,
        video_id: selectedVideo.id,
        answers
      });

      if (result.success && result.data) {
        setQuizResult(result.data);
        
        // Refresh progress
        const progress = await fetchStudentProgressById(studentId);
        setStudentProgress(progress);
      } else {
        alert(result.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle retry (re-watch video message)
  const handleRetry = () => {
    setQuizResult(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading videos...</span>
      </div>
    );
  }

  // Show quiz result
  if (quizResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-lg p-6 mb-6 ${
          quizResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            {quizResult.passed ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
            <div>
              <h2 className={`text-2xl font-bold ${
                quizResult.passed ? 'text-green-800' : 'text-red-800'
              }`}>
                {quizResult.passed ? 'Congratulations!' : 'Keep Trying!'}
              </h2>
              <p className="text-gray-600">{quizResult.message}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">{quizResult.score}%</div>
              <div className="text-sm text-gray-500">Your Score</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">{quizResult.correct_answers}/{quizResult.total_questions}</div>
              <div className="text-sm text-gray-500">Correct Answers</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">{quizResult.passing_score}%</div>
              <div className="text-sm text-gray-500">Passing Score</div>
            </div>
          </div>
        </div>

        {!quizResult.passed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">
                Please re-watch the video before trying the quiz again.
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          {quizResult.can_proceed && quizResult.next_topic_id && (
            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Continue to Next Topic
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show video selection
  if (!selectedVideo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <PlayCircle className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Available Videos</h2>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No videos available yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {videos.map((video) => {
              const passed = hasPassedVideo(video.id);
              const lastScore = getLastScore(video.id);
              
              return (
                <div 
                  key={video.id}
                  className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    passed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectVideo(video)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{video.file_name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                        {lastScore !== undefined && (
                          <span className={passed ? 'text-green-600' : 'text-red-600'}>
                            Last Score: {lastScore}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {passed ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-5 h-5" />
                          Passed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-600 text-sm">
                          <PlayCircle className="w-5 h-5" />
                          Start Quiz
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Show quiz
  if (quiz && selectedVideo) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const answeredCount = answers.filter(a => a !== undefined).length;
    const allAnswered = answeredCount === quiz.questions.length;

    return (
      <div className="max-w-2xl mx-auto">
        {/* Video Header */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedVideo(null)}
            className="text-blue-600 hover:underline mb-2"
          >
            ← Back to Videos
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{selectedVideo.file_name}</h2>
          <p className="text-gray-500">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {currentQuestion.question}
          </h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  answers[currentQuestionIndex] === index
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              disabled={answers[currentQuestionIndex] === undefined}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={!allAnswered || submitting}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Quiz
                </>
              )}
            </button>
          )}
        </div>

        {/* Answered indicator */}
        <div className="mt-4 flex justify-center gap-2">
          {quiz.questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                answers[index] !== undefined ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {answeredCount} of {quiz.questions.length} questions answered
        </p>
      </div>
    );
  }

  return null;
};

export default StudentQuiz;
