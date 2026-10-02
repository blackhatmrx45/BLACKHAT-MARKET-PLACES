import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db';
import { JWT_SECRET, requireAuth, logActivity, rateLimiter, AuthRequest } from '../middleware/auth';

const router = Router();

// 1. User Registration
router.post('/register', rateLimiter(10, 60000), async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name, username, email, password, confirm_password, terms } = req.body;

    // Validation
    if (!full_name || !username || !email || !password) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    if (!terms) {
      res.status(400).json({ error: 'You must agree to the Terms & Conditions.' });
      return;
    }

    if (password !== confirm_password) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    // Username format check
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      res.status(400).json({ error: 'Username must be 3-30 characters (letters, numbers, underscores, hyphens).' });
      return;
    }

    // Check if email or username already taken
    const existingUser = await db.get(
      'SELECT id, username, email FROM users WHERE email = ? OR username = ?',
      [email.toLowerCase(), username.toLowerCase()]
    );

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        res.status(400).json({ error: 'Email is already registered. Please login.' });
        return;
      }
      res.status(400).json({ error: 'Username is already taken. Please choose another.' });
      return;
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user into database
    const result = await db.execute(
      'INSERT INTO users (full_name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [full_name.trim(), username.toLowerCase().trim(), email.toLowerCase().trim(), password_hash, 'user']
    );

    const newUserId = result.insertId;

    // Create welcome notification
    if (newUserId) {
      await db.execute(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          newUserId,
          'Welcome to BHODT!',
          'Your account has been successfully created. Explore our tools and chat with BHODT AI 24/7.'
        ]
      );

      await logActivity(newUserId, 'User registered account', req);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: newUserId, username, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUserId,
        full_name,
        username,
        email,
        role: 'user',
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// 2. User Login
router.post('/login', rateLimiter(15, 60000), async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password, remember_me } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Email/Username and password are required.' });
      return;
    }

    // Query user by email or username
    const user = await db.get(
      'SELECT id, full_name, username, email, password_hash, role, account_status FROM users WHERE email = ? OR username = ?',
      [identifier.toLowerCase().trim(), identifier.toLowerCase().trim()]
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid email/username or password.' });
      return;
    }

    if (user.account_status !== 'active') {
      res.status(403).json({ error: `Account is ${user.account_status}. Please contact BHODT administrator.` });
      return;
    }

    // Verify bcrypt password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await logActivity(user.id, 'Failed login attempt', req);
      res.status(401).json({ error: 'Invalid email/username or password.' });
      return;
    }

    // Update last_login
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    await logActivity(user.id, 'User logged in', req);

    // Generate JWT token
    const expiresIn = remember_me ? '30d' : '7d';
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn }
    );

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: (remember_me ? 30 : 7) * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 3. User Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully.' });
});

// 4. Current User Session Check (GET /api/auth/me)
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await db.get(
      'SELECT id, full_name, username, email, profile_image, role, account_status, email_verified, created_at, last_login FROM users WHERE id = ?',
      [req.user!.id]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user profile.' });
  }
});

// 5. Forgot Password Request
router.post('/forgot-password', rateLimiter(5, 60000), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    const user = await db.get('SELECT id, email, username FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    
    // Always respond with success to prevent user enumeration
    if (!user) {
      res.json({ message: 'If that email exists in our system, a password reset link has been created.' });
      return;
    }

    // Generate random secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await db.execute(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
      [user.email, token, expiresAt]
    );

    await logActivity(user.id, 'Password reset requested', req);

    res.json({
      message: 'If that email exists in our system, a password reset link has been created.',
      resetToken: token, // Provided for direct UI flow / development demo
      resetUrl: `/reset-password.html?token=${token}`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error processing password reset.' });
  }
});

// 6. Reset Password Confirmation
router.post('/reset-password', rateLimiter(5, 60000), async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, new_password, confirm_password } = req.body;

    if (!token || !new_password) {
      res.status(400).json({ error: 'Token and new password are required.' });
      return;
    }

    if (new_password !== confirm_password) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (new_password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    // Check token
    const resetEntry = await db.get(
      'SELECT id, email, token, expires_at, used FROM password_resets WHERE token = ?',
      [token]
    );

    if (!resetEntry || resetEntry.used || new Date(resetEntry.expires_at).getTime() < Date.now()) {
      res.status(400).json({ error: 'Password reset link is invalid or has expired.' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    // Update user password
    const user = await db.get('SELECT id FROM users WHERE email = ?', [resetEntry.email]);
    if (user) {
      await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, user.id]);
      await db.execute('UPDATE password_resets SET used = TRUE WHERE token = ?', [token]);
      await logActivity(user.id, 'Password was reset successfully', req);
    }

    res.json({ message: 'Password has been reset successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Error resetting password.' });
  }
});

export default router;
