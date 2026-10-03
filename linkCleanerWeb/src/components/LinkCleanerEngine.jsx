import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Link2, Wand2, Copy, ExternalLink, AlertCircle,
  CheckCircle2, Loader2, X, ArrowRight, Zap
} from 'lucide-react'
import './LinkCleanerEngine.css'

const API_BASE = import.meta.env.DEV ? '' : 'https://linkcleaner.fastapicloud.dev'

// User-friendly error messages — no technical details exposed
const ERROR_HINTS = {
  unsupported: {
    title: 'Link Not Supported',
    message: 'We couldn\'t clean this link. Try one from Instagram, TikTok, Pinterest, or Snapchat.',
    icon: <AlertCircle size={22} />,
    type: 'unsupported',
  },
  invalid: {
    title: 'That doesn\'t look right',
    message: 'Please paste a full link starting with https:// — for example, a TikTok or Instagram post URL.',
    icon: <AlertCircle size={22} />,
    type: 'invalid',
  },
  network: {
    title: 'Service Unavailable',
    message: 'We\'re having trouble connecting right now. Please try again in a moment.',
    icon: <AlertCircle size={22} />,
    type: 'network',
  },
  server: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred on our end. Please try again in a little while.',
    icon: <AlertCircle size={22} />,
    type: 'server',
  },
}

