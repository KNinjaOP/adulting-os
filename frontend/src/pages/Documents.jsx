import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { documentsAPI } from '../api/endpoints'
import { FileText, Plus, Search, Trash2, Eye, Calendar } from 'lucide-react'
import Modal from '../components/ui/Modal'
import FileUploader from '../components/ui/FileUploader'
import { SkeletonGrid } from '../components/ui/SkeletonLoader'
import { useForm } from 'react-hook-form'
import { format, differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'

const DOC_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'aadhar', label: 'Aadhar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'college', label: 'College Document' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'other', label: 'Other' },
]

const TYPE_COLORS = {
  aadhar: '#f59e0b', pan: '#6366f1', passport: '#0ea5e9', driving_license: '#10b981',
  insurance: '#8b5cf6', college: '#ec4899', certificate: '#f43f5e', other: '#6c7086'
}

function DocCard({ doc, onDelete }) {
  const daysLeft = doc.expiryDate ? differenceInDays(new Date(doc.expiryDate), new Date()) : null
  const isExpired = daysLeft !== null && daysLeft < 0
  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30
  const hasFile = doc.fileUrl && doc.fileUrl.trim() !== ''

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass card-hover"
      style={{ padding: '1.125rem', borderRadius: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          padding: '4px 10px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          background: `${TYPE_COLORS[doc.type] || '#6c7086'}18`,
          color: TYPE_COLORS[doc.type] || '#6c7086',
          border: `1px solid ${TYPE_COLORS[doc.type] || '#6c7086'}28`
        }}>
          {DOC_TYPES.find(t => t.value === doc.type)?.label || doc.type}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {hasFile && (
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#818cf8', textDecoration: 'none' }}>
              <Eye size={13} />
            </a>
          )}
          <button onClick={() => onDelete(doc._id)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#f43f5e', cursor: 'pointer' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{doc.title}</div>
        {doc.documentNumber && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>#{doc.documentNumber}</div>}
      </div>
      {doc.expiryDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={12} color={isExpired ? '#f43f5e' : isExpiringSoon ? '#f59e0b' : 'var(--text-muted)'} />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isExpired ? '#f43f5e' : isExpiringSoon ? '#f59e0b' : 'var(--text-muted)' }}>
            {isExpired ? 'Expired' : `Expires ${format(new Date(doc.expiryDate), 'dd MMM yyyy')}`}
            {!isExpired && daysLeft <= 30 && ` (${daysLeft}d left)`}
          </span>
        </div>
      )}
      {doc.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {doc.tags.map(t => (
            <span key={t} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: '0.65rem', padding: '2px 7px', borderRadius: '999px' }}>#{t}</span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function Documents() {
  const qc = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['documents', search, typeFilter],
    queryFn: () => documentsAPI.getAll({ search, type: typeFilter, limit: 50 }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => documentsAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['documents']); toast.success('Document deleted') },
  })

  const onSubmit = async (form) => {
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      if (uploadFile) fd.append('file', uploadFile)
      await documentsAPI.create(fd)
      qc.invalidateQueries(['documents'])
      toast.success('Document added!')
      reset(); setUploadFile(null); setIsOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add document')
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={22} color="#6366f1" /> Document Vault
          </h1>
          <p className="page-subtitle">Store and manage all your important documents securely</p>
        </div>
        <button className="btn-primary" onClick={() => setIsOpen(true)}><Plus size={16} /> Add Document</button>
      </div>

      <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input type="text" placeholder="Search documents..." className="input-dark" style={{ paddingLeft: '36px' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-dark" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {isLoading ? <SkeletonGrid count={6} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
          {data?.map(doc => <DocCard key={doc._id} doc={doc} onDelete={(id) => deleteMutation.mutate(id)} />)}
          {!data?.length && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon"><FileText size={26} color="#6366f1" /></div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No documents yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add your first document to get started</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); reset() }} title="Add Document">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div><label className="form-label">Title *</label><input {...register('title', { required: true })} placeholder="e.g. My Aadhar Card" className="input-dark" /></div>
            <div><label className="form-label">Document Type *</label>
              <select {...register('type', { required: true })} className="input-dark">
                {DOC_TYPES.slice(1).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div><label className="form-label">Document Number</label><input {...register('documentNumber')} placeholder="e.g. XXXX-XXXX-XXXX" className="input-dark" /></div>
              <div><label className="form-label">Expiry Date</label><input {...register('expiryDate')} type="date" className="input-dark" /></div>
            </div>
            <div><label className="form-label">Tags (comma-separated)</label><input {...register('tags')} placeholder="e.g. identity, government" className="input-dark" /></div>
            <div><label className="form-label">Upload File</label><FileUploader onFileSelect={setUploadFile} label="Upload document (PDF or image)" /></div>
            <div><label className="form-label">Notes</label><textarea {...register('notes')} placeholder="Additional notes..." className="input-dark" rows={2} /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setIsOpen(false); reset() }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Save Document'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
