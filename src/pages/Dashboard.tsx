import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import Sidebar from '../components/Sidebar'
import { Bell, CheckSquare, MoreHorizontal, ClipboardList, Menu } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Load profile from localStorage if it exists
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('soma_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Swetha shankaresh',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      grade: 'S2'
    };
  });

  useEffect(() => {
    // Listen for storage changes to update profile in real-time if changed in settings
    const handleStorageChange = () => {
      const saved = localStorage.getItem('soma_profile');
      if (saved) setProfile(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const chats = [
    { id: 1, name: "Emma Kent", msg: "Hey...!", time: "12:00 AM", online: true, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100" },
    { id: 2, name: "Gren Harry", msg: "Hey...!", time: "12:00 AM", online: true, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" },
    { id: 3, name: "Sarah Lex", msg: "Hey...!", time: "12:00 AM", online: false, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" },
    { id: 4, name: "Hella Anna", msg: "Hey...!", time: "12:00 AM", online: false, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" },
    { id: 5, name: "Hart Kevin", msg: "Hey...!", time: "12:00 AM", online: false, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" },
    { id: 6, name: "Ava Gary", msg: "Hey...!", time: "12:00 AM", online: false, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" },
  ]

  const courses = [
    { id: 1, title: "English", progress: 45, image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400" },
    { id: 2, title: "Social Science", progress: 75, image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400" },
  ]

  const progressData = [
    { subject: "Chemistry", chapter: "Chapter 1", progress: 85 },
    { subject: "English", chapter: "Chapter 2", progress: 65 },
    { subject: "Mathematics", chapter: "Chapter 3", progress: 45 },
  ]

  return (
    <div className="flex min-h-screen bg-[#E5EBF1]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen w-full">
        <header className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-white/50 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] truncate">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={24} />
            </button>

            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-gray-200 lg:border-none">
              <img 
                src={profile.avatar} 
                alt="Profile" 
                className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer"
                onClick={() => navigate('/settings')}
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs md:text-sm font-bold text-gray-900 leading-none mb-1">{profile.name}</div>
                <div className="text-[10px] md:text-xs text-gray-500 font-medium text-left">{user?.role || 'Student'}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Insights Section */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-white/60">
              <h2 className="text-xl md:text-2xl font-bold text-[#4B5563] mb-6 md:mb-8">Insights</h2>
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="42%"
                      stroke="#F0F4F8"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="42%"
                      stroke="#22C55E"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray="264%"
                      strokeDashoffset={`${264 * (1 - 0.75)}%`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl md:text-4xl font-black text-[#22C55E]">75%</span>
                    <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Completion</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1 w-full space-y-4">
                  {[
                    { label: "Completed", value: "90%", color: "bg-[#0D9488]", icon: CheckSquare },
                    { label: "Not Started", value: "85%", color: "bg-[#F59E0B]", icon: MoreHorizontal },
                    { label: "Pending", value: "70%", color: "bg-[#A3B18A]", icon: ClipboardList },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                        <stat.icon size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs md:text-sm font-bold text-gray-400 text-left">{stat.label}</div>
                        <div className="text-base md:text-lg font-black text-gray-800 text-left">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Courses Section */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-white/60">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-[#4B5563]">Courses</h2>
                <button 
                  onClick={() => {
                    const grade = profile.grade || 'S2';
                    let initialPath = ['rwandan', 'secondary', grade];
                    if (grade.startsWith('P')) initialPath = ['rwandan', 'primary', grade];
                    if (grade.startsWith('Year')) initialPath = ['rwandan', 'university', grade];
                    navigate('/programs', { state: { initialPath } });
                  }}
                  className="text-[#004D7A] text-xs font-bold hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {courses.map(course => (
                  <div key={course.id} className="space-y-4">
                    <div className="relative aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-md">
                      <img src={course.image} className="w-full h-full object-cover" alt={course.title} />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-gray-700 text-sm md:text-base truncate">{course.title}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Area (Stacks on mobile) */}
          <div className="space-y-6 md:space-y-8">
            {/* Chats Section */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white/60">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Chats</h2>
                <button 
                  onClick={() => navigate('/messages')}
                  className="text-[#3B82F6] text-xs font-bold hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {chats.map(chat => (
                  <div 
                    key={chat.id} 
                    onClick={() => navigate('/messages')}
                    className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-all"
                  >
                    <div className="relative flex-shrink-0">
                      <img src={chat.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" alt={chat.name} />
                      {chat.online && (
                        <div className="absolute top-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-[#3B82F6] border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs md:text-sm font-bold text-gray-900 truncate">{chat.name}</h4>
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400">{chat.time}</span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-gray-500 truncate text-left">{chat.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Progress Section */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white/60">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6">Completion progress</h2>
              <div className="space-y-4 md:space-y-6">
                {progressData.map((item, i) => (
                  <div key={i} className="p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <div className="text-xs md:text-sm font-bold text-gray-900 leading-none">{item.subject}</div>
                        <div className="text-[9px] md:text-[10px] text-gray-400 font-medium">{item.chapter}</div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${item.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
