import React from 'react'
import Sidebar from './Sidebar'
import { Bell, Mail, Menu, User, LogOut } from 'lucide-react'
import { useAuth } from '../auth'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications.api'
import { parseJsonSafe } from '../utils/storage'

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
    const parsed = parseJsonSafe(saved, null);
    if (parsed) return parsed;

    return {
      name: user?.email?.split('@')[0] || 'User',
      avatar: ''
    };
  });

  const [notifications, setNotifications] = React.useState(() => getNotifications());
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);

  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('soma_profile');
      if (saved) {
        const parsed = parseJsonSafe(saved, null);
        if (parsed) setProfile(parsed);
      }
      setNotifications(getNotifications());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter(n => !n.read).length;

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-white/80 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            {/* SomaBox Logo + Name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-7 h-7 fill-white">
                  <path d="M20 5 L35 12.5 L35 27.5 L20 35 L5 27.5 L5 12.5 Z" className="opacity-20" />
                  <path d="M20 5 L35 12.5 L20 20 L5 12.5 Z" />
                  <path d="M5 15 L20 22.5 L35 15 L35 20 L20 27.5 L5 20 Z" className="opacity-80" />
                  <path d="M5 22.5 L20 30 L35 22.5 L35 27.5 L20 35 L5 27.5 Z" className="opacity-60" />
                </svg>
              </div>
              <span className="text-lg font-black text-white tracking-tight">SomaBox</span>
            </div>
            {/* Separator + Page Title */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="w-px h-6 bg-white/30" />
              <h1 className="text-base md:text-lg font-semibold text-white/80 truncate">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2 md:gap-4 text-white/70">
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="hover:text-white transition-colors p-1 relative"
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border border-primary">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                      <button
                        onClick={() => { markAllAsRead(); setNotifications(getNotifications()); }}
                        className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-xs text-gray-400 font-medium italic">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => { markAsRead(n.id); setNotifications(getNotifications()); }}
                            className={`px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-black uppercase tracking-tighter ${n.type === 'COURSE_COMPLETED' ? 'text-green-600' : 'text-primary'}`}>
                                {n.type.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 truncate">{n.title}</h4>
                            <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button className="hover:text-white transition-colors p-1"><Mail size={22} /></button>
            </div>

            <div className="relative group">
              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-white/20 cursor-pointer" onClick={() => navigate('/settings')}>
                <div className="text-right hidden sm:block">
                  <div className="text-xs md:text-sm font-bold text-white leading-none">{profile.name}</div>
                  <div className="text-[10px] text-white/70 font-black uppercase mt-1 tracking-widest">{user?.role}</div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/30 shadow-sm overflow-hidden flex items-center justify-center bg-white/20">
                  {profile.avatar
                    ? <img src={profile.avatar} className="w-full h-full object-cover" alt="Profile" />
                    : <span className="text-sm font-black text-white uppercase">{profile.name?.charAt(0) || 'U'}</span>
                  }
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
