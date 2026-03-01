import { useState } from 'react'

export default function InterviewPrep({ parsedResume, onBack }) {
    const [projectTitle, setProjectTitle] = useState('')
    const [projectDescription, setProjectDescription] = useState('')
    const [techStack, setTechStack] = useState('')
    const [githubUrl, setGithubUrl] = useState('')
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Extract projects from parsed resume sections for quick selection
    const resumeSections = parsedResume?.sections || {}
    const projectSections = Object.entries(resumeSections).filter(([heading]) =>
        heading.toLowerCase().includes('project') ||
        heading.toLowerCase().includes('experience') ||
        heading.toLowerCase().includes('work')
    )

    const handleSelectSection = (heading, content) => {
        setProjectTitle(heading)
        setProjectDescription(content.trim())
        // Try to auto-detect tech stack from content
        const techMatches = content.match(/(?:using|with|built|developed|technologies?|tech stack|tools?)[:\s]+([^.]+)/i)
        if (techMatches) {
            setTechStack(techMatches[1].trim())
        }
    }

    const API_BASE_URL = import.meta.env.MODE === 'production'
        ? 'https://syrus-h252.onrender.com'
        : ''

    const handleGenerate = async () => {
        if (!projectTitle.trim() || !projectDescription.trim()) return
        setLoading(true)
        setError('')
        try {
            const stackArray = techStack
                .split(/[,|;]/)
                .map(s => s.trim())
                .filter(Boolean)

            const response = await fetch(`${API_BASE_URL}/api/interview-prep`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_title: projectTitle,
                    project_description: projectDescription,
                    tech_stack: stackArray,
                    github_url: githubUrl.trim() || undefined,
                }),
            })
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.detail || 'Failed to generate interview prep')
            }
            const data = await response.json()
            setResults(data)
        } catch (err) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    const categoryIcons = {
        'Architectural Choice': '🏗️',
        'Edge Case Handling': '🛡️',
        'Data/State Management': '🔄',
        'Optimization': '⚡',
        'Conflict/Challenge': '🐛',
    }

    const getCategoryIcon = (category) => {
        for (const [key, icon] of Object.entries(categoryIcons)) {
            if (category?.toLowerCase().includes(key.toLowerCase().split('/')[0].split(' ')[0])) {
                return icon
            }
        }
        return '❓'
    }

    return (
        <div className="interview-prep-container">
            {!results ? (
                <div className="interview-form">
                    <h2 className="section-title">🎯 Interview Prep Generator</h2>
                    <p className="section-subtitle">
                        Select a project from your resume or enter details manually.
                        Get 5 deep-dive questions that test <strong>real ownership</strong>.
                    </p>

                    {projectSections.length > 0 && (
                        <div className="project-quick-select">
                            <h4>Quick Select from Resume</h4>
                            <div className="quick-select-chips">
                                {projectSections.map(([heading, content]) => (
                                    <button
                                        key={heading}
                                        className={`quick-chip ${projectTitle === heading ? 'selected' : ''}`}
                                        onClick={() => handleSelectSection(heading, content)}
                                    >
                                        {heading}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="project-title">Project Title</label>
                        <input
                            id="project-title"
                            type="text"
                            value={projectTitle}
                            onChange={(e) => setProjectTitle(e.target.value)}
                            placeholder="e.g. E-Commerce Platform"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="project-desc">Project Description</label>
                        <textarea
                            id="project-desc"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="Paste the full project description from your resume..."
                            className="form-textarea"
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tech-stack">Tech Stack <span className="optional">(comma-separated)</span></label>
                        <input
                            id="tech-stack"
                            type="text"
                            value={techStack}
                            onChange={(e) => setTechStack(e.target.value)}
                            placeholder="e.g. React, Node.js, MongoDB"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="github-url">GitHub Repository <span className="optional">(optional)</span></label>
                        <input
                            id="github-url"
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/username/repo"
                            className="form-input"
                        />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <div className="form-actions">
                        <button onClick={onBack} className="btn-secondary">← Back to Bullets</button>
                        <button
                            onClick={handleGenerate}
                            className="btn-primary"
                            disabled={loading || !projectTitle.trim() || !projectDescription.trim()}
                        >
                            {loading ? (
                                <><span className="spinner" /> Generating...</>
                            ) : (
                                'Generate Questions'
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="interview-results">
                    <div className="interview-results-header">
                        <h2 className="section-title">🎤 Interview Deep-Dive</h2>
                        <button onClick={() => setResults(null)} className="btn-secondary btn-sm">
                            ← Try Another Project
                        </button>
                    </div>

                    {results.project_summary && (
                        <div className="project-summary-card">
                            <h3>Project Summary</h3>
                            <p>{results.project_summary}</p>
                        </div>
                    )}

                    <div className="questions-list">
                        {(results.interview_prep || []).map((item, index) => (
                            <div
                                key={index}
                                className="question-card animate-fade-in-up"
                                style={{ animationDelay: `${index * 120}ms` }}
                            >
                                <div className="question-header">
                                    <span className="question-number">Q{index + 1}</span>
                                    <span className="question-category">
                                        {getCategoryIcon(item.category)} {item.category}
                                    </span>
                                </div>
                                <p className="question-text">{item.question}</p>
                                <div className="question-meta">
                                    <div className="meta-section">
                                        <span className="meta-label">🎯 Intent</span>
                                        <p>{item.intent}</p>
                                    </div>
                                    <div className="meta-section hint">
                                        <span className="meta-label">💡 Hint</span>
                                        <p>{item.hint_for_student}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        <button onClick={onBack} className="btn-secondary">← Back to Bullets</button>
                    </div>
                </div>
            )}
        </div>
    )
}
