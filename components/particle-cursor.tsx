"use client"

import { useRef, useEffect, useState } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  alpha: number
  color: string
  life: number
  maxLife: number
}

export default function ParticleCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if this is a low-end device
    const checkDevicePerformance = () => {
      // Simple heuristic - check if the device has a small screen or is a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const isSmallScreen = window.innerWidth < 768 || window.innerHeight < 600

      // Check if the device has a slow CPU (using a simple benchmark)
      let slowCPU = false
      const start = performance.now()
      for (let i = 0; i < 1000000; i++) {
        // Simple computation to benchmark CPU
        Math.sqrt(i * Math.random())
      }
      const end = performance.now()
      slowCPU = end - start > 50 // If it takes more than 50ms, consider it a slow CPU

      return isMobile || isSmallScreen || slowCPU
    }

    setIsLowEndDevice(checkDevicePerformance())
  }, [])

  useEffect(() => {
    if (!mounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Mouse position
    let mouseX = 0
    let mouseY = 0
    let lastMouseX = 0
    let lastMouseY = 0
    let isMoving = false
    let lastMoveTime = Date.now()

    // Particles array
    const particles: Particle[] = []
    // Reduce particles on low-end devices
    const maxParticles = isLowEndDevice ? 25 : 50

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      // Create particles on mouse movement
      const movementX = Math.abs(mouseX - lastMouseX)
      const movementY = Math.abs(mouseY - lastMouseY)
      const movement = Math.sqrt(movementX * movementX + movementY * movementY)

      isMoving = movement > 2
      lastMoveTime = Date.now()

      // Create particles based on movement speed - but only if significant movement
      // Increase threshold and reduce particles on low-end devices
      const movementThreshold = isLowEndDevice ? 10 : 6
      if (movement > movementThreshold) {
        const particlesToCreate = Math.min(isLowEndDevice ? 1 : 2, Math.floor(movement / (isLowEndDevice ? 20 : 12)))

        for (let i = 0; i < particlesToCreate; i++) {
          if (particles.length < maxParticles) {
            createParticle()
          }
        }
      }

      lastMouseX = mouseX
      lastMouseY = mouseY
    }

    // Create a particle
    const createParticle = () => {
      const size = Math.random() * 2 + 0.5 // Slightly smaller particles

      // Randomize initial position slightly around cursor
      const offsetX = (Math.random() - 0.5) * 4
      const offsetY = (Math.random() - 0.5) * 4

      const speedX = (Math.random() - 0.5) * 1.2 // Reduced speed
      const speedY = (Math.random() - 0.5) * 1.2 // Reduced speed

      // Create a blue-white color with random hue
      const hue = Math.random() * 40 + 200 // Blue range
      const saturation = Math.random() * 50 + 50 // Medium-high saturation
      const lightness = Math.random() * 30 + 70 // High lightness
      const color = `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`

      // Set a maximum life for the particle - shorter on low-end devices
      const maxLife = Math.random() * (isLowEndDevice ? 60 : 80) + (isLowEndDevice ? 30 : 40)

      particles.push({
        x: mouseX + offsetX,
        y: mouseY + offsetY,
        size,
        speedX,
        speedY,
        alpha: 0.7, // Start with lower alpha
        color,
        life: 0,
        maxLife,
      })
    }

    // Update and draw particles
    let lastFrameTime = 0
    const frameInterval = isLowEndDevice ? 50 : 16 // 20fps for low-end, 60fps for high-end

    const animate = (time: number) => {
      const animationId = requestAnimationFrame(animate)

      // Limit frame rate on low-end devices
      if (isLowEndDevice) {
        const elapsed = time - lastFrameTime
        if (elapsed < frameInterval) return
        lastFrameTime = time - (elapsed % frameInterval)
      }

      // Clear canvas completely each frame to prevent trails
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Check if we should fade out all particles (mouse not moving)
      const now = Date.now()
      const shouldFadeAll = now - lastMoveTime > 1500 // 1.5 seconds without movement

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Update position with reduced speed over time
        p.x += p.speedX * (1 - (p.life / p.maxLife) * 0.8) // Slow down as life increases
        p.y += p.speedY * (1 - (p.life / p.maxLife) * 0.8) // Slow down as life increases

        // Gravitational effect towards mouse - gentler
        if (!shouldFadeAll) {
          const dx = mouseX - p.x
          const dy = mouseY - p.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > 50) {
            const angle = Math.atan2(dy, dx)
            const gravitationalPull = 0.02 // Reduced pull
            p.speedX += Math.cos(angle) * gravitationalPull
            p.speedY += Math.sin(angle) * gravitationalPull
          }
        }

        // Apply drag
        p.speedX *= 0.95 // More drag
        p.speedY *= 0.95 // More drag

        // Increase life
        p.life++

        // Calculate alpha based on life
        if (shouldFadeAll) {
          // Fade out faster when mouse is not moving
          p.alpha -= 0.04
        } else {
          // Normal life cycle
          if (p.life < p.maxLife * 0.2) {
            // Fade in
            p.alpha = Math.min(0.7, (p.life / (p.maxLife * 0.2)) * 0.7)
          } else {
            // Fade out
            p.alpha = 0.7 * (1 - (p.life - p.maxLife * 0.2) / (p.maxLife * 0.8))
          }
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace("1)", `${p.alpha})`)
        ctx.fill()

        // Remove dead particles
        if (p.alpha <= 0 || p.life >= p.maxLife) {
          particles.splice(i, 1)
          i--
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    const animationId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [isActive, mounted, isLowEndDevice])

  if (!mounted) return null

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" />
}
