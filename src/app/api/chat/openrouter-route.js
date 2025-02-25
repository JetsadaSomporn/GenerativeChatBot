import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    
    // Create a TransformStream for handling the streaming response
    const encoder = new TextEncoder();
    
    // Create response stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call OpenRouter API with streaming enabled
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "http://localhost:3000", // Your site URL
              "X-Title": "My AI Chatbot" // Your app name
            },
            body: JSON.stringify({
              model: "anthropic/claude-3-opus", // You can change to other models like "openai/gpt-4-turbo", "anthropic/claude-3-opus", etc.
              messages: [{ role: "user", content: prompt }],
              stream: true,
              max_tokens: 1000,
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Process the chunk
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  console.error('Error parsing JSON:', e);
                }
              }
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('Error in OpenRouter streaming:', error);
          controller.enqueue(encoder.encode("Sorry, there was an error connecting to the AI service."));
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
