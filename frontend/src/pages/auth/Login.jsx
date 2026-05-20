import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { authAPI } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.login(data)
      login(res.data.accessToken, res.data.user)
      toast.success(`Welcome back, ${res.data.user.name}! 🎉`)
      navigate('/app/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      if (err.response?.data?.needsVerification) {
        toast.error('Please verify your email first')
        navigate('/verify-email', { state: { email: data.email } })
      } else {
        toast.error(msg)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#11111b', padding: '2rem' }}>
      {/* BG effect */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
              <Zap size={22} color="white" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#cdd6f4' }}>Adulting OS</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#cdd6f4', marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ color: '#6c7086', fontSize: '0.875rem' }}>Sign in to your life admin dashboard</p>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#45475a' }} />
                <input {...register('email')} type="email" placeholder="you@example.com" className="input-dark" style={{ paddingLeft: '36px' }} />
              </div>
              {errors.email && <p style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: '#6366f1', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#45475a' }} />
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input-dark" style={{ paddingLeft: '36px', paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6c7086' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {isSubmitting ? <span className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6c7086' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
        </p>
      </motion.div>
    </div>
  )
}
