import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon: Icon, color = '#6366f1', trend, trendValue, index = 0 }) {
  const isPositive = trend === 'up'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass card-hover"
      style={{ padding: '1.125rem 1.25rem', borderRadius: '0.875rem', cursor: 'default' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: `${color}18`,
          border: `1px solid ${color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={17} color={color} />
        </div>
        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            fontSize: '0.7rem', fontWeight: 600,
            color: isPositive ? '#10b981' : '#f43f5e',
            background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
            padding: '2px 7px', borderRadius: '999px'
          }}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trendValue}
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ marginTop: '0.2rem', fontSize: '0.7rem', color: 'var(--text-faint)' }}>{subtitle}</div>
      )}
    </motion.div>
  )
}
