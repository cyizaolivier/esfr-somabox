import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import Sidebar from '../components/Sidebar'
import { Bell, Search, PlayCircle, BookOpen, Clock, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()

  const courses = [
    {
      id: 1,
      title: "Introduction to User Experience",
      instructor: "Dr. Sarah Johnson",
      progress: 65,
      image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=400",
      category: "Design"
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      instructor: "Michael Chen",
      progress: 30,
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400",
      category: "Development"
    },
    {
        id: 3,
        title: "Global Education Systems",
        instructor: "Prof. Alan Smith",
        progress: 90,
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400",
        category: "Education"
      }
  ]

  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, let's continue learning!</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search for courses..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004D7A]/20 w-64 transition-all"
              />
            </div>
            
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">Swetha shankaresh</div>
                <div className="text-xs text-gray-500 font-medium">{user?.email?.split('@')[0]} (Student)</div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </header>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
          {/* Main Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 bg-[#004D7A] rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-sm">
                    <h2 className="text-2xl font-bold mb-4">Complete your project for Modern UI Design</h2>
                    <p className="opacity-80 mb-6 text-sm">You've completed 75% of your weekly goal. Just 2 more lessons to go!</p>
                    <button className="bg-[#F4A261] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#e76f51] transition-all flex items-center gap-2">
                        <PlayCircle size={20} />
                        Continue Learning
                    </button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-8 translate-y-8">
                    <BookOpen size={200} />
                </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900">Next Lecture</h3>
                    <span className="text-xs text-[#004D7A] font-bold">14:00 PM</span>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-[#B8D8E9] rounded-xl flex items-center justify-center text-[#004D7A]">
                            <PlayCircle size={24} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900 leading-none mb-1">Typography Basics</div>
                            <div className="text-[10px] text-gray-500">UX Design Foundations</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 px-2">
                        <Clock size={16} />
                        <span>Starts in 45 minutes</span>
                    </div>
                    <button className="w-full py-3 text-sm font-bold text-[#004D7A] hover:bg-gray-100 rounded-xl transition-all">
                        View Schedule
                    </button>
                </div>
            </div>
          </div>

          {/* Courses Section */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Your Active Courses</h2>
            <button className="text-[#004D7A] text-sm font-bold flex items-center gap-1 hover:underline">
                View All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {courses.map(course => (
                 <div key={course.id} className="group cursor-pointer">
                    <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                        <img src={course.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={course.title} />
                        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-[#004D7A]">
                            {course.category}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-[#004D7A] transition-colors mb-1">{course.title}</h4>
                        <p className="text-xs text-gray-500 mb-4">{course.instructor}</p>
                        
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-[#004D7A]">{course.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#004D7A] rounded-full transition-all duration-1000" 
                                    style={{ width: `${course.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                 </div>
             ))}
          </div>
        </div>
      </main>
    </div>
  )
}


