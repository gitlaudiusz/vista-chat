"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface AnimatedTextProps {
  text: string
  speed?: number
  showCursor?: boolean
  onComplete?: () => void
}

export default function AnimatedText({ 
  text, 
  speed = 50, 
  showCursor = true, 
  onComplete 
}: AnimatedTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (!isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [currentIndex, text, speed, isComplete, onComplete])

  return (
    <span className="inline-block">
      {displayText}
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-current ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  )
}