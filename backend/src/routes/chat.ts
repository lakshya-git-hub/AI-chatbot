import express from 'express';
import { auth } from '../middleware/auth';
import { validateMessage, validateRating, validateChatbotName } from '../middleware/validation';
import { messageLimiter } from '../middleware/rateLimit';

interface ChatControllers {
  sendMessage: (req: any, res: any) => Promise<void>;
  getMessages: (req: any, res: any) => Promise<void>;
  rateResponse: (req: any, res: any) => Promise<void>;
  updateChatbotName: (req: any, res: any) => Promise<void>;
}

const createChatRouter = (controllers: ChatControllers) => {
  const router = express.Router();

  router.post('/message', auth, messageLimiter, validateMessage, controllers.sendMessage);
  router.get('/messages', auth, controllers.getMessages);
  router.post('/rate', auth, validateRating, controllers.rateResponse);
  router.post('/settings/chatbot-name', auth, validateChatbotName, controllers.updateChatbotName);

  return router;
};

export default createChatRouter; 