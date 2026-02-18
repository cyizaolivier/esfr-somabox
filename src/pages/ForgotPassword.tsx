import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Shield } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; newPassword?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const auth = useAuth()
  const nav = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await auth.forgotPassword(email)
      setResult(response)
    } catch (err: any) {
      setError(err.message || 'Failed to process request')
    } finally {
      setLoading(false)
    }
  }

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
              Reset your <span className="text-primary-light">password</span> easily
            </h1>
            <p className="text-lg opacity-80 mb-12">
              Enter your email address and we'll help you get back into your account in no time.
            </p>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-light" />
                </div>
                <div>
                  <div className="font-bold text-lg">Secure & Private</div>
                  <div className="text-sm opacity-70">Your information is always protected</div>
                </div>
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
          <Link 
            to="/signin" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Sign In
          </Link>

          <div className="mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-500">No worries, we'll send you reset instructions.</p>
          </div>

          {result ? (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border-2 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.success ? 'Password Reset Successful!' : 'Error'}
                    </div>
                    <div className="text-sm mt-1 text-gray-700">
                      {result.message}
                    </div>
                    {result.newPassword && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-green-300">
                        <div className="text-xs text-green-600 font-semibold uppercase mb-1">New Password</div>
                        <div className="font-mono text-lg font-bold text-green-800">{result.newPassword}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Link
                to="/signin"
                className="block w-full bg-primary text-white py-3 rounded-xl font-bold text-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-gray-600 font-medium">
            Don't have an account? <Link className="text-primary font-bold hover:underline" to="/signup">Sign up Here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
