import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  AlertTriangle, Shield, FileText, TrendingUp, CheckCircle,
  AlertOctagon, Info, Zap
} from 'lucide-react'
import type { ContractAnalysis } from '@/types'
import { getRiskColor } from '@/lib/utils'

interface Props {
  analysis: ContractAnalysis
  onClauseClick?: () => void
}

const RISK_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
}

const RiskIcon = ({ level }: { level: string }) => {
  if (level === 'CRITICAL') return <AlertOctagon className="w-5 h-5 text-red-400" />
  if (level === 'HIGH') return <AlertTriangle className="w-5 h-5 text-orange-400" />
  if (level === 'MEDIUM') return <Info className="w-5 h-5 text-amber-400" />
  return <CheckCircle className="w-5 h-5 text-emerald-400" />
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {value}
    </motion.span>
  )
}

export default function RiskDashboard({ analysis, onClauseClick }: Props) {
  const { risk_summary } = analysis

  const chartData = [
    { name: 'Critical', value: risk_summary.critical_count, color: RISK_COLORS.CRITICAL },
    { name: 'High', value: risk_summary.high_count, color: RISK_COLORS.HIGH },
    { name: 'Medium', value: risk_summary.medium_count, color: RISK_COLORS.MEDIUM },
    { name: 'Low', value: risk_summary.low_count, color: RISK_COLORS.LOW },
  ].filter((d) => d.value > 0)

  const riskColor = getRiskColor(risk_summary.overall_level)

  const scorePercent = risk_summary.overall_score

  return (
    <div className="space-y-6">
      {/* Top summary row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall risk score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 card p-6 flex items-center gap-6"
        >
          {/* Circular progress */}
          <div className="relative shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={riskColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * scorePercent) / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black" style={{ color: riskColor }}>
                <AnimatedCounter value={scorePercent} />
              </span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">Overall Risk Score</div>
            <div className="text-2xl font-bold text-white mb-1">{risk_summary.overall_level}</div>
            <div className={`text-xs px-2.5 py-1 rounded-full border inline-block`}
              style={{
                color: riskColor,
                borderColor: `${riskColor}40`,
                background: `${riskColor}15`,
              }}
            >
              {scorePercent >= 75 ? 'Highly Risky Contract' 
                : scorePercent >= 50 ? 'Moderately Risky'
                : scorePercent >= 25 ? 'Low Risk'
                : 'Generally Safe'}
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        {[
          {
            icon: FileText, label: 'Total Clauses', value: risk_summary.total_clauses,
            color: 'text-brand-400', bg: 'from-brand-500/20 to-violet-500/20',
          },
          {
            icon: AlertOctagon, label: 'Critical Issues', value: risk_summary.critical_count,
            color: 'text-red-400', bg: 'from-red-500/20 to-orange-500/20',
          },
          {
            icon: TrendingUp, label: 'Trust Score', value: `${risk_summary.trust_score}%`,
            color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20',
          },
        ].map((s) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 flex flex-col justify-between"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts + summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-400" />
            Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0d0d16',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                }}
              />
              <Legend
                formatter={(value, entry) => (
                  <span style={{ color: (entry as { color?: string }).color, fontSize: '11px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Severity breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" />
            Severity Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Critical', count: risk_summary.critical_count, color: RISK_COLORS.CRITICAL },
              { label: 'High', count: risk_summary.high_count, color: RISK_COLORS.HIGH },
              { label: 'Medium', count: risk_summary.medium_count, color: RISK_COLORS.MEDIUM },
              { label: 'Low', count: risk_summary.low_count, color: RISK_COLORS.LOW },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">{row.label}</span>
                  <span className="text-xs font-mono" style={{ color: row.color }}>{row.count}</span>
                </div>
                <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: row.color }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${risk_summary.total_clauses > 0 ? (row.count / risk_summary.total_clauses) * 100 : 0}%`,
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">Contract Type:</span>
              <span className="text-xs font-medium text-brand-300">{risk_summary.contract_type}</span>
            </div>
          </div>
        </motion.div>

        {/* Top risks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Top Red Flags
          </h3>
          <div className="space-y-2.5">
            {risk_summary.top_risks.slice(0, 5).map((risk, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div
                  className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: i === 0 ? `${RISK_COLORS.CRITICAL}20` : i < 2 ? `${RISK_COLORS.HIGH}20` : `${RISK_COLORS.MEDIUM}20`,
                    color: i === 0 ? RISK_COLORS.CRITICAL : i < 2 ? RISK_COLORS.HIGH : RISK_COLORS.MEDIUM,
                  }}
                >
                  {i + 1}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{risk}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onClauseClick}
            className="mt-4 w-full text-xs text-brand-400 hover:text-brand-300 transition-colors text-center py-2 border border-brand-500/20 rounded-lg hover:border-brand-500/40"
          >
            Explore All Clauses →
          </button>
        </motion.div>
      </div>

      {/* Executive summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
            <RiskIcon level={risk_summary.overall_level} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Executive Summary</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{risk_summary.executive_summary}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
