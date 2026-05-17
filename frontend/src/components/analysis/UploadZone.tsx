import { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, File, X, CheckCircle, AlertCircle } from 'lucide-react'
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

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export default function UploadZone({ onFileSelect, isUploading, uploadProgress, error }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dropError, setDropError] = useState<string | null>(null)

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
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
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled: isUploading,
  })

  const removeFile = () => {
    setSelectedFile(null)
    setDropError(null)
  }

  const displayError = error || dropError

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
              ${isDragActive
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-surface-500 hover:border-brand-500/50 hover:bg-brand-500/5'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
            role="button"
            aria-label="Upload contract file"
            tabIndex={0}
          >
            <input {...getInputProps()} aria-label="File upload input" />

            {/* Animated icon */}
            <motion.div
              animate={{ y: isDragActive ? -10 : 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 border border-brand-500/30 flex items-center justify-center">
                <Upload className={`w-9 h-9 transition-colors ${isDragActive ? 'text-brand-400' : 'text-gray-400'}`} />
              </div>
            </motion.div>

            {isDragActive ? (
              <p className="text-brand-300 font-semibold text-lg">Drop your contract here...</p>
            ) : (
              <>
                <p className="text-white font-semibold text-lg mb-2">
                  Drag & drop your contract
                </p>
                <p className="text-gray-400 text-sm mb-4">or click to browse files</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {['PDF', 'DOCX', 'DOC', 'PNG', 'JPG'].map((ext) => (
                    <span key={ext} className="glass border border-white/10 px-2.5 py-1 rounded-full text-xs text-gray-400 font-mono">
                      .{ext.toLowerCase()}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-3">Maximum file size: 20MB</p>
              </>
            )}

            {/* Drag overlay glow */}
            {isDragActive && (
              <div className="absolute inset-0 rounded-2xl bg-brand-500/5 pointer-events-none" />
            )}
          </div>
          </motion.div>
        ) : (
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                {selectedFile.type === 'application/pdf' ? (
                  <FileText className="w-6 h-6 text-brand-400" />
                ) : (
                  <File className="w-6 h-6 text-brand-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(selectedFile.size)}</p>

                {/* Upload progress */}
                {isUploading && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{uploadProgress}% uploaded</p>
                  </div>
                )}
              </div>

              {!isUploading && (
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {!isUploading && (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
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
