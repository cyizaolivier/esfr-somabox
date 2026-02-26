/**
 * LMS Backend Server
 * Handles video uploads, quiz generation, and student progress tracking
 */

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// IN-MEMORY DATABASE MODELS
// ============================================

// Videos table
const videos = new Map();

// Content table (text/rich content for lessons)
const content = new Map();

// Topics table
const topics = new Map();

// Quizzes table (questions for each video)
const quizzes = new Map();

// Student progress table
const studentProgress = new Map();

// Users table (students and facilitators)
const users = new Map();

// Initialize with sample data
function initializeSampleData() {
  // Sample topics
  const sampleTopics = [
    { id: 'topic-1', title: 'Introduction to Mathematics', course_id: 'course-1', description: 'Basic math concepts' },
    { id: 'topic-2', title: 'Algebra Fundamentals', course_id: 'course-1', description: 'Algebraic expressions and equations' },
    { id: 'topic-3', title: 'Geometry Basics', course_id: 'course-1', description: 'Shapes, angles, and spatial reasoning' },
  ];
  
  sampleTopics.forEach(topic => topics.set(topic.id, topic));

  // Sample facilitator
  const facilitatorId = 'facilitator-1';
  users.set(facilitatorId, {
    id: facilitatorId,
    name: 'John Facilitator',
    email: 'facilitator@lms.com',
    role: 'facilitator',
    created_at: new Date().toISOString()
  });

  // Sample students
  const sampleStudents = [
    { id: 'student-1', name: 'Alice Smith', email: 'alice@student.com', role: 'student' },
    { id: 'student-2', name: 'Bob Johnson', email: 'bob@student.com', role: 'student' },
    { id: 'student-3', name: 'Charlie Brown', email: 'charlie@student.com', role: 'student' },
  ];
  
  sampleStudents.forEach(student => users.set(student.id, { ...student, created_at: new Date().toISOString() }));

  // Sample video
  const videoId = 'video-1';
  videos.set(videoId, {
    id: videoId,
    file_name: 'Introduction to Algebra.mp4',
    file_url: 'https://example.com/videos/intro-algebra.mp4',
    topic_id: 'topic-2',
    file_types: ['video/mp4'],
    duration: 300, // 5 minutes
    created_at: new Date().toISOString(),
    created_by: facilitatorId
  });

  // Sample quiz for the video
  quizzes.set(videoId, {
    id: 'quiz-1',
    video_id: videoId,
    questions: [
      {
        id: 'q1',
        question: 'What is an algebraic expression?',
        options: [
          'A mathematical statement with only numbers',
          'A combination of numbers, variables, and operations',
          'A type of equation',
          'A geometric shape'
        ],
        correct_answer: 1
      },
      {
        id: 'q2',
        question: 'What does the variable x represent in 2x + 5 = 15?',
        options: [
          'The coefficient',
          'The constant term',
          'The unknown value we need to find',
          'The result'
        ],
        correct_answer: 2
      },
      {
        id: 'q3',
        question: 'What is the first step to solve 3x - 7 = 14?',
        options: [
          'Divide by 3',
          'Add 7 to both sides',
          'Subtract 14 from both sides',
          'Multiply by 3'
        ],
        correct_answer: 1
      },
      {
        id: 'q4',
        question: 'Simplify: 2(x + 3) + 4x',
        options: [
          '6x + 3',
          '6x + 6',
          '8x + 3',
          '2x + 10'
        ],
        correct_answer: 1
      },
      {
        id: 'q5',
        question: 'If y = 2x + 1, what is y when x = 5?',
        options: [
          '10',
          '11',
          '12',
          '13'
        ],
        correct_answer: 1
      }
    ],
    passing_score: 50,
    created_at: new Date().toISOString()
  });

  // Sample student progress
  studentProgress.set('student-1-topic-2', {
    id: 'progress-1',
    student_id: 'student-1',
    video_id: videoId,
    quiz_score: 80,
    passed: true,
    attempts: 1,
    completed_at: new Date().toISOString(),
    last_watched_at: new Date().toISOString()
  });
}

initializeSampleData();

// ============================================
// AI-SIMULATED QUESTION GENERATION
// ============================================

/**
 * Simulates AI-generated quiz questions based on video content
 * In production, this would call an actual AI service
 */
