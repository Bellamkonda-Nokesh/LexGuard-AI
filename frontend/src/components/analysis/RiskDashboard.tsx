import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, FileText, Zap, Shield, CheckCircle, ChevronRight } from 'lucide-react'
import type { ContractAnalysis } from '@/types'
import React from 'react'

interface Props {
  analysis: ContractAnalysis
  onClauseClick: () => void
}

/* ── SVG Arc Score Ring ───────────────────────────── */
function ScoreRing({ score, level }: { score: number; level: string }) {
  const size = 180, strokeW = 14
  const r = (size - strokeW) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const colorMap: Record<string, string> = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' }
  const color = colorMap[level] || '#6366f1'
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeW} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={strokeW} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
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
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}1a`, border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="text-2xl font-black" style={{ color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value}</div>
      </div>
    </motion.div>
  )
}

/* ── Simple horizontal bar row ───────────────────── */
function RiskBarRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-xs font-semibold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
      <div className="w-6 text-xs font-black text-right flex-shrink-0" style={{ color }}>{count}</div>
    </div>
  )
}

export default function RiskDashboard({ analysis, onClauseClick }: Props) {
  const rs = analysis.risk_summary
  const total = rs.total_clauses || (rs.critical_count + rs.high_count + rs.medium_count + rs.low_count)

  return (
    <div className="space-y-5">
      {/* Executive Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-5 flex items-start gap-4"
        style={{ borderColor: rs.overall_level === 'CRITICAL' ? 'rgba(239,68,68,0.25)' : 'var(--border)' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Zap className="w-5 h-5" style={{ color: '#6366f1' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
            <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{rs.contract_type}</div>
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
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${rs.trust_score}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                style={{
                  background: rs.trust_score > 60 ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                    : rs.trust_score > 40 ? 'linear-gradient(90deg,#eab308,#facc15)'
                    : 'linear-gradient(90deg,#ef4444,#f87171)',
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

      {/* Risk Distribution — Simple horizontal bars (no library needed) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-premium p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Risk Distribution</span>
          <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{total} total clauses</span>
        </div>
        <div className="space-y-4">
          <RiskBarRow label="Critical" count={rs.critical_count} total={total} color="#ef4444" />
          <RiskBarRow label="High" count={rs.high_count} total={total} color="#f97316" />
          <RiskBarRow label="Medium" count={rs.medium_count} total={total} color="#eab308" />
          <RiskBarRow label="Low" count={rs.low_count} total={total} color="#22c55e" />
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 flex flex-wrap gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Critical — Immediate action required', color: '#ef4444' },
            { label: 'High — Review before signing', color: '#f97316' },
            { label: 'Medium — Negotiate if possible', color: '#eab308' },
            { label: 'Low — Standard terms', color: '#22c55e' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Clause type breakdown */}
      {analysis.clauses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card-premium p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Clause Type Breakdown</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {analysis.clauses.map((c, i) => {
              const colorMap: Record<string, string> = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' }
              const color = colorMap[c.severity] || '#818cf8'
              return (
                <div key={c.id || i} className="p-3 rounded-xl border transition-all cursor-pointer"
                  style={{ background: `${color}08`, borderColor: `${color}25` }}
                  onClick={onClauseClick}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${color}50`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = `${color}25`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color }}>{c.severity}</div>
                  <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</div>
                  <div className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{c.type.replace(/-/g,' ')}</div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

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
            <button onClick={onClauseClick} className="flex items-center gap-1 text-xs font-medium" style={{ color: '#6366f1' }}>
              View All Clauses <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {rs.top_risks.slice(0, 5).map((risk, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.07 }}
                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: 'var(--bg-card)' }}
                onClick={onClauseClick}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5"
                  style={{
                    background: i === 0 ? 'rgba(239,68,68,0.12)' : i === 1 ? 'rgba(249,115,22,0.12)' : 'rgba(234,179,8,0.1)',
                    color: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#eab308',
                  }}
                >{i + 1}</div>
                <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>{risk}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
