import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ShieldCheck } from 'lucide-react'
import { useState, useRef } from 'react'
import { authAPI } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function VerifyOTP() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const refs = useRef([])

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      refs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter all 6 digits')
    setLoading(true)
    try {
      const res = await authAPI.verifyOTP({ email, otp: code })
      login(res.data.accessToken, res.data.user)
      toast.success('Email verified! Welcome to Adulting OS 🚀')
      navigate('/app/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const resend = async () => {
    setResending(true)
    try {
      await authAPI.resendOTP({ email })
      toast.success('New OTP sent!')
    } catch { toast.error('Failed to resend OTP') }
    finally { setResending(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ShieldCheck size={28} color="#818cf8" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#cdd6f4' }}>Verify your email</h1>
          <p style={{ color: '#6c7086', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            We sent a 6-digit code to <strong style={{ color: '#818cf8' }}>{email || 'your email'}</strong>
          </p>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }} onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i} ref={el => refs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  style={{
                    width: '48px', height: '56px', textAlign: 'center',
                    fontSize: '1.5rem', fontWeight: 700,
                    color: 'var(--text-primary)',
                    WebkitTextFillColor: 'var(--text-primary)',
                    caretColor: '#6366f1',
                    background: digit ? 'rgba(99,102,241,0.15)' : 'var(--input-bg)',
                    border: `2px solid ${digit ? '#6366f1' : 'var(--border)'}`,
                    borderRadius: '12px', outline: 'none', transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#6c7086' }}>
            Didn't receive it?{' '}
            <button onClick={resend} disabled={resending} style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>
        </div>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
          <Link to="/login" style={{ color: '#6c7086', textDecoration: 'none' }}>← Back to login</Link>
        </p>
      </motion.div>
    </div>
  )
}
