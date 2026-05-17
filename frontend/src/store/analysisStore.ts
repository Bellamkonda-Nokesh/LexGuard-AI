import { create } from 'zustand'
import type { ContractAnalysis, Clause, ClauseFilter } from '@/types'

interface AnalysisState {
  analysis: ContractAnalysis | null
  selectedClause: Clause | null
  filter: ClauseFilter
  isLoading: boolean
  loadingStep: number
  error: string | null

  setAnalysis: (analysis: ContractAnalysis) => void
  setSelectedClause: (clause: Clause | null) => void
  setFilter: (filter: Partial<ClauseFilter>) => void
  setLoading: (loading: boolean) => void
  setLoadingStep: (step: number) => void
  setError: (error: string | null) => void
  reset: () => void
  filteredClauses: () => Clause[]
}

const initialFilter: ClauseFilter = { level: 'ALL', search: '', type: 'all' }

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  analysis: null,
  selectedClause: null,
  filter: initialFilter,
  isLoading: false,
  loadingStep: 0,
  error: null,

  setAnalysis: (analysis) => set({ analysis }),
  setSelectedClause: (clause) => set({ selectedClause: clause }),
  setFilter: (filter) => set((s) => ({ filter: { ...s.filter, ...filter } })),
  setLoading: (isLoading) => set({ isLoading }),
  setLoadingStep: (loadingStep) => set({ loadingStep }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ analysis: null, selectedClause: null, filter: initialFilter, isLoading: false, loadingStep: 0, error: null }),

  filteredClauses: () => {
    const { analysis, filter } = get()
    if (!analysis) return []
    return analysis.clauses.filter((c) => {
      const levelMatch = filter.level === 'ALL' || c.severity === filter.level
      const searchMatch =
        filter.search === '' ||
        c.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        c.raw_text.toLowerCase().includes(filter.search.toLowerCase())
      const typeMatch = filter.type === 'all' || c.type === filter.type
      return levelMatch && searchMatch && typeMatch
    })
  },
}))
