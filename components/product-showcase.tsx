"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mic, Brain, Code, Stethoscope, Terminal, Zap } from "lucide-react"

const products = [
  {
    name: "Vista",
    icon: Stethoscope,
    description: "AI-powered veterinary practice management with voice transcription",
    status: "LIVE",
    link: "#vista",
    color: "from-green-400 to-emerald-600"
  },
  {
    name: "Nemotron-49B",
    icon: Brain,
    description: "Our massive language model running on llm.libraxis.cloud",
    status: "OPERATIONAL",
    link: "https://llm.libraxis.cloud",
    color: "from-blue-400 to-indigo-600"
  },
  {
    name: "WhisperX STT",
    icon: Mic,
    description: "19x realtime speech-to-text with diarization",
    status: "RUNNING",
    link: "https://stt.libraxis.cloud",
    color: "from-purple-400 to-pink-600"
  },
  {
    name: "automator-mcp",
    icon: Zap,
    description: "AI control of macOS - send emails, run scripts, automate everything",
    status: "NPM READY",
    link: "https://www.npmjs.com/package/automator-mcp",
    color: "from-orange-400 to-red-600"
  },
  {
    name: "unicode-puzzles-mcp",
    icon: Code,
    description: "Hide secrets in plain sight with Unicode steganography",
    status: "NPM READY",
    link: "https://www.npmjs.com/package/unicode-puzzles-mcp",
    color: "from-cyan-400 to-blue-600"
  },
  {
    name: "mcp-server-semgrep",
    icon: Terminal,
    description: "4000+ security rules for code analysis",
    status: "NPM READY",
    link: "https://www.npmjs.com/package/mcp-server-semgrep",
    color: "from-yellow-400 to-orange-600"
  }
]

export default function ProductShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative h-full w-full">
        {products.map((product, index) => {
          const angle = (index * 60) - 30 // Spread products in an arc
          const radius = 300
          const x = Math.cos((angle * Math.PI) / 180) * radius
          const y = Math.sin((angle * Math.PI) / 180) * radius

          return (
            <motion.div
              key={product.name}
              className="absolute top-1/2 left-1/2 pointer-events-auto"
              style={{
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: hoveredIndex === null || hoveredIndex === index ? 0.8 : 0.3,
                scale: hoveredIndex === index ? 1.1 : 1
              }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <a
                href={product.link}
                target={product.link.startsWith('http') ? '_blank' : undefined}
                rel={product.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="block"
              >
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r ${product.color} rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative bg-black/80 backdrop-blur-md border border-white/20 rounded-full p-4 group-hover:border-white/40 transition-all">
                    <product.icon size={24} className="text-white" />
                  </div>
                  
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-64"
                    >
                      <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-3 text-center">
                        <h3 className="text-white font-semibold">{product.name}</h3>
                        <p className="text-white/70 text-xs mt-1">{product.description}</p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full bg-gradient-to-r ${product.color} text-white font-bold`}>
                          {product.status}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </a>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}