function generateAIQuestions(video) {
  const questionTemplates = [
    {
      question: `What is the main topic covered in "${video.file_name}"?`,
      options: ['Mathematics', 'History', 'Science', 'Art'],
      correct_answer: 0
    },
    {
      question: 'What is the key concept discussed in this video?',
      options: [
        'Fundamental principles',
        'Advanced applications',
        'Historical context',
        'Practical examples'
      ],
      correct_answer: 0
    },
    {
      question: 'How would you apply the knowledge from this video?',
      options: [
        'Through practice problems',
        'By memorization only',
        'By ignoring the content',
        'By skipping to the next topic'
      ],
      correct_answer: 0
    },
    {
      question: 'What is the recommended approach after watching this video?',
      options: [
        'Attempt the quiz immediately',
        'Review the video again',
        'Move to the next topic',
        'Close the application'
      ],
      correct_answer: 0
    },
    {
      question: 'What type of learner would benefit most from this content?',
      options: [
        'Visual learners',
        'Auditory learners only',
        'Kinesthetic learners only',
        'Those who don\'t engage'
      ],
      correct_answer: 0
    }
  ];

  // Add some variety based on video duration
  const numQuestions = video.duration ? Math.min(5, Math.ceil(video.duration / 60)) : 5;
  
  // Shuffle and select questions
  const shuffled = questionTemplates.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numQuestions).map((q, index) => ({
    id: `ai-q-${uuidv4()}`,
    ...q,
    question: `Question ${index + 1}: ${q.question}`
  }));
}

// ============================================
// API ROUTES
// ============================================

// ------------------------------------------
// MEDIA ENDPOINTS (Video Upload & Fetch)
// ------------------------------------------

/**
 * POST /api/media
 * Upload a new educational video
 * 
 * Request Body:
 * {
 *   "file_name": "Introduction to Algebra.mp4",
 *   "file_url": "https://example.com/videos/intro-algebra.mp4",
 *   "topic_id": "topic-2",
 *   "file_types": ["video/mp4"],
 *   "duration": 300 (optional, in seconds)
 * }
 * 
 * Also supports content-only uploads:
 * {
 *   "title": "Algebra Introduction",
 *   "description": "Full lesson text content...",
 *   "topic_id": "topic-2",
 *   "content_type": "text"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "video-uuid",
 *     "file_name": "...",
 *     "file_url": "...",
 *     "topic_id": "...",
 *     "file_types": [...],
 *     "duration": 300,
 *     "created_at": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 */
app.post('/api/media', (req, res) => {
  try {
    const { 
      file_name, 
      file_url, 
      topic_id, 
      file_types, 
      duration,
      title,
      description,
      content_type
    } = req.body;

    // Check if topic exists
    if (!topics.has(topic_id)) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    // Check if this is a content-only upload (text/rich content)
    if (content_type === 'text' || (!file_url && !file_name)) {
      // Create text/rich content
      const newContent = {
        id: `content-${uuidv4()}`,
        title: title || req.body.title || 'Untitled Lesson',
        description: description || '',
        topic_id,
        content_type: 'text',
        video_url: file_url || null,
        video_name: file_name || null,
        duration: duration || 0,
        created_at: new Date().toISOString(),
        created_by: req.body.created_by || 'facilitator-1'
      };

      content.set(newContent.id, newContent);

      return res.status(201).json({
        success: true,
        data: newContent
      });
    }

    // Validation for video upload
    if (!file_name || !file_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: file_name, file_url, topic_id'
      });
    }

    const video = {
      id: `video-${uuidv4()}`,
      file_name,
      file_url,
      topic_id,
      file_types: file_types || ['video/mp4'],
      duration: duration || 300,
      created_at: new Date().toISOString(),
      created_by: req.body.created_by || 'facilitator-1'
    };

    videos.set(video.id, video);

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload video'
    });
  }
});

/**
 * GET /api/media
 * Fetch all uploaded videos
 * 
 * Query Parameters (optional):
 * - topic_id: Filter by topic
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "video-1",
 *       "file_name": "...",
 *       "file_url": "...",
 *       "topic_id": "...",
 *       "file_types": [...],
 *       "duration": 300,
 *       "created_at": "..."
 *     }
 *   ]
 * }
 */
app.get('/api/media', (req, res) => {
  try {
    const { topic_id, type } = req.query;
    
    let videoList = Array.from(videos.values());
    let contentList = Array.from(content.values());
    
    // Filter by topic if provided
    if (topic_id) {
      videoList = videoList.filter(v => v.topic_id === topic_id);
      contentList = contentList.filter(c => c.topic_id === topic_id);
    }

    // Filter by type if provided
    if (type === 'video') {
      // Return only videos
      videoList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return res.json({
        success: true,
        data: videoList
      });
    } else if (type === 'content') {
      // Return only content
      contentList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return res.json({
        success: true,
        data: contentList
      });
    }
    
    // Combine videos and content
    const allMedia = [
      ...videoList.map(v => ({ ...v, media_type: 'video' })),
      ...contentList.map(c => ({ ...c, media_type: 'content' }))
    ];
    
    // Sort by creation date (newest first)
    allMedia.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: allMedia
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos'
    });
  }
});

