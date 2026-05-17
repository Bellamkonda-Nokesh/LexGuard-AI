import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowLeft, Sparkles, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/shared/Navbar'
import UploadZone from '@/components/analysis/UploadZone'
import LoadingPipeline from '@/components/analysis/LoadingPipeline'
import RiskDashboard from '@/components/analysis/RiskDashboard'
import ClauseExplorer from '@/components/analysis/ClauseExplorer'
import AIReasoningPanel from '@/components/analysis/AIReasoningPanel'
import InlineDocumentViewer from '@/components/analysis/InlineDocumentViewer'
import ExportButton from '@/components/analysis/ExportButton'
import { uploadContract, analyzeContract } from '@/services/api'
import { useAnalysisStore } from '@/store/analysisStore'
import type { Clause } from '@/types'

type Stage = 'upload' | 'loading' | 'dashboard'
type DashboardTab = 'overview' | 'clauses' | 'document'

const CONTRACT_TYPES = ['Employment', 'Freelance', 'SaaS Terms', 'NDA', 'Rental', 'Vendor', 'Privacy', 'Insurance', 'Subscription']

export default function AnalysisPage() {
  const [stage, setStage] = useState<Stage>('upload')
  const [dashTab, setDashTab] = useState<DashboardTab>('overview')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { analysis, setAnalysis, selectedClause, setSelectedClause, loadingStep, setLoadingStep } =
    useAnalysisStore()

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setUploadError(null)
      setIsUploading(true)
      setUploadProgress(0)
      const uploadResult = await uploadContract(file, setUploadProgress)
      setIsUploading(false)
      setStage('loading')
      setLoadingStep(1)
      let currentStep = 1
      const stepInterval = setInterval(() => {
        currentStep = Math.min(currentStep + 1, 4)
        setLoadingStep(currentStep)
      }, 3000)
      const result = await analyzeContract(uploadResult.file_id)
      clearInterval(stepInterval)
      setLoadingStep(5)
      setTimeout(() => { setAnalysis(result); setStage('dashboard') }, 500)
    } catch (err: unknown) {
      setIsUploading(false)
      setStage('upload')
      setUploadError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    }
  }, [setAnalysis, setLoadingStep])

  const handleReset = () => {
    useAnalysisStore.getState().reset()
    setStage('upload')
    setDashTab('overview')
    setUploadProgress(0)
    setUploadError(null)
  }

  const handleClauseSelect = (clause: Clause) => {
    setSelectedClause(clause)
    setDashTab('clauses')
  }

  const TAB_LABELS: Record<DashboardTab, string> = {
    overview: '📊 Overview',
    clauses: '📋 Clauses',
    document: '📄 Document',
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="pt-20 pb-16 min-h-screen">
        <AnimatePresence mode="wait">

          {/* ── Upload Stage ── */}
          {stage === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto px-4 sm:px-6 py-16"
            >
              <div className="text-center mb-10">
                <motion.div
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.35)' }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Analyze Your Contract
                </h1>
                <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  Upload any contract and our 3-agent AI pipeline will extract clauses, score risks,
                  and provide actionable guidance in seconds.
                </p>
              </div>

              <UploadZone
                onFileSelect={handleFileSelect}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                error={uploadError}
              />

              {/* Supported types */}
              <div className="mt-8 flex flex-wrap gap-2 justify-center">
                {CONTRACT_TYPES.map((type) => (
                  <div
                    key={type}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    {type}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 justify-center">
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Powered by Gemini 1.5 Pro · Results in ~20 seconds
                </span>
              </div>
            </motion.div>
          )}

          {/* ── Loading Stage ── */}
          {stage === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-lg mx-auto px-4 sm:px-6 py-24"
            >
              <LoadingPipeline currentStep={loadingStep} />
            </motion.div>
          )}

          {/* ── Dashboard Stage ── */}
          {stage === 'dashboard' && analysis && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pt-4">
                <div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs mb-2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Analyze Another Contract
                  </button>
                  <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {analysis.filename}
                  </h1>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {analysis.risk_summary.contract_type} · {analysis.clauses.length} clauses
                    {analysis.processing_time_ms ? ` · ${(analysis.processing_time_ms / 1000).toFixed(1)}s analysis` : ''}
                  </p>
                </div>
                <ExportButton analysisId={analysis.analysis_id} filename={analysis.filename} analysis={analysis} />
              </div>

              {/* Tab navigation */}
              <div
                className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                {(Object.keys(TAB_LABELS) as DashboardTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDashTab(tab)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: dashTab === tab ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                      color: dashTab === tab ? 'white' : 'var(--text-muted)',
                      boxShadow: dashTab === tab ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                    }}
                    id={`tab-${tab}`}
                    role="tab"
                    aria-selected={dashTab === tab}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {dashTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <RiskDashboard analysis={analysis} onClauseClick={() => setDashTab('clauses')} />
                  </motion.div>
                )}

                {dashTab === 'clauses' && (
                  <motion.div
                    key="clauses"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-5 gap-6"
                  >
                    <div className="lg:col-span-2">
                      <ClauseExplorer onClauseSelect={handleClauseSelect} />
                    </div>
                    <div className="lg:col-span-3">
                      {selectedClause ? (
                        <AIReasoningPanel clause={selectedClause} onClose={() => setSelectedClause(null)} />
                      ) : (
                        <div
                          className="card-premium p-12 text-center flex flex-col items-center justify-center"
                          style={{ minHeight: 320 }}
                        >
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                          >
                            <Shield className="w-7 h-7" style={{ color: '#818cf8' }} />
                          </div>
                          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                            Select a clause
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Click any clause on the left to view detailed AI analysis
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {dashTab === 'document' && (
                  <motion.div
                    key="document"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <InlineDocumentViewer
                      analysis={analysis}
                      onClauseClick={(id) => {
                        const clause = analysis.clauses.find(c => c.id === id)
                        if (clause) { setSelectedClause(clause); setDashTab('clauses') }
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
