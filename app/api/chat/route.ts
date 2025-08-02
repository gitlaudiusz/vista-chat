import type { NextRequest } from "next/server"
import { logger, LogType } from "@/lib/logging/logger"
import { chatLogger } from "@/lib/logging/chat-logger"
import type { Message, ChatContext } from "@/types/chat"
import { chatWithVista } from "@/lib/vista-service"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    const { message, sessionId: clientSessionId, messageHistory = [], language } = requestData

    // Get or create a chat session
    const sessionId = clientSessionId || chatLogger.startChatSession()

    // Log the user message
    chatLogger.logUserMessage(sessionId, message, { source: "chat-api" })

    // Prepare context from session data or create new
    const context: ChatContext = {
      conversation_stage: "greeting",
      session_id: sessionId,
      language: language || undefined, // Add language from request
    }

    // If we have message history, determine the conversation stage
    if (messageHistory.length > 0) {
      context.conversation_stage =
        messageHistory.length < 3 ? "greeting" : messageHistory.length < 6 ? "exploration" : "technical_discussion"
    }

    logger.info(LogType.API, "Processing chat request", {
      messagePreview: message.substring(0, 50) + "...",
      sessionId,
      historyLength: messageHistory.length,
      stage: context.conversation_stage,
      language: language || "auto-detect", // Log language
    })

    try {
      // Call Vista service
      const response = await chatWithVista(message, messageHistory as Message[], context)

      // Log the assistant message (successful response)
      chatLogger.logAssistantMessage(sessionId, response.message, {
        source: "chat-api",
        phase: response.phase,
        stage: response.context.conversation_stage,
        next_action: response.next_action,
      })

      return Response.json({
        message: response.message,
        sessionId,
        context: response.context,
      })
    } catch (apiError) {
      logger.error(LogType.API, "Error calling chat service", {
        error: apiError instanceof Error ? apiError.message : String(apiError),
        sessionId,
      })

      // Create a fallback response
      const errorMessage =
        "System Vista chwilowo niedostępny. Sprawdzam połączenie z serwerem weterynaryjnym..."

      // Log the assistant message (error response)
      chatLogger.logAssistantMessage(sessionId, errorMessage, {
        error: "chat_service_error",
        errorType: apiError instanceof Error ? apiError.name : "unknown",
        source: "chat-api",
      })

      return Response.json({
        message: errorMessage,
        sessionId,
        context: { conversation_stage: "greeting", session_id: sessionId },
      })
    }
  } catch (error) {
    logger.error(LogType.API, "Error in chat API", {
      error: error instanceof Error ? error.message : String(error),
    })

    // For general errors, return JSON with an error message
    return Response.json({
      message: "Vista napotkała problem techniczny. Proszę spróbować ponownie.",
      sessionId: null,
      context: { conversation_stage: "greeting" },
    })
  }
}
