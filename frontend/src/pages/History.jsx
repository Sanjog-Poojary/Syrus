import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ATSScore from '../components/ATSScore';
import ResultsPanel from '../components/ResultsPanel';
import './History.css';

export default function History() {
    const { currentUser } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        async function fetchSessions() {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/history?user_id=${currentUser.uid}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setSessions(data.sessions || []);
                }
            } catch (err) {
                console.error('Failed to fetch history:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchSessions();
    }, [currentUser]);

    function formatDate(isoStr) {
        try {
            const d = new Date(isoStr);
            return d.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return isoStr;
        }
    }

    // Detail view of a single session
    if (selectedSession) {
        return (
            <div className="history-page">
                <header className="history-header">
                    <div className="history-header-content">
                        <button
                            className="history-detail-back"
                            onClick={() => setSelectedSession(null)}
                        >
                            ← Back to History
                        </button>
                        <span className="history-detail-date">
                            {formatDate(selectedSession.created_at)}
                        </span>
                    </div>
                </header>

                <div className="history-content history-detail">
                    {/* JD Text */}
                    <div className="history-detail-jd">
                        <h4>Job Description</h4>
                        <p>{selectedSession.jd_text}</p>
                    </div>

                    {/* ATS Scores + Bullets */}
                    <div className="results-layout">
                        <div className="scores-column">
                            <ATSScore
                                beforeScore={selectedSession.ats_scores?.before_score || 0}
                                afterScore={selectedSession.ats_scores?.after_score || 0}
                            />
                            {selectedSession.ats_scores?.matched_keywords?.length > 0 && (
                                <div className="keywords-card">
                                    <h3>Keywords Matched</h3>
                                    <div className="keyword-tags">
                                        {selectedSession.ats_scores.matched_keywords
                                            .slice(0, 12)
                                            .map((kw, i) => (
                                                <span key={i} className="keyword-tag matched">
                                                    {kw}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bullets-column">
                            <ResultsPanel
                                bullets={selectedSession.bullets}
                                matchAnalysis={selectedSession.match_analysis}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Session list view
    return (
        <div className="history-page">
            <header className="history-header">
                <div className="history-header-content">
                    <Link to="/" className="history-back">
                        ← Dashboard
                    </Link>
                    <h1 className="history-title">History</h1>
                    <span className="history-count">
                        {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </header>

            <div className="history-content">
                {loading ? (
                    <div className="history-loading">Loading your sessions...</div>
                ) : sessions.length === 0 ? (
                    <div className="history-empty">
                        <div className="history-empty-icon">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h3>No sessions yet</h3>
                        <p>
                            Generate your first resume insights and they'll appear here
                            automatically.
                        </p>
                    </div>
                ) : (
                    <div className="history-list">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="history-card"
                                onClick={() => setSelectedSession(session)}
                            >
                                <div className="history-card-header">
                                    <span className="history-card-date">
                                        {formatDate(session.created_at)}
                                    </span>
                                    {session.ats_scores?.after_score != null && (
                                        <span className="history-card-score">
                                            ATS {session.ats_scores.after_score}%
                                        </span>
                                    )}
                                </div>
                                <p className="history-card-jd">
                                    {session.jd_snippet || session.jd_text?.slice(0, 120)}
                                </p>
                                <div className="history-card-meta">
                                    <span>
                                        {session.bullets?.length || 0} bullet
                                        {(session.bullets?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                    <span>
                                        {session.jd_keywords?.length || 0} keywords matched
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
