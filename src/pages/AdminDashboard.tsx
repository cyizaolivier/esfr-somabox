import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { UserPlus, ShieldPlus, Users, Activity, CheckCircle, BookOpen, TrendingUp } from 'lucide-react'
import { useAuth, UserRole } from '../auth'
import { getAllCourses } from '../api/course.api'
import { parseJsonSafe } from '../utils/storage'

// ── Tiny SVG Donut (no deps) ─────────────────────────────────────────────────
const DonutChart = ({ segments }: { segments: { value: number; color: string; label: string }[] }) => {
  const total = segments.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <p className="text-center text-gray-300 text-sm py-6 italic">No users yet</p>
  const R = 52; const cx = 64; const cy = 64; const circ = 2 * Math.PI * R
  let cumulative = 0
  const arcs = segments.map(seg => {
    const dash = (seg.value / total) * circ
    const arc = { ...seg, dash, offset: -cumulative * circ / total }
    cumulative += seg.value / total
    return arc
  })
  return (
    <div className="flex items-center gap-6">
      <svg width={128} height={128} viewBox="0 0 128 128" className="flex-shrink-0">
        {arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={arc.color} strokeWidth={22}
            strokeDasharray={`${arc.dash} ${circ}`} strokeDashoffset={arc.offset - circ / 4}
            style={{ transition: 'stroke-dasharray 0.7s ease' }} />
        ))}
        <circle cx={cx} cy={cy} r={40} fill="white" />
        <text x="64" y="60" textAnchor="middle" fontSize="18" fontWeight="900" fill="#111827">{total}</text>
        <text x="64" y="76" textAnchor="middle" fontSize="9" fill="#9CA3AF">total users</text>
      </svg>
      <div className="space-y-2.5 flex-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-sm text-gray-600">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%`, background: s.color }} />
              </div>
              <span className="text-sm font-black text-gray-900 w-4 text-right">{s.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tiny Bar Chart ───────────────────────────────────────────────────────────
const BarChart = ({ bars }: { bars: { label: string; value: number; color: string }[] }) => {
  const max = Math.max(...bars.map(b => b.value), 1)
  return (
    <div className="space-y-3">
      {bars.map((b, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-600 truncate max-w-[140px]">{b.label}</span>
            <span className="font-black text-gray-900">{b.value}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(b.value / max) * 100}%`, background: b.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export const AdminDashboard = () => {
  const { user, registerUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState<'stats' | 'addFacilitator' | 'addAdmin' | 'userList'>('stats')
  const [filterRole, setFilterRole] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('soma_profile');
    if (saved) return parseJsonSafe(saved, { name: user?.email?.split('@')[0] || 'Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' });
    return { name: user?.email?.split('@')[0] || 'Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' };
  });

  const [userStats, setUserStats] = useState({ students: 0, facilitators: 0, admins: 0 });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    if (location.pathname === '/admin/add-facilitator') setView('addFacilitator')
    else if (location.pathname === '/admin/add-admin') setView('addAdmin')
    else if (view !== 'userList') setView('stats')
  }, [location])

  useEffect(() => {
    const savedUsers = localStorage.getItem('soma_users');
    if (savedUsers) {
      const users = parseJsonSafe<any[]>(savedUsers, []);
      setAllUsers(users);
      setUserStats({
        students: users.filter((u: any) => u.role === 'Student').length,
        facilitators: users.filter((u: any) => u.role === 'Facilitator').length,
        admins: users.filter((u: any) => u.role === 'Admin').length,
      });
    }
    const savedEnrollments = localStorage.getItem('soma_enrollments');
    if (savedEnrollments) setEnrollments(parseJsonSafe<any[]>(savedEnrollments, []));

    getAllCourses().then(setCourses).catch(() => { });

    const handleStorageChange = () => {
      const saved = localStorage.getItem('soma_profile');
      if (saved) setProfile(parseJsonSafe(saved, profile));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [view]);

  const totalUsers = userStats.students + userStats.facilitators + userStats.admins;

  const stats = [
    { label: 'Total Students', value: userStats.students.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600', role: 'Student' },
    { label: 'Facilitators', value: userStats.facilitators.toLocaleString(), icon: Activity, color: 'bg-green-50 text-green-600', role: 'Facilitator' },
    { label: 'System Admins', value: userStats.admins.toLocaleString(), icon: ShieldPlus, color: 'bg-purple-50 text-purple-600', role: 'Admin' },
    { label: 'Active Sessions', value: '0', icon: CheckCircle, color: 'bg-orange-50 text-orange-600', role: null },
  ]

  // Chart data derived from real system data
  const donutSegments = [
    { label: 'Students', value: userStats.students, color: '#3b82f6' },
    { label: 'Facilitators', value: userStats.facilitators, color: '#22c55e' },
    { label: 'Admins', value: userStats.admins, color: '#a855f7' },
  ]

  // Enrollment breakdown by grade/level from soma_enrollments
  const levelCounts: Record<string, number> = {}
  enrollments.forEach((e: any) => {
    const raw = e.courseId?.split('-')[0] || ''
    const lvl = raw.match(/^[PS]\d+$|^Year \d+$/i) ? raw : 'Other'
    levelCounts[lvl] = (levelCounts[lvl] || 0) + 1
  })
  const levelBars = Object.entries(levelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({
      label, value,
      color: ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ec4899', '#14b8a6'][i % 6]
    }))

  // Grade distribution of students (from soma_users)
  const gradeMap: Record<string, number> = {}
  allUsers.filter(u => u.role === 'Student' && u.grade).forEach(u => {
    gradeMap[u.grade] = (gradeMap[u.grade] || 0) + 1
  })
  const gradeBars = Object.entries(gradeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({
      label, value,
      color: ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6'][i % 6]
    }))

  // Top Courses by Enrollment
  const courseEnrollmentCounts: Record<string, number> = {}
  enrollments.forEach((e: any) => {
    courseEnrollmentCounts[e.courseId] = (courseEnrollmentCounts[e.courseId] || 0) + 1
  })
  const topCourses = Object.entries(courseEnrollmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count], i) => {
      const course = courses.find(c => c.id === id)
      return {
        label: course?.title || id.split('-').pop() || 'Unknown',
        value: count,
        color: ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ec4899'][i % 5]
      }
    })

  // ── Add User Form ─────────────────────────────────────────────────────────
  const UserForm = ({ role }: { role: 'Facilitator' | 'Admin' }) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true); setMessage(null);
      try {
        await registerUser(name, email, password, role as UserRole);
        setMessage({ type: 'success', text: `${role} account created successfully!` });
        setTimeout(() => {
          const savedUsers = localStorage.getItem('soma_users');
          if (savedUsers) {
            const users = parseJsonSafe<any[]>(savedUsers, []);
            setAllUsers(users);
            setUserStats({
              students: users.filter((u: any) => u.role === 'Student').length,
              facilitators: users.filter((u: any) => u.role === 'Facilitator').length,
              admins: users.filter((u: any) => u.role === 'Admin').length,
            });
          }
          navigate('/admin/dashboard');
        }, 1500);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create account';
        setMessage({ type: 'error', text: errorMessage });
      } finally { setLoading(false); }
    }

    return (
      <div className="max-w-xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Add New {role}</h2>
          <p className="text-gray-500 text-sm">Create a new {role.toLowerCase()} account with full access.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-xl text-sm font-bold border flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} />
              {message.text}
            </div>
          )}
          <div className="space-y-2 text-left">
            <label className="text-sm font-bold text-gray-700 block">Full Name</label>
            <input className="w-full px-4 py-3 bg-white/40 border border-primary/10 rounded-2xl outline-none focus:border-primary transition-all font-medium" required placeholder="Enter full name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-sm font-bold text-gray-700 block">Email Address</label>
            <input type="email" className="w-full px-4 py-3 bg-white/40 border border-primary/10 rounded-2xl outline-none focus:border-primary transition-all font-medium" required placeholder="Enter email address" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-sm font-bold text-gray-700 block">Initial Password</label>
            <input type="password" className="w-full px-4 py-3 bg-white/40 border border-primary/10 rounded-2xl outline-none focus:border-primary transition-all font-medium" required placeholder="Create temporary password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95 disabled:opacity-50">
            {loading ? 'Creating...' : `Create ${role} Account`}
          </button>
        </form>
      </div>
    )
  }

  // ── User List ─────────────────────────────────────────────────────────────
  const UserList = ({ role }: { role: string | null }) => {
    const filteredUsers = role ? allUsers.filter((u: any) => u.role === role) : allUsers;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{role ? `${role}s` : 'All Users'} ({filteredUsers.length})</h2>
          <button onClick={() => setView('stats')} className="text-primary font-bold text-sm hover:underline">Back to Overview</button>
        </div>
        <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5">
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider hidden md:table-cell">Grade</th>
                <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filteredUsers.length > 0 ? filteredUsers.map((u: any, i: number) => (
                <tr key={i} onClick={() => setSelectedUser(u)} className="hover:bg-primary/5 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-tight">{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{u.grade || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Active</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-bold italic">No {role?.toLowerCase() || 'users'} found (0)</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── User Detail ────────────────────────────────────────────────────────────
  const UserDetail = ({ user, onClose }: { user: any; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">{user.email?.charAt(0).toUpperCase() || 'U'}</span>
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
        <button onClick={onClose} className="w-full mt-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all">Close</button>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-100 pb-2">
          <button onClick={() => navigate('/admin/dashboard')} className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'stats' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}>Overview</button>
          <button onClick={() => navigate('/admin/add-facilitator')} className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'addFacilitator' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}>Add Facilitator</button>
          <button onClick={() => { setView('userList'); setFilterRole('Facilitator'); }} className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'userList' && filterRole === 'Facilitator' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}>View Facilitators</button>
          <button onClick={() => navigate('/admin/add-admin')} className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'addAdmin' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}>Add Admin</button>
        </div>

        {view === 'stats' && (
          <div className="space-y-8">
            {/* Original Stat Cards — kept exactly, just improved visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} onClick={() => { if (stat.role) { setView('userList'); setFilterRole(stat.role); } }}
                  className="relative p-6 bg-primary-surface/40 rounded-[2rem] border border-primary/10 hover:shadow-md transition-all cursor-pointer group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none rounded-[2rem]" />
                  <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="text-sm font-bold text-gray-400">{stat.label}</div>
                  <div className="text-3xl font-black text-gray-900 mt-1">{stat.value}</div>
                  {stat.role && <div className="text-[10px] font-bold text-primary/60 mt-2 uppercase tracking-wide">Click to view →</div>}
                </div>
              ))}
            </div>

            {/* Extra live counters row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Total Enrollments', value: enrollments.length, icon: TrendingUp, color: 'text-teal-600 bg-teal-50' },
                { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-pink-600 bg-pink-50' },
                { label: 'Grades Covered', value: Object.keys(gradeMap).length, icon: Activity, color: 'text-amber-600 bg-amber-50' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/60 backdrop-blur-md border border-primary/10 rounded-2xl flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-gray-900">{item.value}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-tight">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Distribution */}
              <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-gray-900 mb-1">User Distribution</h3>
                <p className="text-xs text-gray-400 mb-5">Breakdown of all registered accounts</p>
                <DonutChart segments={donutSegments} />
              </div>

              {/* Student Grades Distribution */}
              <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-6">
                <h3 className="font-bold text-gray-900 mb-1">Students by Grade</h3>
                <p className="text-xs text-gray-400 mb-5">Number of students in each grade</p>
                {gradeBars.length > 0
                  ? <BarChart bars={gradeBars} />
                  : <p className="text-gray-300 text-sm italic text-center py-6">No grade data yet — students without a grade set won't appear here.</p>}
              </div>
            </div>

            {/* Enrollments Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enrollments by Level */}
              {levelBars.length > 0 && (
                <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-6">
                  <h3 className="font-bold text-gray-900 mb-1">Enrollments by Level</h3>
                  <p className="text-xs text-gray-400 mb-5">Enrollment records grouped by grade level</p>
                  <BarChart bars={levelBars} />
                </div>
              )}

              {/* Top Courses */}
              {topCourses.length > 0 && (
                <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] p-6">
                  <h3 className="font-bold text-gray-900 mb-1">Top Courses</h3>
                  <p className="text-xs text-gray-400 mb-5">Courses with the highest number of enrollments</p>
                  <BarChart bars={topCourses} />
                </div>
              )}
            </div>

            {/* Recent Users Table Preview */}
            <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[2rem] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-primary/5">
                <h3 className="font-bold text-gray-900">Recent Users</h3>
                <button onClick={() => { setView('userList'); setFilterRole(null); }} className="text-primary text-sm font-bold hover:underline">View all</button>
              </div>
              <table className="w-full text-left">
                <thead><tr className="bg-primary/5">
                  <th className="px-6 py-3 text-xs font-bold text-primary uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-bold text-primary uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-xs font-bold text-primary uppercase tracking-wider hidden md:table-cell">Grade</th>
                  <th className="px-6 py-3 text-xs font-bold text-primary uppercase tracking-wider text-right">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-primary/5">
                  {allUsers.slice(0, 5).length > 0 ? allUsers.slice(0, 5).map((u: any, i: number) => (
                    <tr key={i} onClick={() => setSelectedUser(u)} className="hover:bg-primary/5 transition-colors cursor-pointer">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{u.email}</td>
                      <td className="px-6 py-3"><span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase">{u.role}</span></td>
                      <td className="px-6 py-3 text-sm text-gray-500 hidden md:table-cell">{u.grade || '—'}</td>
                      <td className="px-6 py-3 text-right">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1.5" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase">Active</span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic text-sm">No users registered yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'userList' && <UserList role={filterRole} />}
        {(view === 'addFacilitator' || view === 'addAdmin') && (
          <UserForm role={view === 'addFacilitator' ? 'Facilitator' : 'Admin'} />
        )}

        {selectedUser && <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
