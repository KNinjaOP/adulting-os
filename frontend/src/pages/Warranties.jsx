import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { warrantiesAPI } from '../api/endpoints'
import { Shield, Plus, Trash2, Eye, AlertTriangle } from 'lucide-react'
import Modal from '../components/ui/Modal'
import FileUploader from '../components/ui/FileUploader'
import { SkeletonGrid } from '../components/ui/SkeletonLoader'
import { useForm } from 'react-hook-form'
import { format, differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'

const CATEGORIES = ['electronics', 'appliances', 'furniture', 'vehicle_parts', 'clothing', 'other']
const CAT_ICONS = { electronics: '💻', appliances: '🏠', furniture: '🛋️', vehicle_parts: '🚗', clothing: '👕', other: '📦' }

function WarrantyCard({ warranty, onDelete }) {
  const daysLeft = differenceInDays(new Date(warranty.warrantyEndDate), new Date())
  const isExpired = daysLeft < 0
  const isUrgent = !isExpired && daysLeft <= 30
  const color = isExpired ? '#f43f5e' : isUrgent ? '#f59e0b' : '#10b981'
  const hasFile = warranty.invoiceUrl && warranty.invoiceUrl.trim() !== ''

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass card-hover"
      style={{ padding: '1.125rem', borderRadius: '0.875rem', borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.4rem' }}>{CAT_ICONS[warranty.category] || '📦'}</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{warranty.productName}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{warranty.brand}{warranty.store && ` · ${warranty.store}`}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {hasFile && (
            <a href={warranty.invoiceUrl} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#818cf8', textDecoration: 'none' }}>
              <Eye size={13} />
            </a>
          )}
          <button onClick={() => onDelete(warranty._id)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#f43f5e', cursor: 'pointer' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: '7px', padding: '0.5rem 0.75rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '2px' }}>PURCHASED</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            {warranty.purchaseDate ? format(new Date(warranty.purchaseDate), 'dd MMM yyyy') : 'N/A'}
          </div>
        </div>
        <div style={{ background: `${color}10`, borderRadius: '7px', padding: '0.5rem 0.75rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '2px' }}>WARRANTY ENDS</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{isExpired ? 'Expired' : `${daysLeft}d left`}</div>
        </div>
      </div>
      {warranty.purchasePrice && (
        <div style={{ marginTop: '0.625rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Purchase price: <span style={{ color: '#10b981', fontWeight: 700 }}>₹{warranty.purchasePrice.toLocaleString()}</span>
        </div>
      )}
    </motion.div>
  )
}

export default function Warranties() {
  const qc = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data: warranties = [], isLoading } = useQuery({
    queryKey: ['warranties'],
    queryFn: () => warrantiesAPI.getAll().then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => warrantiesAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['warranties']); toast.success('Warranty deleted') },
  })

  const onSubmit = async (form) => {
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v) })
      if (uploadFile) fd.append('invoice', uploadFile)
      await warrantiesAPI.create(fd)
      qc.invalidateQueries(['warranties'])
      toast.success('Warranty added!')
      reset(); setUploadFile(null); setIsOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const expiringSoon = warranties.filter(w => {
    const d = differenceInDays(new Date(w.warrantyEndDate), new Date())
    return d >= 0 && d <= 30
  })

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Shield size={22} color="#8b5cf6" /> Warranty Tracker</h1>
          <p className="page-subtitle">Track warranties and return windows for all your products</p>
        </div>
        <button className="btn-primary" onClick={() => setIsOpen(true)}><Plus size={16} /> Add Warranty</button>
      </div>

      {expiringSoon.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.875rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>
            {expiringSoon.length} warranty{expiringSoon.length > 1 ? 'ies' : ''} expiring in the next 30 days
          </span>
        </div>
      )}

      {isLoading ? <SkeletonGrid count={6} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
          {warranties.map(w => <WarrantyCard key={w._id} warranty={w} onDelete={id => deleteMutation.mutate(id)} />)}
          {!warranties.length && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon"><Shield size={26} color="#8b5cf6" /></div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No warranties tracked</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add your product warranties to never miss an expiry</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); reset() }} title="Add Warranty" size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-row">
              <div><label className="form-label">Product Name *</label><input {...register('productName', { required: true })} placeholder="Samsung Galaxy S24" className="input-dark" /></div>
              <div><label className="form-label">Brand</label><input {...register('brand')} placeholder="Samsung" className="input-dark" /></div>
            </div>
            <div className="form-row">
              <div><label className="form-label">Category</label>
                <select {...register('category')} className="input-dark">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div><label className="form-label">Purchase Price (₹)</label><input {...register('purchasePrice', { valueAsNumber: true })} type="number" placeholder="75000" className="input-dark" /></div>
            </div>
            <div className="form-row">
              <div><label className="form-label">Purchase Date *</label><input {...register('purchaseDate', { required: true })} type="date" className="input-dark" /></div>
              <div><label className="form-label">Warranty End Date *</label><input {...register('warrantyEndDate', { required: true })} type="date" className="input-dark" /></div>
            </div>
            <div className="form-row">
              <div><label className="form-label">Store</label><input {...register('store')} placeholder="Amazon, Flipkart..." className="input-dark" /></div>
              <div><label className="form-label">Return Window (days)</label><input {...register('returnWindowDays', { valueAsNumber: true })} type="number" placeholder="10" className="input-dark" /></div>
            </div>
            <div><label className="form-label">Upload Invoice</label><FileUploader onFileSelect={setUploadFile} label="Upload invoice or receipt" /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setIsOpen(false); reset() }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Add Warranty'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
