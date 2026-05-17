import { motion } from 'framer-motion'
import { Upload, Brain, BarChart3, ArrowRight } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Your Contract',
    description: 'Upload any contract in PDF, DOCX, or image format. Our OCR pipeline handles scanned documents too.',
    color: 'from-brand-500 to-violet-500',
    details: ['PDF & DOCX support', 'OCR for scanned docs', 'Secure encrypted upload'],
  },
  {
    step: '02',
    icon: Brain,
    title: 'AI Analyzes Everything',
    description: 'Three specialized AI agents work in sequence: extracting clauses, scoring risks, and generating plain-English explanations.',
    color: 'from-violet-500 to-pink-500',
    details: ['Clause Extractor Agent', 'Risk Analyzer Agent', 'Legal Advisor Agent'],
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Get Actionable Insights',
    description: 'Explore your interactive dashboard, drill into every clause, and export a professional PDF report.',
    color: 'from-cyan-500 to-blue-500',
    details: ['Risk dashboard', 'Inline doc viewer', 'PDF report export'],
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-radial from-brand-900/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass border border-brand-500/30 rounded-full px-4 py-1.5 mb-6">
            <Brain className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-medium text-brand-300">Simple 3-Step Process</span>
          </div>
          <h2 className="section-title">How LexGuard Works</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From contract upload to expert legal insight in under 30 seconds.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-16 left-1/6 right-1/6 h-px bg-gradient-to-r from-brand-500/50 via-violet-500/50 to-cyan-500/50" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative"
                >
                  {/* Step number */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-glow mx-auto lg:mx-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <div className="text-center lg:text-left">
                    <div className="text-xs font-mono text-brand-400 mb-2">STEP {step.step}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{step.description}</p>

                    <ul className="space-y-2">
                      {step.details.map((d) => (
                        <li key={d} className="flex items-center gap-2 justify-center lg:justify-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                          <span className="text-sm text-gray-300">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Arrow between steps */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-7 -right-4 z-10 items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-brand-400" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
