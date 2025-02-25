"use client"
import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPlus, FiTrash2 } from 'react-icons/fi';
import { BsChatLeftDots, BsMoon, BsSun } from 'react-icons/bs';

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const messagesEndRef = useRef(null);
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedText]);

  const simulateStreamingResponse = async (response) => {
    setIsStreaming(true);
    setStreamedText('');
    
    // Show each character one by one
    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 15)); // Delay between each character
      setStreamedText(prev => prev + response[i]);
    }
    
    // After streaming is complete, add the message to the messages array
    setMessages(prev => [...prev, { role: 'bot', content: response }]);
    setIsStreaming(false);
    setStreamedText('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || isStreaming) return;

    // Add user message
    const userMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      // Set up for streaming
      setIsLoading(false);
      setIsStreaming(true);
      setStreamedText('');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Network response was not ok or missing body');
      }

      // Read the streaming response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      let accumulatedText = '';
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunkText = decoder.decode(value, { stream: true });
          accumulatedText += chunkText;
          setStreamedText(accumulatedText);
        }
      }

      // After streaming is complete, add the message to the messages array
      setMessages(prev => [...prev, { role: 'bot', content: accumulatedText }]);
      setIsStreaming(false);
      setStreamedText('');
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      setIsStreaming(false);
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error.' }]);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setStreamedText('');
    setIsStreaming(false);
    setIsLoading(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`hidden md:flex flex-col w-64 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-6">
          <BsChatLeftDots className="text-xl" />
          <h1 className="text-xl font-bold">AI Assistant</h1>
        </div>
        
        <button 
          onClick={startNewChat}
          className={`flex items-center gap-2 p-3 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <FiPlus /> New Chat
        </button>
        
        <div className="mt-auto">
          <button 
            onClick={toggleDarkMode}
            className={`flex items-center gap-2 p-3 rounded-md w-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            {darkMode ? <BsSun /> : <BsMoon />} 
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Mobile Header */}
        <div className={`md:hidden flex items-center justify-between p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <BsChatLeftDots className="text-xl" />
            <h1 className="text-xl font-bold">AI Assistant</h1>
          </div>
          <button onClick={toggleDarkMode}>
            {darkMode ? <BsSun /> : <BsMoon />}
          </button>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 p-4 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ask me anything and I'll do my best to assist you!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  msg.role === 'user' 
                    ? `${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white` 
                    : `${darkMode ? 'bg-gray-800' : 'bg-white'} ${darkMode ? 'text-white' : 'text-gray-900'}`
                } ${darkMode ? 'shadow-dark' : 'shadow-sm'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          
          {/* Loading indicator (thinking dots) */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className={`rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} ${darkMode ? 'shadow-dark' : 'shadow-sm'}`}>
                <div className="flex gap-1">
                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-300'} animate-pulse`}></div>
                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-300'} animate-pulse delay-150`}></div>
                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-300'} animate-pulse delay-300`}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Streaming text animation */}
          {isStreaming && streamedText && (
            <div className="flex justify-start mb-4">
              <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              } ${darkMode ? 'shadow-dark' : 'shadow-sm'}`}>
                <p className="whitespace-pre-wrap">{streamedText}</p>
                <span className="inline-block w-1 h-4 ml-0.5 bg-blue-500 animate-pulse"></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="ถามอะไรได้เลย..."
              className={`flex-1 p-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-gray-100 text-gray-900 border-gray-200'
              } border outline-none`}
              disabled={isLoading || isStreaming}
            />
            <button 
              type="submit" 
              disabled={isLoading || isStreaming || !prompt.trim()} 
              className={`p-2 rounded-lg ${
                prompt.trim() && !isLoading && !isStreaming
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`
              } transition-colors`}
            >
              <FiSend size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
