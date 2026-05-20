import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { subscriptionsAPI } from '../api/endpoints'
import { CreditCard, Plus, Trash2, Edit2, Calendar, TrendingDown } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { SkeletonGrid } from '../components/ui/SkeletonLoader'
import { useForm } from 'react-hook-form'
import { format, differenceInDays } from 'date-fns'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import toast from 'react-hot-toast'

const CATEGORIES = ['entertainment', 'fitness', 'productivity', 'utilities', 'shopping', 'food', 'other']
const CYCLES = ['monthly', 'quarterly', 'yearly', 'weekly']
const CAT_COLORS = { entertainment: '#f43f5e', fitness: '#10b981', productivity: '#6366f1', utilities: '#f59e0b', shopping: '#ec4899', food: '#f97316', other: '#6c7086' }

const LOGOS = { netflix: '🎬', spotify: '🎵', amazon: '📦', gym: '💪', internet: '🌐', prime: '📺', default: '📱' }

function SubCard({ sub, onDelete, onEdit }) {
  const days = differenceInDays(new Date(sub.renewalDate), new Date())
  const urgent = days >= 0 && days <= 3
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass card-hover"
      style={{ padding: '1.25rem', borderRadius: '1rem', border: urgent ? '1px solid rgba(244,63,94,0.4)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${CAT_COLORS[sub.category] || '#6c7086'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            {sub.logo || LOGOS[sub.name.toLowerCase()] || LOGOS.default}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#cdd6f4', fontSize: '0.95rem' }}>{sub.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#6c7086', textTransform: 'capitalize' }}>{sub.category} · {sub.cycle}</div>
          </div>
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981' }}>₹{sub.cost.toLocaleString()}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={12} color={urgent ? '#f43f5e' : '#6c7086'} />
          <span style={{ fontSize: '0.75rem', color: urgent ? '#f43f5e' : '#6c7086', fontWeight: urgent ? 700 : 400 }}>
            {days < 0 ? 'Expired' : days === 0 ? 'Renews today!' : `Renews in ${days}d`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onEdit(sub)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '5px', display: 'flex', alignItems: 'center', color: '#818cf8', cursor: 'pointer' }}>
            <Edit2 size={12} />
          </button>
          <button onClick={() => onDelete(sub._id)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', padding: '5px', display: 'flex', alignItems: 'center', color: '#f43f5e', cursor: 'pointer' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div style={{ marginTop: '0.75rem', padding: '0.4rem 0.75rem', background: sub.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)', borderRadius: '999px', width: 'fit-content' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: sub.status === 'active' ? '#10b981' : '#6c7086', textTransform: 'uppercase' }}>{sub.status}</span>
      </div>
    </motion.div>
  )
}

export default function Subscriptions() {
  const qc = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsAPI.getAll().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => subscriptionsAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['subscriptions']); toast.success('Subscription removed') },
  })

  const onEdit = (sub) => {
    setEditItem(sub)
    Object.entries(sub).forEach(([k, v]) => setValue(k, v instanceof Date ? v.toISOString().split('T')[0] : v))
    setIsOpen(true)
  }

  const onSubmit = async (form) => {
    try {
      if (editItem) {
        await subscriptionsAPI.update(editItem._id, form)
        toast.success('Updated!')
      } else {
        await subscriptionsAPI.create(form)
        toast.success('Subscription added!')
      }
      qc.invalidateQueries(['subscriptions'])
      reset(); setEditItem(null); setIsOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const subs = data?.data || []
  const analytics = data?.analytics || {}
  const activeSubs = subs.filter(s => s.status === 'active')

  const pieData = CATEGORIES.map(cat => ({
    name: cat, value: activeSubs.filter(s => s.category === cat).reduce((sum, s) => sum + s.cost, 0)
  })).filter(d => d.value > 0)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CreditCard size={24} color="#8b5cf6" /> Subscription Manager
          </h1>
          <p className="page-subtitle">Track and optimize your recurring expenses</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditItem(null); reset(); setIsOpen(true) }}><Plus size={16} /> Add Subscription</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Monthly Spend', value: `₹${analytics.monthlyTotal?.toLocaleString() || 0}`, color: '#8b5cf6' },
          { label: 'Yearly Spend', value: `₹${analytics.yearlyTotal?.toLocaleString() || 0}`, color: '#f43f5e' },
          { label: 'Active Subs', value: activeSubs.length, color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#6c7086', marginTop: '0.25rem', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
        {pieData.length > 0 && (
          <div className="glass" style={{ padding: '1rem', borderRadius: '1rem', gridColumn: 'span 1' }}>
            <div style={{ fontSize: '0.7rem', color: '#6c7086', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>By Category</div>
            <ResponsiveContainer width="100%" height={80}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={38} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={Object.values(CAT_COLORS)[i % Object.values(CAT_COLORS).length]} />)}
                </Pie>
                <Tooltip formatter={v => `₹${v}`} contentStyle={{ background: '#1e1e2e', border: 'none', borderRadius: '8px', color: '#cdd6f4', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {isLoading ? <SkeletonGrid count={6} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {subs.map(sub => <SubCard key={sub._id} sub={sub} onDelete={id => deleteMutation.mutate(id)} onEdit={onEdit} />)}
          {!subs.length && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon"><CreditCard size={28} color="#8b5cf6" /></div>
              <p style={{ fontWeight: 600, color: '#a6adc8', marginBottom: '0.5rem' }}>No subscriptions yet</p>
              <p style={{ color: '#6c7086', fontSize: '0.875rem' }}>Start tracking your recurring expenses</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); reset(); setEditItem(null) }} title={editItem ? 'Edit Subscription' : 'Add Subscription'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>Name *</label>
              <input {...register('name', { required: true })} placeholder="Netflix, Spotify..." className="input-dark" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>Cost (₹) *</label>
                <input {...register('cost', { required: true, valueAsNumber: true })} type="number" placeholder="199" className="input-dark" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>Billing Cycle</label>
                <select {...register('cycle')} className="input-dark" style={{ background: '#11111b' }}>
                  {CYCLES.map(c => <option key={c} value={c} style={{ background: '#1e1e2e', textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>Start Date</label>
                <input {...register('startDate')} type="date" className="input-dark" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>Next Renewal *</label>
                <input {...register('renewalDate', { required: true })} type="date" className="input-dark" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>Category</label>
              <select {...register('category')} className="input-dark" style={{ background: '#11111b' }}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1e1e2e', textTransform: 'capitalize' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#a6adc8' }}>Status</label>
              <select {...register('status')} className="input-dark" style={{ background: '#11111b' }}>
                {['active', 'paused', 'cancelled'].map(s => <option key={s} value={s} style={{ background: '#1e1e2e', textTransform: 'capitalize' }}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setIsOpen(false); reset(); setEditItem(null) }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : editItem ? 'Update' : 'Add Subscription'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
