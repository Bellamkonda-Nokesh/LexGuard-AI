import { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, File, X, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

interface Props {
  onFileSelect: (file: File) => void
  isUploading: boolean
  uploadProgress: number
  error?: string | null
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
}

export default function UploadZone({ onFileSelect, isUploading, uploadProgress, error }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dropError, setDropError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setDropError(null)
    if (rejected.length > 0) {
      const err = rejected[0].errors[0]
      if (err.code === 'file-too-large') setDropError('File must be under 20MB.')
      else if (err.code === 'file-invalid-type') setDropError('Please upload a PDF, DOCX, or image file.')
      else setDropError(err.message)
      return
    }
    if (accepted.length > 0) {
      setSelectedFile(accepted[0])
      onFileSelect(accepted[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED_TYPES, maxSize: 20 * 1024 * 1024, maxFiles: 1, disabled: isUploading,
  })

  const displayError = error || dropError

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div key="dropzone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div
              {...getRootProps()}
              className="relative rounded-2xl p-12 text-center cursor-pointer transition-all duration-300"
              style={{
                border: `2px dashed ${isDragActive ? '#6366f1' : 'var(--border)'}`,
                background: isDragActive ? 'rgba(99,102,241,0.07)' : 'var(--bg-card)',
                opacity: isUploading ? 0.5 : 1,
                pointerEvents: isUploading ? 'none' : 'auto',
              }}
              role="button"
              aria-label="Upload contract file"
            >
              <input {...getInputProps()} />
              <motion.div animate={{ y: isDragActive ? -8 : 0 }} className="mb-6">
                <div
                  className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
                  style={{
                    background: isDragActive ? 'rgba(99,102,241,0.15)' : 'var(--surface, rgba(99,102,241,0.08))',
                    border: `1px solid ${isDragActive ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                  }}
                >
                  <Upload className="w-9 h-9" style={{ color: isDragActive ? '#818cf8' : 'var(--text-muted)' }} />
                </div>
              </motion.div>

              {isDragActive ? (
                <p className="font-semibold text-lg" style={{ color: '#818cf8' }}>Drop your contract here...</p>
              ) : (
                <>
                  <p className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                    Drag & drop your contract
                  </p>
                  <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>or click to browse files</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {['PDF', 'DOCX', 'DOC', 'PNG', 'JPG'].map((ext) => (
                      <span
                        key={ext}
                        className="px-2.5 py-1 rounded-full text-xs font-mono border"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                      >
                        .{ext.toLowerCase()}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>Maximum file size: 20MB</p>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="card-premium p-5"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                {selectedFile.type === 'application/pdf'
                  ? <FileText className="w-6 h-6" style={{ color: '#818cf8' }} />
                  : <File className="w-6 h-6" style={{ color: '#818cf8' }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatFileSize(selectedFile.size)}</p>
                {isUploading && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{uploadProgress}% uploaded</p>
                  </div>
                )}
              </div>
              {!isUploading && (
                <button onClick={() => { setSelectedFile(null); setDropError(null) }} aria-label="Remove file" style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {!isUploading && <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#22c55e' }} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 text-sm rounded-xl px-4 py-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {displayError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
