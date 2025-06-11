import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import nodemailer from 'nodemailer';

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
  };
}

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { _id: (user as any)._id.toString() },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Invalid registration data' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid login credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid login credentials' });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { _id: (user as any)._id.toString() },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Invalid login data' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real application, you might want to invalidate the token
    // For now, we'll just send a success response
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging out' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that the email doesn't exist
      res.json({ message: 'If your email is registered, you will receive a password reset link' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    res.status(500).json({ error: 'Error processing password reset request' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Update password
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error resetting password' });
  }
}; 