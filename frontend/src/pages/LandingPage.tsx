import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Upload } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Testimonials from '@/components/landing/Testimonials'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <Navbar />
      <main>
        <Hero />

        {/* Divider */}
        <div className="h-px w-full max-w-7xl mx-auto" style={{ background: 'var(--border)' }} />

        <Features />

        <div className="h-px w-full max-w-7xl mx-auto" style={{ background: 'var(--border)' }} />

        <HowItWorks />

        <div className="h-px w-full max-w-7xl mx-auto" style={{ background: 'var(--border)' }} />

        <Testimonials />

        {/* ── CTA Section ── */}
        <section className="py-16 sm:py-24 relative overflow-hidden" id="cta">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 50%, var(--accent-glow), transparent 70%)',
            }}
          />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 sm:mb-8 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 40px rgba(99,102,241,0.35)',
                }}
              >
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2
                className="font-black mb-4 sm:mb-6 tracking-tight"
                style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: 'var(--text-primary)',
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                }}
              >
                Ready to{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Know What You're Signing?
                </span>
              </h2>
              <p className="text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Upload your contract and get a complete AI-powered risk analysis in under 30 seconds.
                No account required.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/analyze')}
                className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                id="cta-analyze-btn"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                Analyze Your Contract — Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <p className="text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
                Supports PDF, DOCX, and image formats · Max 20MB · Files never stored
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
