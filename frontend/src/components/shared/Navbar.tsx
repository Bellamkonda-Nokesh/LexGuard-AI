import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Menu, X, Sparkles } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Lex<span className="gradient-text">Guard</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link to="/analyze" className="text-sm text-gray-400 hover:text-white transition-colors">Analyze</Link>
              <a href="/#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="/#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How it Works</a>
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/analyze')}
                className="btn-primary flex items-center gap-2 text-sm py-2"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Contract
              </motion.button>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/5 px-4 py-4 space-y-3"
          >
            <Link to="/" className="block text-sm text-gray-400 hover:text-white py-2" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/analyze" className="block text-sm text-gray-400 hover:text-white py-2" onClick={() => setOpen(false)}>Analyze</Link>
            <a href="/#features" className="block text-sm text-gray-400 hover:text-white py-2" onClick={() => setOpen(false)}>Features</a>
            <button
              onClick={() => { navigate('/analyze'); setOpen(false) }}
              className="btn-primary w-full text-sm py-2"
            >
              Analyze Contract
            </button>
          </motion.div>
        )}
      </div>
    </header>
  )
}
