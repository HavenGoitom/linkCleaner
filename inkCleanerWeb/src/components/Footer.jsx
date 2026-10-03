import { motion } from 'framer-motion'
import './Footer.css'

export default function Footer() {
  const platforms = ['Instagram', 'TikTok', 'Pinterest', 'Snapchat']
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
    >
      <div className="footer-inner">
        <p className="footer-note">
          Strips tracking parameters from social media links.
        </p>
        <div className="footer-platforms">
          {platforms.map((p) => (
            <span key={p} className="platform-chip">{p}</span>
          ))}
        </div>
      </div>
    </motion.footer>
  )
}
