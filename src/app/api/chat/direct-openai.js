import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with API key directly (only for development!)
const OPENAI_API_KEY = 'your_openai_api_key_here'; // Replace with your actual OpenAI API key
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    
    // Create a TransformStream for handling the streaming response
    const encoder = new TextEncoder();
    
    // Create response stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call OpenAI API with streaming enabled
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", 
            messages: [{ role: "user", content: prompt }],
            stream: true,
            max_tokens: 1000,
          });
          
          // Process the stream
          for await (const chunk of completion) {
            // Get the content from the chunk if it exists
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // Send content to client
              controller.enqueue(encoder.encode(content));
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('Error in OpenAI streaming:', error);
          controller.enqueue(encoder.encode("Sorry, there was an error connecting to the AI service. Error: " + error.message));
          controller.close();
        }
      }
    });
    
    return new NextResponse(stream);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
