export default function JDInput({ value, onChange, onGenerate, loading }) {
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

    return (
        <div className="jd-container">
            <h2 className="section-title">Paste the Job Description</h2>
            <p className="section-subtitle">
                Copy the full JD from Internshala, Naukri, or your college placement portal.
            </p>

            <div className="jd-input-wrapper">
                <textarea
                    className="jd-textarea"
                    placeholder="Paste the complete job description here...&#10;&#10;Example:&#10;We are looking for a Software Development Intern who has experience with React.js, Node.js, and REST APIs..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={12}
                    disabled={loading}
                />
                <div className="jd-footer">
                    <span className="word-count">
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </span>
                    {value && (
                        <button
                            onClick={() => onChange('')}
                            className="clear-btn"
                            disabled={loading}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <button
                className="btn-primary generate-btn"
                onClick={onGenerate}
                disabled={loading || !value.trim()}
            >
                {loading ? (
                    <>
                        <span className="spinner" />
                        Analyzing with AI...
                    </>
                ) : (
                    <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        Generate Tailored Bullets
                    </>
                )}
            </button>
        </div>
    )
}
