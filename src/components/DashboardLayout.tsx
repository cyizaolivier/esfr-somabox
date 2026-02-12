import React from 'react'
import Sidebar from './Sidebar'
import { Bell, Mail, Menu, User, LogOut } from 'lucide-react'
import { useAuth } from '../auth'
import { useNavigate } from 'react-router-dom'

interface DashboardLayoutProps {
  title: string
  children: React.ReactNode
}

export default function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [profile, setProfile] = React.useState(() => {
    const saved = localStorage.getItem('soma_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: user?.email.split('@')[0] || 'User',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
    };
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('soma_profile');
      if (saved) setProfile(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    signOut()
    navigate('/signin')
  }

  return (
    <div className="flex min-h-screen bg-primary-surface/30">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto max-h-screen w-full flex flex-col">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-primary text-white shadow-lg relative z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-white/80 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-black text-white truncate px-2">{title}</h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2 md:gap-4 text-white/70">
                <button className="hover:text-white transition-colors p-1"><Bell size={22} /></button>
                <button className="hover:text-white transition-colors p-1"><Mail size={22} /></button>
            </div>
            
            <div className="relative group">
              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-white/20 cursor-pointer" onClick={() => navigate('/settings')}>
                <div className="text-right hidden sm:block">
                  <div className="text-xs md:text-sm font-bold text-white leading-none">{profile.name}</div>
                  <div className="text-[10px] text-white/70 font-black uppercase mt-1 tracking-widest">{user?.role}</div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/30 shadow-sm overflow-hidden flex items-center justify-center bg-white/10">
                  <img src={profile.avatar} className="w-full h-full object-cover" alt="Profile" />
                </div>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-primary-surface rounded-2xl shadow-xl border border-primary/10 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User size={16} /> Profile Settings
                </button>
                <div className="h-px bg-gray-100 my-2" />
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8">
          <div className="bg-white/40 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] shadow-sm border border-primary/10 min-h-[calc(100vh-10rem)] p-6 md:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
