import { useState, useCallback, useRef } from 'react'
import { API_BASE_URL } from '../config'

export default function ResumeUploader({ onUploaded }) {
    const [isDragging, setIsDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const fileInputRef = useRef(null)

    const handleFile = useCallback(async (file) => {
        if (!file) return

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('Please upload a PDF file only.')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit.')
            return
        }

        setUploading(true)
        setUploadProgress(0)

        // Simulate progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 15, 85))
        }, 200)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
                method: 'POST',
                body: formData,
            })

            clearInterval(progressInterval)
            setUploadProgress(100)

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.detail || 'Upload failed')
            }

            const data = await response.json()

            setTimeout(() => {
                onUploaded(data)
            }, 400)
        } catch (err) {
            clearInterval(progressInterval)
            alert(err.message || 'Failed to upload resume.')
            setUploading(false)
            setUploadProgress(0)
        }
    }, [onUploaded])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        handleFile(file)
    }, [handleFile])

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    return (
        <div className="uploader-container">
            <h2 className="section-title">Upload Your Resume</h2>
            <p className="section-subtitle">
                Drop your master resume here — we'll extract your real experience and never invent anything new.
            </p>

            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                {uploading ? (
                    <div className="upload-progress">
                        <div className="progress-ring">
                            <svg viewBox="0 0 100 100">
                                <circle className="progress-bg" cx="50" cy="50" r="42" />
                                <circle
                                    className="progress-bar"
                                    cx="50" cy="50" r="42"
                                    style={{
                                        strokeDasharray: `${2 * Math.PI * 42}`,
                                        strokeDashoffset: `${2 * Math.PI * 42 * (1 - uploadProgress / 100)}`,
                                    }}
                                />
                            </svg>
                            <span className="progress-text">{uploadProgress}%</span>
                        </div>
                        <p className="upload-status">Parsing your resume...</p>
                    </div>
                ) : (
                    <>
                        <div className="drop-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <p className="drop-text">
                            <strong>Drag & drop</strong> your resume PDF here
                        </p>
                        <p className="drop-hint">or click to browse · PDF only · Max 10MB</p>
                    </>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFile(e.target.files[0])}
                    className="file-input-hidden"
                />
            </div>
        </div>
    )
}
