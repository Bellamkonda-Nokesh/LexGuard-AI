import { motion } from 'framer-motion'
import { Shield, Brain, FileSearch, BarChart3, MessageSquare, Zap, Lock, Eye, Scale, FileText } from 'lucide-react'

const features = [
  { icon: FileSearch, title: 'Intelligent Clause Extraction', description: 'AI precisely identifies and classifies every clause — non-competes, arbitration, IP transfers, liability limits, and 12+ more types.', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { icon: BarChart3, title: 'Risk Scoring Engine', description: 'Each clause receives a severity rating (LOW → CRITICAL) based on legal imbalance, ambiguity, financial exposure, and industry benchmarks.', grad: 'linear-gradient(135deg,#ef4444,#f97316)' },
  { icon: Brain, title: '3-Agent AI Reasoning', description: 'Three specialized AI agents — Extractor, Analyzer, Advisor — work in sequence to deliver expert-grade legal intelligence.', grad: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
  { icon: MessageSquare, title: 'Plain English Explanations', description: 'Every legal clause translated to plain language with real-world consequences, no legal degree required.', grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  { icon: Scale, title: 'Industry Benchmarking', description: 'Compare your contract clauses against standard industry norms using semantic vector embeddings.', grad: 'linear-gradient(135deg,#10b981,#14b8a6)' },
  { icon: Zap, title: 'Negotiation Strategies', description: 'Get specific, actionable negotiation recommendations and safer wording alternatives for every risky clause.', grad: 'linear-gradient(135deg,#f59e0b,#eab308)' },
  { icon: Eye, title: 'Inline Document Viewer', description: 'View your original contract with color-coded highlights showing exactly which sections are risky.', grad: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
  { icon: Lock, title: 'Scenario Simulation', description: '"What happens if this clause is violated?" — AI simulates real-world consequences of clause violations.', grad: 'linear-gradient(135deg,#6366f1,#3b82f6)' },
  { icon: FileText, title: 'Professional PDF Reports', description: 'Export a beautifully formatted PDF report with executive summary, clause analysis, and recommendations.', grad: 'linear-gradient(135deg,#64748b,#94a3b8)' },
]

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border"
            style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.25)', color: '#818cf8' }}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Everything You Need</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Enterprise-Grade Legal Intelligence
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            LexGuard combines state-of-the-art AI with deep legal knowledge to give you the
            clarity and confidence to sign — or negotiate — with full awareness.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="card-premium p-6 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: feat.grad, boxShadow: '0 4px 15px rgba(99,102,241,0.2)' }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feat.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
