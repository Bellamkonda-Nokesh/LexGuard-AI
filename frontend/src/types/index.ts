export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Clause {
  id: string
  title: string
  type: string
  raw_text: string
  severity: RiskLevel
  risk_factors: string[]
  plain_explanation: string
  real_world_consequence: string
  industry_comparison: string
  negotiation_strategy: string
  safer_wording: string
  scenario_simulation: string
  confidence_score: number
  position_start: number
  position_end: number
}

export interface RiskSummary {
  overall_score: number
  overall_level: RiskLevel
  total_clauses: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  contract_type: string
  top_risks: string[]
  executive_summary: string
  trust_score: number
}

export interface ContractAnalysis {
  analysis_id: string
  filename: string
  file_size: number
  contract_text: string
  clauses: Clause[]
  risk_summary: RiskSummary
  agent_timeline: AgentStep[]
  created_at: string
  processing_time_ms: number
}

export interface AgentStep {
  agent: string
  status: 'pending' | 'running' | 'complete' | 'error'
  message: string
  duration_ms?: number
}

export interface UploadResponse {
  file_id: string
  filename: string
  size: number
  content_type: string
}

export interface AnalysisRequest {
  file_id: string
}

export type FilterLevel = 'ALL' | RiskLevel

export interface ClauseFilter {
  level: FilterLevel
  search: string
  type: string
}
