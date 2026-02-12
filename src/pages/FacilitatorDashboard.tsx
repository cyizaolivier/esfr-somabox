import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { BookOpen, Users, Star, Clock, PlayCircle } from 'lucide-react'
import { useAuth } from '../auth'

export const FacilitatorDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const isCoursesView = location.pathname === '/facilitator/courses'
  const [view, setView] = useState<'stats' | 'studentList'>('stats')
  const [studentCount, setStudentCount] = useState(0);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('soma_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: user?.email?.split('@')[0] || 'Facilitator',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    };
  });

  useEffect(() => {
    // Load student count
    const savedUsers = localStorage.getItem('soma_users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      setStudentCount(users.filter((u: any) => u.role === 'Student').length);
    }

    // Listen for profile changes
    const handleStorageChange = () => {
      const saved = localStorage.getItem('soma_profile');
      if (saved) setProfile(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [view]);

  const stats = [
    { label: 'My Courses', value: '0', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Students', value: studentCount.toLocaleString(), icon: Users, color: 'bg-green-50 text-green-600' },
    { label: 'Avg. Rating', value: '0.0', icon: Star, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Hours Taught', value: '0', icon: Clock, color: 'bg-purple-50 text-purple-600' },
  ]

  const myCourses = [
    { id: 1, title: 'Advanced React Patterns', students: '240', progress: 85, image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400' },
    { id: 2, title: 'Fullstack Architecture', students: '180', progress: 70, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400' },
    { id: 3, title: 'UI/UX Design Systems', students: '320', progress: 95, image: 'https://images.unsplash.com/photo-1541462608141-ad43bddee296?auto=format&fit=crop&q=80&w=400' },
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

  return (
    <DashboardLayout title={isCoursesView ? "My Courses" : "Facilitator Dashboard"}>
      <div className="space-y-10">
        {!isCoursesView && view === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                onClick={() => { if (stat.label === 'Active Students') setView('studentList'); }}
                className={`p-6 bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] shadow-sm hover:shadow-md transition-all ${stat.label === 'Active Students' ? 'cursor-pointer group' : ''}`}
              >
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4 ${stat.label === 'Active Students' ? 'group-hover:scale-110 transition-transform' : ''}`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-sm font-bold text-gray-400">{stat.label}</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {!isCoursesView && view === 'studentList' && <StudentList />}

        {/* Courses Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isCoursesView ? "All Created Courses" : "Manage Recent Courses"}
            </h2>
            {!isCoursesView && (
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
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <span className="text-[10px] font-extrabold text-primary">{course.progress}% Content Ready</span>
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
