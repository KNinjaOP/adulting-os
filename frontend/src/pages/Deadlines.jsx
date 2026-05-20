import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { deadlinesAPI } from '../api/endpoints'
import { Calendar, Plus, Trash2, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { SkeletonGrid } from '../components/ui/SkeletonLoader'
import { useForm } from 'react-hook-form'
import { format, differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'

const CATEGORIES = ['education', 'finance', 'health', 'government', 'work', 'personal', 'vehicle', 'other']
const PRIORITIES = ['low', 'medium', 'high', 'critical']
const PRIORITY_COLORS = { low: 'var(--text-muted)', medium: '#f59e0b', high: '#f43f5e', critical: '#f43f5e' }

function DeadlineCard({ deadline, onDelete, onComplete }) {
  const daysLeft = differenceInDays(new Date(deadline.dueDate), new Date())
  const isOverdue = daysLeft < 0 && deadline.status !== 'completed'
  const isDone = deadline.status === 'completed'
  const priorityColor = PRIORITY_COLORS[deadline.priority] || 'var(--text-muted)'

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass card-hover"
      style={{ padding: '1.125rem', borderRadius: '0.875rem', opacity: isDone ? 0.6 : 1, borderLeft: `3px solid ${isDone ? '#10b981' : isOverdue ? '#f43f5e' : priorityColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', textDecoration: isDone ? 'line-through' : 'none' }}>{deadline.title}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'capitalize' }}>{deadline.category} · {deadline.priority} priority</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.75rem' }}>
          {!isDone && (
            <button onClick={() => onComplete(deadline._id)} title="Mark complete" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#10b981', cursor: 'pointer' }}>
              <CheckCircle size={13} />
            </button>
          )}
          <button onClick={() => onDelete(deadline._id)} style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '7px', padding: '5px', display: 'flex', alignItems: 'center', color: '#f43f5e', cursor: 'pointer' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {deadline.description && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>{deadline.description}</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isDone ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
            <CheckCircle size={13} /> Completed
          </span>
        ) : isOverdue ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#f43f5e', fontWeight: 700 }}>
            <AlertTriangle size={13} /> Overdue by {Math.abs(daysLeft)} days
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: daysLeft <= 3 ? '#f43f5e' : daysLeft <= 7 ? '#f59e0b' : 'var(--text-muted)', fontWeight: daysLeft <= 7 ? 700 : 400 }}>
            <Clock size={13} /> {daysLeft === 0 ? 'Due today!' : `Due in ${daysLeft} days`} · {format(new Date(deadline.dueDate), 'dd MMM yyyy')}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function Deadlines() {
  const qc = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('pending')
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data: deadlines = [], isLoading } = useQuery({
    queryKey: ['deadlines', statusFilter],
    queryFn: () => deadlinesAPI.getAll({ status: statusFilter, limit: 50 }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({ mutationFn: (id) => deadlinesAPI.delete(id), onSuccess: () => { qc.invalidateQueries(['deadlines']); toast.success('Deleted') } })
  const completeMutation = useMutation({ mutationFn: (id) => deadlinesAPI.complete(id), onSuccess: () => { qc.invalidateQueries(['deadlines']); toast.success('Marked complete! 🎉') } })

  const onSubmit = async (form) => {
    try {
      await deadlinesAPI.create(form)
      qc.invalidateQueries(['deadlines'])
      toast.success('Deadline added!')
      reset(); setIsOpen(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const overdueCount = deadlines.filter(d => d.status === 'overdue').length

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Calendar size={22} color="#f59e0b" /> Deadlines & Reminders</h1>
          <p className="page-subtitle">Never miss an important deadline or renewal</p>
        </div>
        <button className="btn-primary" onClick={() => setIsOpen(true)}><Plus size={16} /> Add Deadline</button>
      </div>

      {overdueCount > 0 && (
        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '0.875rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={16} color="#f43f5e" />
          <span style={{ color: '#f43f5e', fontWeight: 600, fontSize: '0.875rem' }}>{overdueCount} overdue deadline{overdueCount > 1 ? 's' : ''}! Please take action.</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem' }}>
        {[['pending', 'Pending'], ['overdue', 'Overdue'], ['completed', 'Completed'], ['', 'All']].map(([v, l]) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            style={{ padding: '5px 13px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: statusFilter === v ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.1)', color: statusFilter === v ? 'white' : '#818cf8' }}>
            {l}
          </button>
        ))}
      </div>

      {isLoading ? <SkeletonGrid count={6} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
          {deadlines.map(d => <DeadlineCard key={d._id} deadline={d} onDelete={id => deleteMutation.mutate(id)} onComplete={id => completeMutation.mutate(id)} />)}
          {!deadlines.length && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon"><Calendar size={26} color="#f59e0b" /></div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No deadlines</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add important deadlines and reminders</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); reset() }} title="Add Deadline">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div><label className="form-label">Title *</label><input {...register('title', { required: true })} placeholder="Submit exam form" className="input-dark" /></div>
            <div><label className="form-label">Description</label><textarea {...register('description')} className="input-dark" rows={2} placeholder="Any notes..." /></div>
            <div className="form-row">
              <div><label className="form-label">Due Date *</label><input {...register('dueDate', { required: true })} type="date" className="input-dark" /></div>
              <div><label className="form-label">Priority</label>
                <select {...register('priority')} className="input-dark">
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div><label className="form-label">Category</label>
                <select {...register('category')} className="input-dark">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="form-label">Remind me (days before)</label><input {...register('reminderDaysBefore', { valueAsNumber: true })} type="number" defaultValue={3} className="input-dark" /></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setIsOpen(false); reset() }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving...' : 'Add Deadline'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
