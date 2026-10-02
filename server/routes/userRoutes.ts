import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { requireAuth, logActivity, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require user authentication
router.use(requireAuth);

// 1. Get User Profile
router.get('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await db.get(
      'SELECT id, full_name, username, email, profile_image, role, account_status, email_verified, created_at, last_login FROM users WHERE id = ?',
      [req.user!.id]
    );
    res.json({ profile: user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// 2. Update User Profile
router.put('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { full_name, email } = req.body;
    if (!full_name || !email) {
      res.status(400).json({ error: 'Full name and email are required.' });
      return;
    }

    // Check if new email is taken by someone else
    const existing = await db.get(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email.toLowerCase().trim(), req.user!.id]
    );

    if (existing) {
      res.status(400).json({ error: 'This email is already in use by another account.' });
      return;
    }

    await db.execute(
      'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
      [full_name.trim(), email.toLowerCase().trim(), req.user!.id]
    );

    await logActivity(req.user!.id, 'Updated profile details', req);

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 3. Update User Password
router.put('/password', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password) {
      res.status(400).json({ error: 'Current and new password are required.' });
      return;
    }

    if (new_password !== confirm_password) {
      res.status(400).json({ error: 'New passwords do not match.' });
      return;
    }

    if (new_password.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }

    // Verify current password
    const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.user!.id]);
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ error: 'Incorrect current password.' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user!.id]);
    await logActivity(req.user!.id, 'Changed account password', req);

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// 4. Get User AI Conversations
router.get('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await db.query(
      'SELECT id, title, created_at, updated_at FROM ai_conversations WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user!.id]
    );
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// 5. Get Single Conversation with Messages
router.get('/conversations/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const convId = Number(req.params.id);
    const conv = await db.get(
      'SELECT id, title, created_at, updated_at FROM ai_conversations WHERE id = ? AND user_id = ?',
      [convId, req.user!.id]
    );

    if (!conv) {
      res.status(404).json({ error: 'Conversation not found.' });
      return;
    }

    const messages = await db.query(
      'SELECT id, sender, message, created_at FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [convId]
    );

    res.json({ conversation: conv, messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load conversation messages' });
  }
});

// 6. Delete AI Conversation
router.delete('/conversations/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const convId = Number(req.params.id);
    await db.execute('DELETE FROM ai_conversations WHERE id = ?', [convId]);
    await logActivity(req.user!.id, `Deleted conversation #${convId}`, req);
    res.json({ message: 'Conversation deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// 7. Get User Favorite Tools
router.get('/favorites', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favs = await db.query('SELECT product_id, created_at FROM favorites WHERE user_id = ?', [req.user!.id]);
    const allProducts = await db.query('SELECT * FROM products');
    
    // Join product details
    const favoriteProducts = favs
      .map((f: any) => allProducts.find((p: any) => p.id === f.product_id))
      .filter(Boolean);

    res.json({ favorites: favoriteProducts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// 8. Add Favorite Tool
router.post('/favorites', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      res.status(400).json({ error: 'Product ID is required.' });
      return;
    }

    await db.execute('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [req.user!.id, product_id]);
    await logActivity(req.user!.id, `Added product ${product_id} to favorites`, req);
    res.json({ message: 'Added to favorites.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// 9. Remove Favorite Tool
router.delete('/favorites/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    await db.execute('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [req.user!.id, productId]);
    res.json({ message: 'Removed from favorites.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// 10. Get User Notifications
router.get('/notifications', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await db.query(
      'SELECT id, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user!.id]
    );
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// 11. Mark Notification as Read
router.put('/notifications/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifId = Number(req.params.id);
    const notifs = db.getLocalDb().notifications;
    const n = notifs.find((x) => x.id === notifId && x.user_id === req.user!.id);
    if (n) {
      n.is_read = 1;
      db.saveLocalDb();
    }
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// 12. Get User Activity Logs
router.get('/activity-logs', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await db.query(
      'SELECT id, action, ip_address, user_agent, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC',
      [req.user!.id]
    );
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

export default router;
