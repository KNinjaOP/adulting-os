import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, FileText, CreditCard, Heart, Car, Shield, Package, Calendar, BarChart3, Bell, ArrowRight, Star, CheckCircle } from 'lucide-react'

const features = [
  { icon: FileText, title: 'Document Vault', desc: 'Aadhar, PAN, Passport, Licenses — all in one secure place with expiry tracking', color: '#6366f1' },
  { icon: CreditCard, title: 'Subscription Manager', desc: 'Track Netflix, Spotify, gym memberships. Never miss a renewal again', color: '#8b5cf6' },
  { icon: Heart, title: 'Health Records', desc: 'Store prescriptions, reports, medicines. Get refill reminders automatically', color: '#f43f5e' },
  { icon: Car, title: 'Vehicle Manager', desc: 'Insurance, PUC, service history, fuel logs. Know your vehicle stats at a glance', color: '#0ea5e9' },
  { icon: Shield, title: 'Warranty Tracker', desc: 'Never let a warranty expire silently. Get alerts before it\'s too late', color: '#f59e0b' },
  { icon: Package, title: 'Delivery Tracker', desc: 'Unified tracking for Amazon, Flipkart, Swiggy and more from one dashboard', color: '#10b981' },
  { icon: Calendar, title: 'Deadlines & Reminders', desc: 'College forms, exam dates, bill due dates — never miss anything important', color: '#ec4899' },
  { icon: BarChart3, title: 'Analytics & Insights', desc: 'See where your money goes with beautiful charts and smart spending insights', color: '#f97316' },
]

const stats = [
  { value: '9+', label: 'Life Modules' },
  { value: '100%', label: 'Private & Secure' },
  { value: '0', label: 'Things to Forget' },
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#11111b', color: '#cdd6f4' }}>
      {/* Background effects */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(69,71,90,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#cdd6f4' }}>Adulting OS</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#a6adc8', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Sign In</Link>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem' }}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '120px', paddingBottom: '80px', textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '120px 2rem 80px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, marginBottom: '2rem' }}>
            <Star size={13} fill="#818cf8" /> The Operating System for Adult Life
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Stop juggling 12 apps<br />
            <span className="gradient-text">Start adulting smarter</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#6c7086', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            One dashboard to manage your documents, subscriptions, health records, vehicles, warranties, deliveries, and deadlines — all with smart reminders.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{ textDecoration: 'none', padding: '0.875rem 2rem', fontSize: '1rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap' }}>
          {stats.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#cdd6f4' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: '#6c7086', marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 2rem', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Everything You Need to Adult</h2>
          <p style={{ color: '#6c7086', marginTop: '0.75rem', fontSize: '1rem' }}>Nine powerful modules, one beautiful dashboard</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass card-hover" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontWeight: 700, color: '#cdd6f4', marginBottom: '0.5rem', fontSize: '1rem' }}>{title}</h3>
              <p style={{ color: '#6c7086', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '1.5rem', padding: '3rem 2rem' }}>
          <Zap size={40} color="#818cf8" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to level up adulting?</h2>
          <p style={{ color: '#6c7086', marginBottom: '2rem', fontSize: '1rem' }}>Join thousands who use Adulting OS to stay on top of life.</p>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '1rem 2.5rem', fontSize: '1rem' }}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(69,71,90,0.3)', padding: '2rem', textAlign: 'center', color: '#45475a', fontSize: '0.875rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Zap size={14} color="#6366f1" />
          <span style={{ color: '#6c7086', fontWeight: 600 }}>Adulting OS</span>
        </div>
        <p>© 2025 Adulting OS. Built with ❤️ to make adult life easier.</p>
      </footer>
    </div>
  )
}
