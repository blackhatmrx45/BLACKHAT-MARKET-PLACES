import { Router, Response } from 'express';
import { db } from '../db';
import { requireAuth, requireAdmin, logActivity, AuthRequest } from '../middleware/auth';

const router = Router();

// Enforce both Authentication and Admin role
router.use(requireAuth);
router.use(requireAdmin);

// 1. Get Platform Statistics
router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await db.query('SELECT id, role, account_status, created_at FROM users');
    const conversations = await db.query('SELECT id, created_at FROM ai_conversations');
    const messages = await db.query('SELECT id FROM ai_messages');
    const products = await db.query('SELECT id, status, price FROM products');

    const totalRevenueEst = products.reduce((acc: number, p: any) => acc + (Number(p.price) || 0), 0);

    res.json({
      stats: {
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.account_status === 'active').length,
        adminCount: users.filter((u: any) => u.role === 'admin').length,
        totalConversations: conversations.length,
        totalMessages: messages.length,
        totalProducts: products.length,
        availableProducts: products.filter((p: any) => p.status === 'AVAILABLE').length,
        totalCatalogValue: totalRevenueEst,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// 2. Get Users List with Search & Filtering
router.get('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = String(req.query.search || '').toLowerCase();
    let users = await db.query(
      'SELECT id, full_name, username, email, role, account_status, email_verified, created_at, last_login FROM users'
    );

    if (search) {
      users = users.filter(
        (u: any) =>
          u.username.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.full_name.toLowerCase().includes(search)
      );
    }

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// 3. Update User Role
router.put('/users/:id/role', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Role must be user or admin' });
      return;
    }

    // Prevent modifying own super-admin role to lock oneself out
    if (userId === req.user!.id && role !== 'admin') {
      res.status(400).json({ error: 'Cannot revoke your own administrator privileges.' });
      return;
    }

    await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    await logActivity(req.user!.id, `Changed role of user #${userId} to ${role}`, req);

    res.json({ message: `User role successfully updated to ${role}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// 4. Update User Account Status (Activate, Deactivate, Suspend)
router.put('/users/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    if (userId === req.user!.id && status !== 'active') {
      res.status(400).json({ error: 'Cannot deactivate your own account.' });
      return;
    }

    await db.execute('UPDATE users SET account_status = ? WHERE id = ?', [status, userId]);
    await logActivity(req.user!.id, `Changed status of user #${userId} to ${status}`, req);

    res.json({ message: `User account status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// 5. Delete User
router.delete('/users/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);

    if (userId === req.user!.id) {
      res.status(400).json({ error: 'Cannot delete your own admin account.' });
      return;
    }

    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    await logActivity(req.user!.id, `Deleted user account #${userId}`, req);

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 6. View All Recent AI Conversations across the platform
router.get('/conversations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const convs = await db.query('SELECT * FROM ai_conversations ORDER BY updated_at DESC LIMIT 50');
    const users = await db.query('SELECT id, username, email FROM users');
    const messages = await db.query('SELECT * FROM ai_messages');

    const enriched = convs.map((c: any) => {
      const user = users.find((u: any) => u.id === c.user_id);
      const msgCount = messages.filter((m: any) => m.conversation_id === c.id).length;
      return {
        ...c,
        username: user?.username || 'Unknown',
        email: user?.email || 'N/A',
        messageCount: msgCount,
      };
    });

    res.json({ conversations: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// 7. Add New Tool / Product
router.post('/products', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      id,
      name,
      image,
      description,
      category,
      price,
      currency = 'LKR',
      version,
      platform,
      status = 'AVAILABLE',
      features,
      requirements,
      license,
      file_type = '.zip',
    } = req.body;

    if (!id || !name || !description || !category || !price) {
      res.status(400).json({ error: 'Missing required product fields.' });
      return;
    }

    const featuresJson = typeof features === 'string' ? features : JSON.stringify(features || []);

    await db.execute(
      `INSERT INTO products (id, name, image, description, category, price, currency, version, platform, status, features, requirements, license, file_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id.trim(),
        name.trim(),
        image || '/src/assets/images/bhodt_web_toolkit_1790926906209.jpg',
        description.trim(),
        category.trim(),
        Number(price),
        currency,
        version || '1.0.0',
        platform || 'Cross-Platform',
        status,
        featuresJson,
        requirements || 'Standard modern OS',
        license || 'Commercial License',
        file_type,
      ]
    );

    await logActivity(req.user!.id, `Created new product: ${name} (${id})`, req);

    res.status(201).json({ message: 'Product successfully added to the BHODT marketplace & AI knowledge!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add product' });
  }
});

// 8. Edit Tool / Product
router.put('/products/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, category, price, version, status, requirements, license, features } = req.body;

    const featuresJson = features ? (typeof features === 'string' ? features : JSON.stringify(features)) : undefined;

    await db.execute(
      `UPDATE products SET name = ?, description = ?, category = ?, price = ?, version = ?, status = ?, requirements = ?, license = ?, features = ?
       WHERE id = ?`,
      [name, description, category, Number(price), version, status, requirements, license, featuresJson, id]
    );

    await logActivity(req.user!.id, `Updated product: ${name} (${id})`, req);

    res.json({ message: 'Product updated successfully. AI assistant now reflects updated knowledge!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// 9. Delete Tool / Product
router.delete('/products/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    await logActivity(req.user!.id, `Deleted product ${id}`, req);

    res.json({ message: 'Product removed from marketplace and AI knowledge base.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
