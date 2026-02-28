import { useState } from 'react'

export default function ResultsPanel({ bullets, matchAnalysis }) {
    const [copiedIndex, setCopiedIndex] = useState(null)

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index)
            setTimeout(() => setCopiedIndex(null), 2000)
        })
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
                            <button
                                className="copy-btn"
                                onClick={() => copyToClipboard(bullet.rewritten, index)}
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
