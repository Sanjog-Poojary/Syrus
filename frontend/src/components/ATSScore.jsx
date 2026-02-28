import { useEffect, useState } from 'react'

export default function ATSScore({ beforeScore, afterScore }) {
    const [animatedBefore, setAnimatedBefore] = useState(0)
    const [animatedAfter, setAnimatedAfter] = useState(0)

    useEffect(() => {
        // Animate the scores counting up
        const duration = 1200
        const steps = 60
        const interval = duration / steps

        let stepCount = 0
        const timer = setInterval(() => {
            stepCount++
            const progress = stepCount / steps
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)

            setAnimatedBefore(Math.round(beforeScore * eased))
            setAnimatedAfter(Math.round(afterScore * eased))

            if (stepCount >= steps) {
                clearInterval(timer)
                setAnimatedBefore(beforeScore)
                setAnimatedAfter(afterScore)
            }
        }, interval)

        return () => clearInterval(timer)
    }, [beforeScore, afterScore])

    const getScoreColor = (score) => {
        if (score >= 70) return 'var(--color-emerald-500)'
        if (score >= 40) return 'var(--color-amber-500)'
        return 'var(--color-rose-500)'
    }

    const getScoreLabel = (score) => {
        if (score >= 70) return 'Strong'
        if (score >= 40) return 'Moderate'
        return 'Weak'
    }

    const improvement = afterScore - beforeScore

    const circumference = 2 * Math.PI * 42

    return (
        <div className="ats-container">
            <h3 className="ats-title">ATS Readiness Score</h3>

            <div className="score-comparison">
                {/* Before Score */}
                <div className="score-card before">
                    <span className="score-label">Before</span>
                    <div className="score-ring">
                        <svg viewBox="0 0 100 100">
                            <circle className="ring-bg" cx="50" cy="50" r="42" />
                            <circle
                                className="ring-fill"
                                cx="50" cy="50" r="42"
                                style={{
                                    stroke: getScoreColor(animatedBefore),
                                    strokeDasharray: circumference,
                                    strokeDashoffset: circumference * (1 - animatedBefore / 100),
                                }}
                            />
                        </svg>
                        <div className="score-value">
                            <span className="score-number">{animatedBefore}</span>
                            <span className="score-percent">%</span>
                        </div>
                    </div>
                    <span className="score-status" style={{ color: getScoreColor(beforeScore) }}>
                        {getScoreLabel(beforeScore)}
                    </span>
                </div>

                {/* Arrow */}
                <div className="score-arrow">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </div>

                {/* After Score */}
                <div className="score-card after">
                    <span className="score-label">After</span>
                    <div className="score-ring">
                        <svg viewBox="0 0 100 100">
                            <circle className="ring-bg" cx="50" cy="50" r="42" />
                            <circle
                                className="ring-fill"
                                cx="50" cy="50" r="42"
                                style={{
                                    stroke: getScoreColor(animatedAfter),
                                    strokeDasharray: circumference,
                                    strokeDashoffset: circumference * (1 - animatedAfter / 100),
                                }}
                            />
                        </svg>
                        <div className="score-value">
                            <span className="score-number">{animatedAfter}</span>
                            <span className="score-percent">%</span>
                        </div>
                    </div>
                    <span className="score-status" style={{ color: getScoreColor(afterScore) }}>
                        {getScoreLabel(afterScore)}
                    </span>
                </div>
            </div>

            {/* Improvement Badge */}
            {improvement > 0 && (
                <div className="improvement-badge animate-fade-in">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <span>+{improvement}% improvement</span>
                </div>
            )}
        </div>
    )
}
