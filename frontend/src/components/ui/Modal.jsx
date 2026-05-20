import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const widths = { sm: '400px', md: '560px', lg: '720px', xl: '900px' }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: `min(${widths[size]}, calc(100vw - 2rem))`,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '1.25rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              transition: 'background 0.3s ease',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
              <button onClick={onClose} style={{
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                color: '#f43f5e', cursor: 'pointer', borderRadius: '8px',
                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={16} />
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: '1.5rem' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
