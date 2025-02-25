# Modern AI Chatbot

A responsive, feature-rich AI chatbot interface built with Next.js and Tailwind CSS. This project provides a modern user experience similar to world-class AI assistants like ChatGPT, Qwen, and Mistral.

![AI Chatbot Preview](./public/chatbot-preview.png)

## Features

- ✨ **Modern UI** - Clean, responsive design following modern design principles
- 🌓 **Dark/Light Mode** - Toggle between dark and light themes
- ⚡ **Real-time Streaming** - Character-by-character streaming text responses
- 📱 **Mobile Responsive** - Works seamlessly on desktop and mobile devices
- 🧠 **Simulated AI Responses** - Easily extendable to connect to real AI APIs
- 💬 **Chat History** - View your conversation history
- 🔄 **New Chat Function** - Start fresh conversations

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library
- Web Streams API - For streaming text responses

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd my-chatbot
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in your browser to see the result.

## Project Structure

```
my-chatbot/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.js      # API endpoint for chat
│   │   ├── dashboard/
│   │   │   └── page.js           # Main chat interface
│   │   ├── globals.css           # Global styles
│   │   └── layout.js            
├── tailwind.config.js            # Tailwind configuration
└── package.json
```

## Customization

### Adding New AI Responses

To add new topic responses, edit the `generateResponse` function in `/src/app/api/chat/route.js`:

```javascript
function generateResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('new topic')) {
    return `Your detailed response about the new topic...`;
  } 
  // ...existing topics...
}
```

### Connecting to a Real AI API

To connect to a real AI service (like OpenAI, Claude, etc.), modify the API route:

```javascript
// Example with OpenAI (requires installing openai package)
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In your POST function:
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: prompt }],
  stream: true,
});

// Handle streaming response...
```

## Features to Add

- User authentication
- Persistent chat history
- File uploads
- Code highlighting
- Voice input/output
- More UI themes

## License

[MIT](LICENSE)

## Acknowledgements

- Inspired by leading AI chat interfaces
- Built with Next.js App Router
