import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import { Message } from './models/Message';
import { HfInference } from "@huggingface/inference";
import { createChatControllers } from './controllers/chat';
import createChatRouter from './routes/chat';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Initialize Hugging Face Inference Client
const inferenceClient = new HfInference(process.env.HF_TOKEN);

// Create chat controllers
const chatControllers = createChatControllers(inferenceClient);

// Create chat router with controllers
const chatRouter = createChatRouter(chatControllers);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRouter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-chatbot')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle chat messages with optimized error handling
  socket.on('chat message', async (data) => {
    try {
      const { userId, content } = data;

      // Save user message
      const userMessage = new Message({
        user: userId,
        content,
        isAI: false
      });
      await userMessage.save();

      // Get AI response with optimized parameters
      const completion = await inferenceClient.chatCompletion({
        provider: "fireworks-ai",
        model: "deepseek-ai/DeepSeek-R1-0528",
        messages: [{ role: "user", content }],
        max_tokens: 150,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';

      // Remove <think> tags from AI response if present
      const cleanedAiResponse = aiResponse.replace(/<\/?think>/g, '').trim();

      // Save AI response
      const aiMessage = new Message({
        user: userId,
        content: cleanedAiResponse,
        isAI: true
      });
      await aiMessage.save();

      // Emit messages back to client with acknowledgment
      socket.emit('chat response', {
        userMessage,
        aiMessage
      }, (ack: boolean) => {
        if (!ack) {
          console.warn('No acknowledgment received for message:', socket.id);
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { 
        message: 'Error processing message',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 