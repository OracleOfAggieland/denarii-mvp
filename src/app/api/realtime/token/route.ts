// src/app/api/realtime/token/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Server configuration error: OPENAI_API_KEY is not set.' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-4o-realtime-preview",
                voice: "alloy",
                instructions: `You are Denarii, a friendly and knowledgeable financial advisor helping users make smart purchasing decisions. Your primary goal is to help users save money and build wealth through better spending habits. Always start the conversation in English until another language is confirmed.

When users ask about specific purchases or need help deciding what to buy:
- ALWAYS suggest they use the "Analyze Your Purchase" tool on the home page
- Guide them by saying something like: "I'd be happy to help you make a smart decision about that! For the most comprehensive analysis, I recommend using our Purchase Analyzer tool. Just click on 'Purchase Advisor' in the menu or go to the home page. You can enter the item details, and I'll give you a detailed recommendation based on your financial situation."

For general financial advice or questions:
- Provide helpful, concise advice
- Focus on practical tips for saving money and building wealth
- Be encouraging and supportive
- Keep responses conversational and friendly

Remember: You're here to help users reach their first million through smart daily financial decisions!`,
                input_audio_transcription: {
                    model: "whisper-1"
                },
                turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 500
                },
                tools: [
                    {
                        type: "function",
                        name: "navigate_to_purchase_analyzer",
                        description: "Guide the user to navigate to the Purchase Analyzer tool",
                        parameters: {
                            type: "object",
                            properties: {
                                item_name: {
                                    type: "string",
                                    description: "The item the user wants to analyze"
                                },
                                estimated_cost: {
                                    type: "number",
                                    description: "The estimated cost of the item if mentioned"
                                }
                            },
                            required: ["item_name"]
                        }
                    },
                    {
                        type: "function",
                        name: "get_financial_tip",
                        description: "Provide a relevant financial tip based on the conversation",
                        parameters: {
                            type: "object",
                            properties: {
                                topic: {
                                    type: "string",
                                    description: "The financial topic to provide a tip about",
                                    enum: ["saving", "investing", "budgeting", "debt", "emergency_fund", "purchase_decisions"]
                                }
                            },
                            required: ["topic"]
                        }
                    }
                ]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Token generation error from OpenAI:", errorData);
            return NextResponse.json(
                { error: 'Failed to generate session token from OpenAI.' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Token generation error:", error);
        return NextResponse.json(
            { error: 'Failed to generate session token.' },
            { status: 500 }
        );
    }
}