import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, Sparkles, Upload, CheckCircle, Zap } from 'lucide-react'

const floatingBadges = [
  { label: 'Non-Compete Detected', level: 'CRITICAL', delay: 0 },
  { label: 'Auto-Renewal Clause', level: 'HIGH', delay: 0.5 },
  { label: 'IP Transfer Found', level: 'HIGH', delay: 1 },
  { label: 'Arbitration Required', level: 'MEDIUM', delay: 1.5 },
  { label: 'Payment Terms Clear', level: 'LOW', delay: 2 },
]

const levelColors: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
}

const stats = [
  { value: '94%', label: 'Accuracy Rate' },
  { value: '12+', label: 'Clause Types' },
  { value: '<30s', label: 'Analysis Time' },
  { value: '3', label: 'AI Agents' },
]

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow animation-delay-400" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass border border-brand-500/30 rounded-full px-4 py-1.5 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs font-medium text-brand-300">Powered by Gemini 1.5 Pro</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            >
              Understand Every{' '}
              <span className="gradient-text">Clause</span>
              <br />
              Before It{' '}
              <span className="gradient-text">Costs You.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg"
            >
              LexGuard AI analyzes your contracts in seconds — extracting hidden risks, 
              explaining legal implications in plain English, and giving you the negotiation 
              power you deserve.
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              {['No Legal Degree Required', 'Instant Analysis', 'AI-Explained'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-brand-400" />
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/analyze')}
                className="btn-primary flex items-center gap-2 text-base px-8 py-4"
                id="hero-analyze-cta"
              >
                <Upload className="w-5 h-5" />
                Analyze Your Contract
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary flex items-center gap-2 text-base px-8 py-4"
              >
                See How It Works
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-4 gap-4 mt-12 pt-10 border-t border-white/5"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Floating UI Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Main card */}
            <div className="relative animate-float">
              <div className="card p-6 shadow-glow-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-brand-400" />
                      <span className="text-sm font-semibold text-white">Contract Analysis</span>
                    </div>
                    <span className="text-xs text-gray-500">Employment_Agreement.pdf</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-red-400">74</div>
                    <div className="text-xs text-gray-500">Risk Score</div>
                  </div>
                </div>

                {/* Risk bars */}
                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Critical', val: 3, color: 'bg-red-500', width: 'w-[60%]' },
                    { label: 'High', val: 5, color: 'bg-orange-500', width: 'w-[80%]' },
                    { label: 'Medium', val: 4, color: 'bg-amber-500', width: 'w-[65%]' },
                    { label: 'Low', val: 7, color: 'bg-emerald-500', width: 'w-full' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-14 shrink-0">{row.label}</span>
                      <div className="flex-1 h-1.5 bg-surface-600 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${row.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: row.width }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-4">{row.val}</span>
                    </div>
                  ))}
                </div>

                {/* Clause preview */}
                <div className="glass rounded-xl p-3 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-red-300 mb-1">Non-Compete Clause — CRITICAL</p>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                        Employee shall not engage in any competing business activities for 36 months after termination...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              {floatingBadges.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + badge.delay, duration: 0.4 }}
                  className={`absolute glass border rounded-full px-3 py-1.5 text-xs font-medium ${levelColors[badge.level]}`}
                  style={{
                    top: `${-10 + i * 25}%`,
                    right: `${-20 + (i % 2) * 10}%`,
                    transform: `translateX(${i % 2 === 0 ? '80px' : '60px'})`,
                  }}
                >
                  {badge.label}
                </motion.div>
              ))}
            </div>

            {/* Agent status card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-8 -left-8 glass border border-white/10 rounded-xl p-3 w-48"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-semibold text-white">AI Agents Active</span>
              </div>
              {['Clause Extractor', 'Risk Analyzer', 'Legal Advisor'].map((agent, i) => (
                <div key={agent} className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                  <span className="text-xs text-gray-400">{agent}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
