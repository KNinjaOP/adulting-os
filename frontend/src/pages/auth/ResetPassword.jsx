import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { authAPI } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async ({ password }) => {
    try {
      const res = await authAPI.resetPassword(token, { password })
      login(res.data.accessToken, res.data.user)
      toast.success('Password reset successfully!')
      navigate('/app/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#11111b', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#cdd6f4' }}>Set new password</h1>
          <p style={{ color: '#6c7086', fontSize: '0.875rem', marginTop: '0.5rem' }}>Choose a strong password for your account</p>
        </div>
        <div className="glass" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {['password', 'confirmPassword'].map((field) => (
              <div key={field} style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>
                  {field === 'password' ? 'New Password' : 'Confirm Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#45475a' }} />
                  <input
                    {...register(field, {
                      required: true,
                      minLength: field === 'password' ? 8 : undefined,
                      validate: field === 'confirmPassword' ? v => v === watch('password') || "Passwords don't match" : undefined
                    })}
                    type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    className="input-dark" style={{ paddingLeft: '36px', paddingRight: '40px' }}
                  />
                  {field === 'password' && (
                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6c7086' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
                {errors[field] && <p style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors[field].message}</p>}
              </div>
            ))}
            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
        <Link to="/login" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', color: '#6c7086', textDecoration: 'none', fontSize: '0.875rem' }}>
          Back to login
        </Link>
      </motion.div>
    </div>
  )
}
