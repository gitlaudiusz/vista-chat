export interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: Date
}

export interface ChatContext {
  conversation_stage: "greeting" | "exploration" | "technical_discussion" | "conclusion"
  language?: "en" | "pl"
  user_interests?: string[]
  last_topic?: string
  session_id?: string
}

export interface ChatResponse {
  message: string
  context: ChatContext
  phase: "initial" | "technical" | "assessment"
  next_action: "continue_chat" | "request_info" | "end_conversation"
  email_requested: boolean
}
