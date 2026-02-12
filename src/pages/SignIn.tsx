import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, UserRole } from '../auth'
import { Eye, EyeOff, User, Shield, Briefcase } from 'lucide-react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const userRole = await auth.signIn(email, password)
      if (userRole === 'Admin') nav('/admin/dashboard')
      else if (userRole === 'Facilitator') nav('/facilitator/dashboard')
      else nav('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { id: 'Student' as UserRole, label: 'Student', icon: User },
    { id: 'Facilitator' as UserRole, label: 'Facilitator', icon: Briefcase },
    { id: 'Admin' as UserRole, label: 'Admin', icon: Shield },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
          alt="Students studying"
          className="absolute inset-0 w-full h-full object-cover opacity-100 mix-blend-overlay"
        />
        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
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
              Bridging the gap in <span className="text-primary-light">global education</span>
            </h1>
            <p className="text-lg opacity-80 mb-12">
              Access quality education anytime, anywhere. Join thousands of students transforming their future through technology.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-left">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm opacity-70">Courses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-left">
                <div className="text-2xl font-bold">10,000+</div>
                <div className="text-sm opacity-70">Students</div>
              </div>
            </div>
          </div>

          <div className="italic text-sm opacity-60">
            "Education is the most powerful weapon which you can use to change the world." — Nelson Mandela
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-primary-surface overflow-y-auto">
        <div className="max-w-md w-full py-12">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500">Choose your role and sign in</p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                className="w-full bg-white/60 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
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
                  className="w-full bg-white/60 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                <span className="text-gray-600 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-primary font-semibold hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600 font-medium">
            Don't have an account? <Link className="text-primary font-bold hover:underline" to="/signup">Sign up Here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

