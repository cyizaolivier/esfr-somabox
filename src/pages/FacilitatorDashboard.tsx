import React from 'react'
import { useLocation } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { BookOpen, Users, TrendingUp, Clock, PlayCircle, Plus, MessageSquare, Send, FileCheck } from 'lucide-react'

export const FacilitatorDashboard = () => {
  const location = useLocation()
  const isCoursesView = location.pathname === '/facilitator/courses'
  const [view, setView] = React.useState<'stats' | 'studentList' | 'messages'>('stats')

  const [studentCount, setStudentCount] = React.useState(0)

  React.useEffect(() => {
    const savedUsers = localStorage.getItem('soma_users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      setStudentCount(users.filter((u: any) => u.role === 'Student').length);
    }
  }, []);

  const stats = [
    { label: 'Total Courses', value: '0', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Students', value: studentCount.toLocaleString(), icon: Users, color: 'bg-green-50 text-green-600' },
    { label: 'Active Enrollments', value: '0', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
    { label: 'Completion Rate', value: '0%', icon: FileCheck, color: 'bg-orange-50 text-orange-600' },
  ]

  const myCourses = [
    { id: 1, title: 'Advanced React Patterns', students: '240', progress: 85, image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400' },
    { id: 2, title: 'Fullstack Architecture', students: '180', progress: 70, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400' },
    { id: 3, title: 'UI/UX Design Systems', students: '320', progress: 95, image: 'https://images.unsplash.com/photo-1541462608141-ad43bddee296?auto=format&fit=crop&q=80&w=400' },
  ]

  const recentMessages = [
    { id: 1, sender: 'John Doe', subject: 'Course Enrollment', preview: 'I would like to enroll in...', time: '2 hours ago', unread: true },
    { id: 2, sender: 'Jane Smith', subject: 'Quiz Question', preview: 'Can you clarify the answer...', time: '5 hours ago', unread: false },
    { id: 3, sender: 'Mike Johnson', subject: 'Module Completion', preview: 'I have completed the module...', time: '1 day ago', unread: false },
  ]

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
              <div key={msg.id} className={`p-6 hover:bg-primary/5 transition-colors cursor-pointer ${msg.unread ? 'bg-blue-50/30' : ''}`}>
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
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
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

  return (
    <DashboardLayout title={isCoursesView ? "My Courses" : "Facilitator Dashboard"}>
      <div className="space-y-10">
        {!isCoursesView && view === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                onClick={() => { 
                  if (stat.label === 'Total Students') setView('studentList'); 
                  if (stat.label === 'Active Enrollments') setView('studentList');
                }}
                className={`p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm hover:shadow-md transition-all ${['Total Students', 'Active Enrollments'].includes(stat.label) ? 'cursor-pointer group' : ''}`}
              >
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4 ${['Total Students', 'Active Enrollments'].includes(stat.label) ? 'group-hover:scale-110 transition-transform' : ''}`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-sm font-bold text-gray-400">{stat.label}</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{stat.value}</div>
              </div>
            ))}
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
                    <div key={msg.id} className={`p-4 hover:bg-primary/5 transition-colors cursor-pointer ${msg.unread ? 'bg-blue-50/30' : ''}`}>
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
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
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

        {/* Courses Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isCoursesView ? "All Created Courses" : "Manage Recent Courses"}
            </h2>
            {isCoursesView ? (
              <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all">
                <Plus size={18} /> Create New Course
              </button>
            ) : (
              <button className="text-primary font-bold text-sm hover:underline">View all courses</button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCourses.map((course) => (
              <div key={course.id} className="group cursor-pointer">
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
                    <span className="flex items-center gap-1"><Users size={14} /> {course.students} students</span>
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
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
