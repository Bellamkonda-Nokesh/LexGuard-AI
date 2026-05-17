import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertOctagon, AlertTriangle, Info, CheckCircle, Copy, Lightbulb, Scale, Zap, Shield } from 'lucide-react'
import type { Clause } from '@/types'
import { getRiskBadgeClass, getRiskColor } from '@/lib/utils'
import { useState } from 'react'

interface Props {
  clause: Clause
  onClose: () => void
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'implication', label: 'Implications', icon: Zap },
  { id: 'benchmark', label: 'Benchmark', icon: Scale },
  { id: 'negotiate', label: 'Negotiate', icon: Lightbulb },
]

const RiskIcon = ({ level }: { level: string }) => {
  if (level === 'CRITICAL') return <AlertOctagon className="w-5 h-5 text-red-400" />
  if (level === 'HIGH') return <AlertTriangle className="w-5 h-5 text-orange-400" />
  if (level === 'MEDIUM') return <Info className="w-5 h-5 text-amber-400" />
  return <CheckCircle className="w-5 h-5 text-emerald-400" />
}

export default function AIReasoningPanel({ clause, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const riskColor = getRiskColor(clause.severity)

  const copyText = async () => {
    await navigator.clipboard.writeText(clause.raw_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="flex flex-col card-premium overflow-hidden"
        style={{ minHeight: 440 }}
      >
        {/* Header */}
        <div className="p-5 flex items-start gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <RiskIcon level={clause.severity} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>{clause.title}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={getRiskBadgeClass(clause.severity)}>{clause.severity}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{clause.type}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors" aria-label="Close panel"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-2" style={{ borderBottom: '1px solid var(--border)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-all border-b-2"
                style={{
                  borderBottomColor: activeTab === tab.id ? '#6366f1' : 'transparent',
                  color: activeTab === tab.id ? '#818cf8' : 'var(--text-muted)',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Original Clause Text</p>
                    <button onClick={copyText} className="flex items-center gap-1 text-xs transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <blockquote className="text-xs rounded-xl p-4 leading-relaxed font-mono"
                    style={{ background: 'var(--bg-card)', border: `1px solid var(--border)`, borderLeft: `3px solid ${riskColor}`, color: 'var(--text-secondary)' }}>
                    {clause.raw_text || 'No clause text available.'}
                  </blockquote>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>🤖 AI Explanation (Plain English)</p>
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{clause.plain_explanation || 'No explanation available.'}</p>
                  </div>
                </div>
                {clause.risk_factors?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Risk Factors</p>
                    <div className="space-y-1.5">
                      {clause.risk_factors.map((factor, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: riskColor }} />
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{factor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>AI Confidence</p>
                    <span className="text-xs font-mono" style={{ color: riskColor }}>{Math.round((clause.confidence_score || 0) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: riskColor }}
                      initial={{ width: 0 }} animate={{ width: `${(clause.confidence_score || 0) * 100}%` }} transition={{ duration: 1 }} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'implication' && (
              <motion.div key="implication" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="rounded-xl p-4" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" style={{ color: '#f97316' }} />
                    <p className="text-xs font-semibold" style={{ color: '#f97316' }}>Real-World Consequence</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{clause.real_world_consequence || 'No consequence data available.'}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" style={{ color: '#ef4444' }} />
                    <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>Scenario: If Violated</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{clause.scenario_simulation || 'No scenario data available.'}</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'benchmark' && (
              <motion.div key="benchmark" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4" style={{ color: '#818cf8' }} />
                    <p className="text-xs font-semibold" style={{ color: '#818cf8' }}>Industry Benchmark</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{clause.industry_comparison || 'No benchmark data available.'}</p>
                </div>
                <div className="card-premium p-4">
                  <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Deviation from Standard</p>
                  <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,#22c55e 0%,#eab308 50%,#ef4444 100%)', opacity: 0.25 }} />
                    <motion.div className="absolute top-0 h-full w-1.5 rounded-full" style={{ background: riskColor }}
                      initial={{ left: '50%' }}
                      animate={{ left: clause.severity === 'CRITICAL' ? '88%' : clause.severity === 'HIGH' ? '72%' : clause.severity === 'MEDIUM' ? '58%' : '25%' }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    <span>Standard</span><span>Unusual</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'negotiate' && (
              <motion.div key="negotiate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4" style={{ color: '#22c55e' }} />
                    <p className="text-xs font-semibold" style={{ color: '#22c55e' }}>Negotiation Strategy</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{clause.negotiation_strategy || 'No negotiation strategy available.'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Safer Alternative Wording</p>
                  <blockquote className="text-xs rounded-xl p-4 leading-relaxed font-mono"
                    style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', color: 'var(--text-secondary)' }}>
                    {clause.safer_wording || 'No alternative wording available.'}
                  </blockquote>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
