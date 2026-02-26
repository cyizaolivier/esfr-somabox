import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import Sidebar from '../components/Sidebar'
import { Bell, CheckSquare, MoreHorizontal, ClipboardList, Menu, Activity, Loader2, AlertCircle } from 'lucide-react'
import { getStudentProgressById } from '../api/progress.api'
import { getStudentProgress } from '../api/progress.api'
import { getAllCourses } from '../api/course.api'
interface CourseProgress {
  courseId: string;
  courseName: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'pending';
  lastUpdated: string;
}

interface StudentProgress {
  email: string;
  courses: CourseProgress[];
  loading: boolean;
  error: string | null;
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  // const [studentProgress, setStudentProgress] = useState<StudentProgress>([]);
  // Load profile from localStorage if it exists
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('soma_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse profile:', e);
    }

    // Fallback to user email for name if no profile exists
    return {
      name: user?.email?.split('@')[0] || 'User',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      grade: 'S2'
    };
  });

  useEffect(() => {
    // Listen for storage changes to update profile in real-time if changed in settings
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('soma_profile');
        if (saved) setProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse profile update:', e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Student progress state
  const [studentProgress, setStudentProgress] = useState<StudentProgress>({
    email: user?.email || '',
    courses: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const studentId = user?.id;
        if (!studentId) {
          throw new Error('No student ID found');
        }

        // Fetch progress and all courses to get details
        let [studentProgressData, allCourses] = await Promise.all([
          getStudentProgress(studentId),
          getAllCourses()
        ]);

        // Defensive check: if it's an object with a 'courses' property (old format), extract it
        if (studentProgressData && !Array.isArray(studentProgressData) && (studentProgressData as any).courses) {
          console.log('Migrating old progress object format to array');
          studentProgressData = (studentProgressData as any).courses;
        }

        // If still not an array, default to empty
        if (!Array.isArray(studentProgressData)) {
          studentProgressData = [];
        }

        const courses: CourseProgress[] = studentProgressData.map((item: any) => {
          const courseDetail = allCourses.find((c: any) => c.id === item.courseId);
          return {
            courseId: item.courseId,
            courseName: courseDetail?.title || `Course ${item.courseId.substring(0, 4)}`,
            courseImage: courseDetail?.coverPage || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400",
            progress: item.progress_percentage,
            status: item.status as 'completed' | 'in-progress' | 'pending',
            lastUpdated: new Date().toISOString()
          };
        });

        setStudentProgress(prev => ({
          ...prev,
          courses,
          loading: false,
          error: null
        }));
      } catch (err: any) {
        console.error('Failed to fetch progress:', err);
        setStudentProgress(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load progress data'
        }));
      }
    };

    if (user) {
      fetchProgress();
    }
  }, [user]);

  // Calculate real statistics
  const completedCount = studentProgress.courses.filter(c => c.status === 'completed').length;
  const pendingCount = studentProgress.courses.filter(c => c.status === 'pending').length;
  const inProgressCount = studentProgress.courses.filter(c => c.status === 'in-progress').length;
  const totalCourses = studentProgress.courses.length;
  const overallProgress = totalCourses > 0
    ? Math.round(studentProgress.courses.reduce((sum, c) => sum + c.progress, 0) / totalCourses)
    : 0;

  const chats = [
    { id: 1, name: "Maximillien (Facilitator)", msg: "Welcome to English Fundamentals!", time: "9:15 AM", online: true, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" },
    { id: 2, name: "SomaBox Team", msg: "New course materials are now available.", time: "Yesterday", online: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" },
    { id: 3, name: "Alice (S3 Student)", msg: "Did you find the notes for Biology?", time: "Mon", online: false, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" },
    { id: 4, name: "Assistant AI", msg: "You have an upcoming quiz in 2 hours.", time: "2:30 PM", online: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" },
  ]

  // Get real course data from progress
  const courses = studentProgress.courses
    .filter(c => c.status === 'in-progress' || c.status === 'completed' || c.status === 'pending')
    .slice(0, 4) // Show up to 4 real programs
    .map(c => ({
      id: c.courseId,
      title: (c as any).courseName, // Use the real title we mapped
      progress: c.progress,
      image: (c as any).courseImage || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400"
    }));

  // Get real progress data
  const progressData = studentProgress.courses
    .slice(0, 3)
    .map(c => ({
      subject: c.courseName,
      chapter: c.status === 'completed' ? 'Completed' : c.status === 'in-progress' ? 'In Progress' : 'Not Started',
      progress: c.progress
    }));

  // Show loading spinner while fetching progress data
  if (studentProgress.loading) {
    return (
      <div className="flex min-h-screen bg-primary-surface items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-primary" />
          <p className="text-gray-500 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state if fetching failed
  if (studentProgress.error) {
    return (
      <div className="flex min-h-screen bg-primary-surface">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <AlertCircle size={48} className="text-orange-400" />
            <h2 className="text-xl font-bold text-gray-800">Couldn't load your data</h2>
            <p className="text-gray-500 text-sm">The server might be offline. Your progress will appear once the connection is restored.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-primary-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto max-h-screen w-full flex flex-col">
        <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-primary text-white shadow-lg relative z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-white/80 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-black text-white truncate px-2">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative p-2 text-white/70 hover:text-white transition-colors">
              <Bell size={24} />
            </button>

            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-white/20 lg:border-none">
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-8 h-8 md:w-11 md:h-11 rounded-full object-cover border-2 border-white/30 shadow-sm cursor-pointer"
                onClick={() => navigate('/settings')}
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs md:text-sm font-bold text-white leading-none mb-1">{profile.name}</div>
                <div className="text-[10px] md:text-xs text-white/70 font-black text-left uppercase tracking-widest">{user?.role || 'Student'}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Insights Section */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-primary/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 md:mb-8 flex items-center gap-2">
                  <Activity size={20} className="text-primary" /> Insights
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                  {/* Circular Progress */}
                  <div className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="42%"
                        stroke="rgba(var(--primary-rgb), 0.05)"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="42%"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-primary"
                        strokeDasharray="264%"
                        strokeDashoffset={`${264 * (1 - overallProgress / 100)}%`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl md:text-4xl font-black text-primary">{overallProgress}%</span>
                      <span className="text-[10px] md:text-xs font-bold text-gray-400 gap-1 uppercase tracking-wider">Complete</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Completed", value: completedCount, total: totalCourses, color: "bg-primary/10 text-primary", icon: CheckSquare },
                      { label: "Pending", value: pendingCount, total: totalCourses, color: "bg-orange-500/10 text-orange-600", icon: ClipboardList },
                      { label: "In Progress", value: inProgressCount, total: totalCourses, color: "bg-blue-500/10 text-blue-600", icon: Activity },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/20 rounded-2xl border border-white/40">
                        <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <stat.icon size={18} className="md:w-5 md:h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">{stat.label}</div>
                          <div className="text-base md:text-lg font-black text-gray-800">
                            {stat.value} {stat.total > 0 && `/ ${stat.total}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Programs Section */}
              <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-primary/10 shadow-sm">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Programs</h2>
                  <button
                    onClick={() => {
                      const grade = profile.grade || 'S2';
                      let initialPath = ['rwandan', 'secondary', grade];
                      if (grade.startsWith('P')) initialPath = ['rwandan', 'primary', grade];
                      if (grade.startsWith('Year')) initialPath = ['rwandan', 'university', grade];
                      navigate('/programs', { state: { initialPath } });
                    }}
                    className="text-primary text-xs font-bold hover:underline"
                  >
                    View Library
                  </button>
                </div>
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-sm mb-2">No courses yet</div>
                    <div className="text-gray-500 text-xs">Enroll in a grade to start learning</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                    {courses.map(course => (
                      <div key={course.id} className="space-y-4 group cursor-pointer">
                        <div className="relative aspect-[16/9] rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500">
                          <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="px-1">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <span className="font-bold text-gray-800 text-sm md:text-base truncate">{course.title}</span>
                            <span className="text-[10px] font-black text-primary">{course.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-primary/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar Section */}
            <div className="space-y-6 md:space-y-8">
              {/* Messages */}
              <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-primary/10 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Messages</h2>
                  <button
                    onClick={() => navigate('/messages')}
                    className="text-primary text-xs font-bold hover:underline"
                  >
                    View Inbox
                  </button>
                </div>
                <div className="space-y-3">
                  {chats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => navigate('/messages')}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/40 transition-all cursor-pointer border border-transparent hover:border-primary/10 group"
                    >
                      <div className="relative flex-shrink-0">
                        <img src={chat.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white/50" alt={chat.name} />
                        {chat.online && (
                          <div className="absolute top-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-primary border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs md:text-sm font-bold text-gray-800 group-hover:text-primary transition-colors truncate">{chat.name}</h4>
                          <span className="text-[9px] md:text-[10px] font-bold text-gray-400">{chat.time}</span>
                        </div>
                        <p className="text-[10px] md:text-[11px] text-gray-500 truncate text-left">{chat.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance */}
              <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-primary/10 shadow-sm">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6">Performance</h2>
                {progressData.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-sm mb-2">No performance data yet</div>
                    <div className="text-gray-500 text-xs">Start learning to track your progress</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {progressData.map((item, i) => (
                      <div key={i} className="p-4 bg-primary-surface/40 rounded-[1.5rem] border border-primary/5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="text-left">
                            <div className="text-xs md:text-sm font-bold text-gray-800 leading-none">{item.subject}</div>
                            <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tight">{item.chapter}</div>
                          </div>
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {item.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-primary/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
