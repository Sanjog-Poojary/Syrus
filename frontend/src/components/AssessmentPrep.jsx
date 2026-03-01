import { useState } from 'react'

export default function AssessmentPrep({ jdText }) {
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const API_BASE_URL = import.meta.env.MODE === 'production'
        ? 'https://syrus-h252.onrender.com'
        : ''

    const handleGenerate = async () => {
        if (!jdText) return
        setLoading(true)
        setError('')
        try {
            const response = await fetch(`${API_BASE_URL}/api/assessment-prep`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_jd: jdText,
                }),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.detail || 'Failed to generate assessment prep')
            }

            const data = await response.json()
            setResults(data)
        } catch (err) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="assessment-prep-container">
            {!results ? (
                <div className="assessment-form">
                    <h2 className="section-title">🧠 Placement Intelligence</h2>
                    <p className="section-subtitle">
                        Paste a Job Description to predict the likely Aptitude/Online Assessment platform (e.g., Mettl, HackerRank) and test sections based on historical Indian campus hiring data.
                    </p>

                    {!jdText ? (
                        <p className="error-text">Please provide a target JD first.</p>
                    ) : null}

                    {error && <p className="error-text">{error}</p>}

                    <div className="form-actions" style={{ justifyContent: 'center' }}>
                        <button
                            onClick={handleGenerate}
                            className="btn-primary"
                            disabled={loading || !jdText}
                            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                        >
                            {loading ? (
                                <><span className="spinner" /> Predicting Assessment...</>
                            ) : (
                                'Predict Test Pattern'
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="assessment-results">
                    <div className="interview-results-header">
                        <h2 className="section-title">🧠 Predicted Assessment Pattern</h2>
                        <button onClick={() => setResults(null)} className="btn-secondary btn-sm">
                            ← Re-Analyze
                        </button>
                    </div>

                    <div className="company-context-card animate-fade-in-up">
                        <div className="company-info-row">
                            <div className="info-block">
                                <span className="info-label">Company</span>
                                <span className="info-value">{results.predicted_company}</span>
                            </div>
                            <div className="info-block">
                                <span className="info-label">Company Tier</span>
                                <span className="info-value">{results.assessment_tier}</span>
                            </div>
                            <div className="info-block provider-block">
                                <span className="info-label">Likely Platform</span>
                                <span className="info-value provider-name">{results.test_pattern?.provider}</span>
                            </div>
                        </div>
                    </div>

                    <h3 className="sub-heading">Expected Sections</h3>
                    <div className="sections-grid">
                        {(results.test_pattern?.sections || []).map((section, index) => (
                            <div
                                key={index}
                                className="test-section-card animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="ts-header">
                                    <h4 className="ts-name">{section.name}</h4>
                                    <span className="ts-difficulty">{section.difficulty}</span>
                                </div>
                                <div className="ts-topics">
                                    <strong>Focus Areas:</strong>
                                    <ul>
                                        {(section.focus_topics || section.languages || []).map((topic, tIdx) => (
                                            <li key={tIdx}>{topic}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    {results.preparation_roadmap && (
                        <div className="crunch-roadmap-card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            <h3>🔥 48-Hour Crunch Roadmap</h3>
                            <p>{results.preparation_roadmap}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
