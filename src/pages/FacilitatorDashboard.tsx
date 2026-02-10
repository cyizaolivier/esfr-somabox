import React from 'react'
import { useLocation } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { BookOpen, Users, Star, Clock, PlayCircle, Plus } from 'lucide-react'

export const FacilitatorDashboard = () => {
  const location = useLocation()
  const isCoursesView = location.pathname === '/facilitator/courses'

  const stats = [
    { label: 'My Courses', value: '12', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Students', value: '840', icon: Users, color: 'bg-green-50 text-green-600' },
    { label: 'Avg. Rating', value: '4.9', icon: Star, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Hours Taught', value: '3,200', icon: Clock, color: 'bg-purple-50 text-purple-600' },
  ]

  const myCourses = [
    { id: 1, title: 'Advanced React Patterns', students: '240', progress: 85, image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400' },
    { id: 2, title: 'Fullstack Architecture', students: '180', progress: 70, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400' },
    { id: 3, title: 'UI/UX Design Systems', students: '320', progress: 95, image: 'https://images.unsplash.com/photo-1541462608141-ad43bddee296?auto=format&fit=crop&q=80&w=400' },
  ]

  return (
    <DashboardLayout title={isCoursesView ? "My Courses" : "Facilitator Dashboard"}>
      <div className="space-y-10">
        {!isCoursesView && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-sm font-bold text-gray-400">{stat.label}</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isCoursesView ? "All Created Courses" : "Manage Recent Courses"}
            </h2>
            {isCoursesView ? (
              <button className="flex items-center gap-2 px-6 py-2.5 bg-[#004D7A] text-white rounded-xl font-bold hover:bg-[#003A5C] transition-all">
                <Plus size={18} /> Create New Course
              </button>
            ) : (
              <button className="text-[#004D7A] font-bold text-sm hover:underline">View all courses</button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCourses.map((course) => (
              <div key={course.id} className="group cursor-pointer">
                <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#004D7A] shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                      <PlayCircle size={24} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#004D7A] transition-colors">{course.title}</h3>
                    <span className="text-xs font-bold text-gray-400">{course.students} Students</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#004D7A] rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#004D7A]">{course.progress}% Content Ready</span>
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
