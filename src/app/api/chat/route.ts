import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ErrorType } from '@/types';
import { validateEnvironment, getOpenAIConfig, logEnvironmentInfo, getCurrentEnvironment } from '@/lib/openai-config';

// Function to create OpenAI client when needed
function createOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Request interface for type safety
interface ChatRequest {
  message: string;
  image?: string; // Base64 encoded image
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

// Response interface for type safety
interface ChatResponse {
  response?: string;
  error?: string;
  errorType?: ErrorType;
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    // Log environment info for debugging
    const currentEnv = getCurrentEnvironment();
    console.log(`Chat API called - Environment: ${currentEnv}`);
    console.log(`API Key present: ${!!process.env.OPENAI_API_KEY}`);
    console.log(`API Key length: ${process.env.OPENAI_API_KEY?.length || 0}`);
    
    if (currentEnv === 'development') {
      logEnvironmentInfo();
    }

    // Validate environment variables
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.error('Environment validation failed:', envValidation.error);
      console.error('OPENAI_API_KEY value:', process.env.OPENAI_API_KEY ? `[${process.env.OPENAI_API_KEY.length} chars]` : 'undefined');
      return NextResponse.json(
        { 
          error: `Server configuration error: ${envValidation.error}`,
          errorType: ErrorType.API_ERROR 
        },
        { status: 500 }
      );
    }

    // Log warnings if any (in development only)
    if (envValidation.warnings && currentEnv === 'development') {
      envValidation.warnings.forEach(warning => {
        console.warn('Environment warning:', warning);
      });
    }

    // Get OpenAI configuration
    const config = getOpenAIConfig();

    // Parse and validate request body
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          errorType: ErrorType.VALIDATION_ERROR 
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Message is required and cannot be empty',
          errorType: ErrorType.VALIDATION_ERROR 
        },
        { status: 400 }
      );
    }

    // Validate conversation history if provided
    if (body.conversationHistory && !Array.isArray(body.conversationHistory)) {
      return NextResponse.json(
        { 
          error: 'Conversation history must be an array',
          errorType: ErrorType.VALIDATION_ERROR 
        },
        { status: 400 }
      );
    }

    // Build messages array for OpenAI API
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    
    // Add conversation history if provided
    if (body.conversationHistory && body.conversationHistory.length > 0) {
      for (const historyMessage of body.conversationHistory) {
        if (historyMessage.role && historyMessage.content) {
          messages.push({
            role: historyMessage.role,
            content: historyMessage.content,
          });
        }
      }
    }
    
    // Add current user message (with image if provided)
    if (body.image) {
      // This is a vision request
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: body.message.trim(),
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${body.image}`,
            },
          },
        ],
      });
    } else {
      // Regular text message
      messages.push({
        role: 'user',
        content: body.message.trim(),
      });
    }

    // Create OpenAI client and make request
    const openai = createOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: body.image ? 'gpt-4o' : config.model, // Use gpt-4o for image requests (supports vision)
      messages: messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    // Extract response from OpenAI
    const assistantMessage = completion.choices[0]?.message?.content;
    
    if (!assistantMessage) {
      return NextResponse.json(
        { 
          error: 'No response received from AI service',
          errorType: ErrorType.API_ERROR 
        },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({
      response: assistantMessage,
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Handle specific OpenAI errors
    if (error?.status === 429) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please wait a moment and try again.',
          errorType: ErrorType.RATE_LIMIT_ERROR 
        },
        { status: 429 }
      );
    }

    if (error?.status === 401) {
      return NextResponse.json(
        { 
          error: 'Authentication failed. Please contact support.',
          errorType: ErrorType.API_ERROR 
        },
        { status: 500 }
      );
    }

    if (error?.status >= 400 && error?.status < 500) {
      return NextResponse.json(
        { 
          error: 'Invalid request to AI service',
          errorType: ErrorType.VALIDATION_ERROR 
        },
        { status: 400 }
      );
    }

    // Handle network/connection errors
    if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'Unable to connect to AI service. Please check your connection.',
          errorType: ErrorType.NETWORK_ERROR 
        },
        { status: 503 }
      );
    }

    // Generic error fallback
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        errorType: ErrorType.API_ERROR 
      },
      { status: 500 }
    );
  }
}