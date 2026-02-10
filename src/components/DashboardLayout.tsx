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

  const handleLogout = () => {
    signOut()
    navigate('/signin')
  }

  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen w-full">
        {/* Top Navbar */}
        <header className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-white/50 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{title}</h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2 md:gap-4 text-gray-400">
                <button className="hover:text-gray-600 transition-colors p-1"><Bell size={22} /></button>
                <button className="hover:text-gray-600 transition-colors p-1"><Mail size={22} /></button>
            </div>
            
            <div className="relative group">
              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-gray-200 cursor-pointer">
                <div className="text-right hidden sm:block">
                  <div className="text-xs md:text-sm font-bold text-gray-900 leading-none">{user?.email.split('@')[0]}</div>
                  <div className="text-[10px] text-[#004D7A] font-extrabold uppercase mt-1 tracking-wider">{user?.role}</div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#004D7A]/10 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-[#004D7A]">
                  <User size={20} />
                </div>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
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
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 min-h-[calc(100vh-10rem)] p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
