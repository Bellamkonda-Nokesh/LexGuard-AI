import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import LandingPage from '@/pages/LandingPage'
import AnalysisPage from '@/pages/AnalysisPage'

export default function App() {
  return (
    <ThemeProvider>
      {/* Animated background mesh */}
      <div className="bg-mesh" aria-hidden="true" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyze" element={<AnalysisPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
