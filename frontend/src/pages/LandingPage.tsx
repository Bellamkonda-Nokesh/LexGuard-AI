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
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 via-violet-900/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to{' '}
                <span className="gradient-text">Know What You're Signing?</span>
              </h2>
              <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
                Upload your contract now and get a complete AI-powered risk analysis in under 30 seconds.
                No account required.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/analyze')}
                  className="btn-primary flex items-center gap-2 text-base px-8 py-4"
                  id="cta-analyze-btn"
                >
                  <Upload className="w-5 h-5" />
                  Analyze Your Contract Free
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                Supports PDF, DOCX, and image formats. Max 20MB. Your files are processed securely and never stored without permission.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
