import { Request, Response } from 'express';
import { HfInference } from '@huggingface/inference';
import { Message } from '../models/Message';
import NodeCache from 'node-cache';

// Initialize cache with 5 minutes TTL
const responseCache = new NodeCache({ stdTTL: 300 });

export const createChatControllers = (inferenceClient: HfInference) => {

  const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { content } = req.body;
      const user = (req as any).user;

      // Check cache first
      const cacheKey = `${user._id}-${content}`;
      const cachedResponse = responseCache.get(cacheKey);
      if (cachedResponse) {
        res.json(cachedResponse);
        return;
      }

      // Save user message
      const userMessage = new Message({
        user: user._id,
        content,
        isAI: false
      });
      await userMessage.save();

      // Get AI response from Hugging Face model with optimized parameters
      const chatCompletion = await inferenceClient.chatCompletion({
        provider: "fireworks-ai",
        model: "deepseek-ai/DeepSeek-R1-0528",
        messages: [{ role: "user", content }],
        max_tokens: 150, // Limit response length for faster responses
        temperature: 0.7, // Slightly lower temperature for more focused responses
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not process your request.';

      // Save AI response
      const aiMessage = new Message({
        user: user._id,
        content: aiResponse,
        isAI: true
      });
      await aiMessage.save();

      const response = { userMessage, aiMessage };
      
      // Cache the response
      responseCache.set(cacheKey, response);

      res.json(response);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      res.status(500).json({ error: 'Error processing message' });
    }
  };

  const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      const page = parseInt(req.query.page as string) || 1;
      const limit = 20; // Number of messages per page
      const skip = (page - 1) * limit;

      const messages = await Message.find({ user: user._id })
        .sort({ createdAt: -1 }) // Sort descending for latest messages first
        .skip(skip)
        .limit(limit);

      // Check if there are more messages
      const totalMessages = await Message.countDocuments({ user: user._id });
      const hasMore = totalMessages > page * limit;

      res.json({
        messages: messages.reverse(), // Reverse to show latest at the bottom
        pagination: {
          hasMore,
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching messages' });
    }
  };

  const rateResponse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageId, rating } = req.body;
      const user = (req as any).user;
      const message = await Message.findOne({
        _id: messageId,
        user: user._id,
        isAI: true
      });

      if (!message) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }

      message.rating = rating;
      await message.save();

      res.json(message);
    } catch (error) {
      res.status(500).json({ error: 'Error rating message' });
    }
  };

  const updateChatbotName = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chatbotName } = req.body;
      const user = (req as any).user;

      if (!chatbotName || typeof chatbotName !== 'string' || chatbotName.trim().length === 0) {
        res.status(400).json({ error: 'Chatbot name is required and must be a non-empty string.' });
        return;
      }

      if (chatbotName.length > 50) {
        res.status(400).json({ error: 'Chatbot name cannot exceed 50 characters.' });
        return;
      }

      // Find the user and update their chatbotName
      const updatedUser = await (req as any).user.constructor.findByIdAndUpdate(
        user._id,
        { chatbotName },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      res.json({ message: 'Chatbot name updated successfully.', chatbotName: updatedUser.chatbotName });
    } catch (error) {
      console.error('Error updating chatbot name:', error);
      res.status(500).json({ error: 'Error updating chatbot name.' });
    }
  };

  return {
    sendMessage,
    getMessages,
    rateResponse,
    updateChatbotName,
  };
}; 