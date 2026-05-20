import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { deliveriesAPI } from '../api/endpoints'
import { Package, Plus, Trash2, ExternalLink, Truck } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { SkeletonGrid } from '../components/ui/SkeletonLoader'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const PLATFORMS = ['amazon', 'flipkart', 'myntra', 'meesho', 'nykaa', 'zomato', 'swiggy', 'blinkit', 'zepto', 'courier', 'other']
const STATUSES = ['ordered', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']
const STATUS_CONFIG = {
  ordered: { color: '#6366f1', label: 'Ordered', emoji: '📦' },
  processing: { color: '#f59e0b', label: 'Processing', emoji: '⚙️' },
  shipped: { color: '#0ea5e9', label: 'Shipped', emoji: '🚢' },
  out_for_delivery: { color: '#8b5cf6', label: 'Out for Delivery', emoji: '🚴' },
  delivered: { color: '#10b981', label: 'Delivered', emoji: '✅' },
  cancelled: { color: '#f43f5e', label: 'Cancelled', emoji: '❌' },
  returned: { color: '#6c7086', label: 'Returned', emoji: '↩️' },
}
const PLATFORM_EMOJIS = { amazon: '📦', flipkart: '🛒', myntra: '👗', zomato: '🍕', swiggy: '🛵', blinkit: '⚡', other: '🚚' }

export default function Deliveries() {
  const qc = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ['deliveries', statusFilter],
    queryFn: () => deliveriesAPI.getAll({ status: statusFilter, limit: 50 }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deliveriesAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['deliveries']); toast.success('Deleted') },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => deliveriesAPI.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(['deliveries']); toast.success('Status updated') },
  })

  const onSubmit = async (form) => {
    try {
      await deliveriesAPI.create(form)
      qc.invalidateQueries(['deliveries'])
      toast.success('Delivery added!')
      reset(); setIsOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const activeCount = deliveries.filter(d => !['delivered', 'cancelled', 'returned'].includes(d.status)).length

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Package size={22} color="#f59e0b" /> Delivery Tracker</h1>
          <p className="page-subtitle">Track all your orders from one place</p>
        </div>
        <button className="btn-primary" onClick={() => setIsOpen(true)}><Plus size={16} /> Add Delivery</button>
      </div>

      {activeCount > 0 && (
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '0.875rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Truck size={16} color="#818cf8" />
          <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.875rem' }}>{activeCount} active deliver{activeCount > 1 ? 'ies' : 'y'} in transit</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '4px 11px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: statusFilter === s ? (STATUS_CONFIG[s]?.color || '#6366f1') : 'rgba(99,102,241,0.1)', color: statusFilter === s ? 'white' : '#818cf8' }}>
            {s ? STATUS_CONFIG[s]?.label : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? <SkeletonGrid count={6} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
          {deliveries.map(d => {
            const sc = STATUS_CONFIG[d.status] || STATUS_CONFIG.ordered
            return (
              <motion.div key={d._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass card-hover"
                style={{ padding: '1.125rem', borderRadius: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ fontSize: '1.3rem' }}>{PLATFORM_EMOJIS[d.platform] || '📦'}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{d.itemName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{d.platform}{d.orderId && ` · #${d.orderId}`}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteMutation.mutate(d._id)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#f43f5e', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                  <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: `${sc.color}18`, color: sc.color }}>
                    {sc.emoji} {sc.label}
                  </span>
                  {d.estimatedDelivery && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ETA: {format(new Date(d.estimatedDelivery), 'dd MMM')}</span>
                  )}
                </div>

                {d.status !== 'delivered' && d.status !== 'cancelled' && (
                  <select value={d.status} onChange={e => updateStatusMutation.mutate({ id: d._id, status: e.target.value })}
                    className="input-dark" style={{ width: '100%', fontSize: '0.78rem', padding: '6px 10px' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
                  </select>
                )}

                {d.trackingUrl && (
                  <a href={d.trackingUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.625rem', fontSize: '0.75rem', color: '#818cf8', textDecoration: 'none' }}>
                    <ExternalLink size={12} /> Track Order
                  </a>
                )}
              </motion.div>
            )
          })}
          {!deliveries.length && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon"><Package size={26} color="#f59e0b" /></div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No deliveries tracked</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add an order to start tracking</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); reset() }} title="Add Delivery">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div><label className="form-label">Item Name *</label><input {...register('itemName', { required: true })} placeholder="iPhone 16 Pro" className="input-dark" /></div>
            <div className="form-row">
              <div><label className="form-label">Platform</label>
                <select {...register('platform')} className="input-dark">
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><label className="form-label">Order ID</label><input {...register('orderId')} placeholder="OD-XXXXXXXXXX" className="input-dark" /></div>
            </div>
            <div className="form-row">
              <div><label className="form-label">Amount (₹)</label><input {...register('amount', { valueAsNumber: true })} type="number" className="input-dark" /></div>
              <div><label className="form-label">Expected Delivery</label><input {...register('estimatedDelivery')} type="date" className="input-dark" /></div>
            </div>
            <div><label className="form-label">Tracking URL</label><input {...register('trackingUrl')} placeholder="https://..." className="input-dark" /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setIsOpen(false); reset() }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Add Delivery'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
