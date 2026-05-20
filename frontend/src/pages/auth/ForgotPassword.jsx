import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react'
import { authAPI } from '../../api/endpoints'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm()

  const onSubmit = async ({ email }) => {
    try {
      await authAPI.forgotPassword({ email })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#11111b', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <KeyRound size={28} color="#f59e0b" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#cdd6f4' }}>Reset password</h1>
          <p style={{ color: '#6c7086', fontSize: '0.875rem', marginTop: '0.5rem' }}>Enter your email to receive a reset link</p>
        </div>
        <div className="glass" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          {isSubmitSuccessful ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <p style={{ color: '#10b981', fontWeight: 600 }}>Check your email!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#45475a' }} />
                  <input {...register('email', { required: true })} type="email" placeholder="you@example.com" className="input-dark" style={{ paddingLeft: '36px' }} />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {isSubmitting ? 'Sending...' : <>Send Reset Link <ArrowRight size={16} /></>}
              </button>
            </form>
          )}
        </div>
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem', color: '#6c7086', textDecoration: 'none', fontSize: '0.875rem' }}>
          <ArrowLeft size={14} /> Back to login
        </Link>
      </motion.div>
    </div>
  )
}
