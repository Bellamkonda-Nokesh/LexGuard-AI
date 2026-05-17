import { motion } from 'framer-motion'
import {
  Shield, Brain, FileSearch, BarChart3, MessageSquare,
  Zap, Lock, Eye, Scale, FileText
} from 'lucide-react'

const features = [
  {
    icon: FileSearch,
    title: 'Intelligent Clause Extraction',
    description: 'AI precisely identifies and classifies every clause — non-competes, arbitration, IP transfers, liability limits, and 12+ more types.',
    color: 'from-brand-500 to-violet-500',
  },
  {
    icon: BarChart3,
    title: 'Risk Scoring Engine',
    description: 'Each clause receives a severity rating (LOW → CRITICAL) based on legal imbalance, ambiguity, financial exposure, and industry benchmarks.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Brain,
    title: '3-Agent AI Reasoning',
    description: 'Three specialized AI agents — Extractor, Analyzer, Advisor — work in sequence to deliver expert-grade legal intelligence.',
    color: 'from-violet-500 to-pink-500',
  },
  {
    icon: MessageSquare,
    title: 'Plain English Explanations',
    description: 'Every legal clause translated to plain language with real-world consequences, no legal degree required.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Scale,
    title: 'Industry Benchmarking',
    description: 'Compare your contract clauses against standard industry norms using semantic vector embeddings.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Negotiation Strategies',
    description: 'Get specific, actionable negotiation recommendations and safer wording alternatives for every risky clause.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Eye,
    title: 'Inline Document Viewer',
    description: 'View your original contract with color-coded highlights showing exactly which sections are risky.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Lock,
    title: 'Scenario Simulation',
    description: '"What happens if this clause is violated?" — AI simulates real-world consequences of clause violations.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: FileText,
    title: 'Professional PDF Reports',
    description: 'Export a beautifully formatted PDF report with executive summary, clause analysis, and recommendations.',
    color: 'from-slate-400 to-gray-500',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass border border-brand-500/30 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-medium text-brand-300">Everything You Need</span>
          </div>
          <h2 className="section-title">Enterprise-Grade Legal Intelligence</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            LexGuard combines state-of-the-art AI with deep legal knowledge to give you the 
            clarity and confidence to sign — or negotiate — with full awareness.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <motion.div
                key={feat.title}
                variants={item}
                className="card-hover p-6 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
