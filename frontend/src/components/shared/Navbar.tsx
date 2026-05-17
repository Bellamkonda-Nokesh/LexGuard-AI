import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Upload, Sun, Moon, Menu, X } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme, isDark } = useTheme()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <header className="navbar">
      <div
        className="navbar-inner"
        style={{
          boxShadow: scrolled ? 'var(--shadow)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" id="nav-logo">
            <motion.div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              whileHover={{ scale: 1.08, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Shield className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-800 tracking-tight" style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                LexGuard
              </span>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>AI Legal Intelligence</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features', href: '/#features' },
              { label: 'How it Works', href: '/#how-it-works' },
              { label: 'About', href: '/#about' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-14 h-7 rounded-full border transition-all duration-400 flex items-center px-1"
              style={{
                background: isDark
                  ? 'rgba(99,102,241,0.15)'
                  : 'rgba(79,70,229,0.08)',
                borderColor: 'var(--border)',
              }}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              id="theme-toggle"
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  marginLeft: isDark ? 0 : '1.5rem',
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.div key="moon" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                      <Moon className="w-3 h-3 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div key="sun" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.15 }}>
                      <Sun className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.button>

            {/* Analyze CTA */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/analyze"
                className="btn-primary hidden sm:flex text-sm"
                id="nav-analyze-btn"
              >
                <Upload className="w-4 h-4" />
                Analyze Contract
              </Link>
            </motion.div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden btn-ghost p-2"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden"
            style={{
              background: 'var(--bg-glass)',
              borderBottom: '1px solid var(--border)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {[
                { label: 'Features', href: '/#features' },
                { label: 'How it Works', href: '/#how-it-works' },
                { label: 'Analyze Contract', href: '/analyze', accent: true },
              ].map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    color: item.accent ? '#6366f1' : 'var(--text-secondary)',
                    background: item.accent ? 'var(--accent-glow)' : 'transparent',
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
