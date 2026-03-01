import { useState } from 'react'
import { API_BASE_URL } from '../config'

export default function ResultsPanel({ bullets, matchAnalysis, masterResumeText, jdText }) {
    const [copiedIndex, setCopiedIndex] = useState(null)
    const [rewriteResults, setRewriteResults] = useState({})
    const [rewriteLoading, setRewriteLoading] = useState({})

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index)
            setTimeout(() => setCopiedIndex(null), 2000)
        })
    }

    const handleRewrite = async (bullet, index) => {
        if (rewriteLoading[index]) return
        setRewriteLoading(prev => ({ ...prev, [index]: true }))

        try {
            const response = await fetch(`${API_BASE_URL}/api/rewrite-bullet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    master_resume_text: masterResumeText,
                    target_jd: jdText,
                    target_experience: bullet.original || bullet.rewritten,
                }),
            })
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.detail || 'Rewrite failed')
            }
            const data = await response.json()
            setRewriteResults(prev => ({ ...prev, [index]: data }))
        } catch (err) {
            setRewriteResults(prev => ({
                ...prev,
                [index]: { error: err.message },
            }))
        } finally {
            setRewriteLoading(prev => ({ ...prev, [index]: false }))
        }
    }

    if (!bullets || bullets.length === 0) {
        return (
            <div className="results-empty">
                <p>No bullet suggestions generated. Try a different JD or resume.</p>
            </div>
        )
    }

    return (
        <div className="results-container">
            <h2 className="section-title">Your Tailored Bullets</h2>
            <p className="section-subtitle">
                Each rewrite uses <strong>only</strong> your real experience — rephrased for this specific JD.
            </p>

            <div className="bullets-list">
                {bullets.map((bullet, index) => (
                    <div
                        key={index}
                        className="bullet-card animate-fade-in-up"
                        style={{ animationDelay: `${index * 150}ms` }}
                    >
                        <div className="bullet-header">
                            <span className="bullet-number">#{index + 1}</span>
                            <div className="bullet-actions">
                                <button
                                    className="rewrite-btn"
                                    onClick={() => handleRewrite(bullet, index)}
                                    disabled={rewriteLoading[index]}
                                    title="Deep rewrite with honesty check"
                                >
                                    {rewriteLoading[index] ? (
                                        <><span className="spinner-sm" /> Rewriting...</>
                                    ) : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Rewrite
                                        </>
                                    )}
                                </button>
                                <button
                                    className="copy-btn"
                                    onClick={() => copyToClipboard(
                                        rewriteResults[index]?.optimized_bullet || bullet.rewritten,
                                        index
                                    )}
                                >
                                    {copiedIndex === index ? (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                            </svg>
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {bullet.original && (
                            <div className="bullet-original">
                                <span className="label">Before</span>
                                <p>{bullet.original}</p>
                            </div>
                        )}

                        <div className="bullet-rewritten">
                            <span className="label label-after">After</span>
                            <p>{bullet.rewritten}</p>
                        </div>

                        {bullet.jd_keywords_used && bullet.jd_keywords_used.length > 0 && (
                            <div className="bullet-keywords">
                                {bullet.jd_keywords_used.map((kw, i) => (
                                    <span key={i} className="keyword-chip">{kw}</span>
                                ))}
                            </div>
                        )}

                        {bullet.rationale && (
                            <p className="bullet-rationale">{bullet.rationale}</p>
                        )}

                        {/* Honesty-First Rewrite Result */}
                        {rewriteResults[index] && !rewriteResults[index].error && (
                            <div className="rewrite-result animate-fade-in-up">
                                <div className="rewrite-result-header">
                                    <span className="rewrite-label">✨ Honesty-First Rewrite</span>
                                    <span className={`honesty-badge ${rewriteResults[index].honesty_check?.toLowerCase() === 'pass'
                                            ? 'badge-pass' : 'badge-fail'
                                        }`}>
                                        {rewriteResults[index].honesty_check?.toLowerCase() === 'pass' ? '✓' : '✗'}
                                        {' '}{rewriteResults[index].honesty_check}
                                    </span>
                                </div>
                                <div className="rewrite-optimized">
                                    <p className="optimized-text">{rewriteResults[index].optimized_bullet}</p>
                                </div>
                                {rewriteResults[index].original_source_snippet && (
                                    <div className="rewrite-source">
                                        <span className="meta-label">📌 Source</span>
                                        <p>{rewriteResults[index].original_source_snippet}</p>
                                    </div>
                                )}
                                {rewriteResults[index].mapping_logic && (
                                    <div className="rewrite-logic">
                                        <span className="meta-label">🔗 Mapping Logic</span>
                                        <p>{rewriteResults[index].mapping_logic}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {rewriteResults[index]?.error && (
                            <div className="rewrite-error">
                                <p>⚠️ {rewriteResults[index].error}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Match Analysis */}
            {matchAnalysis && (
                <div className="match-analysis">
                    <h3>Match Analysis</h3>
                    <div className="analysis-grid">
                        {matchAnalysis.strong_matches?.length > 0 && (
                            <div className="analysis-section">
                                <h4>
                                    <span className="dot dot-green" />
                                    Strong Matches
                                </h4>
                                <ul>
                                    {matchAnalysis.strong_matches.map((m, i) => (
                                        <li key={i}>{m}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {matchAnalysis.partial_matches?.length > 0 && (
                            <div className="analysis-section">
                                <h4>
                                    <span className="dot dot-amber" />
                                    Partial Matches
                                </h4>
                                <ul>
                                    {matchAnalysis.partial_matches.map((m, i) => (
                                        <li key={i}>{m}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {matchAnalysis.gaps?.length > 0 && (
                            <div className="analysis-section">
                                <h4>
                                    <span className="dot dot-rose" />
                                    Gaps (Not in your resume)
                                </h4>
                                <ul>
                                    {matchAnalysis.gaps.map((g, i) => (
                                        <li key={i}>{g}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
