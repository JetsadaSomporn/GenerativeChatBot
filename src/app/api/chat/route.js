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
              "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "http://localhost:3000", 
              "X-Title": "My AI Chatbot"
            },
            body: JSON.stringify({
              model: "openai/gpt-3.5-turbo",
              messages: [{ role: "user", content: prompt }],
              stream: true,
              max_tokens: 1000,
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
          }

          // Use the improved parsing approach for SSE streams
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Add the new chunk to our buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete lines from the buffer
            const lines = buffer.split('\n');
            // Keep the last line in the buffer if it's incomplete
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
              
              const data = trimmedLine.slice(6); // Remove 'data: ' prefix
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // Log the problematic data for debugging (but don't send to client)
                console.error('Error parsing JSON:', e, 'Data:', data);
                // Continue processing the next lines rather than failing
                continue;
              }
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('Error in OpenRouter streaming:', error);
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
