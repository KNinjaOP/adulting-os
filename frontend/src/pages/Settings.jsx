import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { authAPI } from '../api/endpoints'
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')

  const { register: regProfile, handleSubmit: submitProfile, formState: { isSubmitting: savingProfile } } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' }
  })

  const { register: regPass, handleSubmit: submitPass, reset: resetPass, formState: { isSubmitting: savingPass } } = useForm()

  const onSaveProfile = async (data) => {
    try {
      const res = await authAPI.updateProfile({ name: data.name })
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
  }

  const onChangePassword = async (data) => {
    try {
      await authAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password changed!')
      resetPass()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  const sectionTitle = (text) => (
    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>{text}</h2>
  )

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SettingsIcon size={22} color="#6366f1" /> Settings
        </h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.25rem' }}>
        {/* Tab Sidebar */}
        <div className="glass" style={{ borderRadius: '0.875rem', padding: '0.625rem', height: 'fit-content' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.6rem 0.875rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 500, marginBottom: '2px', textAlign: 'left', transition: 'all 0.2s',
                background: activeTab === id ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: activeTab === id ? '#818cf8' : 'var(--text-muted)',
              }}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass" style={{ borderRadius: '0.875rem', padding: '1.75rem' }}>

          {activeTab === 'profile' && (
            <div>
              {sectionTitle('Profile Information')}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>✓ Verified account</div>
                </div>
              </div>
              <form onSubmit={submitProfile(onSaveProfile)}>
                <div style={{ display: 'grid', gap: '1rem', maxWidth: '440px' }}>
                  <div><label className="form-label">Full Name</label><input {...regProfile('name')} className="input-dark" /></div>
                  <div><label className="form-label">Email (read-only)</label><input {...regProfile('email')} className="input-dark" disabled style={{ opacity: 0.5 }} /></div>
                  <button type="submit" disabled={savingProfile} className="btn-primary" style={{ width: 'fit-content' }}>
                    <Save size={15} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              {sectionTitle('Change Password')}
              <form onSubmit={submitPass(onChangePassword)}>
                <div style={{ display: 'grid', gap: '1rem', maxWidth: '440px' }}>
                  <div><label className="form-label">Current Password</label><input {...regPass('currentPassword', { required: true })} type="password" className="input-dark" placeholder="••••••••" /></div>
                  <div><label className="form-label">New Password</label><input {...regPass('newPassword', { required: true, minLength: 8 })} type="password" className="input-dark" placeholder="Min 8 characters" /></div>
                  <button type="submit" disabled={savingPass} className="btn-primary" style={{ width: 'fit-content' }}>
                    <Lock size={15} /> {savingPass ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              {sectionTitle('Notification Preferences')}
              {[
                { label: 'Email Reminders', desc: 'Receive daily digest emails for expiring items' },
                { label: 'Document Expiry Alerts', desc: 'Get notified when documents are about to expire' },
                { label: 'Subscription Renewals', desc: 'Reminders 3 days before subscription renews' },
                { label: 'Warranty Expiry', desc: 'Alerts when product warranties are ending soon' },
              ].map(({ label, desc }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
                  </div>
                  <div style={{ width: '42px', height: '22px', borderRadius: '999px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', right: '3px', top: '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'white' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              {sectionTitle('Appearance')}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Theme</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem', maxWidth: '380px' }}>
                  {[
                    { label: 'Dark Mode', emoji: '🌙', value: 'dark' },
                    { label: 'Light Mode', emoji: '☀️', value: 'light' },
                  ].map(({ label, emoji, value }) => {
                    const active = theme === value
                    return (
                      <div key={label} onClick={() => { if (!active) toggleTheme() }}
                        style={{ padding: '1rem', borderRadius: '0.875rem', border: `2px solid ${active ? '#6366f1' : 'var(--border)'}`, background: active ? 'rgba(99,102,241,0.1)' : 'transparent', textAlign: 'center', cursor: active ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                        <div style={{ fontSize: '1.4rem' }}>{emoji}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: active ? '#818cf8' : 'var(--text-muted)', marginTop: '0.4rem' }}>{label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>Currency</div>
                <select className="input-dark" style={{ width: '220px' }}>
                  <option value="₹">₹ INR - Indian Rupee</option>
                  <option value="$">$ USD - US Dollar</option>
                  <option value="€">€ EUR - Euro</option>
                </select>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
