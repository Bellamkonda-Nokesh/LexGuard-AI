import axios from 'axios'
import type { ContractAnalysis, UploadResponse } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export async function uploadContract(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<UploadResponse>('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (evt.total && onProgress) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    },
  })
  return response.data
}

export async function analyzeContract(fileId: string): Promise<ContractAnalysis> {
  const response = await api.post<ContractAnalysis>('/api/analyze', { file_id: fileId })
  return response.data
}

export async function getAnalysis(analysisId: string): Promise<ContractAnalysis> {
  const response = await api.get<ContractAnalysis>(`/api/analysis/${analysisId}`)
  return response.data
}

export async function exportReport(analysisId: string): Promise<Blob> {
  const response = await api.get(`/api/export/${analysisId}`, {
    responseType: 'blob',
  })
  return response.data
}
