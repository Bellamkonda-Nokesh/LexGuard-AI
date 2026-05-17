import { Link } from 'react-router-dom'
import { Shield, Github, Twitter, Linkedin, Heart, Zap } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function Footer() {
  const { isDark } = useTheme()

  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-base" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                LexGuard AI
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
              Know what you're signing before you sign it. AI-powered contract intelligence for everyone.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: Github, href: 'https://github.com/Bellamkonda-Nokesh/LexGuard-AI', label: 'GitHub' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Product</div>
            <ul className="space-y-2.5">
              {[
                { label: 'Analyze Contract', href: '/analyze' },
                { label: 'Features', href: '/#features' },
                { label: 'How it Works', href: '/#how-it-works' },
                { label: 'Pricing', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Legal</div>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'].map(label => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Powered by */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Powered By</div>
            <div className="space-y-2.5">
              {[
                { label: 'Google Gemini 1.5 Pro', color: '#4285F4' },
                { label: 'Google Cloud Run', color: '#34A853' },
                { label: 'FastAPI Backend', color: '#009688' },
                { label: 'React + Vite', color: '#61DAFB' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-12 pt-6"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 LexGuard AI · Built with{' '}
            <Heart className="w-3 h-3 inline text-red-400" />
            {' '}using Gemini 1.5 Pro + Google Cloud
          </p>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <Zap className="w-3 h-3" style={{ color: '#eab308' }} />
            <span className="text-xs font-medium" style={{ color: '#ca8a04' }}>Not a substitute for professional legal advice</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
