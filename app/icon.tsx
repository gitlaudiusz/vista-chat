import { ImageResponse } from "next/og"

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: "#050a14",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Milky Way background */}
      <div
        style={{
          position: "absolute",
          width: "150%",
          height: "150%",
          background: "linear-gradient(135deg, transparent 0%, rgba(100, 150, 255, 0.1) 40%, transparent 60%)",
          filter: "blur(2px)",
        }}
      />

      {/* Libra constellation */}
      <svg width="24" height="24" viewBox="0 0 24 24" style={{ position: "relative" }}>
        {/* Stars */}
        <circle cx="6" cy="6" r="1.5" fill="white" filter="drop-shadow(0 0 1px white)" />
        <circle cx="12" cy="6" r="1.5" fill="white" filter="drop-shadow(0 0 1px white)" />
        <circle cx="18" cy="12" r="1.5" fill="white" filter="drop-shadow(0 0 1px white)" />
        <circle cx="20" cy="15" r="1" fill="white" filter="drop-shadow(0 0 0.5px white)" />
        <circle cx="4" cy="12" r="1" fill="white" filter="drop-shadow(0 0 0.5px white)" />
        <circle cx="6" cy="18" r="1" fill="white" filter="drop-shadow(0 0 0.5px white)" />
        <circle cx="12" cy="18" r="1" fill="white" filter="drop-shadow(0 0 0.5px white)" />

        {/* Lines */}
        <line x1="6" y1="6" x2="12" y2="6" stroke="rgba(180, 220, 255, 0.8)" strokeWidth="0.5" />
        <line x1="12" y1="6" x2="18" y2="12" stroke="rgba(180, 220, 255, 0.8)" strokeWidth="0.5" />
        <line x1="18" y1="12" x2="20" y2="15" stroke="rgba(180, 220, 255, 0.8)" strokeWidth="0.5" />
        <line x1="6" y1="6" x2="4" y2="12" stroke="rgba(180, 220, 255, 0.8)" strokeWidth="0.5" />
        <line x1="4" y1="12" x2="6" y2="18" stroke="rgba(180, 220, 255, 0.8)" strokeWidth="0.5" />
        <line x1="6" y1="18" x2="12" y2="18" stroke="rgba(180, 220, 255, 0.8)" strokeWidth="0.5" />
        <line x1="12" y1="18" x2="18" y2="12" stroke="rgba(180, 220, 255, 0.8)" strokeWidth="0.5" />
      </svg>
    </div>,
    // ImageResponse options
    {
      ...size,
    },
  )
}
