import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';

export const JWT_SECRET = process.env.JWT_SECRET || 'bhodt_cyber_ai_jwt_secret_2026_super_key';

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// 1. Require Authenticated User Middleware
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required. Please log in.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Check if user still exists and is active
    const user = await db.get('SELECT id, username, email, role, account_status FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    if (user.account_status !== 'active') {
      res.status(403).json({ error: `Account is ${user.account_status}. Please contact support.` });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// 2. Optional Auth (attaches req.user if token present, but doesn't block)
export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      const user = await db.get('SELECT id, username, email, role, account_status FROM users WHERE id = ?', [decoded.id]);
      if (user && user.account_status === 'active') {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        };
      }
    }
  } catch (e) {
    // Ignore invalid token on optional auth
  }
  next();
}

// 3. Require Admin Role Middleware
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
    return;
  }
  next();
}

// 4. Activity Logger Utility
export async function logActivity(userId: number | null, action: string, req: Request): Promise<void> {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    await db.execute(
      'INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [userId, action, String(ip).slice(0, 45), String(userAgent).slice(0, 250)]
    );
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// 5. Basic Rate Limiter (Defensive Security against Brute Force)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(limit = 15, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'global';
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
      return;
    }

    entry.count += 1;
    next();
  };
}
