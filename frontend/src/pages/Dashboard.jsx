import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { dashboardAPI } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/ui/StatCard'
import SkeletonCard from '../components/ui/SkeletonLoader'
import {
  FileText, CreditCard, Car, Package, Bell, AlertTriangle, Calendar,
  TrendingUp, Shield, Zap, CheckCircle2, ExternalLink
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

const STATUS_COLORS = {
  ordered: '#6366f1', processing: '#f59e0b', shipped: '#0ea5e9',
  out_for_delivery: '#8b5cf6', delivered: '#10b981', cancelled: '#f43f5e'
}

function SectionLabel({ icon: Icon, label, color }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)',
      marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
      textTransform: 'uppercase', letterSpacing: '0.08em'
    }}>
      <Icon size={12} color={color} /> {label}
    </div>
  )
}

function AlertBanner({ items, label, color = '#f59e0b', icon: Icon }) {
  if (!items?.length) return null
  return (
    <div style={{
      background: `${color}10`, border: `1px solid ${color}25`,
      borderRadius: '0.625rem', padding: '0.625rem 0.875rem', marginBottom: '0.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
        <Icon size={12} color={color} />
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ background: color, color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '0 5px', borderRadius: '999px', lineHeight: '16px' }}>{items.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {items.slice(0, 3).map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.3rem 0.5rem', background: 'rgba(0,0,0,0.08)', borderRadius: '5px'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {item.title || item.name || item.itemName || item.productName}
            </span>
            <span style={{ fontSize: '0.68rem', color, fontWeight: 600, flexShrink: 0, marginLeft: '0.5rem' }}>
              {item.expiryDate && `${differenceInDays(new Date(item.expiryDate), new Date())}d`}
              {item.renewalDate && `${differenceInDays(new Date(item.renewalDate), new Date())}d`}
              {item.dueDate && `${differenceInDays(new Date(item.dueDate), new Date())}d`}
              {item.warrantyEndDate && `${differenceInDays(new Date(item.warrantyEndDate), new Date())}d`}
              {item.estimatedDelivery && format(new Date(item.estimatedDelivery), 'MMM d')}
            </span>
          </div>
        ))}
        {items.length > 3 && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center' }}>+{items.length - 3} more</div>}
      </div>
    </div>
  )
}

function SmallCard({ children, style }) {
  return (
    <div className="glass" style={{ borderRadius: '0.75rem', overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

function ListRow({ left, sub, right, isLast }) {
  return (
    <div style={{
      padding: '0.625rem 0.875rem',
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem'
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{left}</div>
        {sub && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1px', textTransform: 'capitalize' }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  )
}

function EmptyRow({ message }) {
  return <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{message}</div>
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardAPI.getSummary().then(r => r.data.data)
  })

  const stats = data?.stats || {}
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const hasAlerts = data?.expiringDocs?.length || data?.upcomingDeadlines?.length ||
    data?.expiringWarranties?.length || data?.activeSubscriptions?.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={16} color="white" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.4rem' }}>{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="page-subtitle">Here's your life admin summary for today</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
        {isLoading ? [...Array(6)].map((_, i) => <SkeletonCard key={i} rows={2} />) : (<>
          <StatCard title="Documents" value={stats.totalDocuments || 0} icon={FileText} color="#6366f1" index={0} />
          <StatCard title="Subscriptions" value={stats.activeSubscriptions || 0} subtitle={`₹${stats.monthlySubscriptionSpend || 0}/mo`} icon={CreditCard} color="#8b5cf6" index={1} />
          <StatCard title="Vehicles" value={stats.totalVehicles || 0} icon={Car} color="#0ea5e9" index={2} />
          <StatCard title="Deliveries" value={stats.activeDeliveries || 0} icon={Package} color="#f59e0b" index={3} />
          <StatCard title="Alerts" value={stats.unreadNotifications || 0} icon={Bell} color="#f43f5e" index={4} />
          <StatCard title="Overdue" value={stats.overdueDeadlines || 0} icon={AlertTriangle} color="#f43f5e" index={5} />
        </>)}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.25rem', alignItems: 'start' }}>

        {/* Left: Alerts */}
        <div>
          <SectionLabel icon={AlertTriangle} label="Urgent Alerts" color="#f59e0b" />
          {isLoading ? <SkeletonCard rows={4} /> : (
            <SmallCard style={{ padding: '0.75rem' }}>
              <AlertBanner items={data?.expiringDocs} label="Documents Expiring" color="#f43f5e" icon={FileText} />
              <AlertBanner items={data?.upcomingDeadlines} label="Upcoming Deadlines" color="#f59e0b" icon={Calendar} />
              <AlertBanner items={data?.expiringWarranties} label="Warranties Expiring" color="#8b5cf6" icon={Shield} />
              <AlertBanner items={data?.activeSubscriptions?.slice(0, 3)} label="Renewals Due" color="#0ea5e9" icon={CreditCard} />
              {!hasAlerts && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.5rem' }}>
                  <CheckCircle2 size={22} color="#10b981" />
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>All clear!</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No urgent alerts right now.</p>
                  </div>
                </div>
              )}
            </SmallCard>
          )}
        </div>

        {/* Right: Deliveries + Receipts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <SectionLabel icon={Package} label="Active Deliveries" color="#f59e0b" />
            {isLoading ? <SkeletonCard rows={3} /> : (
              <SmallCard>
                {data?.pendingDeliveries?.length > 0 ? data.pendingDeliveries.map((d, i) => (
                  <ListRow key={d._id} left={d.itemName} sub={d.platform}
                    isLast={i === data.pendingDeliveries.length - 1}
                    right={<span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px', borderRadius: '999px', background: `${STATUS_COLORS[d.status]}18`, color: STATUS_COLORS[d.status] }}>{d.status.replace(/_/g, ' ')}</span>}
                  />
                )) : <EmptyRow message="No active deliveries" />}
              </SmallCard>
            )}
          </div>
          <div>
            <SectionLabel icon={TrendingUp} label="Recent Receipts" color="#10b981" />
            {isLoading ? <SkeletonCard rows={3} /> : (
              <SmallCard>
                {data?.recentReceipts?.length > 0 ? data.recentReceipts.map((r, i) => (
                  <ListRow key={r._id} left={r.title} sub={r.storeName}
                    isLast={i === data.recentReceipts.length - 1}
                    right={<span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>₹{r.amount?.toLocaleString()}</span>}
                  />
                )) : <EmptyRow message="No receipts yet" />}
              </SmallCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
