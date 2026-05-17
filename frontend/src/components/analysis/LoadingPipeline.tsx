import { motion } from 'framer-motion'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import type { AgentStep } from '@/types'

const DEFAULT_STEPS = [
  { agent: 'Document Parser', status: 'pending', message: 'Parsing document content...' },
  { agent: 'Clause Extractor', status: 'pending', message: 'Identifying contractual clauses...' },
  { agent: 'Risk Analyzer', status: 'pending', message: 'Scoring risk levels and detecting exploitative terms...' },
  { agent: 'Legal Advisor', status: 'pending', message: 'Generating plain-English explanations and recommendations...' },
  { agent: 'Report Builder', status: 'pending', message: 'Compiling analysis dashboard...' },
]

const loadingMessages = [
  'Parsing document structure...',
  'Extracting contractual clauses...',
  'Running legal risk analysis...',
  'Comparing against industry benchmarks...',
  'Generating negotiation strategies...',
]

interface Props {
  currentStep: number
  agentSteps?: AgentStep[]
}

export default function LoadingPipeline({ currentStep, agentSteps }: Props) {
  const steps = agentSteps || DEFAULT_STEPS.map((s, i) => ({
    ...s,
    status: i < currentStep ? 'complete' : i === currentStep ? 'running' : 'pending',
  } as AgentStep))

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Contract</h2>
        <p className="text-gray-400 text-sm">
          {loadingMessages[Math.min(currentStep, loadingMessages.length - 1)]}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.agent}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
              step.status === 'complete'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : step.status === 'running'
                ? 'bg-brand-500/10 border-brand-500/30 shadow-glow'
                : step.status === 'error'
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-surface-800 border-surface-600 opacity-50'
            }`}
          >
            {/* Status icon */}
            <div className="shrink-0">
              {step.status === 'complete' && (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
              {step.status === 'running' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-5 h-5 text-brand-400" />
                </motion.div>
              )}
              {step.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              {step.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-surface-500" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${
                  step.status === 'complete' ? 'text-emerald-300'
                  : step.status === 'running' ? 'text-brand-300'
                  : step.status === 'error' ? 'text-red-300'
                  : 'text-gray-500'
                }`}>
                  {step.agent}
                </p>
                {step.status === 'running' && (
                  <span className="text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full">Active</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{step.message}</p>
            </div>

            {/* Duration */}
            {step.status === 'complete' && step.duration_ms && (
              <span className="text-xs text-gray-500 shrink-0 font-mono">
                {(step.duration_ms / 1000).toFixed(1)}s
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Overall Progress</span>
          <span className="text-xs font-mono text-brand-400">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <p className="text-center text-xs text-gray-600 mt-6">
        Powered by Gemini 1.5 Pro · This may take 15–30 seconds
      </p>
    </div>
  )
}
