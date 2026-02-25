import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Eye, EyeOff, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

// ─── Success Overlay Card ────────────────────────────────────────────────────
function SuccessCard({ onRedirect }: { onRedirect: () => void }) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onRedirect()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [onRedirect])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(10, 18, 40, 0.75)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.4s ease forwards',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(32px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes pop { 0%{transform:scale(0.6) rotate(-10deg);opacity:0} 70%{transform:scale(1.12) rotate(3deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes pulse-ring { 0%{transform:scale(0.95);opacity:0.7} 100%{transform:scale(1.4);opacity:0} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        @keyframes floatDot { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes countShrink { from{transform:scale(1.3)} to{transform:scale(1)} }

        .success-card {
          font-family: 'Sora', sans-serif;
          animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both;
          background: linear-gradient(145deg, #ffffff 0%, #f0f7ff 60%, #e8f4ff 100%);
          border-radius: 28px;
          padding: 48px 40px 40px;
          max-width: 420px;
          width: 100%;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(59,130,246,0.15),
            0 32px 80px rgba(30,64,175,0.18),
            0 8px 24px rgba(30,64,175,0.1);
        }

        .success-card::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(99,179,237,0.18) 0%, transparent 70%);
          border-radius: 50%;
        }
        .success-card::after {
          content: '';
          position: absolute;
          bottom: -40px; left: -40px;
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(167,213,255,0.2) 0%, transparent 70%);
          border-radius: 50%;
        }

        .check-wrapper {
          position: relative;
          width: 80px; height: 80px;
          margin: 0 auto 28px;
          animation: pop 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }
        .check-ring {
          position: absolute; inset: -10px;
          border-radius: 50%;
          background: rgba(59,130,246,0.12);
          animation: pulse-ring 1.4s ease-out 0.8s infinite;
        }
        .check-bg {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(59,130,246,0.45), 0 0 0 6px rgba(59,130,246,0.12);
          position: relative; z-index: 1;
        }
        .check-svg { stroke-dasharray: 40; stroke-dashoffset: 40; animation: dash 0.5s ease 0.9s forwards; }

        .heading {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 26px; font-weight: 800;
          line-height: 1.2; margin-bottom: 10px;
          animation: shimmer 3s linear infinite;
        }

        .subtext {
          font-family: 'DM Sans', sans-serif;
          color: #64748b; font-size: 14.5px; line-height: 1.6;
          margin-bottom: 32px;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent);
          margin-bottom: 24px;
        }

        .countdown-row {
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'DM Sans', sans-serif;
        }
        .countdown-label {
          font-size: 13px; color: #94a3b8; display: flex; align-items: center; gap: 6px;
        }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; animation: floatDot 1.2s ease infinite; }
        .dot:nth-child(2){ animation-delay: 0.2s; }
        .dot:nth-child(3){ animation-delay: 0.4s; }

        .countdown-num {
          font-size: 13px; font-weight: 600; color: #3b82f6;
          font-variant-numeric: tabular-nums;
          animation: countShrink 1s ease infinite;
        }

        .go-btn {
          margin-top: 20px;
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          font-family: 'Sora', sans-serif;
          font-size: 15px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap-10: 8px;
          border: none; cursor: pointer;
          box-shadow: 0 6px 20px rgba(37,99,235,0.35);
          transition: all 0.2s;
          gap: 8px;
        }
        .go-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(37,99,235,0.4); }

        .sparkle-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 100px;
          padding: 4px 12px; font-size: 11.5px; font-weight: 600;
          color: #3b82f6; margin-bottom: 16px;
          font-family: 'DM Sans', sans-serif;
        }

        .info-row {
          display: flex; gap: 10px; align-items: flex-start;
          background: rgba(239,246,255,0.8);
          border: 1px solid rgba(59,130,246,0.12);
          border-radius: 12px; padding: 14px;
          margin-bottom: 20px; font-family: 'DM Sans', sans-serif;
        }
        .info-icon { flex-shrink:0; margin-top: 2px; }
        .info-text { font-size: 13px; color: #475569; line-height: 1.5; }
        .info-text strong { color: #1e40af; font-weight: 600; }
      `}</style>

      <div className="success-card">
        {/* Check Icon */}
        <div className="check-wrapper">
          <div className="check-ring" />
          <div className="check-bg">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <polyline
                className="check-svg"
                points="8,18 15,25 28,11"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Badge */}
        <div style={{ textAlign: 'center' }}>
          <div className="sparkle-badge" style={{ display: 'inline-flex' }}>
            <Sparkles size={12} />
            Welcome to SomaBox
          </div>
        </div>

        {/* Heading */}
        <h2 className="heading" style={{ textAlign: 'center' }}>
          Account Created<br />Successfully!
        </h2>

        {/* Sub text */}
        <p className="subtext" style={{ textAlign: 'center' }}>
          Your learning journey begins now. We're thrilled to have you join thousands of students transforming their futures.
        </p>

        {/* Info box */}
        <div className="info-row">
          <div className="info-icon">
            <CheckCircle2 size={16} color="#3b82f6" />
          </div>
          <div className="info-text">
            A <strong>verification email</strong> has been sent to your inbox. Please check your email to activate your account.
          </div>
        </div>

        <div className="divider" />

        {/* Countdown row */}
        <div className="countdown-row">
          <div className="countdown-label">
            Redirecting to Sign In
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <div className="countdown-num">in {countdown}s</div>
        </div>

        {/* CTA button */}
        <button className="go-btn" onClick={onRedirect}>
          Go to Sign In
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Main SignUp Component ────────────────────────────────────────────────────
export default function SignUp() {
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const auth = useAuth()
  const nav = useNavigate()

  const handleRedirect = () => nav('/signin')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      await auth.signUp(fullname, email, password)
      setShowSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showSuccess && <SuccessCard onRedirect={handleRedirect} />}

      <div className="min-h-screen flex">
        {/* Left Column */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
          <img
            src="https://media.istockphoto.com/id/2226385991/photo/happy-group-of-students-studying-together-at-the-library.webp?a=1&b=1&s=612x612&w=0&k=20&c=b6rhWOe7dRwbk_Cvsedg4vem3I9MW6Ui2n26jgu5fXg="
            alt="Students learning"
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
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
                {[['500+','Courses'],['10,000+','Students'],['100+','Schools'],['95%','Success Rate']].map(([n,l])=>(
                  <div key={l} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <div className="text-2xl font-bold">{n}</div>
                    <div className="text-sm opacity-70">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="italic text-sm opacity-60">
              "Education is the most powerful weapon which you can use to change the world." — Nelson Mandela
            </div>
          </div>
        </div>

       
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-primary-surface overflow-y-auto">
          <div className="max-w-md w-full py-8">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Sign Up</h2>
              <p className="text-gray-500">Sign Up to the learning platform</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fullname</label>
                <input
                  className="w-full bg-white/60 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                  className="w-full bg-white/60 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                    className="w-full bg-white/60 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    className="w-full bg-white/60 border border-primary/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-70 mt-4"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-600">
              Already have an account? <Link className="text-primary font-bold hover:underline" to="/signin">Sign in Here</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}