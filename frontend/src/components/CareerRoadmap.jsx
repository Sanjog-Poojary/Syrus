import { useState } from 'react'

export default function CareerRoadmap({ masterResumeText, jdText }) {
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const API_BASE_URL = import.meta.env.MODE === 'production'
        ? 'https://syrus-h252.onrender.com'
        : ''

    const handleGenerate = async () => {
        if (!masterResumeText || !jdText) return
        setLoading(true)
        setError('')
        try {
            const response = await fetch(`${API_BASE_URL}/api/career-roadmap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    master_resume_text: masterResumeText,
                    target_jd: jdText,
                }),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.detail || 'Failed to generate career roadmap')
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
        <div className="career-roadmap-container">
            {!results ? (
                <div className="roadmap-form">
                    <h2 className="section-title">🗺️ Career Roadmap Architect</h2>
                    <p className="section-subtitle">
                        Analyze your master resume against the target Job Description to identify critical technical skill gaps. We'll suggest high-quality free resources (like NPTEL and YouTube) to unblock you.
                    </p>

                    {(!masterResumeText || !jdText) ? (
                        <p className="error-text">Please upload a resume and provide a target JD first.</p>
                    ) : null}

                    {error && <p className="error-text">{error}</p>}

                    <div className="form-actions" style={{ justifyContent: 'center' }}>
                        <button
                            onClick={handleGenerate}
                            className="btn-primary"
                            disabled={loading || !masterResumeText || !jdText}
                            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                        >
                            {loading ? (
                                <><span className="spinner" /> Analyzing Gaps...</>
                            ) : (
                                'Identify Skill Gaps'
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="roadmap-results">
                    <div className="interview-results-header">
                        <h2 className="section-title">🗺️ Your Skill Gap Analysis</h2>
                        <button onClick={() => setResults(null)} className="btn-secondary btn-sm">
                            ← Re-Analyze
                        </button>
                    </div>

                    {results.overall_readiness_summary && (
                        <div className="readiness-card">
                            <h3>Overall Readiness</h3>
                            <p>{results.overall_readiness_summary}</p>
                        </div>
                    )}

                    <div className="gaps-list">
                        {(results.identified_gaps || []).map((gap, index) => (
                            <div
                                key={index}
                                className="gap-card animate-fade-in-up"
                                style={{ animationDelay: `${index * 120}ms` }}
                            >
                                <div className="gap-header">
                                    <h4 className="gap-skill">{gap.skill}</h4>
                                    <div className="gap-badges">
                                        <span className="badge frequency" title="Frequency across jobs">
                                            Demand: {gap.frequency}
                                        </span>
                                        <span className={`badge impact impact-${gap.impact_score > 7 ? 'high' : 'medium'}`} title="Impact Score (1-10)">
                                            Impact: {gap.impact_score}/10
                                        </span>
                                    </div>
                                </div>

                                {gap.learning_path && gap.learning_path.length > 0 && (
                                    <div className="resources-container">
                                        <h5 className="resources-title">Suggested Learning Resources:</h5>
                                        <ul className="resources-list">
                                            {gap.learning_path.map((path, pIdx) => (
                                                <li key={pIdx} className="resource-item">
                                                    <span className="resource-provider">{path.provider}</span>
                                                    <div className="resource-details">
                                                        <a href={path.link_placeholder.startsWith('http') ? path.link_placeholder : `https://www.youtube.com/results?search_query=${encodeURIComponent(path.link_placeholder)}`} target="_blank" rel="noreferrer" className="resource-link">
                                                            {path.resource_name}
                                                        </a>
                                                        <span className="resource-time">⏱️ {path.estimated_time}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
