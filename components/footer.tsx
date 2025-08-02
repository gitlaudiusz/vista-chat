"use client"

import { motion } from "framer-motion"
import { Mail } from "lucide-react"

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="absolute bottom-0 left-0 right-0 z-20 p-4 text-center text-white/60"
    >
      <div className="flex items-center justify-center space-x-4 text-xs">
        <span>© 2025 VISTA by LibraxisAI</span>
        <a
          href="mailto:vista@libraxis.ai"
          className="flex items-center space-x-1 hover:text-white/80 transition-colors"
          aria-label="Kontakt VISTA"
        >
          <Mail size={12} />
          <span>Kontakt</span>
        </a>
      </div>
    </motion.footer>
  )
}
