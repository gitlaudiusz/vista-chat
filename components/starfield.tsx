"use client"

import { useRef, useEffect, useState } from "react"
import * as THREE from "three"

export default function Starfield() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)
  const [mounted, setMounted] = useState(false)

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
    if (!mounted || !containerRef.current) return

    // Create scene with a subtle background gradient
    const scene = new THREE.Scene()

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    // Create renderer with improved settings
    const renderer = new THREE.WebGLRenderer({
      antialias: !isLowEndDevice, // Disable antialiasing on low-end devices
      powerPreference: "high-performance",
      alpha: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 1) // Pure black background
    containerRef.current.appendChild(renderer.domElement)

    // Create a gradient background
    const gradientTexture = createGradientTexture()
    const gradientMaterial = new THREE.MeshBasicMaterial({
      map: gradientTexture,
      transparent: true,
      opacity: 0.7,
    })
    const gradientGeometry = new THREE.PlaneGeometry(2, 2)
    const gradientMesh = new THREE.Mesh(gradientGeometry, gradientMaterial)
    gradientMesh.position.z = -10
    scene.add(gradientMesh)

    // Adjust star counts based on device performance
    // Reduce star count to make the Libra constellation more visible
    const starCounts = isLowEndDevice ? { bright: 50, medium: 200, dim: 500 } : { bright: 120, medium: 600, dim: 1800 }

    // Create different star materials for varied appearance
    const brightStarMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
    })

    const mediumStarMaterial = new THREE.PointsMaterial({
      color: 0xe0f0ff, // Slight blue tint
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    })

    const dimStarMaterial = new THREE.PointsMaterial({
      color: 0xb0d0ff, // More blue tint
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    })

    // Create star vertices with improved distribution
    const brightStarVertices = []
    const mediumStarVertices = []
    const dimStarVertices = []

    // Create bright stars (fewer, but more visible)
    for (let i = 0; i < starCounts.bright; i++) {
      const x = (Math.random() - 0.5) * 200
      const y = (Math.random() - 0.5) * 200
      const z = (Math.random() - 0.5) * 200
      brightStarVertices.push(x, y, z)
    }

    // Create medium stars
    for (let i = 0; i < starCounts.medium; i++) {
      const x = (Math.random() - 0.5) * 300
      const y = (Math.random() - 0.5) * 300
      const z = (Math.random() - 0.5) * 300
      mediumStarVertices.push(x, y, z)
    }

    // Create dim stars (more numerous, but less visible)
    for (let i = 0; i < starCounts.dim; i++) {
      const x = (Math.random() - 0.5) * 500
      const y = (Math.random() - 0.5) * 500
      const z = (Math.random() - 0.5) * 500
      dimStarVertices.push(x, y, z)
    }

    // Create geometries for each star type
    const brightStarGeometry = new THREE.BufferGeometry()
    brightStarGeometry.setAttribute("position", new THREE.Float32BufferAttribute(brightStarVertices, 3))

    const mediumStarGeometry = new THREE.BufferGeometry()
    mediumStarGeometry.setAttribute("position", new THREE.Float32BufferAttribute(mediumStarVertices, 3))

    const dimStarGeometry = new THREE.BufferGeometry()
    dimStarGeometry.setAttribute("position", new THREE.Float32BufferAttribute(dimStarVertices, 3))

    // Create star systems
    const brightStars = new THREE.Points(brightStarGeometry, brightStarMaterial)
    const mediumStars = new THREE.Points(mediumStarGeometry, mediumStarMaterial)
    const dimStars = new THREE.Points(dimStarGeometry, dimStarMaterial)

    // Add all star systems to scene
    scene.add(brightStars)
    scene.add(mediumStars)
    scene.add(dimStars)

    // Create a subtle nebula effect - skip on low-end devices
    if (!isLowEndDevice) {
      const nebulaGeometry = new THREE.SphereGeometry(400, 32, 32)
      const nebulaMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a237e, // Deep blue
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
      })
      const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial)
      scene.add(nebula)
    }

    // Function to create gradient texture
    function createGradientTexture() {
      const canvas = document.createElement("canvas")
      canvas.width = isLowEndDevice ? 256 : 512
      canvas.height = isLowEndDevice ? 256 : 512

      const context = canvas.getContext("2d")
      if (!context) return new THREE.Texture()

      // Create radial gradient
      const gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
      )

      // Add color stops
      gradient.addColorStop(0, "rgba(20, 30, 60, 0.5)") // Dark blue center
      gradient.addColorStop(0.5, "rgba(10, 15, 30, 0.3)") // Fading out
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)") // Transparent edge

      // Fill with gradient
      context.fillStyle = gradient
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Create texture
      const texture = new THREE.Texture(canvas)
      texture.needsUpdate = true
      return texture
    }

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Mouse movement for parallax effect - reduce sensitivity on low-end devices
    let mouseX = 0
    let mouseY = 0
    const parallaxFactor = isLowEndDevice ? 0.005 : 0.01

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Add subtle breathing effect to stars
    let breathingPhase = 0
    const breathingSpeed = isLowEndDevice ? 0.002 : 0.003

    // Animation loop with frame rate limiting for low-end devices
    let lastTime = 0
    const frameInterval = isLowEndDevice ? 50 : 16 // 20fps for low-end, 60fps for high-end

    const animate = (time: number) => {
      const animationId = requestAnimationFrame(animate)

      // Limit frame rate on low-end devices
      if (isLowEndDevice) {
        const elapsed = time - lastTime
        if (elapsed < frameInterval) return
        lastTime = time - (elapsed % frameInterval)
      }

      // Breathing effect
      breathingPhase += breathingSpeed
      const breathingValue = Math.sin(breathingPhase) * 0.5 + 0.5

      // Adjust star material opacity with breathing
      brightStarMaterial.opacity = 0.85 + breathingValue * 0.15
      mediumStarMaterial.opacity = 0.7 + breathingValue * 0.15
      dimStarMaterial.opacity = 0.5 + breathingValue * 0.15

      // Rotate stars at different speeds - slower on low-end devices
      const rotationFactor = isLowEndDevice ? 0.5 : 1
      brightStars.rotation.x += 0.0001 * rotationFactor
      brightStars.rotation.y += 0.0001 * rotationFactor

      mediumStars.rotation.x += 0.00008 * rotationFactor
      mediumStars.rotation.y += 0.00008 * rotationFactor

      dimStars.rotation.x += 0.00005 * rotationFactor
      dimStars.rotation.y += 0.00005 * rotationFactor

      // Rotate nebula very slowly - only if not a low-end device
      if (!isLowEndDevice && scene.getObjectByName("nebula")) {
        const nebula = scene.getObjectByName("nebula")
        if (nebula) {
          nebula.rotation.x += 0.0001 * breathingValue
          nebula.rotation.y += 0.0001 * breathingValue
        }
      }

      // Parallax effect
      camera.position.x += (mouseX * 0.05 - camera.position.x) * parallaxFactor
      camera.position.y += (mouseY * 0.05 - camera.position.y) * parallaxFactor

      renderer.render(scene, camera)
    }

    const animationId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationId)

      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }

      // Dispose of geometries and materials to prevent memory leaks
      brightStarGeometry.dispose()
      mediumStarGeometry.dispose()
      dimStarGeometry.dispose()
      brightStarMaterial.dispose()
      mediumStarMaterial.dispose()
      dimStarMaterial.dispose()

      // Dispose of textures
      gradientMaterial.map?.dispose()
      gradientMaterial.dispose()
      gradientGeometry.dispose()

      // Cancel animation frame
      renderer.dispose()
    }
  }, [isLowEndDevice, mounted])

  return <div ref={containerRef} className="absolute inset-0 z-0" />
}
