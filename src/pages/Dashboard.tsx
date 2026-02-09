import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const nav = useNavigate()

  const handleSignOut = () => {
    signOut()
    nav('/signin')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-sm text-gray-600">{user?.email}</div>
        </div>
        <div className="mt-6">
          <p>Welcome to your LMS dashboard. This is a mock UI; replace with your actual content.</p>
        </div>
        <div className="mt-6">
          <button onClick={handleSignOut} className="px-4 py-2 bg-red-600 text-white rounded">
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
