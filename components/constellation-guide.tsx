"use client"

import { useState, useEffect, useRef } from "react"
import { X, Info, ChevronRight, ChevronLeft } from "lucide-react"

interface ConstellationGuideProps {
  onClose: () => void
}

export default function ConstellationGuide({ onClose }: ConstellationGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Ensure component is fully loaded before animations
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const steps = [
    {
      title: "Finding Libra in the night sky",
      content:
        "Libra is a zodiac constellation visible in the Northern Hemisphere from April to July, and best seen in June. It sits between Virgo to the west and Scorpius to the east.",
      tip: "Look south in the early evening during late spring and early summer months.",
    },
    {
      title: "Identifying the main stars",
      content:
        "Libra's brightest stars are Zubeneschamali (β Librae) and Zubenelgenubi (α Librae). Despite being labeled 'alpha', Zubenelgenubi is actually slightly dimmer than Zubeneschamali.",
      tip: "Zubeneschamali has a distinctive greenish tint, making it one of the few stars that appears colored to the naked eye.",
    },
    {
      title: "Using nearby constellations",
      content:
        "Find Libra by first locating the bright star Spica in Virgo to the west, and the distinctive red star Antares in Scorpius to the east. Libra sits between these two landmarks.",
      tip: "The bright star Arcturus can help too - follow the arc of the Big Dipper's handle to Arcturus, then continue the arc to Spica, and look eastward to find Libra.",
    },
    {
      title: "Recognizing the scale shape",
      content:
        "When properly connected, Libra resembles a traditional balance scale: the two bright stars Zubeneschamali (β) and Zubenelgenubi (α) form the horizontal beam, while fainter stars drop downward to a single point, outlining the central stem and pans. Visualizing this scale-like outline helps distinguish Libra from surrounding constellations.",
      tip: "Imagine a balance: the top bar runs between β and α Librae, vertical lines drop to γ and υ Librae, which then join at τ Librae – the point where the pans would hang.",
    },
    {
      title: "Historical significance",
      content:
        "Interestingly, Zubenelgenubi and Zubeneschamali mean 'northern claw' and 'southern claw' in Arabic. This is because these stars were once considered part of Scorpius (the scorpion's claws) before Libra became its own constellation.",
      tip: "The connection to Scorpius explains why Libra's brightest stars have names related to claws rather than scales.",
    },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isLoaded) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/70">
      <div className="relative w-full max-w-2xl backdrop-blur-md bg-black/80 border border-white/20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(120,150,255,0.2)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-200 z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-light text-white flex items-center">
            <Info size={18} className="mr-2 text-blue-300" />
            How to spot Libra constellation
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="min-h-[200px]" ref={contentRef}>
            <h3 className="text-lg font-medium text-white/90 mb-3">{steps[currentStep].title}</h3>
            <p className="text-white/80 mb-4">{steps[currentStep].content}</p>
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 flex items-start">
              <div className="bg-blue-500/20 p-1 rounded-full mr-3 mt-0.5">
                <Info size={16} className="text-blue-300" />
              </div>
              <p className="text-blue-200/90 text-sm">{steps[currentStep].tip}</p>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentStep === index ? "bg-white w-4" : "bg-white/30"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center text-sm ${
                currentStep === 0 ? "text-white/30 cursor-not-allowed" : "text-white/80 hover:text-white"
              }`}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
            <div className="text-white/50 text-sm">
              {currentStep + 1} of {steps.length}
            </div>
            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className={`flex items-center text-sm ${
                currentStep === steps.length - 1 ? "text-white/30 cursor-not-allowed" : "text-white/80 hover:text-white"
              }`}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Visual aid - realistic constellation diagram */}
        <div className="p-6 pt-0">
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="bg-black/50 rounded-lg p-4 flex justify-center">
              <div className="relative w-full max-w-md h-[180px]">
                {/* Realistic constellation diagram based on the provided image */}
                <svg width="100%" height="100%" viewBox="0 0 400 180" className="absolute inset-0">
                  {/* Background */}
                  <rect width="400" height="180" fill="#050a14" />

                  {/* Milky Way background effect */}
                  <path
                    d="M100,40 Q200,90 300,140"
                    stroke="rgba(100, 150, 255, 0.1)"
                    strokeWidth="60"
                    fill="none"
                    filter="blur(15px)"
                  />

                  {/* Constellation lines - updated to match the image */}
                  <line x1="120" y1="40" x2="200" y2="40" stroke="rgba(180, 220, 255, 0.6)" strokeWidth="1" />
                  <line x1="200" y1="40" x2="280" y2="80" stroke="rgba(180, 220, 255, 0.6)" strokeWidth="1" />
                  <line x1="280" y1="80" x2="320" y2="100" stroke="rgba(180, 220, 255, 0.6)" strokeWidth="1" />
                  <line x1="120" y1="40" x2="80" y2="100" stroke="rgba(180, 220, 255, 0.6)" strokeWidth="1" />
                  <line x1="80" y1="100" x2="120" y2="140" stroke="rgba(180, 220, 255, 0.6)" strokeWidth="1" />
                  <line x1="120" y1="140" x2="200" y2="140" stroke="rgba(180, 220, 255, 0.6)" strokeWidth="1" />
                  <line x1="200" y1="140" x2="280" y2="80" stroke="rgba(180, 220, 255, 0.6)" strokeWidth="1" />

                  {/* Stars */}
                  <circle
                    cx="120"
                    cy="40"
                    r="6"
                    fill="rgba(255, 255, 255, 0.95)"
                    filter="drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))"
                  />
                  <circle
                    cx="200"
                    cy="40"
                    r="6"
                    fill="rgba(255, 255, 255, 0.95)"
                    filter="drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))"
                  />
                  <circle
                    cx="280"
                    cy="80"
                    r="6"
                    fill="rgba(255, 255, 255, 0.95)"
                    filter="drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))"
                  />
                  <circle
                    cx="320"
                    cy="100"
                    r="4"
                    fill="rgba(255, 255, 255, 0.9)"
                    filter="drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))"
                  />
                  <circle
                    cx="80"
                    cy="100"
                    r="5"
                    fill="rgba(255, 255, 255, 0.9)"
                    filter="drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))"
                  />
                  <circle
                    cx="120"
                    cy="140"
                    r="5"
                    fill="rgba(255, 255, 255, 0.9)"
                    filter="drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))"
                  />
                  <circle
                    cx="200"
                    cy="140"
                    r="5"
                    fill="rgba(255, 255, 255, 0.9)"
                    filter="drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))"
                  />

                  {/* Star labels */}
                  <text x="120" y="30" fill="rgba(255, 255, 255, 0.9)" fontSize="10" textAnchor="middle">
                    Zubeneschamali
                  </text>
                  <text x="200" y="30" fill="rgba(255, 255, 255, 0.9)" fontSize="10" textAnchor="middle">
                    Zubenelgenubi
                  </text>
                  <text x="280" y="70" fill="rgba(255, 255, 255, 0.8)" fontSize="10" textAnchor="middle">
                    Zubenelhakrabi
                  </text>
                  <text x="320" y="90" fill="rgba(255, 255, 255, 0.7)" fontSize="10" textAnchor="middle">
                    Theta Librae
                  </text>
                  <text x="80" y="90" fill="rgba(255, 255, 255, 0.8)" fontSize="10" textAnchor="middle">
                    Brachium
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
