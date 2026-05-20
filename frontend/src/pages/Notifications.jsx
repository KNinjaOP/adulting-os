import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { notificationsAPI } from '../api/endpoints'
import { Bell, Trash2, CheckCheck, Check, FileText, CreditCard, Shield, Calendar, Pill, Car, Package } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const TYPE_ICONS = {
  document_expiry: FileText, subscription_renewal: CreditCard, warranty_expiry: Shield,
  deadline: Calendar, medicine: Pill, vehicle_renewal: Car, delivery: Package, general: Bell
}
const TYPE_COLORS = {
  document_expiry: '#6366f1', subscription_renewal: '#8b5cf6', warranty_expiry: '#f59e0b',
  deadline: '#f43f5e', medicine: '#10b981', vehicle_renewal: '#0ea5e9', delivery: '#f97316', general: '#6c7086'
}

export default function Notifications() {
  const qc = useQueryClient()
  const { refresh } = useNotifications()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll({ limit: 50 }).then(r => r.data),
  })

  const markReadMutation = useMutation({ mutationFn: (id) => notificationsAPI.markRead(id), onSuccess: () => { qc.invalidateQueries(['notifications']); refresh() } })
  const markAllMutation = useMutation({ mutationFn: () => notificationsAPI.markAllRead(), onSuccess: () => { qc.invalidateQueries(['notifications']); toast.success('All marked read'); refresh() } })
  const deleteMutation = useMutation({ mutationFn: (id) => notificationsAPI.delete(id), onSuccess: () => { qc.invalidateQueries(['notifications']); refresh() } })
  const clearMutation = useMutation({ mutationFn: () => notificationsAPI.clearRead(), onSuccess: () => { qc.invalidateQueries(['notifications']); toast.success('Cleared'); refresh() } })

  const notifications = data?.data || []
  const unreadCount = data?.unreadCount || 0

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={22} color="#f59e0b" /> Notifications
            {unreadCount > 0 && <span style={{ background: '#f43f5e', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>{unreadCount}</span>}
          </h1>
          <p className="page-subtitle">All your life admin alerts in one place</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {unreadCount > 0 && (
            <button className="btn-secondary" onClick={() => markAllMutation.mutate()} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              <CheckCheck size={15} /> Mark All Read
            </button>
          )}
          <button className="btn-danger" onClick={() => clearMutation.mutate()} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
            <Trash2 size={15} /> Clear Read
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {notifications.map((notif, i) => {
          const Icon = TYPE_ICONS[notif.type] || Bell
          const color = TYPE_COLORS[notif.type] || '#6c7086'
          return (
            <motion.div key={notif._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="glass card-hover"
              style={{ padding: '0.875rem 1.125rem', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: notif.isRead ? 0.65 : 1, borderLeft: notif.isRead ? undefined : `3px solid ${color}` }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: `${color}14`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{notif.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{notif.message}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>{format(new Date(notif.createdAt), 'dd MMM yyyy · HH:mm')}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {!notif.isRead && (
                  <button onClick={() => markReadMutation.mutate(notif._id)} title="Mark read"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '7px', padding: '6px', display: 'flex', alignItems: 'center', color: '#10b981', cursor: 'pointer' }}>
                    <Check size={13} />
                  </button>
                )}
                <button onClick={() => deleteMutation.mutate(notif._id)}
                  style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '7px', padding: '6px', display: 'flex', alignItems: 'center', color: '#f43f5e', cursor: 'pointer' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          )
        })}

        {!isLoading && !notifications.length && (
          <div className="empty-state glass" style={{ borderRadius: '1rem', padding: '3.5rem' }}>
            <div className="empty-state-icon"><Bell size={26} color="#f59e0b" /></div>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>All clear! No notifications</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>You'll be notified about expiring documents, renewals, and deadlines</p>
          </div>
        )}
      </div>
    </div>
  )
}