function isValidUrl(str) {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Detect platform from URL
function detectPlatform(url) {
  if (!url) return null
  if (url.includes('instagram.com')) return { name: 'Instagram', emoji: '📸', color: '#e1306c' }
  if (url.includes('tiktok.com')) return { name: 'TikTok', emoji: '🎵', color: '#010101' }
  if (url.includes('pinterest.com') || url.includes('pin.it')) return { name: 'Pinterest', emoji: '📌', color: '#e60023' }
  if (url.includes('snapchat.com')) return { name: 'Snapchat', emoji: '👻', color: '#fffc00' }
  return null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export default function LinkCleanerEngine() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const platform = detectPlatform(url)

  const handleChange = (e) => {
    setUrl(e.target.value)
    setCharCount(e.target.value.length)
    if (status !== 'idle') {
      setStatus('idle')
      setResult(null)
      setError(null)
    }
  }

  const handleClear = () => {
    setUrl('')
    setCharCount(0)
    setStatus('idle')
    setResult(null)
    setError(null)
  }

  const handleClean = useCallback(async () => {
    if (!url.trim()) {
      toast.error('Please paste a link first!')
      return
    }

    if (!isValidUrl(url.trim())) {
      setStatus('error')
      setError(ERROR_HINTS.invalid)
      return
    }

    setStatus('loading')
    setResult(null)
    setError(null)

    try {
      const response = await axios.post(`${API_BASE}/api/resolve`, null, {
        params: { url: url.trim() },
        timeout: 15000,
      })

      const data = response.data

      // If the response is not a JSON object (e.g., an HTML page from a 404 fallback), throw an error
      if (typeof data !== 'object' || !data) {
        throw new Error('Invalid response from server')
      }

      if (data.error) {
        setStatus('error')
        setError(ERROR_HINTS.unsupported)
        return
      }

      setStatus('success')
      setResult(data)
      toast.success('Link cleaned successfully!', { duration: 3000 })
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
        setStatus('error')
        setError(ERROR_HINTS.network)
      } else if (err.response?.status >= 500) {
        setStatus('error')
        setError(ERROR_HINTS.server)
      } else {
        const serverMsg = err.response?.data?.error || err.response?.data?.detail
        setStatus('error')
        setError({
          title: 'Something went wrong',
          message: serverMsg || 'An unexpected error occurred.',
          icon: <AlertCircle size={22} />,
          type: 'generic',
        })
      }
    }
  }, [url])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleClean()
  }

  const handleCopy = async () => {
    if (!result?.resolved_url) return
    try {
      await navigator.clipboard.writeText(result.resolved_url)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy. Please copy manually.')
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      setCharCount(text.length)
    } catch {
      toast.error('Could not read clipboard.')
    }
  }

  const removedParams = result && result.original_url
    ? (result.original_url.split('?')[1]?.split('&').length ?? 0)
    : 0

  return (
    <motion.div
      className="engine-wrapper"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Hero Title ── */}
      <motion.div className="hero-section" variants={itemVariants}>
        <h1 className="hero-title">
          Want to clean your links?
        </h1>
        <p className="hero-subtitle">
          Search below.
        </p>
      </motion.div>

      {/* ── Search Card ── */}
      <motion.div className="search-card" variants={itemVariants}>

        {/* Platform badge */}
        <AnimatePresence>
          {platform && (
            <motion.div
              className="platform-badge"
              initial={{ opacity: 0, scale: 0.7, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -6 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <span>{platform.emoji}</span>
              <span>{platform.name} detected</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <div className="input-row">
          <div className={`input-wrap ${status === 'error' ? 'input-error' : ''} ${status === 'success' ? 'input-success' : ''}`}>
            <Link2 size={18} className="input-icon" />
            <input
              id="link-input"
              type="url"
              className="link-input"
              placeholder="Paste a link or search..."
              value={url}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck={false}
              aria-label="Paste your social media link here"
            />
            <AnimatePresence>
              {url && (
                <motion.button
                  className="clear-btn"
                  onClick={handleClear}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  aria-label="Clear input"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            id="clean-btn"
            className={`clean-btn ${status === 'loading' ? 'loading' : ''}`}
            onClick={handleClean}
            disabled={status === 'loading'}
            whileHover={{ scale: status === 'loading' ? 1 : 1.04 }}
            whileTap={{ scale: status === 'loading' ? 1 : 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            aria-label="Clean link"
          >
            {status === 'loading' ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                style={{ display: 'flex' }}
              >
                <Loader2 size={20} />
              </motion.span>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Clean</span>
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </div>

        {/* Paste shortcut */}
        <div className="input-meta">
          <button className="paste-btn" onClick={handlePaste} aria-label="Paste from clipboard">
            📋 Paste from clipboard
          </button>
          {charCount > 0 && (
            <span className="char-count">{charCount} chars</span>
          )}
        </div>
      </motion.div>

      {/* ── Result / Error Area ── */}
      <AnimatePresence mode="wait">
        {/* Success */}
        {status === 'success' && result && (
          <motion.div
            key="success"
            className="result-card success-card"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="result-header">
              <div className="result-icon success-icon">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h2 className="result-title">Link Cleaned!</h2>
                {removedParams > 0 && (
                  <p className="result-subtitle">{removedParams} tracking parameter{removedParams > 1 ? 's' : ''} removed</p>
                )}
              </div>
            </div>

            <div className="url-compare">
              <div className="url-block original">
                <label className="url-label">Original</label>
                <span className="url-text url-strikethrough">{result.original_url}</span>
              </div>
              <div className="url-arrow">
                <ArrowRight size={16} />
              </div>
              <div className="url-block clean">
                <label className="url-label">Clean</label>
                <span className="url-text url-clean">{result.resolved_url}</span>
              </div>
            </div>

            <div className="result-actions">
              <motion.button
                id="copy-btn"
                className={`action-btn copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </motion.button>

              <motion.a
                id="open-link-btn"
                className="action-btn open-btn"
                href={result.resolved_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <ExternalLink size={16} />
                <span>Open Link</span>
              </motion.a>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && error && (
          <motion.div
            key="error"
            className="result-card error-card"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="result-header">
              <div className="result-icon error-icon">
                {error.icon}
              </div>
              <div>
                <h2 className="result-title">{error.title}</h2>
                <p className="result-subtitle">{error.message}</p>
              </div>
            </div>

            {error.type === 'unsupported' && (
              <div className="supported-platforms">
                <p className="supported-label">Supported platforms:</p>
                <div className="platform-list">
                  {[
                    { emoji: '📸', name: 'Instagram' },
                    { emoji: '🎵', name: 'TikTok' },
                    { emoji: '📌', name: 'Pinterest' },
                    { emoji: '👻', name: 'Snapchat' },
                  ].map((p) => (
                    <span key={p.name} className="supported-chip">
                      {p.emoji} {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}



            <motion.button
              className="retry-btn"
              onClick={handleClean}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── How it works (shown only at idle) ── */}
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div
            className="how-it-works"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {[
              { step: '1', label: 'Paste your link' },
              { step: '2', label: 'Hit Clean' },
              { step: '3', label: 'Get a clean URL' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="step-item"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
              >
                <span className="step-num">{item.step}</span>
                <span className="step-label">{item.label}</span>
                {i < 2 && <span className="step-sep">→</span>}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
