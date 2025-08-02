"use client"

interface LoadingDotsProps {
  size?: "sm" | "md" | "lg"
  color?: string
}

export default function LoadingDots({ size = "md", color = "white" }: LoadingDotsProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2", 
    lg: "w-3 h-3"
  }

  const containerClasses = {
    sm: "space-x-1",
    md: "space-x-1.5",
    lg: "space-x-2"
  }

  return (
    <div className={`flex items-center ${containerClasses[size]}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full animate-pulse`}
        style={{ 
          backgroundColor: color,
          animationDelay: "0ms",
          animationDuration: "800ms"
        }}
      />
      <div 
        className={`${sizeClasses[size]} rounded-full animate-pulse`}
        style={{ 
          backgroundColor: color,
          animationDelay: "200ms", 
          animationDuration: "800ms"
        }}
      />
      <div 
        className={`${sizeClasses[size]} rounded-full animate-pulse`}
        style={{ 
          backgroundColor: color,
          animationDelay: "400ms",
          animationDuration: "800ms"
        }}
      />
    </div>
  )
}