import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { UserPlus, ShieldPlus, Users, Activity, CheckCircle } from 'lucide-react'
import { useAuth, UserRole } from '../auth'
import { createUser } from '../api/students.api'
import { api } from '../api/api'
export const AdminDashboard = () => {
  const { user, registerUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState<'stats' | 'addFacilitator' | 'addAdmin' | 'userList'>('stats')
  const [filterRole, setFilterRole] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('soma_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: user?.email?.split('@')[0] || 'Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    };
  });

  useEffect(() => {
    if (location.pathname === '/admin/add-facilitator') setView('addFacilitator')
    else if (location.pathname === '/admin/add-admin') setView('addAdmin')
    else if (view !== 'userList') setView('stats')
  }, [location])

  const [userStats, setUserStats] = useState({ students: 0, facilitators: 0, admins: 0 });
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const savedUsers = localStorage.getItem('soma_users');
    
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      
      setUserStats({
        students: users.filter((u: any) => u.role === 'Student').length,
        facilitators: users.filter((u: any) => u.role === 'Facilitator').length,
        admins: users.filter((u: any) => u.role === 'Admin').length
      });
    }

    // Listen for profile changes
    const handleStorageChange = () => {
      const saved = localStorage.getItem('soma_profile');
      if (saved) setProfile(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [view]);

  useEffect(() => {
    // Load users from localStorage (set during registration)
    const savedUsers = localStorage.getItem('soma_users');
    
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      setAllUsers(users);
      setUserStats({
        students: users.filter((u: any) => u.role === 'Student').length,
        facilitators: users.filter((u: any) => u.role === 'Facilitator').length,
        admins: users.filter((u: any) => u.role === 'Admin').length
      });
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
    { label: 'Total Students', value: userStats.students.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600', role: 'Student' },
    { label: 'Facilitators', value: userStats.facilitators.toLocaleString(), icon: Activity, color: 'bg-green-50 text-green-600', role: 'Facilitator' },
    { label: 'System Admins', value: userStats.admins.toLocaleString(), icon: ShieldPlus, color: 'bg-purple-50 text-purple-600', role: 'Admin' },
    { label: 'Active Sessions', value: '0', icon: CheckCircle, color: 'bg-orange-50 text-orange-600', role: null },
  ]

  const UserForm = ({ role }: { role: 'Facilitator' | 'Admin' }) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage(null);
      
      try {
        // Call API to create user via auth (saves to localStorage too)
        await registerUser(name, email, password, role as UserRole);
        setMessage({ type: 'success', text: `${role} account created successfully!` });
        
        // Refresh from localStorage
        setTimeout(() => {
          const savedUsers = localStorage.getItem('soma_users');
          if (savedUsers) {
            const users = JSON.parse(savedUsers);
            setAllUsers(users);
            setUserStats({
              students: users.filter((u: any) => u.role === 'Student').length,
              facilitators: users.filter((u: any) => u.role === 'Facilitator').length,
              admins: users.filter((u: any) => u.role === 'Admin').length
            });
          }
          navigate('/admin/dashboard');
        }, 1500);
      } catch (error: any) {
        // Show error message from API or fallback
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create account';
        setMessage({ type: 'error', text: errorMessage });
      } finally {
        setLoading(false);
      }
    }

    return (
      <div className="max-w-xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Add New {role}</h2>
          <p className="text-gray-500 text-sm">Create a new {role.toLowerCase()} account with full access.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-xl text-sm font-bold border flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-600 border-green-100' 
                : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} />
              {message.text}
            </div>
          )}
          <div className="space-y-2 text-left">
              <label className="text-sm font-bold text-gray-700 block">Full Name</label>
              <input 
                  className="w-full px-4 py-3 bg-white/40 border border-primary/10 rounded-2xl outline-none focus:border-primary transition-all font-medium"
                  required 
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
              />
          </div>
          <div className="space-y-2 text-left">
              <label className="text-sm font-bold text-gray-700 block">Email Address</label>
              <input 
                  type="email"
                  className="w-full px-4 py-3 bg-white/40 border border-primary/10 rounded-2xl outline-none focus:border-primary transition-all font-medium"
                  required 
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
          </div>
          <div className="space-y-2 text-left">
              <label className="text-sm font-bold text-gray-700 block">Initial Password</label>
              <input 
                  type="password"
                  className="w-full px-4 py-3 bg-white/40 border border-primary/10 rounded-2xl outline-none focus:border-primary transition-all font-medium"
                  required 
                  placeholder="Create temporary password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Creating...' : `Create ${role} Account`}
          </button>
        </form>
      </div>
    )
  }

  const UserList = ({ role }: { role: string | null }) => {
    // Use allUsers from API instead of localStorage
    const users = allUsers || [];
    const filteredUsers = role ? users.filter((u: any) => u.role === role) : users;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {role ? `${role}s` : 'All Users'} ({filteredUsers.length})
          </h2>
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
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filteredUsers.length > 0 ? filteredUsers.map((u: any, i: number) => (
                <tr 
                  key={i} 
                  onClick={() => setSelectedUser(u)}
                  className="hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-tight">
                        {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Active</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-gray-400 font-bold italic">
                    No {role?.toLowerCase() || 'users'} found (0)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const UserDetail = ({ user, onClose }: { user: any; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Role</label>
              <p className="text-gray-900 font-medium">{user.role}</p>
            </div>
            
            {user.name && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
                <p className="text-gray-900 font-medium">{user.name}</p>
              </div>
            )}
            
            {user.grade && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Grade</label>
                <p className="text-gray-900 font-medium">{user.grade}</p>
              </div>
            )}
            
            <div className="bg-green-50 rounded-2xl p-4">
              <label className="text-xs font-bold text-green-600 uppercase tracking-wider">Status</label>
              <p className="text-green-700 font-medium">Active</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full mt-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        <div className="flex gap-4 border-b border-gray-100 pb-2">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'stats' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => navigate('/admin/add-facilitator')}
            className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'addFacilitator' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Add Facilitator
          </button>
          <button 
            onClick={() => { setView('userList'); setFilterRole('Facilitator'); }}
            className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'userList' && filterRole === 'Facilitator' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            View Facilitators
          </button>
          <button 
            onClick={() => navigate('/admin/add-admin')}
            className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'addAdmin' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Add Admin
          </button>
        </div>

        {view === 'stats' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                onClick={() => { if (stat.role) { setView('userList'); setFilterRole(stat.role); } }}
                className="p-6 bg-primary-surface/40 rounded-[2rem] border border-primary/10 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-sm font-bold text-gray-400">{stat.label}</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
        ) : view === 'userList' ? (
          <UserList role={filterRole} />
        ) : (
          <UserForm role={view === 'addFacilitator' ? 'Facilitator' : 'Admin'} />
        )}
        
        {selectedUser && <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
