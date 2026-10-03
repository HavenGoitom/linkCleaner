import { motion } from 'framer-motion'
import './Header.css'

export default function Header() {
  return (
    <motion.header
      className="header"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="header-inner">
        <motion.div
          className="logo"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <div className="logo-icon">
            <img src="/logo.png" alt="LinkCleaner Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit' }} />
          </div>
          <span className="logo-text">
            LinkCleaner
          </span>
        </motion.div>
      </div>
    </motion.header>
  )
}
