import { motion } from 'framer-motion'
import { Star, Building2 } from 'lucide-react'

const testimonials = [
  { name: 'Sarah Chen', role: 'Startup Founder', company: 'TechFlow Inc.', avatar: 'SC', rating: 5, quote: 'LexGuard found a 36-month non-compete clause buried in my employment contract that my lawyer missed. It saved me from signing away 3 years of my career.', tag: 'Non-Compete Detected', tagColor: '#ef4444' },
  { name: 'Marcus Johnson', role: 'Freelance Developer', company: 'Independent', avatar: 'MJ', rating: 5, quote: 'The IP transfer clause analysis was eye-opening. I almost signed over all my side projects to a client. LexGuard explained it in plain English and gave me better wording to propose.', tag: 'IP Transfer Found', tagColor: '#f97316' },
  { name: 'Priya Sharma', role: 'Operations Manager', company: 'RetailCo Ltd.', avatar: 'PS', rating: 5, quote: 'We analyzed 12 vendor contracts in one afternoon. The benchmark comparison showed us exactly which terms were unusual for our industry. Incredible tool.', tag: 'Industry Benchmarked', tagColor: '#22c55e' },
  { name: 'David Park', role: 'Small Business Owner', company: 'Park & Associates', avatar: 'DP', rating: 5, quote: 'The automatic renewal clause hidden in a 40-page SaaS agreement would have locked me in for 2 more years. LexGuard spotted it instantly and explained the financial risk.', tag: 'Auto-Renewal Alert', tagColor: '#eab308' },
  { name: 'Emma Wilson', role: 'HR Director', company: 'GrowthCorp', avatar: 'EW', rating: 5, quote: 'We use LexGuard to pre-screen every employment contract before sending to candidates. It has transformed how our legal review process works.', tag: 'Standardized Review', tagColor: '#6366f1' },
  { name: 'Alex Rivera', role: 'Real Estate Agent', company: 'Apex Realty', avatar: 'AR', rating: 5, quote: 'Rental agreements have never been clearer. My clients get a full risk report before signing. LexGuard has become our secret competitive advantage.', tag: 'Rental Clarity', tagColor: '#06b6d4' },
]

const stats = [
  { val: '50,000+', label: 'Contracts Analyzed' },
  { val: '$2.4M', label: 'In Unfair Clauses Caught' },
  { val: '4.9/5', label: 'User Rating' },
  { val: '99.9%', label: 'Uptime' },
]

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border"
            style={{ background: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.25)', color: '#facc15' }}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-medium">Trusted by Thousands</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Real People, Real Savings
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            From freelancers to enterprise teams — LexGuard protects everyone from unfair contracts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-premium p-6 flex flex-col"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-current" style={{ color: '#facc15' }} />
                ))}
              </div>
              <div
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold mb-4 w-fit border"
                style={{ color: t.tagColor, background: `${t.tagColor}15`, borderColor: `${t.tagColor}30` }}
              >
                {t.tag}
              </div>
              <blockquote className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--text-secondary)' }}>
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Building2 className="w-3 h-3" />
                  {t.company}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 card-premium p-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-10 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black gradient-text">{s.val}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
