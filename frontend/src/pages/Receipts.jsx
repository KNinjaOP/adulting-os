import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { receiptsAPI } from '../api/endpoints'
import { Receipt as ReceiptIcon, Plus, Trash2, Eye, Search } from 'lucide-react'
import Modal from '../components/ui/Modal'
import FileUploader from '../components/ui/FileUploader'
import { SkeletonGrid } from '../components/ui/SkeletonLoader'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const CATEGORIES = ['electronics', 'food', 'clothing', 'health', 'education', 'travel', 'utilities', 'other']
const CAT_COLORS = { electronics: '#6366f1', food: '#f97316', clothing: '#ec4899', health: '#f43f5e', education: '#0ea5e9', travel: '#10b981', utilities: '#f59e0b', other: '#6c7086' }

export default function Receipts() {
  const qc = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['receipts', search, catFilter],
    queryFn: () => receiptsAPI.getAll({ search, category: catFilter, limit: 50 }).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => receiptsAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['receipts']); toast.success('Receipt deleted') },
  })

  const onSubmit = async (form) => {
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v) })
      if (uploadFile) fd.append('file', uploadFile)
      await receiptsAPI.create(fd)
      qc.invalidateQueries(['receipts'])
      toast.success('Receipt saved!')
      reset(); setUploadFile(null); setIsOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const receipts = data?.data || []
  const totalAmount = data?.totalAmount || 0

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><ReceiptIcon size={22} color="#10b981" /> Receipt Manager</h1>
          <p className="page-subtitle">Save and organize all your important receipts and invoices</p>
        </div>
        <button className="btn-primary" onClick={() => setIsOpen(true)}><Plus size={16} /> Add Receipt</button>
      </div>

      <div className="glass" style={{ padding: '0.875rem 1.25rem', borderRadius: '0.875rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL RECORDED SPEND</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>₹{totalAmount.toLocaleString()}</div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{receipts.length} receipts stored</div>
      </div>

      <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input type="text" placeholder="Search receipts..." className="input-dark" style={{ paddingLeft: '36px' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-dark" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? <SkeletonGrid count={6} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
          {receipts.map(r => {
            const hasFile = r.fileUrl && r.fileUrl.trim() !== ''
            return (
              <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass card-hover"
                style={{ padding: '1.125rem', borderRadius: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                  <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'capitalize', background: `${CAT_COLORS[r.category] || '#6c7086'}18`, color: CAT_COLORS[r.category] || '#6c7086' }}>
                    {r.category}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {hasFile && (
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#818cf8', textDecoration: 'none' }}>
                        <Eye size={13} />
                      </a>
                    )}
                    <button onClick={() => deleteMutation.mutate(r._id)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#f43f5e', cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{r.title}</div>
                {r.storeName && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.storeName}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.625rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(new Date(r.date), 'dd MMM yyyy')}</span>
                  {r.amount && <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>₹{r.amount.toLocaleString()}</span>}
                </div>
              </motion.div>
            )
          })}
          {!receipts.length && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon"><ReceiptIcon size={26} color="#10b981" /></div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No receipts saved</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Start saving your receipts and invoices</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); reset() }} title="Add Receipt" size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-row">
              <div><label className="form-label">Title *</label><input {...register('title', { required: true })} placeholder="MacBook Pro Receipt" className="input-dark" /></div>
              <div><label className="form-label">Store / Merchant</label><input {...register('storeName')} placeholder="Apple Store" className="input-dark" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div><label className="form-label">Amount (₹)</label><input {...register('amount', { valueAsNumber: true })} type="number" placeholder="125000" className="input-dark" /></div>
              <div><label className="form-label">Date</label><input {...register('date')} type="date" className="input-dark" /></div>
              <div><label className="form-label">Category</label>
                <select {...register('category')} className="input-dark">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div><label className="form-label">Folder</label><input {...register('folder')} placeholder="Electronics, Medical..." className="input-dark" /></div>
              <div><label className="form-label">Tags</label><input {...register('tags')} placeholder="important, tax" className="input-dark" /></div>
            </div>
            <div><label className="form-label">Upload Receipt</label><FileUploader onFileSelect={setUploadFile} label="Upload receipt image or PDF" /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setIsOpen(false); reset() }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Save Receipt'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
