import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Eye, EyeOff } from 'lucide-react'

export default function SignUp() {
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      await auth.signUp(email, password)
      nav('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#004D7A]">
        <img 
          src="https://images.unsplash.com/photo-1523240795204-d076406ac051?auto=format&fit=crop&q=80&w=1000" 
          alt="Students learning"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-24">
            <div className="w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-8 h-8 fill-white">
                    <path d="M20 5 L35 12.5 L35 27.5 L20 35 L5 27.5 L5 12.5 Z" className="opacity-20" />
                    <path d="M20 5 L35 12.5 L20 20 L5 12.5 Z" />
                    <path d="M5 15 L20 22.5 L35 15 L35 20 L20 27.5 L5 20 Z" className="opacity-80" />
                    <path d="M5 22.5 L20 30 L35 22.5 L35 27.5 L20 35 L5 27.5 Z" className="opacity-60" />
                </svg>
            </div>
            <div className="text-white">
                <div className="text-xl font-bold leading-none">SomaBox</div>
                <div className="text-[10px] opacity-70 font-medium">Learning Portal</div>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Bridging the gap in <span className="text-[#F4A261]">global education</span>
            </h1>
            <p className="text-lg opacity-80 mb-12">
              Access quality education anytime, anywhere. Join thousands of students transforming their future through technology.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm opacity-70">Courses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="text-2xl font-bold">10,000+</div>
                <div className="text-sm opacity-70">Students</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="text-2xl font-bold">100+</div>
                <div className="text-sm opacity-70">Schools</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm opacity-70">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="italic text-sm opacity-60">
            "Education is the most powerful weapon which you can use to change the world." — Nelson Mandela
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="max-w-md w-full py-8">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Sign Up</h2>
            <p className="text-gray-500">Sign Up to the learning platform</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fullname</label>
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#004D7A]/20 transition-all"
                placeholder="Input your fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                type="text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#004D7A]/20 transition-all"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#004D7A]/20 transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm-Password</label>
              <div className="relative">
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#004D7A]/20 transition-all"
                  placeholder="Enter your confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#004D7A] text-white py-3 rounded-xl font-bold hover:bg-[#003B5C] transition-all shadow-lg shadow-[#004D7A]/20 disabled:opacity-70 mt-4"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account? <Link className="text-[#004D7A] font-bold hover:underline" to="/signin">Sign in Here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

