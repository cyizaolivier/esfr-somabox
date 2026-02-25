import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../auth'
import { BookOpen, Users, TrendingUp, Clock, PlayCircle, Plus, MessageSquare, Send, FileCheck, MessageCircle, Star, Loader2 } from 'lucide-react'
import { getMyCourses, Course } from '../api/course.api'
import { getAllStudents } from '../api/course.api'
import { getAllProgress } from '../api/progress.api'

// Comment interface
interface Comment {
  id: string
  courseId: string
  author: string
  authorEmail: string
  content: string
  timestamp: string
  replies: Reply[]
}

interface Reply {
  id: string
  author: string
  authorEmail: string
  content: string
  timestamp: string
}

export const FacilitatorDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isCoursesView = location.pathname === '/facilitator/courses'
  const [view, setView] = useState<'stats' | 'studentList' | 'messages' | 'comments' | 'courseStudents'>('stats')
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<{id: string, title: string} | null>(null)

  const [studentCount, setStudentCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [newReply, setNewReply] = useState('')
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState<any[]>([])

  // Fetch facilitator's courses
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true)
        const courses = await getMyCourses()
        setMyCourses(courses)
      } catch (err) {
        console.error('Failed to fetch courses:', err)
        setMyCourses([])
      } finally {
        setLoading(false)
      }
    }

    if (user?.email) {
      fetchMyCourses()
    } else {
      setLoading(false)
    }
  }, [user, location.pathname])

  useEffect(() => {
    const loadStudentCount = async () => {
      try {
        // Try to get students from API first
        const apiStudents = await getAllStudents()
        if (apiStudents && apiStudents.length > 0) {
          setStudentCount(apiStudents.length)
        } else {
          // Fallback to localStorage
          const savedUsers = localStorage.getItem('soma_users');
          if (savedUsers) {
            const users = JSON.parse(savedUsers);
            setStudentCount(users.filter((u: any) => u.role === 'Student').length);
          }
        }
      } catch (error) {
        console.error('Failed to load students from API:', error)
        // Fallback to localStorage
        const savedUsers = localStorage.getItem('soma_users');
        if (savedUsers) {
          const users = JSON.parse(savedUsers);
          setStudentCount(users.filter((u: any) => u.role === 'Student').length);
        }
      }
    }

    const loadProgress = async () => {
      try {
        const progress = await getAllProgress()
        if (progress) {
          setProgressData(progress)
        }
      } catch (error) {
        console.error('Failed to load progress:', error)
      }
    }

    loadStudentCount()
    loadProgress()

    // Load comments from localStorage
    const savedComments = localStorage.getItem('soma_course_comments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  useEffect(() => {
    // Save comments to localStorage whenever they change
    localStorage.setItem('soma_course_comments', JSON.stringify(comments));
  }, [comments]);

  // Calculate completion rate from progress data
  const completionRate = React.useMemo(() => {
    if (progressData.length === 0) return 0;
    let totalProgress = 0;
    let count = 0;
    progressData.forEach((student: any) => {
      if (student.courses) {
        student.courses.forEach((course: any) => {
          totalProgress += course.progress || 0;
          count++;
        });
      }
    });
    return count > 0 ? Math.round(totalProgress / count) : 0;
  }, [progressData]);

  const stats = [
    { label: 'Total Courses', value: myCourses.length.toString(), icon: BookOpen, color: 'bg-primary-surface text-primary' },
    { label: 'Total Students', value: studentCount.toLocaleString(), icon: Users, color: 'bg-green-50 text-green-600' },
    { label: 'Active Enrollments', value: myCourses.reduce((acc, c) => acc + (c.students || 0), 0).toString(), icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: FileCheck, color: 'bg-orange-50 text-orange-600' },
  ]

  const recentMessages = [
    { id: 1, sender: 'John Doe', subject: 'Course Enrollment', preview: 'I would like to enroll in...', time: '2 hours ago', unread: true },
    { id: 2, sender: 'Jane Smith', subject: 'Quiz Question', preview: 'Can you clarify the answer...', time: '5 hours ago', unread: false },
    { id: 3, sender: 'Mike Johnson', subject: 'Module Completion', preview: 'I have completed the module...', time: '1 day ago', unread: false },
  ]

  // Format courses for display
  const formattedCourses = myCourses.map(course => ({
    id: course.id,
    title: course.title,
    students: course.students?.toString() || '0',
    progress: 0,
    image: course.coverPage || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400'
  }))

  const StudentList = () => {
    const savedUsers = localStorage.getItem('soma_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const students = users.filter((u: any) => u.role === 'Student');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Enrolled Students ({students.length})</h2>
          <button
            onClick={() => setView('stats')}
            className="text-primary font-bold text-sm hover:underline"
          >
            Back to Overview
          </button>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5">
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {students.length > 0 ? students.map((u: any, i: number) => (
                <tr key={i} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.email}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Active</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} className="px-6 py-20 text-center text-gray-400 font-bold italic">
                    No students currently enrolled (0)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const RecentMessages = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recent Messages</h2>
          <button
            onClick={() => setView('stats')}
            className="text-primary font-bold text-sm hover:underline"
          >
            Back to Overview
          </button>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
          <div className="divide-y divide-primary/5">
            {recentMessages.length > 0 ? recentMessages.map((msg) => (
              <div key={msg.id} className={`p-6 hover:bg-primary/5 transition-colors cursor-pointer ${msg.unread ? 'bg-primary-surface/30' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {msg.sender.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={`font-semibold ${msg.unread ? 'text-gray-900' : 'text-gray-700'}`}>{msg.sender}</h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">{msg.time}</span>
                    </div>
                    <p className={`text-sm ${msg.unread ? 'font-medium text-gray-900' : 'text-gray-600'} mt-0.5`}>{msg.subject}</p>
                    <p className="text-sm text-gray-400 truncate mt-1">{msg.preview}</p>
                  </div>
                  {msg.unread && (
                    <span className="w-2 h-2 bg-primary-light rounded-full flex-shrink-0 mt-2"></span>
                  )}
                </div>
              </div>
            )) : (
              <div className="px-6 py-20 text-center text-gray-400 font-bold italic">
                No messages yet
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const CourseComments = () => {
    const handleAddReply = (commentId: string) => {
      if (!newReply.trim() || !user) return;

      const reply: Reply = {
        id: Date.now().toString(),
        author: user.email?.split('@')[0] || 'Facilitator',
        authorEmail: user.email || 'facilitator@example.com',
        content: newReply,
        timestamp: new Date().toLocaleString()
      };

      setComments(prev => prev.map(c =>
        c.id === commentId
          ? { ...c, replies: [...c.replies, reply] }
          : c
      ));
      setNewReply('');
    };

    const selectedCourseComments = comments.filter(c => c.courseId === selectedCourseId);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Course Comments</h2>
          <button
            onClick={() => { setView('stats'); setSelectedCourseId(null); }}
            className="text-primary font-bold text-sm hover:underline"
          >
            Back to Overview
          </button>
        </div>

        {/* Course Selector */}
        <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-6">
          <h3 className="font-bold text-gray-900 mb-4">Select a Course</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
              <span className="ml-2 text-gray-500">Loading courses...</span>
            </div>
          ) : formattedCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
              <p>No courses yet. Create your first course to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {formattedCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`p-4 rounded-xl border transition-all ${selectedCourseId === course.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white/40 border-primary/10 hover:border-primary/30'
                    }`}
                >
                  <p className="font-bold text-sm truncate">{course.title}</p>
                  <p className={`text-xs mt-1 ${selectedCourseId === course.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {comments.filter(c => c.courseId === course.id).length} comments
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comments List */}
        {selectedCourseId && (
          <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
            <div className="p-6 bg-primary/5 border-b border-primary/10">
              <h3 className="font-bold text-gray-900">
                {formattedCourses.find(c => c.id === selectedCourseId)?.title || 'Course'} - Comments
              </h3>
            </div>

            <div className="divide-y divide-primary/5">
              {selectedCourseComments.length > 0 ? (
                selectedCourseComments.map((comment) => (
                  <div key={comment.id} className="p-6">
                    {/* Main Comment */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{comment.author}</span>
                          <span className="text-xs text-gray-400">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="ml-14 mt-4 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {reply.author.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900">{reply.author}</span>
                                <span className="text-xs text-gray-400">{reply.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-600">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    <div className="ml-14 mt-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddReply(comment.id)}
                        className="flex-1 bg-white/60 border border-primary/10 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-all flex items-center gap-2"
                      >
                        <Send size={14} /> Reply
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-20 text-center text-gray-400 font-bold italic">
                  No comments yet. Students can add comments when they enroll in this course.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Get total comment count
  const totalComments = comments.length
  
  // Get students enrolled in a specific course
  const getStudentsForCourse = (courseId: string) => {
    const savedEnrollments = localStorage.getItem('soma_enrollments');
    const savedUsers = localStorage.getItem('soma_users');
    
    if (savedEnrollments) {
      const enrollments = JSON.parse(savedEnrollments);
      const courseEnrollments = enrollments.filter((e: any) => e.courseId === courseId);
      
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        return courseEnrollments.map((e: any) => {
          const user = users.find((u: any) => u.id === e.studentId || u.email === e.studentEmail);
          return {
            id: e.studentId,
            name: e.studentName || user?.name || e.studentEmail?.split('@')[0] || 'Student',
            email: e.studentEmail || user?.email || '',
            enrolledAt: e.enrolledAt || e.createdAt || new Date().toISOString()
          };
        });
      }
      return courseEnrollments.map((e: any) => ({
        id: e.studentId,
        name: e.studentName || 'Student',
        email: e.studentEmail || '',
        enrolledAt: e.enrolledAt || e.createdAt || new Date().toISOString()
      }));
    }
    return [];
  };

  // Course Students View Component
  const CourseStudentsView = () => {
    const courseStudents = selectedCourseForStudents ? getStudentsForCourse(selectedCourseForStudents.id) : [];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Students in Course</h2>
            <p className="text-gray-500 mt-1">{selectedCourseForStudents?.title}</p>
          </div>
          <button
            onClick={() => { setView('stats'); setSelectedCourseForStudents(null); }}
            className="text-primary font-bold text-sm hover:underline"
          >
            Back to Overview
          </button>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
          {courseStudents.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5">
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {courseStudents.map((student: any, i: number) => (
                  <tr key={i} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(student.enrolledAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-20 text-center text-gray-400 font-bold italic">
              No students enrolled in this course yet
            </div>
          )}
        </div>
      </div>
    );
  };

  // Navigate to course outline when clicking on a course
  const handleCourseClick = (courseId: string) => {
    navigate(`/facilitator/course-outline/${courseId}`)
  }

  // Handle clicking on student count to see students
  const handleStudentCountClick = (course: {id: string, title: string}, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCourseForStudents(course);
    setView('courseStudents');
  }

  return (
    <DashboardLayout title={isCoursesView ? "My Courses" : "Facilitator Dashboard"}>
      <div className="space-y-10">
        {!isCoursesView && view === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                onClick={() => {
                  if (stat.label === 'Total Courses') navigate('/facilitator/courses');
                }}
                className={`p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm hover:shadow-md transition-all ${stat.label === 'Total Courses' ? 'cursor-pointer group' : ''}`}
              >
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4 ${stat.label === 'Total Courses' ? 'group-hover:scale-110 transition-transform' : ''}`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-sm font-bold text-gray-400">{stat.label}</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{stat.value}</div>
              </div>
            ))}

            {/* Comments Card */}
            <div
              className="p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle size={24} />
              </div>
              <div className="text-sm font-bold text-gray-400">Course Comments</div>
              <div className="text-2xl font-black text-gray-900 mt-1">{totalComments}</div>
            </div>
          </div>
        )}

        {!isCoursesView && view === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Messages Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
                <button
                  onClick={() => setView('messages')}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
                <div className="divide-y divide-primary/5">
                  {recentMessages.slice(0, 3).map((msg) => (
                    <div key={msg.id} className={`p-4 hover:bg-primary/5 transition-colors cursor-pointer ${msg.unread ? 'bg-primary-surface/30' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {msg.sender.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={`text-sm ${msg.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{msg.sender}</h3>
                            <span className="text-xs text-gray-400 flex-shrink-0">{msg.time}</span>
                          </div>
                          <p className={`text-xs ${msg.unread ? 'font-medium text-gray-900' : 'text-gray-600'} mt-0.5 truncate`}>{msg.subject}</p>
                        </div>
                        {msg.unread && (
                          <span className="w-2 h-2 bg-primary-light rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats / Progress Overview */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Quick Overview</h2>
              </div>

              <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Course Completion Rate</span>
                    <span className="font-bold text-primary">75%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Active Students This Week</span>
                    <span className="font-bold text-green-600">128</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Pending Quiz Reviews</span>
                    <span className="font-bold text-orange-600">12</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isCoursesView && view === 'studentList' && <StudentList />}
        {!isCoursesView && view === 'messages' && <RecentMessages />}
        {!isCoursesView && view === 'comments' && <CourseComments />}
        {view === 'courseStudents' && <CourseStudentsView />}

        {/* Courses Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isCoursesView ? "All Created Courses" : "Recent Courses"}
            </h2>
            <div className="flex items-center gap-4">
              {isCoursesView && (
                <button
                  onClick={() => navigate('/facilitator/create-course')}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-md active:scale-95"
                >
                  <Plus size={18} />
                  <span>Create New Course</span>
                </button>
              )}
              {!isCoursesView && (
                <button className="text-primary font-bold text-sm hover:underline">View all courses</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="ml-3 text-gray-500">Loading your courses...</span>
              </div>
            ) : formattedCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">No Courses Yet</h3>
                <p className="text-gray-500 mb-4">You haven't created any courses yet. Create your first course to get started.</p>
                <button 
                 onClick={() => navigate('/facilitator/create-course')}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all">
                  Create Your First Course
                </button>
              </div>
            ) : (
              formattedCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="group cursor-pointer"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-12 h-12 bg-primary-surface rounded-full flex items-center justify-center text-primary shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                        <PlayCircle size={24} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 truncate">{course.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button 
                        onClick={(e) => handleStudentCountClick({id: course.id, title: course.title}, e)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Users size={14} /> 
                        <span>{course.students} students</span>
                      </button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] font-extrabold text-primary">{course.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default FacilitatorDashboard