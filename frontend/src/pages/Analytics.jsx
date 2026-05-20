import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../api/endpoints'
import { BarChart3 } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import SkeletonCard from '../components/ui/SkeletonLoader'
import { format } from 'date-fns'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#f97316']

const ChartCard = ({ title, children, span = 1 }) => (
  <div className="glass" style={{ padding: '1.25rem', borderRadius: '0.875rem', gridColumn: `span ${span}` }}>
    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
    {children}
  </div>
)

const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
        {label && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>}
        {payload.map((p, i) => (
          <div key={i} style={{ fontSize: '0.8rem', fontWeight: 700, color: p.color || 'var(--text-primary)' }}>
            {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsAPI.getAll().then(r => r.data.data),
  })

  if (isLoading) return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><BarChart3 size={24} color="#6366f1" /> Analytics & Insights</h1>
        <p className="page-subtitle">Visual overview of your spending and life admin data</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} rows={6} />)}
      </div>
    </div>
  )

  const monthlySpending = data?.monthlySpending?.map(m => ({
    month: `${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m._id.month]} ${String(m._id.year).slice(2)}`,
    spend: m.total || 0,
    count: m.count || 0,
  })) || []

  const spendingByCategory = data?.spendingByCategory?.map(c => ({ name: c._id, value: c.total, count: c.count })) || []
  const subByCategory = data?.subscriptionByCategory?.map(c => ({ name: c._id, value: c.total })) || []
  const healthByType = data?.healthByType?.map(h => ({ name: h._id, value: h.count })) || []
  const vehicleExpenses = data?.vehicleExpenses || []

  const totalSpent = data?.totalSpent || 0

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart3 size={24} color="#6366f1" /> Analytics & Insights
        </h1>
        <p className="page-subtitle">Visual overview of your spending and life admin data</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
        <div className="glass" style={{ padding: '1.125rem', borderRadius: '0.875rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>₹{totalSpent.toLocaleString()}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>TOTAL RECORDED SPEND</div>
        </div>
        <div className="glass" style={{ padding: '1.125rem', borderRadius: '0.875rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#8b5cf6' }}>{subByCategory.length}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>SUBSCRIPTION CATEGORIES</div>
        </div>
        <div className="glass" style={{ padding: '1.125rem', borderRadius: '0.875rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f43f5e' }}>{healthByType.reduce((s, h) => s + h.value, 0)}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>HEALTH RECORDS</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

        {/* Monthly Spending Trend */}
        {monthlySpending.length > 0 && (
          <ChartCard title="📈 Monthly Spending Trend (₹)" span={2}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlySpending}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(69,71,90,0.3)" />
                <XAxis dataKey="month" tick={{ fill: '#6c7086', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6c7086', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="spend" stroke="#6366f1" strokeWidth={2.5} fill="url(#spendGrad)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Spending by Category */}
        {spendingByCategory.length > 0 && (
          <ChartCard title="💸 Spending by Category">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={spendingByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {spendingByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{ background: '#1e1e2e', border: 'none', borderRadius: '8px', color: '#cdd6f4', fontSize: '12px' }} />
                <Legend formatter={v => v} wrapperStyle={{ fontSize: '11px', color: '#6c7086' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Subscriptions by Category */}
        {subByCategory.length > 0 && (
          <ChartCard title="💳 Subscription Spend (₹/mo by Category)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(69,71,90,0.3)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6c7086', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#6c7086', fontSize: 11, textTransform: 'capitalize' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ background: '#1e1e2e', border: 'none', borderRadius: '8px', color: '#cdd6f4', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {subByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Health records */}
        {healthByType.length > 0 && (
          <ChartCard title="🏥 Health Records by Type">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={healthByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(69,71,90,0.3)" />
                <XAxis dataKey="name" tick={{ fill: '#6c7086', fontSize: 11, textTransform: 'capitalize' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6c7086', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e1e2e', border: 'none', borderRadius: '8px', color: '#cdd6f4', fontSize: '12px' }} />
                <Bar dataKey="value" name="Count" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Vehicle expenses */}
        {vehicleExpenses.length > 0 && (
          <ChartCard title="🚗 Vehicle Expenses" span={vehicleExpenses.length === 1 ? 1 : 2}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={vehicleExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(69,71,90,0.3)" />
                <XAxis dataKey="name" tick={{ fill: '#6c7086', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6c7086', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ background: '#1e1e2e', border: 'none', borderRadius: '8px', color: '#cdd6f4', fontSize: '12px' }} />
                <Bar dataKey="fuel" name="Fuel" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="service" name="Service" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#6c7086' }} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Empty state */}
        {!monthlySpending.length && !spendingByCategory.length && !subByCategory.length && (
          <div className="empty-state glass" style={{ gridColumn: '1/-1', borderRadius: '0.875rem' }}>
            <div className="empty-state-icon"><BarChart3 size={26} color="#6366f1" /></div>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No analytics data yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add receipts, subscriptions and health records to see insights here</p>
          </div>
        )}
      </div>
    </div>
  )
}