/**
 * GET /api/media/:id
 * Fetch a single video by ID
 */
app.get('/api/media/:id', (req, res) => {
  try {
    const { id } = req.params;
    const video = videos.get(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video'
    });
  }
});

// ------------------------------------------
// QUIZ QUESTION ENDPOINTS
// ------------------------------------------

/**
 * POST /api/media/questions
 * Generate quiz questions automatically based on video content
 * 
 * Request Body:
 * {
 *   "video_id": "video-1",
 *   "num_questions": 5 (optional, default 5)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "quiz-uuid",
 *     "video_id": "video-1",
 *     "questions": [
 *       {
 *         "id": "q1",
 *         "question": "What is...?",
 *         "options": ["A", "B", "C", "D"],
 *         "correct_answer": 0
 *       }
 *     ],
 *     "passing_score": 50,
 *     "created_at": "..."
 *   }
 * }
 */
app.post('/api/media/questions', (req, res) => {
  try {
    const { video_id, num_questions } = req.body;

    if (!video_id) {
      return res.status(400).json({
        success: false,
        error: 'video_id is required'
      });
    }

    const video = videos.get(video_id);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Check if quiz already exists for this video
    let quiz = Array.from(quizzes.values()).find(q => q.video_id === video_id);

    if (quiz) {
      // Return existing quiz
      return res.json({
        success: true,
        data: quiz,
        message: 'Quiz already exists for this video'
      });
    }

    // Generate new quiz using AI-simulated logic
    const questions = generateAIQuestions(video);
    
    quiz = {
      id: `quiz-${uuidv4()}`,
      video_id,
      questions,
      passing_score: 50,
      created_at: new Date().toISOString()
    };

    quizzes.set(quiz.id, quiz);

    res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz generated successfully using AI'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate quiz questions'
    });
  }
});

/**
 * GET /api/media/:video_id/questions
 * Get quiz questions for a specific video
 */
app.get('/api/media/:video_id/questions', (req, res) => {
  try {
    const { video_id } = req.params;
    
    const quiz = Array.from(quizzes.values()).find(q => q.video_id === video_id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found for this video'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz questions'
    });
  }
});

// ------------------------------------------
// QUIZ SUBMISSION & ASSESSMENT
// ------------------------------------------

/**
 * POST /api/quiz/submit
 * Submit quiz answers and evaluate student performance
 * 
 * Request Body:
 * {
 *   "student_id": "student-1",
 *   "video_id": "video-1",
 *   "answers": [0, 2, 1, 1, 2] // Array of selected option indices
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "score": 80,
 *     "passed": true,
 *     "total_questions": 5,
 *     "correct_answers": 4,
 *     "can_proceed": true,
 *     "message": "Congratulations! You passed the quiz."
 *   }
 * }
 */
app.post('/api/quiz/submit', (req, res) => {
  try {
    const { student_id, video_id, answers } = req.body;

    if (!student_id || !video_id || !answers) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: student_id, video_id, answers'
      });
    }

    // Find the quiz for this video
    const quiz = Array.from(quizzes.values()).find(q => q.video_id === video_id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found for this video. Please generate a quiz first.'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passing_score;

    // Update student progress
    const progressKey = `${student_id}-${video_id}`;
    const existingProgress = studentProgress.get(progressKey);
    
    const progress = {
      id: existingProgress?.id || `progress-${uuidv4()}`,
      student_id,
      video_id,
      quiz_score: score,
      passed,
      attempts: (existingProgress?.attempts || 0) + 1,
      completed_at: passed ? new Date().toISOString() : existingProgress?.completed_at,
      last_watched_at: new Date().toISOString()
    };

    studentProgress.set(progressKey, progress);

    // Determine if student can proceed to next topic
    const video = videos.get(video_id);
    const topic = topics.get(video?.topic_id);
    const allTopics = Array.from(topics.values()).filter(t => t.course_id === topic?.course_id);
    const currentTopicIndex = allTopics.findIndex(t => t.id === topic?.id);
    const nextTopic = allTopics[currentTopicIndex + 1];
    const canProceed = passed && !!nextTopic;

    const responseMessage = passed 
      ? 'Congratulations! You passed the quiz. You can proceed to the next topic.'
      : 'You did not pass the quiz. Please re-watch the video and try again.';

    res.json({
      success: true,
      data: {
        score,
        passed,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        passing_score: quiz.passing_score,
        can_proceed: canProceed,
        next_topic_id: nextTopic?.id || null,
        message: responseMessage,
        needs_rewatch: !passed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate quiz'
    });
  }
});

// ------------------------------------------
// TOPIC ENDPOINTS
// ------------------------------------------

/**
 * GET /api/topics
 * Fetch all topics
 */
