import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowLeft, Sparkles } from 'lucide-react'
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

export default function AnalysisPage() {
  const [stage, setStage] = useState<Stage>('upload')
  const [dashTab, setDashTab] = useState<DashboardTab>('overview')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { analysis, setAnalysis, selectedClause, setSelectedClause, loadingStep, setLoadingStep, error } =
    useAnalysisStore()

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setUploadError(null)
      setIsUploading(true)
      setUploadProgress(0)

      // Upload
      const uploadResult = await uploadContract(file, setUploadProgress)
      setIsUploading(false)

      // Start loading pipeline
      setStage('loading')
      setLoadingStep(1)

      // Simulate progressive steps
      let currentStep = 1
      const stepInterval = setInterval(() => {
        currentStep = Math.min(currentStep + 1, 4)
        setLoadingStep(currentStep)
      }, 3000)

      // Analyze
      const result = await analyzeContract(uploadResult.file_id)
      clearInterval(stepInterval)
      setLoadingStep(5)

      setTimeout(() => {
        setAnalysis(result)
        setStage('dashboard')
      }, 500)
    } catch (err: unknown) {
      setIsUploading(false)
      setStage('upload')
      const errMsg = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      setUploadError(errMsg)
      console.error('Analysis error:', err)
    }
  }, [setAnalysis, setLoadingStep])

  const handleClauseSelect = (clause: Clause) => {
    setSelectedClause(clause)
    setDashTab('clauses')
  }

  const handleDocumentClauseClick = (clauseId: string) => {
    const clause = analysis?.clauses.find((c) => c.id === clauseId)
    if (clause) {
      setSelectedClause(clause)
      setDashTab('clauses')
    }
  }

  const handleReset = () => {
    useAnalysisStore.getState().reset()
    setStage('upload')
    setDashTab('overview')
    setUploadProgress(0)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <AnimatePresence mode="wait">
          {/* Upload Stage */}
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
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-black text-white mb-3">
                  Analyze Your Contract
                </h1>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
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
              <div className="mt-8 grid grid-cols-3 sm:grid-cols-5 gap-3">
                {['Employment', 'Freelance', 'SaaS Terms', 'NDA', 'Rental', 'Vendor', 'Privacy', 'Insurance', 'Subscription'].slice(0, 9).map((type) => (
                  <div key={type} className="glass border border-white/5 rounded-xl px-3 py-2 text-center">
                    <span className="text-xs text-gray-400">{type}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 justify-center">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs text-gray-500">Powered by Gemini 1.5 Pro · Results in ~20 seconds</span>
              </div>
            </motion.div>
          )}

          {/* Loading Stage */}
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

          {/* Dashboard Stage */}
          {stage === 'dashboard' && analysis && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              {/* Dashboard header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Analyze Another Contract
                  </button>
                  <h1 className="text-xl font-bold text-white">{analysis.filename}</h1>
                  <p className="text-xs text-gray-400">
                    {analysis.risk_summary.contract_type} · {analysis.clauses.length} clauses · 
                    {analysis.processing_time_ms ? ` ${(analysis.processing_time_ms / 1000).toFixed(1)}s analysis` : ''}
                  </p>
                </div>
                <ExportButton analysisId={analysis.analysis_id} filename={analysis.filename} />
              </div>

              {/* Tab navigation */}
              <div className="flex gap-1 mb-6 glass border border-white/5 rounded-xl p-1 w-fit">
                {(['overview', 'clauses', 'document'] as DashboardTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDashTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      dashTab === tab
                        ? 'bg-brand-500 text-white shadow-glow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    id={`tab-${tab}`}
                    aria-selected={dashTab === tab}
                    role="tab"
                  >
                    {tab}
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
                    <RiskDashboard
                      analysis={analysis}
                      onClauseClick={() => setDashTab('clauses')}
                    />
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
                        <AIReasoningPanel
                          clause={selectedClause}
                          onClose={() => setSelectedClause(null)}
                        />
                      ) : (
                        <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
                          <Shield className="w-10 h-10 text-gray-600 mb-4" />
                          <p className="text-gray-400 text-sm">Select a clause to view detailed AI analysis</p>
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
                      onClauseClick={handleDocumentClauseClick}
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
