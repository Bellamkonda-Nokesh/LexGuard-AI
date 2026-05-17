import { motion } from 'framer-motion'
import { Star, Building2 } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Startup Founder',
    company: 'TechFlow Inc.',
    avatar: 'SC',
    rating: 5,
    quote: 'LexGuard found a 36-month non-compete clause buried in my employment contract that my lawyer missed. It saved me from signing away 3 years of my career.',
    tag: 'Non-Compete Detected',
    tagColor: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
  {
    name: 'Marcus Johnson',
    role: 'Freelance Developer',
    company: 'Independent',
    avatar: 'MJ',
    rating: 5,
    quote: 'The IP transfer clause analysis was eye-opening. I almost signed over all my side projects to a client. LexGuard explained it in plain English and gave me better wording to propose.',
    tag: 'IP Transfer Found',
    tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  },
  {
    name: 'Priya Sharma',
    role: 'Operations Manager',
    company: 'RetailCo Ltd.',
    avatar: 'PS',
    rating: 5,
    quote: 'We analyzed 12 vendor contracts in one afternoon. The benchmark comparison showed us exactly which terms were unusual for our industry. Incredible tool.',
    tag: 'Industry Benchmarked',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    name: 'David Park',
    role: 'Small Business Owner',
    company: 'Park & Associates',
    avatar: 'DP',
    rating: 5,
    quote: 'The automatic renewal clause hidden in a 40-page SaaS agreement would have locked me in for 2 more years. LexGuard spotted it instantly and explained the financial risk.',
    tag: 'Auto-Renewal Alert',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    name: 'Emma Wilson',
    role: 'HR Director',
    company: 'GrowthCorp',
    avatar: 'EW',
    rating: 5,
    quote: 'We use LexGuard to pre-screen every employment contract before sending to candidates. It has transformed how our legal review process works.',
    tag: 'Standardized Review',
    tagColor: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
  },
  {
    name: 'Alex Rivera',
    role: 'Real Estate Agent',
    company: 'Apex Realty',
    avatar: 'AR',
    rating: 5,
    quote: 'Rental agreements have never been clearer. My clients get a full risk report before signing. LexGuard has become our secret competitive advantage.',
    tag: 'Rental Clarity',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
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
          <div className="inline-flex items-center gap-2 glass border border-brand-500/30 rounded-full px-4 py-1.5 mb-6">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-brand-300">Trusted by Thousands</span>
          </div>
          <h2 className="section-title">Real People, Real Savings</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From freelancers to enterprise teams — LexGuard protects everyone from unfair contracts.
          </p>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="card-hover p-6 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Tag */}
              <div className={`inline-flex items-center border rounded-full px-2.5 py-1 text-xs font-medium mb-4 w-fit ${t.tagColor}`}>
                {t.tag}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-gray-300 leading-relaxed flex-1 mb-5">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Building2 className="w-3 h-3" />
                    {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass border border-white/5 rounded-2xl p-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            {[
              { val: '50,000+', label: 'Contracts Analyzed' },
              { val: '$2.4M', label: 'In Unfair Clauses Caught' },
              { val: '4.9/5', label: 'User Rating' },
              { val: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black gradient-text">{s.val}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
