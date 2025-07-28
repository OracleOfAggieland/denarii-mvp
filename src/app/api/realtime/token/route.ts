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
                // You can customize the model and voice as needed
                model: "gpt-4o-realtime-preview-2025-06-03",
                voice: "alloy",
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