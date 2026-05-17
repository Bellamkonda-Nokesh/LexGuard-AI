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
  const cls = 'w-5 h-5'
  if (level === 'CRITICAL') return <AlertOctagon className={`${cls} text-red-400`} />
  if (level === 'HIGH') return <AlertTriangle className={`${cls} text-orange-400`} />
  if (level === 'MEDIUM') return <Info className={`${cls} text-amber-400`} />
  return <CheckCircle className={`${cls} text-emerald-400`} />
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
        className="h-full flex flex-col card overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-start gap-3">
          <RiskIcon level={clause.severity} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm leading-tight">{clause.title}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={getRiskBadgeClass(clause.severity)}>{clause.severity}</span>
              <span className="text-xs text-gray-500">{clause.type}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1" aria-label="Close panel">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-300'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
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
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Original clause text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-400">Original Clause Text</p>
                    <button onClick={copyText} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                      <Copy className="w-3 h-3" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <blockquote
                    className="text-xs text-gray-300 bg-surface-700 rounded-xl p-4 leading-relaxed font-mono border-l-3"
                    style={{ borderLeftColor: riskColor }}
                  >
                    {clause.raw_text}
                  </blockquote>
                </div>

                {/* AI explanation */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">🤖 AI Explanation (Plain English)</p>
                  <div className="glass rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-200 leading-relaxed">{clause.plain_explanation}</p>
                  </div>
                </div>

                {/* Risk factors */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Risk Factors</p>
                  <div className="space-y-1.5">
                    {clause.risk_factors.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: riskColor }} />
                        <p className="text-xs text-gray-300">{factor}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-gray-400">AI Confidence</p>
                    <span className="text-xs font-mono" style={{ color: riskColor }}>
                      {Math.round(clause.confidence_score * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: riskColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${clause.confidence_score * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'implication' && (
              <motion.div
                key="implication"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="glass rounded-xl p-4 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <p className="text-xs font-semibold text-orange-300">Real-World Consequence</p>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{clause.real_world_consequence}</p>
                </div>

                <div className="glass rounded-xl p-4 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    <p className="text-xs font-semibold text-red-300">Scenario: If Violated</p>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{clause.scenario_simulation}</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'benchmark' && (
              <motion.div
                key="benchmark"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="glass rounded-xl p-4 border border-brand-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4 text-brand-400" />
                    <p className="text-xs font-semibold text-brand-300">Industry Benchmark</p>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{clause.industry_comparison}</p>
                </div>

                {/* Visual deviation indicator */}
                <div className="card p-4">
                  <p className="text-xs font-medium text-gray-400 mb-3">Deviation from Standard</p>
                  <div className="relative h-3 bg-surface-600 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-30" />
                    <motion.div
                      className="absolute top-0 h-full w-1 rounded-full"
                      style={{ background: riskColor }}
                      initial={{ left: '50%' }}
                      animate={{
                        left: clause.severity === 'CRITICAL' ? '90%'
                          : clause.severity === 'HIGH' ? '75%'
                          : clause.severity === 'MEDIUM' ? '60%'
                          : '30%',
                      }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Standard</span>
                    <span>Unusual</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'negotiate' && (
              <motion.div
                key="negotiate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="glass rounded-xl p-4 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-300">Negotiation Strategy</p>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{clause.negotiation_strategy}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Safer Alternative Wording</p>
                  <blockquote className="text-xs text-gray-300 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 leading-relaxed font-mono">
                    {clause.safer_wording}
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
