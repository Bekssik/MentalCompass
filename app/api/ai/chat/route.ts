import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPrompt } from "@/lib/ai/prompts";
import OpenAI from "openai";
import { ChatMessage, AssessmentData } from "@/types/prisma";
import { Prisma } from "@prisma/client";

// OpenRouter configuration - использует совместимый с OpenAI API формат
const openai = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "MentalCompass AI Assistant - Mishka",
      },
    })
  : null;

// Бесплатная модель по умолчанию (можно изменить через переменную окружения)
// Попробуем несколько бесплатных моделей в порядке приоритета
const FALLBACK_MODELS = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemini-flash-1.5:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
];
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || FALLBACK_MODELS[0];

export async function POST(request: NextRequest) {
  console.log("🔵 [AI Chat] Request received");
  
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { message, userId, conversationHistory } = body;

    console.log("🔵 [AI Chat] Request data:", {
      hasMessage: !!message,
      messageLength: message?.length,
      hasUserId: !!userId,
      historyLength: conversationHistory?.length || 0,
    });

    if (!message) {
      console.error("❌ [AI Chat] Message is required");
      return NextResponse.json(
        { error: "Message is required", response: "Сообщение обязательно для заполнения." },
        { status: 400 }
      );
    }

    // Check if OpenRouter API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("🔵 [AI Chat] API Key check:", {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : "none",
      hasOpenAIClient: !!openai,
    });

    if (!apiKey || !openai) {
      console.error("❌ [AI Chat] OpenRouter API key is not configured");
      return NextResponse.json(
        {
          error: "API key not configured",
          response:
            "Извините, AI сервис временно недоступен. Пожалуйста, обратитесь к администратору.",
        },
        { status: 503 }
      );
    }

    // Build the prompt
    const prompt = buildPrompt(message, conversationHistory || []);
    console.log("🔵 [AI Chat] Using model:", DEFAULT_MODEL);

    // Call OpenRouter API (совместим с OpenAI API)
    let aiResponse = "Извините, AI сервис временно недоступен.";
    let lastError: any = null;
    
    const messages = [
      {
        role: "system" as const,
        content:
          "You are Mishka, a supportive AI assistant for a mental health platform. Provide emotional support, help users navigate, and suggest professional help. NEVER diagnose or give medical conclusions. Respond in Russian.",
      },
      ...(conversationHistory || []).map((msg: ChatMessage) => ({
        role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    // Try models in order of preference
    const modelsToTry = process.env.OPENROUTER_MODEL 
      ? [process.env.OPENROUTER_MODEL, ...FALLBACK_MODELS]
      : FALLBACK_MODELS;
    
    for (const model of modelsToTry) {
      try {
        console.log("🔵 [AI Chat] Trying model:", model);
        console.log("🔵 [AI Chat] Sending request to OpenRouter:", {
          model: model,
          messagesCount: messages.length,
          lastMessage: message.substring(0, 50) + "...",
        });

        const startTime = Date.now();
        const completion = await openai.chat.completions.create({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        });

        const duration = Date.now() - startTime;
        console.log("✅ [AI Chat] OpenRouter response received:", {
          model: model,
          duration: `${duration}ms`,
          hasChoices: !!completion.choices,
          choicesCount: completion.choices?.length || 0,
          hasContent: !!completion.choices?.[0]?.message?.content,
          contentLength: completion.choices?.[0]?.message?.content?.length || 0,
        });

        aiResponse = completion.choices[0]?.message?.content || aiResponse;
        
        if (!aiResponse || aiResponse.trim() === "") {
          console.warn("⚠️ [AI Chat] Empty response from API, trying next model");
          continue;
        }
        
        // Success! Break out of the loop
        break;
      } catch (apiError: any) {
        lastError = apiError;
        const errorMessage = apiError?.message || apiError?.error?.message || "Unknown error";
        console.warn(`⚠️ [AI Chat] Model ${model} failed:`, errorMessage);
        
        // If it's not a model-specific error, don't try other models
        if (
          errorMessage.includes("invalid_api_key") || 
          errorMessage.includes("401") || 
          errorMessage.includes("Unauthorized") ||
          errorMessage.includes("authentication") ||
          errorMessage.includes("rate limit") ||
          errorMessage.includes("429") ||
          errorMessage.includes("insufficient_quota") ||
          errorMessage.includes("quota") ||
          errorMessage.includes("402")
        ) {
          // These are not model-specific errors, break immediately
          break;
        }
        
        // Continue to next model if this one failed
        continue;
      }
    }
    
    // If we still don't have a response, handle the error
    if (!aiResponse || aiResponse.trim() === "" || aiResponse === "Извините, AI сервис временно недоступен.") {
      const apiError = lastError || new Error("All models failed");
      const errorDetails = {
        message: apiError?.message,
        status: apiError?.status,
        code: apiError?.code,
        response: apiError?.response?.data || apiError?.response,
        error: apiError?.error,
        stack: apiError?.stack,
      };
      
      console.error("❌ [AI Chat] OpenRouter API error (all models failed):", JSON.stringify(errorDetails, null, 2));
      
      const errorMessage = apiError?.message || apiError?.error?.message || "Unknown error";
      const statusCode = apiError?.status || apiError?.response?.status || apiError?.statusCode;
      
      // Provide more specific error messages
      if (errorMessage.includes("rate limit") || errorMessage.includes("429") || statusCode === 429) {
        aiResponse =
          "Извините, сервис перегружен. Пожалуйста, попробуйте через несколько минут.";
      } else if (
        errorMessage.includes("invalid_api_key") || 
        errorMessage.includes("401") || 
        errorMessage.includes("Unauthorized") || 
        statusCode === 401 ||
        errorMessage.includes("authentication")
      ) {
        aiResponse =
          "Извините, проблема с конфигурацией сервиса (неверный API ключ). Пожалуйста, обратитесь к администратору.";
      } else if (errorMessage.includes("insufficient_quota") || errorMessage.includes("quota") || statusCode === 402) {
        aiResponse =
          "Извините, превышен лимит запросов. Пожалуйста, попробуйте позже.";
      } else if (errorMessage.includes("model") || errorMessage.includes("not found")) {
        aiResponse =
          "Извините, все доступные модели недоступны. Пожалуйста, обратитесь к администратору.";
      } else {
        aiResponse =
          `Извините, произошла ошибка при обработке вашего запроса: ${errorMessage}. Пожалуйста, попробуйте снова или обратитесь к специалисту.`;
      }
    }

    // Store assessment data if user is logged in
    if (userId && session) {
      try {
        await prisma.assessment.upsert({
          where: {
            userId: session.user.id,
          },
          update: {
            data: {
              messages: [
                ...((await prisma.assessment.findUnique({
                  where: { userId: session.user.id },
                }))?.data as AssessmentData)?.messages || [],
                { role: "user" as const, content: message },
                { role: "assistant" as const, content: aiResponse },
              ],
            } as Prisma.InputJsonValue,
          },
          create: {
            userId: session.user.id,
            data: {
              messages: [
                { role: "user" as const, content: message },
                { role: "assistant" as const, content: aiResponse },
              ],
            } as Prisma.InputJsonValue,
          },
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue even if assessment storage fails
      }
    }

    console.log("✅ [AI Chat] Sending response:", {
      responseLength: aiResponse.length,
      responsePreview: aiResponse.substring(0, 100) + "...",
    });

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("❌ [AI Chat] Unexpected error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : typeof error,
    });
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Internal server error",
        response: `Извините, произошла внутренняя ошибка сервера: ${errorMessage}. Пожалуйста, попробуйте позже или обратитесь к администратору.`,
      },
      { status: 500 }
    );
  }
}

