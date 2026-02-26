import { api } from "./api";

// ============================================
// VIDEO/MEDIA TYPES
// ============================================

export interface Video {
  id: string;
  file_name: string;
  file_url: string;
  topic_id: string;
  file_types: string[];
  duration: number;
  created_at: string;
  created_by?: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  topic_id: string;
  content_type: string;
  video_url?: string | null;
  video_name?: string | null;
  duration: number;
  created_at: string;
  created_by?: string;
}

export type MediaItem = Video | Content;

export interface Topic {
  id: string;
  title: string;
  course_id: string;
  description?: string;
  created_at?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

export interface Quiz {
  id: string;
  video_id: string;
  questions: QuizQuestion[];
  passing_score: number;
  created_at: string;
}

export interface QuizSubmission {
  student_id: string;
  video_id: string;
  answers: number[];
}

export interface QuizResult {
  score: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  passing_score: number;
  can_proceed: boolean;
  next_topic_id: string | null;
  message: string;
  needs_rewatch: boolean;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  video_id: string;
  quiz_score: number;
  passed: boolean;
  attempts: number;
  completed_at?: string;
  last_watched_at?: string;
  video_name?: string;
  video_url?: string;
  topic_name?: string;
  student_name?: string;
  student_email?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  total_videos_watched?: number;
  passed_quizzes?: number;
  total_attempts?: number;
  average_score?: number;
}

// ============================================
// VIDEO UPLOAD & FETCH API
// ============================================

/**
 * Upload a new educational video or content
 * POST /api/media
 */
export const uploadVideo = async (videoData: {
  // For video uploads
  file_name?: string;
  file_url?: string;
  topic_id: string;
  file_types?: string[];
  duration?: number;
  // For content uploads
  title?: string;
  description?: string;
  content_type?: string;
}): Promise<{ success: boolean; data?: MediaItem; error?: string }> => {
  try {
    const response = await api.post('/media', videoData);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Failed to upload:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to upload' 
    };
  }
};

/**
 * Fetch all uploaded videos
 * GET /api/media
 */
export const fetchVideos = async (topicId?: string): Promise<Video[]> => {
  try {
    const params = topicId ? { topic_id: topicId } : {};
    const response = await api.get('/media', { params });
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    return [];
  }
};

/**
 * Fetch a single video by ID
 * GET /api/media/:id
 */
export const fetchVideoById = async (id: string): Promise<Video | null> => {
  try {
    const response = await api.get(`/media/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Failed to fetch video:', error);
    return null;
  }
};

// ============================================
// QUIZ QUESTION GENERATION API
// ============================================

/**
 * Generate quiz questions automatically based on video content
 * POST /api/media/questions
 */
export const generateQuizQuestions = async (videoId: string, numQuestions?: number): Promise<{
  success: boolean;
  data?: Quiz;
  error?: string;
}> => {
  try {
    const response = await api.post('/media/questions', {
      video_id: videoId,
      num_questions: numQuestions
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Failed to generate quiz questions:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to generate quiz questions' 
    };
  }
};

/**
 * Get quiz questions for a specific video
 * GET /api/media/:video_id/questions
 */
export const fetchQuizQuestions = async (videoId: string): Promise<Quiz | null> => {
  try {
    const response = await api.get(`/media/${videoId}/questions`);
    return response.data.data || null;
  } catch (error) {
    console.error('Failed to fetch quiz questions:', error);
    return null;
  }
};

// ============================================
// QUIZ SUBMISSION & ASSESSMENT API
// ============================================

/**
 * Submit quiz answers and evaluate student performance
 * POST /api/quiz/submit
 */
export const submitQuiz = async (submission: QuizSubmission): Promise<{
  success: boolean;
  data?: QuizResult;
  error?: string;
}> => {
  try {
    const response = await api.post('/quiz/submit', submission);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Failed to submit quiz:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to submit quiz' 
    };
  }
};

// ============================================
// TOPIC API
// ============================================

/**
 * Fetch all topics
 * GET /api/topics
 */
export const fetchTopics = async (courseId?: string): Promise<Topic[]> => {
  try {
    const params = courseId ? { course_id: courseId } : {};
    const response = await api.get('/topics', { params });
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch topics:', error);
    return [];
  }
};

/**
 * Create a new topic
 * POST /api/topics
 */
export const createTopic = async (topicData: {
  title: string;
  course_id: string;
  description?: string;
}): Promise<{ success: boolean; data?: Topic; error?: string }> => {
  try {
    const response = await api.post('/topics', topicData);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Failed to create topic:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to create topic' 
    };
  }
};

// ============================================
// STUDENT PROGRESS API
// ============================================

/**
 * Get student progress (for facilitators to monitor)
 * GET /api/progress
 */
export const fetchStudentProgress = async (filters?: {
  student_id?: string;
  video_id?: string;
}): Promise<StudentProgress[]> => {
  try {
    const response = await api.get('/progress', { params: filters });
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch student progress:', error);
    return [];
  }
};

/**
 * Get progress for a specific student
 * GET /api/students/:student_id/progress
 */
export const fetchStudentProgressById = async (studentId: string): Promise<StudentProgress[]> => {
  try {
    const response = await api.get(`/students/${studentId}/progress`);
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch student progress:', error);
    return [];
  }
};

// ============================================
// STUDENT API
// ============================================

/**
 * Get all students (for facilitators)
 * GET /api/students
 */
export const fetchStudents = async (): Promise<Student[]> => {
  try {
    const response = await api.get('/students');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return [];
  }
};

/**
 * Get a specific student
 * GET /api/students/:id
 */
export const fetchStudentById = async (id: string): Promise<Student | null> => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Failed to fetch student:', error);
    return null;
  }
};

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Check if the backend API is running
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.data.success === true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};
