import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Loader2, CheckCircle } from 'lucide-react'
import { exportReport } from '@/services/api'

interface Props {
  analysisId: string
  filename: string
}

export default function ExportButton({ analysisId, filename }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleExport = async () => {
    try {
      setStatus('loading')
      const blob = await exportReport(analysisId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LexGuard_Report_${filename.replace(/\.[^.]+$/, '')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleExport}
      disabled={status === 'loading'}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        status === 'done'
          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
          : status === 'error'
          ? 'bg-red-500/20 border border-red-500/30 text-red-400'
          : 'btn-primary'
      }`}
      aria-label="Export PDF report"
      id="export-pdf-btn"
    >
      {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
      {status === 'done' && <CheckCircle className="w-4 h-4" />}
      {status === 'error' && <FileText className="w-4 h-4" />}
      {status === 'idle' && <Download className="w-4 h-4" />}
      {status === 'loading' ? 'Generating PDF...' 
        : status === 'done' ? 'Downloaded!'
        : status === 'error' ? 'Export Failed'
        : 'Export PDF Report'}
    </motion.button>
  )
}
