// Code snippet for non-streaming handleSubmit:

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!prompt.trim() || isLoading) return;

  // Add user message
  const userMessage = { role: 'user', content: prompt };
  setMessages(prev => [...prev, userMessage]);
  setPrompt('');
  setIsLoading(true);

  try {
    const res = await fetch('/api/chat/non-streaming-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    
    // Simulate streaming for better UX
    await simulateStreamingResponse(data.response);
  } catch (error) {
    console.error('Error:', error);
    setIsLoading(false);
    setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error.' }]);
  }
};
