import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db';
import { config } from '../config/env';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { User } from '../types';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check existing email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES (?, ?, ?, 'customer', ?)
    `);

    const result = stmt.run(name.trim(), email.toLowerCase().trim(), passwordHash, phone || null);
    const userId = result.lastInsertRowid as number;

    const user: User = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'customer',
      phone: phone || ''
    };

    const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const rawUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!rawUser) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, rawUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user: User = {
      id: rawUser.id,
      name: rawUser.name,
      email: rawUser.email,
      role: rawUser.role,
      phone: rawUser.phone || '',
      created_at: rawUser.created_at
    };

    const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error during login' });
  }
});

// Get Current User Profile
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Update Profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    db.prepare(`
      UPDATE users
      SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name.trim(), phone || null, req.user!.id);

    const updatedUser = db.prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?').get(req.user!.id) as User;

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

// Change Password
router.put('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const rawUser = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as any;
    const isMatch = await bcrypt.compare(currentPassword, rawUser.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, req.user!.id);

    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to change password' });
  }
});

export default router;
