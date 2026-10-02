// BHODT Dynamic Product Knowledge Service
// Single source of truth: Reads from products database and supports future REST API / SQL / Firebase backend

import { products } from '../data/products';
import { Product } from '../types/product';

/**
 * Retrieves the latest dynamic product knowledge.
 * Automatically discovers new products without requiring manual AI retraining.
 */
export async function getProductKnowledge(): Promise<Product[]> {
  try {
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    }
  } catch (error) {
    // Gracefully fallback to local products list
  }
  return products;
}

/**
 * Synchronous accessor for immediate local lookup
 */
export function getProductKnowledgeSync(): Product[] {
  return products;
}

/**
 * Searches and filters products dynamically
 */
export function searchProducts(query: string, catalog: Product[] = products): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return catalog;

  return catalog.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.features.some((f) => f.toLowerCase().includes(q))
  );
}
