"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the ConstellationGuide to prevent hydration issues
const ConstellationGuide = dynamic(() => import("./constellation-guide"), { ssr: false })

export default function LibraConstellation() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [isGuideReady, setIsGuideReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update dimensions on mount and resize
  useEffect(() => {
    setMounted(true)

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    // Delay setting guide ready to prevent flashing
    const timer = setTimeout(() => {
      setIsGuideReady(true)
    }, 1000)

    return () => {
      window.removeEventListener("resize", updateDimensions)
      clearTimeout(timer)
    }
  }, [])

  if (!mounted) return null

  // Define star positions based on the image
  const stars = [
    { id: 1, x: 0.25, y: 0.2, size: 3, name: "Zubeneschamali", designation: "β Librae" },
    { id: 2, x: 0.5, y: 0.2, size: 3, name: "Zubenelgenubi", designation: "α Librae" },
    { id: 3, x: 0.25, y: 0.4, size: 3, name: "Gamma Librae", designation: "γ Librae" },
    { id: 4, x: 0.5, y: 0.4, size: 2.5, name: "Upsilon Librae", designation: "υ Librae" },
    { id: 5, x: 0.375, y: 0.6, size: 2, name: "Tau Librae", designation: "τ Librae" },
  ]

  // Define constellation lines (scale-like pattern)
  const lines = [
    { start: 0, end: 1 }, // Top horizontal bar
    { start: 0, end: 2 }, // Left vertical connection
    { start: 1, end: 3 }, // Right vertical connection
    { start: 2, end: 4 }, // Bottom left diagonal
    { start: 3, end: 4 }, // Bottom right diagonal
  ]

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-5 pointer-events-none">
        {/* Milky Way background effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(135deg, transparent 0%, rgba(100, 150, 255, 0.1) 40%, transparent 60%)",
            filter: "blur(30px)",
          }}
        />

        {/* Constellation lines */}
        <svg width="100%" height="100%" className="absolute inset-0">
          {lines.map((line, index) => {
            const start = stars[line.start]
            const end = stars[line.end]

            return (
              <line
                key={`line-${index}`}
                x1={start.x * dimensions.width}
                y1={start.y * dimensions.height}
                x2={end.x * dimensions.width}
                y2={end.y * dimensions.height}
                stroke="rgba(180, 220, 255, 0.6)"
                strokeWidth={1}
              />
            )
          })}
        </svg>

        {/* Stars */}
        {stars.map((star, index) => {
          const isHovered = hoveredStar === index
          const x = star.x * dimensions.width
          const y = star.y * dimensions.height
          const size = star.size * 3

          return (
            <div key={`star-${index}`} style={{ position: "absolute", left: 0, top: 0 }}>
              {/* Star */}
              <motion.div
                className="pointer-events-auto cursor-pointer"
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)`,
                }}
                animate={{
                  scale: isHovered ? 1.5 : [1, 1.1, 1],
                }}
                transition={{
                  duration: isHovered ? 0.2 : 3,
                  repeat: isHovered ? 0 : Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                onMouseEnter={() => setHoveredStar(index)}
                onMouseLeave={() => setHoveredStar(null)}
              />

              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-3 pointer-events-none"
                    style={{
                      left: x,
                      top: y + 15,
                      transform: "translateX(-50%)",
                      width: "max-content",
                      maxWidth: "220px",
                    }}
                  >
                    <div className="text-white">
                      <h3 className="font-medium text-sm">{star.name}</h3>
                      <p className="text-white/70 text-xs">{star.designation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {/* Help button - only show when guide is ready to prevent flashing */}
        {isGuideReady && (
          <motion.button
            className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-full p-2 text-white/80 hover:text-white hover:bg-black/60 transition-colors pointer-events-auto z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGuide(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            title="How to spot Libra constellation"
          >
            <HelpCircle size={20} />
          </motion.button>
        )}
      </div>

      {/* Constellation Guide Modal */}
      {showGuide && <ConstellationGuide onClose={() => setShowGuide(false)} />}
    </>
  )
}
