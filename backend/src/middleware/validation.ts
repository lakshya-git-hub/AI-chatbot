import { Request, Response, NextFunction } from 'express';

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long' });
    return;
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  next();
};

export const validateMessage = (req: Request, res: Response, next: NextFunction): void => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }

  if (content.length > 1000) {
    res.status(400).json({ error: 'Message is too long' });
    return;
  }

  next();
};

export const validateRating = (req: Request, res: Response, next: NextFunction): void => {
  const { rating } = req.body;

  if (!rating || typeof rating !== 'number') {
    res.status(400).json({ error: 'Valid rating is required' });
    return;
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be between 1 and 5' });
    return;
  }

  next();
};

export const validateChatbotName = (req: Request, res: Response, next: NextFunction): void => {
  const { chatbotName } = req.body;

  if (!chatbotName || typeof chatbotName !== 'string' || chatbotName.trim().length === 0) {
    res.status(400).json({ error: 'Chatbot name is required and must be a non-empty string.' });
    return;
  }

  if (chatbotName.length > 50) {
    res.status(400).json({ error: 'Chatbot name cannot exceed 50 characters.' });
    return;
  }

  next();
}; 