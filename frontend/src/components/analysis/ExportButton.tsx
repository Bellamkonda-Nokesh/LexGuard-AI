import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { exportReport } from '@/services/api'
import type { ContractAnalysis } from '@/types'

interface Props {
  analysisId: string
  filename: string
  analysis: ContractAnalysis   // pass full analysis for client-side fallback
}

export default function ExportButton({ analysisId, filename, analysis }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleExport = async () => {
    if (status === 'loading') return
    try {
      setStatus('loading')
      const blob = await exportReport(analysisId, analysis)

      // Determine file extension from blob type
      const ext = blob.type === 'application/pdf' ? 'pdf' : 'txt'
      const baseName = filename.replace(/\.[^.]+$/, '')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LexGuard_Report_${baseName}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const bgStyle = {
    done:    { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' },
    error:   { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' },
    loading: { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', opacity: 0.7 },
    idle:    {},
  }[status]

  return (
    <motion.button
      whileHover={status === 'idle' ? { scale: 1.02 } : {}}
      whileTap={status === 'idle' ? { scale: 0.98 } : {}}
      onClick={handleExport}
      disabled={status === 'loading'}
      className={status === 'idle' ? 'btn-primary' : 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all'}
      style={status !== 'idle' ? bgStyle : {}}
      aria-label="Export analysis report"
      id="export-pdf-btn"
    >
      {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
      {status === 'done' && <CheckCircle className="w-4 h-4" />}
      {status === 'error' && <AlertCircle className="w-4 h-4" />}
      {status === 'idle' && <Download className="w-4 h-4" />}
      {status === 'loading' ? 'Generating Report...'
        : status === 'done' ? 'Downloaded!'
        : status === 'error' ? 'Try Again'
        : 'Export Report'}
    </motion.button>
  )
}
