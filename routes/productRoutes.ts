import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET all products dynamically from the database
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await db.query('SELECT * FROM products ORDER BY id ASC');
    const formatted = products.map((p: any) => ({
      ...p,
      price: Number(p.price),
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// GET single product
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    product.price = Number(product.price);
    if (typeof product.features === 'string') {
      product.features = JSON.parse(product.features);
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

export default router;
