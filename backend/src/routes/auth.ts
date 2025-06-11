import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { auth } from '../middleware/auth';
import { register, login, logout, requestPasswordReset, resetPassword } from '../controllers/auth';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimit';

const router = express.Router();

// Register new user
router.post('/register', authLimiter, validateRegistration, register);

// Login user
router.post('/login', authLimiter, validateLogin, login);

// Get current user
router.get('/me', auth, async (req: any, res) => {
  res.json(req.user);
});

router.post('/logout', logout);
router.post('/forgot-password', authLimiter, requestPasswordReset);
router.post('/reset-password', authLimiter, resetPassword);

export default router; 