app.get('/api/topics', (req, res) => {
  try {
    const { course_id } = req.query;
    let topicList = Array.from(topics.values());
    
    if (course_id) {
      topicList = topicList.filter(t => t.course_id === course_id);
    }

    res.json({
      success: true,
      data: topicList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch topics'
    });
  }
});

/**
 * POST /api/topics
 * Create a new topic
 */
app.post('/api/topics', (req, res) => {
  try {
    const { title, course_id, description } = req.body;

    if (!title || !course_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, course_id'
      });
    }

    const topic = {
      id: `topic-${uuidv4()}`,
      title,
      course_id,
      description: description || '',
      created_at: new Date().toISOString()
    };

    topics.set(topic.id, topic);

    res.status(201).json({
      success: true,
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create topic'
    });
  }
});

// ------------------------------------------
// STUDENT PROGRESS ENDPOINTS
// ------------------------------------------

/**
 * GET /api/progress
 * Get student progress (for facilitators to monitor)
 * 
 * Query Parameters:
 * - student_id: Filter by student
 * - video_id: Filter by video
 */
app.get('/api/progress', (req, res) => {
  try {
    const { student_id, video_id } = req.query;
    
    let progressList = Array.from(studentProgress.values());

    if (student_id) {
      progressList = progressList.filter(p => p.student_id === student_id);
    }

    if (video_id) {
      progressList = progressList.filter(p => p.video_id === video_id);
    }

    // Enrich progress data with video and student info
    const enrichedProgress = progressList.map(progress => {
      const video = videos.get(progress.video_id);
      const student = users.get(progress.student_id);
      const topic = topics.get(video?.topic_id);
      
      return {
        ...progress,
        video_name: video?.file_name,
        video_url: video?.file_url,
        topic_name: topic?.title,
        student_name: student?.name,
        student_email: student?.email
      };
    });

    res.json({
      success: true,
      data: enrichedProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
});

/**
 * GET /api/students/:student_id/progress
 * Get progress for a specific student
 */
app.get('/api/students/:student_id/progress', (req, res) => {
  try {
    const { student_id } = req.params;
    
    const progressList = Array.from(studentProgress.values())
      .filter(p => p.student_id === student_id);

    const enrichedProgress = progressList.map(progress => {
      const video = videos.get(progress.video_id);
      const topic = topics.get(video?.topic_id);
      
      return {
        ...progress,
        video_name: video?.file_name,
        video_url: video?.file_url,
        topic_name: topic?.title,
        topic_id: topic?.id
      };
    });

    res.json({
      success: true,
      data: enrichedProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student progress'
    });
  }
});

// ------------------------------------------
// STUDENT ENDPOINTS
// ------------------------------------------

/**
 * GET /api/students
 * Get all students (for facilitators)
 */
app.get('/api/students', (req, res) => {
  try {
    const studentList = Array.from(users.values())
      .filter(u => u.role === 'student');

    // Enrich with progress stats
    const enrichedStudents = studentList.map(student => {
      const progressList = Array.from(studentProgress.values())
        .filter(p => p.student_id === student.id);
      
      const passedQuizzes = progressList.filter(p => p.passed).length;
      const totalAttempts = progressList.reduce((sum, p) => sum + p.attempts, 0);
      const averageScore = progressList.length > 0
        ? Math.round(progressList.reduce((sum, p) => sum + p.quiz_score, 0) / progressList.length)
        : 0;

      return {
        ...student,
        total_videos_watched: progressList.length,
        passed_quizzes: passedQuizzes,
        total_attempts: totalAttempts,
        average_score: averageScore
      };
    });

    res.json({
      success: true,
      data: enrichedStudents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    });
  }
});

/**
 * GET /api/students/:id
 * Get a specific student
 */
app.get('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const student = users.get(id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student'
    });
  }
});

// ------------------------------------------
// HEALTH CHECK
// ------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LMS Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LMS Backend Server running on http://localhost:${PORT}`);
  console.log(`📚 API Endpoints:`);
  console.log(`   - POST /api/media           - Upload video`);
  console.log(`   - GET  /api/media           - Fetch all videos`);
  console.log(`   - GET  /api/media/:id       - Fetch video by ID`);
  console.log(`   - POST /api/media/questions - Generate quiz questions`);
  console.log(`   - GET  /api/media/:video_id/questions - Get quiz questions`);
  console.log(`   - POST /api/quiz/submit     - Submit quiz and evaluate`);
  console.log(`   - GET  /api/topics          - Fetch all topics`);
  console.log(`   - POST /api/topics          - Create new topic`);
  console.log(`   - GET  /api/progress        - Get student progress`);
  console.log(`   - GET  /api/students        - Get all students`);
});

export default app;
