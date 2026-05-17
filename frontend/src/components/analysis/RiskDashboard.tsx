import { motion } from 'framer-motion'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { AlertTriangle, TrendingUp, FileText, Zap, Shield, CheckCircle, ChevronRight } from 'lucide-react'
import type { ContractAnalysis } from '@/types'
import { useTheme } from '@/context/ThemeContext'

interface Props {
  analysis: ContractAnalysis
  onClauseClick: () => void
}

/* ── SVG Arc Score Ring ───────────────────────────── */
function ScoreRing({ score, level }: { score: number; level: string }) {
  const size = 180
  const strokeW = 14
  const r = (size - strokeW) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const colorMap: Record<string, string> = {
    CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e'
  }
  const color = colorMap[level] || '#6366f1'
  const glowMap: Record<string, string> = {
    CRITICAL: 'rgba(239,68,68,0.3)', HIGH: 'rgba(249,115,22,0.3)',
    MEDIUM: 'rgba(234,179,8,0.3)', LOW: 'rgba(34,197,94,0.3)'
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeW} />
        {/* Fill */}
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          filter="url(#glow)"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-black"
          style={{ color, fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          {score}
        </motion.span>
        <span className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          RISK SCORE
        </span>
      </div>
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: `0 0 40px ${glowMap[level] || 'rgba(99,102,241,0.2)'}`,
          borderRadius: '50%',
        }}
      />
    </div>
  )
}

/* ── Stat Card ───────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, delay }: {
  icon: React.ElementType; label: string; value: number; color: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card-premium p-4 flex items-center gap-4"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}1a`, border: `1px solid ${color}30` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="text-2xl font-black" style={{ color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {value}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Custom Tooltip ──────────────────────────────── */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; fill: string }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs" style={{ minWidth: 120 }}>
      <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{payload[0].name}</div>
      <div className="font-black text-lg" style={{ color: payload[0].fill }}>{payload[0].value}</div>
    </div>
  )
}

export default function RiskDashboard({ analysis, onClauseClick }: Props) {
  const { isDark } = useTheme()
  const rs = analysis.risk_summary

  const barData = [
    { name: 'Critical', value: rs.critical_count, color: '#ef4444' },
    { name: 'High', value: rs.high_count, color: '#f97316' },
    { name: 'Medium', value: rs.medium_count, color: '#eab308' },
    { name: 'Low', value: rs.low_count, color: '#22c55e' },
  ]

  // Radar data from clause types
  const radarData = (() => {
    const typeMap: Record<string, number> = {}
    for (const c of analysis.clauses) {
      const k = c.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).slice(0, 14)
      typeMap[k] = Math.max(typeMap[k] || 0,
        { CRITICAL: 100, HIGH: 75, MEDIUM: 45, LOW: 15 }[c.severity] || 0)
    }
    return Object.entries(typeMap).slice(0, 7).map(([subject, A]) => ({ subject, A }))
  })()

  const axisColor = isDark ? 'rgba(148,163,184,0.5)' : 'rgba(71,85,105,0.6)'

  return (
    <div className="space-y-5">
      {/* Executive Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-5 flex items-start gap-4"
        style={{ borderColor: rs.overall_level === 'CRITICAL' ? 'rgba(239,68,68,0.25)' : 'var(--border)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <Zap className="w-5 h-5" style={{ color: '#6366f1' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>AI Executive Summary</span>
            <span className={`badge-${rs.overall_level.toLowerCase()}`}>{rs.overall_level} RISK</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {rs.executive_summary}
          </p>
        </div>
      </motion.div>

      {/* Main Grid: Score + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Score Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card-premium p-6 flex flex-col items-center justify-center gap-4"
        >
          <ScoreRing score={rs.overall_score} level={rs.overall_level} />
          <div className="text-center">
            <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
              {rs.contract_type}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {rs.total_clauses} clauses · {analysis.filename}
            </div>
          </div>
          {/* Trust Meter */}
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: 'var(--text-muted)' }}>Trust Score</span>
              <span className="font-bold" style={{ color: rs.trust_score > 60 ? '#22c55e' : rs.trust_score > 40 ? '#eab308' : '#ef4444' }}>
                {rs.trust_score}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${rs.trust_score}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                style={{
                  background: rs.trust_score > 60
                    ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                    : rs.trust_score > 40
                    ? 'linear-gradient(90deg, #eab308, #facc15)'
                    : 'linear-gradient(90deg, #ef4444, #f87171)',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stat Cards 2x2 */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          <StatCard icon={AlertTriangle} label="Critical Clauses" value={rs.critical_count} color="#ef4444" delay={0.1} />
          <StatCard icon={TrendingUp} label="High Risk" value={rs.high_count} color="#f97316" delay={0.15} />
          <StatCard icon={FileText} label="Medium Risk" value={rs.medium_count} color="#eab308" delay={0.2} />
          <StatCard icon={CheckCircle} label="Low Risk" value={rs.low_count} color="#22c55e" delay={0.25} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Risk Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barCategoryGap="35%">
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="card-premium p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Risk Radar</span>
          </div>
          {radarData.length > 2 ? (
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: axisColor }} />
                <Radar name="Risk" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.18} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--text-muted)' }}>
              Not enough clause types for radar
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Risks */}
      {rs.top_risks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-premium p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: '#ef4444' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Key Red Flags</span>
            </div>
            <button
              onClick={onClauseClick}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: '#6366f1' }}
            >
              View All Clauses <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {rs.top_risks.slice(0, 4).map((risk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.07 }}
                className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer"
                style={{ background: 'var(--bg-card)' }}
                onClick={onClauseClick}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5"
                  style={{
                    background: i === 0 ? 'rgba(239,68,68,0.12)' : i === 1 ? 'rgba(249,115,22,0.12)' : 'rgba(234,179,8,0.1)',
                    color: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#eab308',
                  }}
                >
                  {i + 1}
                </div>
                <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>{risk}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
