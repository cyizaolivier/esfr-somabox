import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { UserPlus, ShieldPlus, Users, Activity, CheckCircle } from 'lucide-react'

export const AdminDashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState<'stats' | 'addFacilitator' | 'addAdmin'>('stats')

  useEffect(() => {
    if (location.pathname === '/admin/add-facilitator') setView('addFacilitator')
    else if (location.pathname === '/admin/add-admin') setView('addAdmin')
    else setView('stats')
  }, [location])

  const stats = [
    { label: 'Total Students', value: '12,450', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Facilitators', value: '48', icon: Activity, color: 'bg-green-50 text-green-600' },
    { label: 'System Admins', value: '6', icon: ShieldPlus, color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Sessions', value: '1,200', icon: CheckCircle, color: 'bg-orange-50 text-orange-600' },
  ]

  const UserForm = ({ role }: { role: 'Facilitator' | 'Admin' }) => (
    <div className="max-w-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Add New {role}</h2>
        <p className="text-gray-500 text-sm">Create a new {role.toLowerCase()} account with full access.</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); alert(`${role} added!`); navigate('/admin/dashboard'); }} className="space-y-6">
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">Full Name</label>
            <input 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#004D7A] transition-all font-medium"
                required 
                placeholder="Enter full name"
            />
        </div>
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">Email Address</label>
            <input 
                type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#004D7A] transition-all font-medium"
                required 
                placeholder="Enter email address"
            />
        </div>
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">Initial Password</label>
            <input 
                type="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#004D7A] transition-all font-medium"
                required 
                placeholder="Create temporary password"
            />
        </div>
        <button type="submit" className="w-full py-4 bg-[#004D7A] text-white rounded-2xl font-bold hover:bg-[#003A5C] transition-all shadow-lg active:scale-95">
            Create {role} Account
        </button>
      </form>
    </div>
  )

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        <div className="flex gap-4 border-b border-gray-100 pb-2">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'stats' ? 'text-[#004D7A] border-b-2 border-[#004D7A]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => navigate('/admin/add-facilitator')}
            className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'addFacilitator' ? 'text-[#004D7A] border-b-2 border-[#004D7A]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Add Facilitator
          </button>
          <button 
            onClick={() => navigate('/admin/add-admin')}
            className={`pb-2 px-4 text-sm font-bold transition-all ${view === 'addAdmin' ? 'text-[#004D7A] border-b-2 border-[#004D7A]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Add Admin
          </button>
        </div>

        {view === 'stats' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-[2rem] border border-white hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-sm font-bold text-gray-400">{stat.label}</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <UserForm role={view === 'addFacilitator' ? 'Facilitator' : 'Admin'} />
        )}
      </div>
    </DashboardLayout>
  )
}
