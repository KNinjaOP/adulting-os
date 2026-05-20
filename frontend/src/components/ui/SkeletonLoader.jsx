export default function SkeletonCard({ rows = 4 }) {
  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
      <div className="shimmer" style={{ height: '20px', width: '60%', borderRadius: '6px', marginBottom: '1rem' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer" style={{ height: '14px', width: `${70 + Math.random() * 30}%`, borderRadius: '4px', marginBottom: '0.5rem' }} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(69,71,90,0.3)', display: 'flex', gap: '1rem' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="shimmer" style={{ height: '14px', width: `${60 + i * 15}px`, borderRadius: '4px' }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(69,71,90,0.15)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="shimmer" style={{ height: '14px', width: `${50 + j * 20}px`, borderRadius: '4px' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={3} />
      ))}
    </div>
  )
}
