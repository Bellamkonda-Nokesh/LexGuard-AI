import { motion } from 'framer-motion'
import { Upload, Brain, BarChart3, ArrowRight } from 'lucide-react'

const steps = [
  {
    step: '01', icon: Upload,
    title: 'Upload Your Contract',
    description: 'Upload any contract in PDF, DOCX, or image format. Our OCR pipeline handles scanned documents too.',
    grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    details: ['PDF & DOCX support', 'OCR for scanned docs', 'Secure encrypted upload'],
  },
  {
    step: '02', icon: Brain,
    title: 'AI Analyzes Everything',
    description: 'Three specialized AI agents work in sequence: extracting clauses, scoring risks, and generating plain-English explanations.',
    grad: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    details: ['Clause Extractor Agent', 'Risk Analyzer Agent', 'Legal Advisor Agent'],
  },
  {
    step: '03', icon: BarChart3,
    title: 'Get Actionable Insights',
    description: 'Explore your interactive dashboard, drill into every clause, and export a professional PDF report.',
    grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
    details: ['Risk dashboard', 'Inline doc viewer', 'PDF report export'],
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.05), transparent 70%)' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 sm:mb-6 border"
            style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.25)', color: '#818cf8' }}
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Simple 3-Step Process</span>
          </div>
          <h2
            className="font-black mb-4 tracking-tight"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            }}
          >
            How LexGuard Works
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            From contract upload to expert legal insight in under 30 seconds.
          </p>
        </motion.div>

        {/* Steps: stacks on mobile, 3-col on lg+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative card-premium p-6 sm:p-7"
              >
                {/* Step icon */}
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: step.grad, boxShadow: '0 4px 20px rgba(99,102,241,0.25)' }}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>

                <div
                  className="text-xs font-mono font-bold mb-2"
                  style={{ color: '#818cf8', letterSpacing: '0.08em' }}
                >
                  STEP {step.step}
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {step.description}
                </p>
                <ul className="space-y-1.5">
                  {step.details.map(d => (
                    <li key={d} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#818cf8' }} />
                      <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>{d}</span>
                    </li>
                  ))}
                </ul>

                {/* Arrow connector (desktop only, between cards) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-10 -right-4 z-10 items-center justify-center">
                    <ArrowRight className="w-5 h-5" style={{ color: '#6366f1' }} />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
