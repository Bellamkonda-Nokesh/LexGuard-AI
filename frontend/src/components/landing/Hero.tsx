import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Upload, Shield, Zap, Lock } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

const FLOATING_TAGS = [
  { label: 'Non-Compete Detected', color: '#ef4444', x: '68%', y: '18%', delay: 0 },
  { label: 'Auto-Renewal Risk', color: '#f97316', x: '72%', y: '42%', delay: 0.3 },
  { label: 'IP Transfer Found', color: '#eab308', x: '70%', y: '65%', delay: 0.6 },
  { label: 'Arbitration Required', color: '#f97316', x: '64%', y: '84%', delay: 0.9 },
  { label: 'Payment Terms Clear', color: '#22c55e', x: '12%', y: '72%', delay: 1.2 },
]

function FloatingTag({ label, color, x, y, delay }: { label: string; color: string; x: string; y: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay: delay + 1, duration: 0.4, type: 'spring' }}
      className="absolute hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md select-none"
      style={{
        left: x, top: y,
        background: `${color}15`,
        border: `1px solid ${color}35`,
        color,
        boxShadow: `0 0 16px ${color}20`,
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
      {label}
    </motion.div>
  )
}

export default function Hero() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Grid background */}
      <div
        className="absolute inset-0 grid-pattern opacity-40 pointer-events-none"
        style={{ opacity: isDark ? 0.4 : 0.25 }}
      />

      {/* Floating tags */}
      {FLOATING_TAGS.map(tag => <FloatingTag key={tag.label} {...tag} />)}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          {/* Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border"
            style={{
              background: 'rgba(99,102,241,0.1)',
              borderColor: 'rgba(99,102,241,0.25)',
              color: '#818cf8',
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            Powered by Gemini 1.5 Pro · 3-Agent AI Pipeline
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', color: 'var(--text-primary)' }}
          >
            Know What{' '}
            <span
              className="gradient-text animate-gradient"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
              }}
            >
              You're Signing
            </span>
            {' '}Before You Sign It.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            Upload any contract and our AI agents extract risky clauses, score each one,
            and explain implications in plain English — with negotiation strategies included.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 mb-14"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/analyze')}
              className="btn-primary text-base px-8 py-3.5"
              id="hero-analyze-btn"
            >
              <Upload className="w-5 h-5" />
              Analyze My Contract — Free
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-ghost text-base px-6 py-3.5"
            >
              <Shield className="w-4 h-4" />
              See a Demo
            </motion.button>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-6"
          >
            {[
              { icon: Lock, label: 'Files never stored' },
              { icon: Zap, label: 'Results in ~20s' },
              { icon: Shield, label: 'Gemini 1.5 Pro AI' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.1)' }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Contract card preview */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8, type: 'spring', stiffness: 80 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block animate-float"
        style={{ width: 340 }}
      >
        <div className="card-premium p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Shield className="w-4 h-4" style={{ color: '#6366f1' }} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Contract Analysis</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Employment_Agreement.pdf</div>
            </div>
            <div className="ml-auto text-2xl font-black" style={{ color: '#ef4444', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>74</div>
          </div>
          {[
            { label: 'Critical', count: 3, color: '#ef4444', w: '35%' },
            { label: 'High', count: 5, color: '#f97316', w: '55%' },
            { label: 'Medium', count: 4, color: '#eab308', w: '45%' },
            { label: 'Low', count: 7, color: '#22c55e', w: '80%' },
          ].map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs font-medium w-14" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: row.w }}
                  transition={{ delay: 1.4 + i * 0.1, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: row.color }}
                />
              </div>
              <span className="text-xs font-bold w-4 text-right" style={{ color: row.color }}>{row.count}</span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="p-3 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
            <span className="text-xs font-semibold" style={{ color: '#f87171' }}>Non-Compete Clause — CRITICAL</span>
          </motion.div>
          {/* AI Agents */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="p-3 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>AI Agents Active</span>
            </div>
            {['Clause Extractor', 'Risk Analyzer', 'Legal Advisor'].map((agent, i) => (
              <div key={agent} className="flex items-center gap-2 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{agent}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
