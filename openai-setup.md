# Setting up OpenAI API Integration

This guide will help you connect your chatbot to the OpenAI API.

## 1. Install the OpenAI package

Run the following command in your project directory:

```bash
npm install openai
```

## 2. Get your OpenAI API Key

1. Go to [OpenAI's website](https://platform.openai.com/account/api-keys)
2. Create an account or log in
3. Navigate to the API key section
4. Create a new API key
5. Copy your API key

## 3. Set up environment variables

1. Create a `.env.local` file in your project root if it doesn't exist
2. Add your API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with the API key you copied

## 4. Restart your development server

```bash
npm run dev
```

## 5. Test your integration

Your chatbot should now be connected to OpenAI's API and provide real AI responses!
