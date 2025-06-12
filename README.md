# AI-Powered Chatbot

A modern, real-time AI chatbot built with Next.js, Node.js, Express.js, MongoDB, and Tailwind CSS.

## Features

- 🤖 AI-powered responses using OpenAI GPT
- 🔐 User authentication with JWT
- 💬 Real-time chat using WebSocket
- 📱 Responsive UI with Tailwind CSS
- 💾 Chat history storage in MongoDB
- 🌙 Dark/Light mode support
- ⭐ Response rating system

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io
- **AI**: OpenAI GPT API
- **Authentication**: JWT

## Project Structure

```
/chatbot-app
 ├── frontend (Next.js)
 │   ├── pages
 │   ├── components
 │   ├── styles
 │   ├── utils
 │   └── services
 │
 ├── backend (Node.js + Express.js)
 │   ├── routes
 │   ├── models
 │   ├── controllers
 │   ├── middleware
 │   ├── services
 │   └── config
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd backend
npm install
```

4. Set up environment variables
- Create `.env` files in both frontend and backend directories
- Add necessary environment variables (see .env.example files)

5. Start the development servers
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

## API Documentation

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Chat
- GET /api/chat/history - Get chat history
- POST /api/chat/message - Send a message
- GET /api/chat/conversations - Get all conversations

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

## Deployment Notes

This section added to trigger a new Netlify deploy. 