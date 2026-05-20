import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { healthAPI } from '../api/endpoints'
import { Heart, Plus, Trash2, Eye, Pill, Stethoscope, FileText, Syringe, AlertCircle, ExternalLink } from 'lucide-react'
import Modal from '../components/ui/Modal'
import FileUploader from '../components/ui/FileUploader'
import { SkeletonGrid } from '../components/ui/SkeletonLoader'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const TYPES = ['prescription', 'report', 'vaccination', 'appointment', 'medicine', 'checkup', 'other']
const TYPE_ICONS = { prescription: Pill, report: FileText, vaccination: Syringe, appointment: Stethoscope, medicine: Pill, checkup: Stethoscope, other: Heart }
const TYPE_COLORS = { prescription: '#10b981', report: '#6366f1', vaccination: '#f59e0b', appointment: '#0ea5e9', medicine: '#8b5cf6', checkup: '#f43f5e', other: '#6c7086' }

function HealthCard({ record, onDelete }) {
  const Icon = TYPE_ICONS[record.type] || Heart
  const color = TYPE_COLORS[record.type] || '#6c7086'
  const hasFile = record.fileUrl && record.fileUrl.trim() !== ''

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass card-hover"
      style={{ padding: '1.125rem', borderRadius: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: `${color}15`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={15} color={color} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{record.title}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px', textTransform: 'capitalize' }}>
              {record.type}{record.familyMember ? ` · ${record.familyMember}` : ''}
            </div>
          </div>
        </div>
        <button onClick={() => onDelete(record._id)}
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#f43f5e', cursor: 'pointer', flexShrink: 0 }}>
          <Trash2 size={12} />
        </button>
      </div>

      {record.doctor && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
          Dr. {record.doctor}{record.hospital ? ` · ${record.hospital}` : ''}
        </div>
      )}

      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        {format(new Date(record.date), 'dd MMM yyyy')}
      </div>

      {record.medicines?.length > 0 && (
        <div style={{ marginTop: '0.625rem', padding: '0.375rem 0.625rem', background: 'rgba(16,185,129,0.08)', borderRadius: '6px', fontSize: '0.72rem', color: '#10b981' }}>
          💊 {record.medicines.length} medicine{record.medicines.length > 1 ? 's' : ''} prescribed
        </div>
      )}

      {/* File status */}
      <div style={{ marginTop: '0.625rem' }}>
        {hasFile ? (
          <a href={record.fileUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
            <ExternalLink size={11} /> View File
          </a>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-faint)' }}>
            <Eye size={11} /> No file stored
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function Health() {
  const qc = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['health', typeFilter],
    queryFn: () => healthAPI.getAll({ type: typeFilter, limit: 50 }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => healthAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['health']); toast.success('Record deleted') },
  })

  const onSubmit = async (form) => {
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v) })
      if (uploadFile) fd.append('file', uploadFile)
      await healthAPI.create(fd)
      qc.invalidateQueries(['health'])
      toast.success('Health record added!')
      reset(); setUploadFile(null); setIsOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const label = (text, req) => (
    <label className="form-label">{text}{req && ' *'}</label>
  )

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Heart size={22} color="#f43f5e" /> Health Records
          </h1>
          <p className="page-subtitle">Manage prescriptions, reports, and medical history</p>
        </div>
        <button className="btn-primary" onClick={() => setIsOpen(true)}><Plus size={16} /> Add Record</button>
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['', ...TYPES].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{
            padding: '5px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: 'none',
            background: typeFilter === t ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.1)',
            color: typeFilter === t ? 'white' : '#818cf8', textTransform: 'capitalize',
          }}>
            {t || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? <SkeletonGrid count={6} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.875rem' }}>
          {data?.map(r => <HealthCard key={r._id} record={r} onDelete={id => deleteMutation.mutate(id)} />)}
          {!data?.length && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon"><Heart size={26} color="#f43f5e" /></div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No health records yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Add your first medical record</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); reset() }} title="Add Health Record" size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-row">
              <div>{label('Title', true)}<input {...register('title', { required: true })} placeholder="e.g. Blood Test Report" className="input-dark" /></div>
              <div>{label('Type', true)}
                <select {...register('type', { required: true })} className="input-dark">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div>{label('Doctor')}<input {...register('doctor')} placeholder="Dr. Smith" className="input-dark" /></div>
              <div>{label('Hospital')}<input {...register('hospital')} placeholder="City Hospital" className="input-dark" /></div>
            </div>
            <div className="form-row">
              <div>{label('Date')}<input {...register('date')} type="date" className="input-dark" /></div>
              <div>{label('Family Member')}<input {...register('familyMember')} placeholder="Self" className="input-dark" /></div>
            </div>
            <div>
              {label('Notes')}
              <textarea {...register('notes')} className="input-dark" rows={2} placeholder="Any additional notes..." />
            </div>
            <div>
              {label('Upload Report')}
              <FileUploader onFileSelect={setUploadFile} label="Upload prescription or report" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setIsOpen(false); reset() }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Save Record'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
