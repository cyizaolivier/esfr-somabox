import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Upload, 
  Plus, 
  Eye, 
  FileQuestion, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { 
  MediaItem, 
  Topic, 
  Quiz, 
  uploadVideo, 
  fetchVideos, 
  fetchTopics, 
  generateQuizQuestions,
  fetchQuizQuestions,
  fetchStudentProgress,
  StudentProgress
} from '../api/media.api';

interface VideoManagementProps {
  courseId?: string;
}

// Helper to get item properties safely
const getItemTitle = (item: any) => item.title || item.file_name || 'Untitled';
const getItemDescription = (item: any) => item.description;
const getItemFileName = (item: any) => item.file_name;
const getItemDuration = (item: any) => item.duration || 0;
const isVideoType = (item: any) => !!item.file_name;

// Helper functions to check item types
const isContentType = (item: any): boolean => {
  return 'title' in item && !!item.title;
};

const isVideoItem = (item: any): boolean => {
  return 'file_name' in item && !!item.file_name;
};

export const VideoManagement: React.FC<VideoManagementProps> = ({ courseId }) => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [contentType, setContentType] = useState<'video' | 'text'>('video');

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file_name: '',
    file_url: '',
    topic_id: '',
    file_types: ['video/mp4'],
    duration: 300,
    content_type: 'text'
  });

  // Fetch videos and topics
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedMedia, fetchedTopics] = await Promise.all([
          fetchVideos(),
          fetchTopics(courseId)
        ]);
        setMediaItems(fetchedMedia as MediaItem[]);
        setTopics(fetchedTopics);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  // Handle content type change
  const handleContentTypeChange = (type: 'video' | 'text') => {
    setContentType(type);
    setUploadForm({
      ...uploadForm,
      content_type: type,
      file_name: type === 'text' ? '' : uploadForm.file_name,
      file_url: type === 'text' ? '' : uploadForm.file_url,
      duration: type === 'text' ? 0 : uploadForm.duration
    });
  };

  // Handle video/content upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const payload = contentType === 'text' 
        ? {
            title: uploadForm.title,
            description: uploadForm.description,
            topic_id: uploadForm.topic_id,
            content_type: 'text',
            file_url: uploadForm.file_url || undefined,
            duration: uploadForm.duration || 0
          }
        : {
            file_name: uploadForm.file_name,
            file_url: uploadForm.file_url,
            topic_id: uploadForm.topic_id,
            file_types: uploadForm.file_types,
            duration: uploadForm.duration
          };

      const result = await uploadVideo(payload);
      if (result.success && result.data) {
        setMediaItems([result.data as MediaItem, ...mediaItems]);
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          description: '',
          file_name: '',
          file_url: '',
          topic_id: '',
          file_types: ['video/mp4'],
          duration: 300,
          content_type: 'text'
        });
      } else {
        alert(result.error || 'Failed to upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  // Handle quiz generation
  const handleGenerateQuiz = async (videoId: string) => {
    setGeneratingQuiz(videoId);
    try {
      const result = await generateQuizQuestions(videoId);
      if (result.success && result.data) {
        setQuizData(result.data);
        setShowQuizModal(true);
      } else {
        alert(result.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      alert('Failed to generate quiz');
    } finally {
      setGeneratingQuiz(null);
    }
  };

  // Handle view quiz
  const handleViewQuiz = async (videoId: string) => {
    try {
      const quiz = await fetchQuizQuestions(videoId);
      if (quiz) {
        setQuizData(quiz);
        setShowQuizModal(true);
      } else {
        alert('No quiz found for this video. Generate one first.');
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    }
  };

  // Handle view student progress
  const handleViewProgress = async (videoId: string) => {
    try {
      const progress = await fetchStudentProgress({ video_id: videoId });
      setStudentProgress(progress);
      setShowProgressModal(true);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  // Get topic name by ID
  const getTopicName = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    return topic?.title || 'Unknown Topic';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlayCircle className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Content Management</h2>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Content
        </button>
      </div>

      {/* Content List */}
      {mediaItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No content added yet</p>
          <p className="text-sm text-gray-400">Click "Add Content" to add videos or text lessons</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {mediaItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {isContentType(item) || !isVideoType(item) ? (
                    <FileText className="w-8 h-8 text-green-600 mt-1" />
                  ) : (
                    <PlayCircle className="w-8 h-8 text-blue-600 mt-1" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {getItemTitle(item)}
                    </h3>
                    {getItemDescription(item) && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {getItemDescription(item)}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Topic: {getTopicName(item.topic_id)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {isVideoType(item) && getItemFileName(item) && (
                        <span className="flex items-center gap-1">
                          <PlayCircle className="w-4 h-4" />
                          {Math.floor(getItemDuration(item) / 60)}:{(getItemDuration(item) % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        isContentType(item) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isContentType(item) ? 'Text Lesson' : 'Video'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isVideoType(item) && getItemFileName(item) && (
                    <>
                      <button
                        onClick={() => handleViewQuiz(item.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Quiz"
                      >
                        <FileQuestion className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleGenerateQuiz(item.id)}
                        disabled={generatingQuiz === item.id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Generate Quiz"
                      >
                        {generatingQuiz === item.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleViewProgress(item.id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Student Progress"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Educational Content</h3>
            
            {/* Content Type Selector */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => handleContentTypeChange('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${
                  contentType === 'text'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5" />
                Text Lesson
              </button>
              <button
                type="button"
                onClick={() => handleContentTypeChange('video')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${
                  contentType === 'video'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <PlayCircle className="w-5 h-5" />
                Video
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Title (for text content) */}
              {contentType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Introduction to Algebra"
                    required={contentType === 'text'}
                  />
                </div>
              )}

              {/* Description (for text content) */}
              {contentType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Content / Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Write your lesson content here... You can include detailed explanations, examples, and notes."
                    rows={6}
                    required={contentType === 'text'}
                  />
                </div>
              )}

              {/* Video Title (for video content) */}
              {contentType === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={uploadForm.file_name}
                    onChange={(e) => setUploadForm({ ...uploadForm, file_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Introduction to Algebra"
                    required={contentType === 'video'}
                  />
                </div>
              )}

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {contentType === 'text' ? 'Video URL (Optional)' : 'Video URL'}
                </label>
                <input
                  type="url"
                  value={uploadForm.file_url}
                  onChange={(e) => setUploadForm({ ...uploadForm, file_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={contentType === 'text' 
                    ? "https://example.com/video.mp4 (optional)" 
                    : "https://example.com/videos/intro.mp4"}
                  required={contentType === 'video'}
                />
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <select
                  value={uploadForm.topic_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, topic_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a topic</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration (for video) */}
              {contentType === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={uploadForm.duration}
                    onChange={(e) => setUploadForm({ ...uploadForm, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="300"
                    min="0"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {contentType === 'text' ? 'Add Lesson' : 'Upload Video'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && quizData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quiz Questions</h3>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {quizData.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-800 mb-3">
                    {index + 1}. {question.question}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className={`p-2 rounded ${
                          optIndex === question.correct_answer 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {optIndex === question.correct_answer && (
                          <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />
                        )}
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Passing Score: {quizData.passing_score}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Student Progress</h3>
              <button
                onClick={() => setShowProgressModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            {studentProgress.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No student progress yet</p>
            ) : (
              <div className="space-y-3">
                {studentProgress.map((progress) => (
                  <div 
                    key={progress.id} 
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {progress.student_name || 'Unknown Student'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {progress.student_email || ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          progress.passed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {progress.quiz_score}%
                        </div>
                        <div className="text-sm text-gray-500">
                          Attempts: {progress.attempts}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {progress.passed ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Passed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <XCircle className="w-4 h-4" />
                          Needs Improvement
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagement;
