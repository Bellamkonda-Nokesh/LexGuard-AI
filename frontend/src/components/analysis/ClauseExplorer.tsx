import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ChevronDown, ChevronUp, ExternalLink, Shield, AlertOctagon, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import type { Clause, RiskLevel } from '@/types'
import { getRiskBadgeClass, getRiskColor } from '@/lib/utils'
import { useAnalysisStore } from '@/store/analysisStore'

interface Props {
  onClauseSelect: (clause: Clause) => void
}

const RISK_LEVELS: { label: string; value: 'ALL' | RiskLevel }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Critical', value: 'CRITICAL' },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
]

const RiskIcon = ({ level }: { level: RiskLevel }) => {
  const cls = 'w-4 h-4'
  if (level === 'CRITICAL') return <AlertOctagon className={`${cls} text-red-400`} />
  if (level === 'HIGH') return <AlertTriangle className={`${cls} text-orange-400`} />
  if (level === 'MEDIUM') return <Info className={`${cls} text-amber-400`} />
  return <CheckCircle className={`${cls} text-emerald-400`} />
}

function ClauseListItem({ clause, isSelected, onClick }: {
  clause: Clause
  isSelected: boolean
  onClick: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`card transition-all duration-200 cursor-pointer ${
        isSelected ? 'border-brand-500/50 shadow-glow' : 'hover:border-surface-400'
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <RiskIcon level={clause.severity} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-white leading-tight">{clause.title}</h4>
              <span className={getRiskBadgeClass(clause.severity)} style={{ whiteSpace: 'nowrap' }}>
                {clause.severity}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{clause.type}</p>
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{clause.plain_explanation}</p>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Confidence</span>
          <div className="flex-1 h-1 bg-surface-600 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${clause.confidence_score * 100}%`,
                background: getRiskColor(clause.severity),
              }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: getRiskColor(clause.severity) }}>
            {Math.round(clause.confidence_score * 100)}%
          </span>
        </div>

        {/* Expand button */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Less' : 'View Details'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            className="ml-auto flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Full Analysis
          </button>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                {/* Clause text */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Clause Text</p>
                  <blockquote className="text-xs text-gray-300 bg-surface-700 rounded-lg p-3 leading-relaxed border-l-2 border-brand-500/50 font-mono">
                    "{clause.raw_text.length > 300 ? clause.raw_text.slice(0, 300) + '...' : clause.raw_text}"
                  </blockquote>
                </div>

                {/* Real-world consequence */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">⚠️ Real-World Consequence</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{clause.real_world_consequence}</p>
                </div>

                {/* Negotiation */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">💡 Negotiation Strategy</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{clause.negotiation_strategy}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function ClauseExplorer({ onClauseSelect }: Props) {
  const { filter, setFilter, filteredClauses, selectedClause } = useAnalysisStore()
  const clauses = filteredClauses()

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Clause Explorer</h3>
          <span className="text-xs text-gray-500">({clauses.length} clauses)</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clauses..."
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="w-full bg-surface-800 border border-surface-500 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50 transition-colors"
            aria-label="Search clauses"
          />
        </div>

        {/* Level filter */}
        <div className="flex gap-1.5 flex-wrap">
          {RISK_LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => setFilter({ level: lvl.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter.level === lvl.value
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'glass text-gray-400 hover:text-white hover:border-brand-500/30'
              }`}
              aria-pressed={filter.level === lvl.value}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter icon */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Filter className="w-3.5 h-3.5" />
        Showing {clauses.length} clause{clauses.length !== 1 ? 's' : ''}
        {filter.level !== 'ALL' && ` with ${filter.level} severity`}
        {filter.search && ` matching "${filter.search}"`}
      </div>

      {/* Clause list */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        <AnimatePresence>
          {clauses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <Shield className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No clauses match your filter.</p>
            </motion.div>
          ) : (
            clauses.map((clause) => (
              <ClauseListItem
                key={clause.id}
                clause={clause}
                isSelected={selectedClause?.id === clause.id}
                onClick={() => onClauseSelect(clause)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
