import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Upload, Shield, Zap, Lock } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

/* ── Floating tag – only shows on XL screens ── */
function FloatingTag({
  label, color, style,
}: {
  label: string; color: string; style: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.4, type: 'spring' }}
      className="absolute hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold select-none pointer-events-none"
      style={{
        ...style,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        color,
        backdropFilter: 'blur(8px)',
        boxShadow: `0 0 16px ${color}18`,
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
      {label}
    </motion.div>
  )
}

/* ── Inline contract preview card ── */
function ContractCard() {
  const bars = [
    { label: 'Critical', count: 3, color: '#ef4444', w: '35%' },
    { label: 'High',     count: 5, color: '#f97316', w: '55%' },
    { label: 'Medium',   count: 4, color: '#eab308', w: '45%' },
    { label: 'Low',      count: 7, color: '#22c55e', w: '80%' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 0.7, duration: 0.8, type: 'spring', stiffness: 70 }}
      className="w-full max-w-xs mx-auto xl:mx-0 animate-float"
    >
      <div className="card-premium p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Shield className="w-4 h-4" style={{ color: '#6366f1' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>Contract Analysis</div>
            <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>Employment_Agreement.pdf</div>
          </div>
          <div className="text-2xl font-black flex-shrink-0" style={{ color: '#ef4444', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>74</div>
        </div>

        {/* Risk bars */}
        {bars.map((row, i) => (
          <motion.div key={row.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + i * 0.1 }}
            className="flex items-center gap-3">
            <span className="text-xs font-medium w-12 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: row.w }} transition={{ delay: 1.4 + i * 0.1, duration: 0.8 }}
                className="h-full rounded-full" style={{ background: row.color }} />
            </div>
            <span className="text-xs font-bold w-3 text-right flex-shrink-0" style={{ color: row.color }}>{row.count}</span>
          </motion.div>
        ))}

        {/* Critical alert */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f87171' }} />
          <span className="text-xs font-semibold" style={{ color: '#f87171' }}>Non-Compete Clause — CRITICAL</span>
        </motion.div>

        {/* Agents */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="p-3 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>AI Agents Active</span>
          </div>
          {['Clause Extractor', 'Risk Analyzer', 'Legal Advisor'].map(a => (
            <div key={a} className="flex items-center gap-2 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{a}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const TAGS = [
    { label: 'Non-Compete Detected', color: '#ef4444', style: { top: '12%', right: '5%' } },
    { label: 'Auto-Renewal Risk',    color: '#f97316', style: { top: '38%', right: '2%' } },
    { label: 'IP Transfer Found',    color: '#eab308', style: { top: '60%', right: '8%' } },
    { label: 'Arbitration Required', color: '#f97316', style: { bottom: '15%', right: '3%' } },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none grid-pattern"
        style={{ opacity: isDark ? 0.35 : 0.2 }}
      />

      {/* Floating tags (desktop only) */}
      {TAGS.map(t => <FloatingTag key={t.label} {...t} />)}

      {/* ── Main Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 xl:gap-16 items-center">

          {/* Left: Text */}
          <div className="text-center xl:text-left">
            {/* Pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border"
              style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.25)', color: '#818cf8' }}
            >
              <Zap className="w-3.5 h-3.5" />
              Powered by Gemini 1.5 Pro · 3-Agent AI Pipeline
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-black tracking-tight leading-[1.05] mb-6"
              style={{
                fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                color: 'var(--text-primary)',
                fontSize: 'clamp(2.25rem, 5vw, 4.5rem)',
              }}
            >
              Know What{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                You're Signing
              </span>
              {' '}Before You Sign It.
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto xl:mx-0"
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
              className="flex flex-col sm:flex-row gap-3 justify-center xl:justify-start mb-10"
            >
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/analyze')}
                className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 w-full sm:w-auto"
                id="hero-analyze-btn"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                Analyze My Contract — Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-ghost text-sm sm:text-base px-5 py-3 w-full sm:w-auto"
              >
                <Shield className="w-4 h-4" />
                See a Demo
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center xl:justify-start"
            >
              {[
                { icon: Lock, label: 'Files never stored' },
                { icon: Zap, label: 'Results in ~20s' },
                { icon: Shield, label: 'Gemini 1.5 Pro AI' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Contract Card – visible on lg+ */}
          <div className="hidden lg:flex items-center justify-center xl:justify-end">
            <ContractCard />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-base))' }}
      />
    </section>
  )
}
