import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ChevronRight, AlertTriangle, TrendingUp, FileText, CheckCircle } from 'lucide-react'
import { useAnalysisStore } from '@/store/analysisStore'
import type { Clause } from '@/types'

const SEVERITY_CONFIG = {
  CRITICAL: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', badge: 'badge-critical' },
  HIGH: { icon: TrendingUp, color: '#f97316', bg: 'rgba(249,115,22,0.1)', badge: 'badge-high' },
  MEDIUM: { icon: FileText, color: '#eab308', bg: 'rgba(234,179,8,0.08)', badge: 'badge-medium' },
  LOW: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', badge: 'badge-low' },
}

interface Props {
  onClauseSelect: (clause: Clause) => void
}

export default function ClauseExplorer({ onClauseSelect }: Props) {
  const { analysis, selectedClause, setSelectedClause } = useAnalysisStore()
  const [search, setSearch] = useState('')
  const [filterSev, setFilterSev] = useState<string>('ALL')

  const clauses = useMemo(() => {
    if (!analysis) return []
    return analysis.clauses.filter(c => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.raw_text.toLowerCase().includes(search.toLowerCase())
      const matchSev = filterSev === 'ALL' || c.severity === filterSev
      return matchSearch && matchSev
    }).sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
    })
  }, [analysis, search, filterSev])

  const counts = useMemo(() => {
    if (!analysis) return {}
    return analysis.clauses.reduce((acc, c) => {
      acc[c.severity] = (acc[c.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [analysis])

  const handleSelect = (clause: Clause) => {
    setSelectedClause(clause)
    onClauseSelect(clause)
  }

  return (
    <div className="card-premium flex flex-col h-full" style={{ maxHeight: '70vh' }}>
      {/* Header */}
      <div className="p-4 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Clause Explorer
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
            {clauses.length} shown
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search clauses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-glass w-full pl-8 pr-4 py-2 text-xs"
          />
        </div>

        {/* Severity filters */}
        <div className="flex gap-1.5 flex-wrap">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
            const cfg = SEVERITY_CONFIG[sev as keyof typeof SEVERITY_CONFIG]
            const isActive = filterSev === sev
            return (
              <button
                key={sev}
                onClick={() => setFilterSev(sev)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: isActive ? (cfg?.bg || 'rgba(99,102,241,0.12)') : 'var(--bg-card)',
                  color: isActive ? (cfg?.color || '#818cf8') : 'var(--text-muted)',
                  border: `1px solid ${isActive ? (cfg?.color + '35' || 'rgba(99,102,241,0.3)') : 'var(--border)'}`,
                }}
              >
                {sev === 'ALL' ? `All (${analysis?.clauses.length || 0})` : `${sev} (${counts[sev] || 0})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Clause List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence>
          {clauses.map((clause, i) => {
            const cfg = SEVERITY_CONFIG[clause.severity as keyof typeof SEVERITY_CONFIG]
            const Icon = cfg?.icon || FileText
            const isSelected = selectedClause?.id === clause.id

            return (
              <motion.button
                key={clause.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleSelect(clause)}
                className="w-full text-left rounded-xl p-3.5 flex items-start gap-3 transition-all"
                style={{
                  background: isSelected
                    ? `${cfg?.color || '#6366f1'}12`
                    : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? (cfg?.color + '30' || 'var(--border-hover)') : 'var(--border)'}`,
                  boxShadow: isSelected ? `0 0 0 1px ${cfg?.color}20` : 'none',
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover)'
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-card)'
                }}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg?.bg || 'rgba(99,102,241,0.1)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: cfg?.color || '#818cf8' }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {clause.title}
                    </span>
                    <ChevronRight
                      className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                      style={{
                        color: 'var(--text-muted)',
                        transform: isSelected ? 'translateX(2px)' : 'none',
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cfg?.badge || 'badge-low'}>{clause.severity}</span>
                    <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {clause.type.replace(/-/g, ' ')}
                    </span>
                  </div>
                  {clause.plain_explanation && (
                    <p className="text-[11px] mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {clause.plain_explanation}
                    </p>
                  )}
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {clauses.length === 0 && (
          <div className="py-12 text-center">
            <Search className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No clauses match your filter</p>
          </div>
        )}
      </div>
    </div>
  )
}
