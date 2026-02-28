import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './contexts/AuthContext'
import ResumeUploader from './components/ResumeUploader'
import JDInput from './components/JDInput'
import ResultsPanel from './components/ResultsPanel'
import ATSScore from './components/ATSScore'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { API_BASE_URL } from './config'
import './App.css'

function Dashboard() {
  const [parsedResume, setParsedResume] = useState(null)
  const [resumeFilename, setResumeFilename] = useState('')
  const [jdText, setJdText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: upload, 2: JD, 3: results

  const { currentUser, logout } = useAuth()

  const handleResumeUploaded = useCallback((data) => {
    setParsedResume(data.parsed_resume)
    setResumeFilename(data.filename)
    setStep(2)
    setError('')
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!parsedResume || !jdText.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-bullets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsed_resume: parsedResume,
          jd_text: jdText,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to generate bullets')
      }

      const data = await response.json()
      setResults(data)
      setStep(3)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [parsedResume, jdText])

  const handleReset = useCallback(() => {
    setParsedResume(null)
    setResumeFilename('')
    setJdText('')
    setResults(null)
    setError('')
    setStep(1)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error("Failed to log out", err)
    }
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            <div className="logo-group">
              <div className="logo-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h1 className="logo-text">Cyrus</h1>
            </div>
            <p className="tagline hidden md:block">Honest AI Resume Tailoring for Campus Placements</p>
          </div>

          <div className="auth-status flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600 truncate max-w-[150px]">
              {currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="steps-bar">
        <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'complete' : ''}`}>
          <div className="step-number">{step > 1 ? '✓' : '1'}</div>
          <span>Upload Resume</span>
        </div>
        <div className="step-connector" />
        <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'complete' : ''}`}>
          <div className="step-number">{step > 2 ? '✓' : '2'}</div>
          <span>Paste JD</span>
        </div>
        <div className="step-connector" />
        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span>Get Results</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {error && (
          <div className="error-banner animate-slide-down">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
            <button onClick={() => setError('')} className="error-dismiss">×</button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <ResumeUploader onUploaded={handleResumeUploaded} />
          </div>
        )}

        {/* Step 2: JD Input */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <div className="resume-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{resumeFilename} uploaded</span>
              <button onClick={handleReset} className="change-btn">Change</button>
            </div>
            <JDInput
              value={jdText}
              onChange={setJdText}
              onGenerate={handleGenerate}
              loading={loading}
            />
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && results && (
          <div className="results-layout animate-fade-in-up">
            <div className="scores-column">
              <ATSScore
                beforeScore={results.ats_scores?.before_score || 0}
                afterScore={results.ats_scores?.after_score || 0}
              />
              <div className="keywords-card">
                <h3>Keywords Matched</h3>
                <div className="keyword-tags">
                  {results.ats_scores?.matched_keywords?.slice(0, 12).map((kw, i) => (
                    <span key={i} className="keyword-tag matched">{kw}</span>
                  ))}
                </div>
                {results.ats_scores?.new_matches_from_bullets?.length > 0 && (
                  <>
                    <h4>New Matches (from rewrites)</h4>
                    <div className="keyword-tags">
                      {results.ats_scores.new_matches_from_bullets.map((kw, i) => (
                        <span key={i} className="keyword-tag new">{kw}</span>
                      ))}
                    </div>
                  </>
                )}
                {results.ats_scores?.missing_keywords?.length > 0 && (
                  <>
                    <h4>Still Missing</h4>
                    <div className="keyword-tags">
                      {results.ats_scores.missing_keywords.slice(0, 8).map((kw, i) => (
                        <span key={i} className="keyword-tag missing">{kw}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="bullets-column">
              <ResultsPanel
                bullets={results.bullets}
                matchAnalysis={results.match_analysis}
              />
            </div>
            <div className="results-actions">
              <button onClick={handleReset} className="btn-secondary">
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Cyrus — Built with honesty, for students who deserve better.</p>
      </footer>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) {
    return <Navigate to="/login" />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
