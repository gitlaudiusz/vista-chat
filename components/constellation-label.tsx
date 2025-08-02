"use client"

import { motion } from "framer-motion"

export default function ConstellationLabel() {
  return (
    <motion.div
      className="absolute top-24 right-8 z-20 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
    >
      <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
        <h3 className="text-white/90 text-sm font-light">Constellation</h3>
        <p className="text-white text-lg font-medium">Libra</p>
        <p className="text-white/60 text-xs">The scales</p>
      </div>
    </motion.div>
  )
}
