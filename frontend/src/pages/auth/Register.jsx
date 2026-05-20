import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { authAPI } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] })

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.register({ name: data.name, email: data.email, password: data.password })
      // If backend auto-verified (no email configured), it returns accessToken directly
      if (res.data.accessToken) {
        login(res.data.accessToken, res.data.user)
        toast.success(`Welcome to Adulting OS, ${res.data.user.name}! 🎉`)
        navigate('/app/dashboard')
      } else {
        toast.success('Account created! Check your email for OTP.')
        navigate('/verify-email', { state: { email: data.email } })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#11111b', padding: '2rem' }}>
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
              <Zap size={22} color="white" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#cdd6f4' }}>Adulting OS</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#cdd6f4', marginBottom: '0.5rem' }}>Start adulting smarter</h1>
          <p style={{ color: '#6c7086', fontSize: '0.875rem' }}>Create your free life admin account</p>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {[
              { field: 'name', label: 'Full Name', placeholder: 'John Doe', icon: User, type: 'text' },
              { field: 'email', label: 'Email', placeholder: 'you@example.com', icon: Mail, type: 'email' },
            ].map(({ field, label, placeholder, icon: Icon, type }) => (
              <div key={field} style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#45475a' }} />
                  <input {...register(field)} type={type} placeholder={placeholder} className="input-dark" style={{ paddingLeft: '36px' }} />
                </div>
                {errors[field] && <p style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors[field].message}</p>}
              </div>
            ))}

            {['password', 'confirmPassword'].map((field) => (
              <div key={field} style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>
                  {field === 'password' ? 'Password' : 'Confirm Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#45475a' }} />
                  <input {...register(field)} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input-dark" style={{ paddingLeft: '36px', paddingRight: '40px' }} />
                  {field === 'password' && (
                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6c7086' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
                {errors[field] && <p style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors[field].message}</p>}
              </div>
            ))}

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {isSubmitting ? 'Creating Account...' : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6c7086' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
