import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { RiskLevel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW': return '#10b981'
    case 'MEDIUM': return '#f59e0b'
    case 'HIGH': return '#f97316'
    case 'CRITICAL': return '#ef4444'
  }
}

export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'LOW': return 'badge-low'
    case 'MEDIUM': return 'badge-medium'
    case 'HIGH': return 'badge-high'
    case 'CRITICAL': return 'badge-critical'
  }
}

export function getRiskHighlightClass(level: RiskLevel): string {
  switch (level) {
    case 'LOW': return 'highlight-low'
    case 'MEDIUM': return 'highlight-medium'
    case 'HIGH': return 'highlight-high'
    case 'CRITICAL': return 'highlight-critical'
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'LOW': return 'Low Risk'
    case 'MEDIUM': return 'Medium Risk'
    case 'HIGH': return 'High Risk'
    case 'CRITICAL': return 'Critical Risk'
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}

export function scoreToPercent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}
