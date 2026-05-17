import { useMemo } from 'react'
import type { ContractAnalysis } from '@/types'
import { getRiskHighlightClass } from '@/lib/utils'
import { useAnalysisStore } from '@/store/analysisStore'

interface Props {
  analysis: ContractAnalysis
  onClauseClick: (clauseId: string) => void
}

export default function InlineDocumentViewer({ analysis, onClauseClick }: Props) {
  const { selectedClause } = useAnalysisStore()

  const highlighted = useMemo(() => {
    let text = analysis.contract_text || ''
    if (!text) return '<p class="text-gray-400 italic">No document text available for display.</p>'

    // Sort clauses by position descending to replace from end
    const sorted = [...analysis.clauses].sort((a, b) => b.position_start - a.position_start)

    for (const clause of sorted) {
      if (clause.position_start >= 0 && clause.position_end > clause.position_start) {
        const before = text.slice(0, clause.position_start)
        const clauseText = text.slice(clause.position_start, clause.position_end)
        const after = text.slice(clause.position_end)
        const cls = getRiskHighlightClass(clause.severity)
        const isSelected = selectedClause?.id === clause.id ? 'ring-2 ring-brand-500' : ''
        text = `${before}<mark class="${cls} ${isSelected} rounded px-0.5" data-clause-id="${clause.id}" tabindex="0" role="button" aria-label="Clause: ${clause.title}, Risk: ${clause.severity}">${clauseText}</mark>${after}`
      }
    }

    // Convert newlines to <br> and wrap paragraphs
    return text
      .split('\n\n')
      .map((p) => `<p class="mb-3 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('')
  }, [analysis, selectedClause])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const mark = target.closest('mark[data-clause-id]') as HTMLElement | null
    if (mark) {
      const id = mark.dataset.clauseId
      if (id) onClauseClick(id)
    }
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Original Document</h3>
        <div className="ml-auto flex items-center gap-3 flex-wrap">
          {[
            { label: 'Critical', cls: 'bg-red-500/20 border-red-500/30 text-red-400' },
            { label: 'High', cls: 'bg-orange-500/20 border-orange-500/30 text-orange-400' },
            { label: 'Medium', cls: 'bg-amber-500/20 border-amber-500/30 text-amber-400' },
            { label: 'Low', cls: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' },
          ].map((l) => (
            <div key={l.label} className={`flex items-center gap-1.5 text-xs border rounded-full px-2.5 py-0.5 ${l.cls}`}>
              <div className="w-2 h-2 rounded-full bg-current" />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Click any highlighted clause to view its analysis in the panel on the right.
      </p>

      {/* Document text */}
      <div
        className="prose prose-invert prose-sm max-w-none text-sm text-gray-300 leading-relaxed max-h-[600px] overflow-y-auto font-mono text-xs"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: highlighted }}
        role="document"
        aria-label="Contract text with highlighted clauses"
      />
    </div>
  )
}
