"use client"

import { useEffect, useState } from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Format markdown with simple syntax highlighting
  const formatMarkdown = (text: string) => {
    // Replace code blocks with basic styling
    let formatted = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<div class="code-block"><pre><code class="language-${lang || "text"}">${escapeHtml(code.trim())}</code></pre></div>`
    })

    // Replace inline code
    formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>")

    // Replace headers
    formatted = formatted.replace(/^### (.*$)/gm, "<h3>$1</h3>")
    formatted = formatted.replace(/^## (.*$)/gm, "<h2>$1</h2>")
    formatted = formatted.replace(/^# (.*$)/gm, "<h1>$1</h1>")

    // Replace bold and italic
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Replace links
    formatted = formatted.replace(
      /\[(.*?)\]$$(.*?)$$/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )

    // Replace lists
    formatted = formatted.replace(/^\* (.*$)/gm, "<li>$1</li>")
    formatted = formatted.replace(/^(\d+)\. (.*$)/gm, "<li>$2</li>")

    // Replace paragraphs
    formatted = formatted.replace(/^(?!<h|<li|<div class="code-block"|<pre)(.*$)/gm, (_, text) => {
      if (text.trim() === "") return ""
      return `<p>${text}</p>`
    })

    // Wrap lists
    let inList = false
    const lines = formatted.split("\n")
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("<li>") && !inList) {
        lines[i] = "<ul>" + lines[i]
        inList = true
      } else if (!lines[i].startsWith("<li>") && inList) {
        lines[i - 1] = lines[i - 1] + "</ul>"
        inList = false
      }
    }
    if (inList) {
      lines.push("</ul>")
    }

    return lines.join("\n")
  }

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  if (!mounted) {
    return <div className={`text-sm leading-relaxed ${className}`}>{content}</div>
  }

  return (
    <div
      className={`text-sm leading-relaxed markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
    />
  )
}
