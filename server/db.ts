import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial Products Seed
import { products as initialProducts } from '../src/data/products';

let pool: mysql.Pool | null = null;
let useMysql = false;

// Fallback JSON-backed storage path for offline/development resilience
const DATA_DIR = path.resolve(__dirname, '../data');
const JSON_DB_FILE = path.join(DATA_DIR, 'bhodt_store.json');

interface LocalDbSchema {
  users: any[];
  products: any[];
  ai_conversations: any[];
  ai_messages: any[];
  favorites: any[];
  activity_logs: any[];
  notifications: any[];
  password_resets: any[];
}

let localDb: LocalDbSchema = {
  users: [],
  products: [],
  ai_conversations: [],
  ai_messages: [],
  favorites: [],
  activity_logs: [],
  notifications: [],
  password_resets: [],
};

// Initialize fallback database
function initLocalDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(JSON_DB_FILE)) {
    try {
      const data = fs.readFileSync(JSON_DB_FILE, 'utf8');
      localDb = JSON.parse(data);
    } catch (e) {
      console.warn('Could not parse local JSON db, re-initializing.');
    }
  }

  // Seed default admin if no users exist
  if (!localDb.users || localDb.users.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync('Admin@123456', salt);

    localDb.users = [
      {
        id: 1,
        full_name: 'BHODT Master Administrator',
        username: 'admin',
        email: 'admin@bhodt.dev',
        password_hash,
        profile_image: '/assets/avatar-default.png',
        role: 'admin',
        account_status: 'active',
        email_verified: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
      },
    ];
  }

  // Seed products if empty
  if (!localDb.products || localDb.products.length === 0) {
    localDb.products = initialProducts.map((p) => ({
      ...p,
      file_type: p.fileType || '.zip / Standalone App',
      last_updated: p.lastUpdated,
      created_at: new Date().toISOString(),
    }));
  }

  saveLocalDb();
}

function saveLocalDb() {
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local JSON db:', err);
  }
}

// Initialize MySQL pool or fallback
export async function initDatabase() {
  initLocalDb();

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'bhodt_db';

  if (host && user) {
    try {
      pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Test connection
      const conn = await pool.getConnection();
      console.log('✅ Connected to MySQL Database:', database);
      conn.release();
      useMysql = true;
    } catch (err: any) {
      console.warn('⚠️ MySQL connection failed, operating with resilient persistent store:', err.message);
      useMysql = false;
    }
  } else {
    console.log('ℹ️ No MySQL DB_HOST set. Operating with local high-performance store.');
    useMysql = false;
  }
}

// Database helper functions that support both MySQL and Fallback store transparently
export const db = {
  // Query multiple rows
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (useMysql && pool) {
      const [rows] = await pool.query(sql, params);
      return rows as T[];
    }
    return executeLocalQuery<T>(sql, params);
  },

  // Query single row
  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results && results.length > 0 ? results[0] : null;
  },

  // Execute insert/update/delete
  async execute(sql: string, params: any[] = []): Promise<{ insertId?: number; affectedRows: number }> {
    if (useMysql && pool) {
      const [result]: any = await pool.execute(sql, params);
      return { insertId: result.insertId, affectedRows: result.affectedRows };
    }
    return executeLocalMutation(sql, params);
  },

  // Direct access to localDb for dynamic services
  getLocalDb() {
    return localDb;
  },

  saveLocalDb() {
    saveLocalDb();
  },
};

// Internal Local Storage Query Processor
function executeLocalQuery<T>(sql: string, params: any[]): T[] {
  const normalized = sql.trim().toLowerCase();

  // 1. SELECT from users
  if (normalized.includes('from users') || normalized.includes('from `users`')) {
    let list = [...localDb.users];
    if (normalized.includes('where id = ?') || normalized.includes('where `id` = ?')) {
      const id = params[0];
      list = list.filter((u) => u.id === Number(id));
    } else if (normalized.includes('where email = ?') || normalized.includes('where `email` = ?')) {
      const email = params[0];
      list = list.filter((u) => u.email.toLowerCase() === String(email).toLowerCase());
    } else if (normalized.includes('where username = ?') || normalized.includes('where `username` = ?')) {
      const username = params[0];
      list = list.filter((u) => u.username.toLowerCase() === String(username).toLowerCase());
    } else if (normalized.includes('where email = ? or username = ?')) {
      const val = params[0];
      list = list.filter(
        (u) =>
          u.email.toLowerCase() === String(val).toLowerCase() ||
          u.username.toLowerCase() === String(val).toLowerCase()
      );
    }
    return list as T[];
  }

  // 2. SELECT from products
  if (normalized.includes('from products') || normalized.includes('from `products`')) {
    let list = [...localDb.products];
    if (normalized.includes('where id = ?')) {
      list = list.filter((p) => p.id === params[0]);
    } else if (normalized.includes('where status = ?')) {
      list = list.filter((p) => p.status === params[0]);
    }
    return list as T[];
  }

  // 3. SELECT from ai_conversations
  if (normalized.includes('from ai_conversations')) {
    let list = [...localDb.ai_conversations];
    if (normalized.includes('where user_id = ?')) {
      list = list.filter((c) => c.user_id === Number(params[0]));
    }
    if (normalized.includes('order by')) {
      list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    return list as T[];
  }

  // 4. SELECT from ai_messages
  if (normalized.includes('from ai_messages')) {
    let list = [...localDb.ai_messages];
    if (normalized.includes('where conversation_id = ?')) {
      list = list.filter((m) => m.conversation_id === Number(params[0]));
    }
    return list as T[];
  }

  // 5. SELECT from favorites
  if (normalized.includes('from favorites')) {
    let list = [...localDb.favorites];
    if (normalized.includes('where user_id = ?')) {
      list = list.filter((f) => f.user_id === Number(params[0]));
    }
    return list as T[];
  }

  // 6. SELECT from notifications
  if (normalized.includes('from notifications')) {
    let list = [...localDb.notifications];
    if (normalized.includes('where user_id = ?')) {
      list = list.filter((n) => n.user_id === Number(params[0]));
    }
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list as T[];
  }

  // 7. SELECT from password_resets
  if (normalized.includes('from password_resets')) {
    let list = [...localDb.password_resets];
    if (normalized.includes('where token = ?')) {
      list = list.filter((r) => r.token === params[0] && !r.used);
    }
    return list as T[];
  }

  // 8. SELECT from activity_logs
  if (normalized.includes('from activity_logs')) {
    let list = [...localDb.activity_logs];
    if (normalized.includes('where user_id = ?')) {
      list = list.filter((l) => l.user_id === Number(params[0]));
    }
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list.slice(0, 50) as T[];
  }

  return [] as T[];
}

function executeLocalMutation(sql: string, params: any[]): { insertId?: number; affectedRows: number } {
  const normalized = sql.trim().toLowerCase();

  // INSERT INTO users
  if (normalized.startsWith('insert into users') || normalized.startsWith('insert into `users`')) {
    const newId = (localDb.users.length ? Math.max(...localDb.users.map((u) => u.id)) : 0) + 1;
    const user = {
      id: newId,
      full_name: params[0],
      username: params[1],
      email: params[2],
      password_hash: params[3],
      profile_image: '/assets/avatar-default.png',
      role: params[4] || 'user',
      account_status: 'active',
      email_verified: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null,
    };
    localDb.users.push(user);
    saveLocalDb();
    return { insertId: newId, affectedRows: 1 };
  }

  // UPDATE users
  if (normalized.startsWith('update users') || normalized.startsWith('update `users`')) {
    if (normalized.includes('set last_login = now() where id = ?')) {
      const u = localDb.users.find((x) => x.id === Number(params[0]));
      if (u) {
        u.last_login = new Date().toISOString();
        saveLocalDb();
        return { affectedRows: 1 };
      }
    } else if (normalized.includes('set password_hash = ? where id = ?')) {
      const u = localDb.users.find((x) => x.id === Number(params[1]));
      if (u) {
        u.password_hash = params[0];
        u.updated_at = new Date().toISOString();
        saveLocalDb();
        return { affectedRows: 1 };
      }
    } else if (normalized.includes('set full_name = ?, email = ? where id = ?')) {
      const u = localDb.users.find((x) => x.id === Number(params[2]));
      if (u) {
        u.full_name = params[0];
        u.email = params[1];
        u.updated_at = new Date().toISOString();
        saveLocalDb();
        return { affectedRows: 1 };
      }
    } else if (normalized.includes('set role = ? where id = ?')) {
      const u = localDb.users.find((x) => x.id === Number(params[1]));
      if (u) {
        u.role = params[0];
        saveLocalDb();
        return { affectedRows: 1 };
      }
    } else if (normalized.includes('set account_status = ? where id = ?')) {
      const u = localDb.users.find((x) => x.id === Number(params[1]));
      if (u) {
        u.account_status = params[0];
        saveLocalDb();
        return { affectedRows: 1 };
      }
    }
  }

  // DELETE FROM users
  if (normalized.startsWith('delete from users')) {
    const id = Number(params[0]);
    const initLen = localDb.users.length;
    localDb.users = localDb.users.filter((u) => u.id !== id);
    saveLocalDb();
    return { affectedRows: initLen - localDb.users.length };
  }

  // INSERT INTO ai_conversations
  if (normalized.startsWith('insert into ai_conversations')) {
    const newId = (localDb.ai_conversations.length ? Math.max(...localDb.ai_conversations.map((c) => c.id)) : 0) + 1;
    const conv = {
      id: newId,
      user_id: Number(params[0]),
      title: params[1] || 'New AI Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localDb.ai_conversations.push(conv);
    saveLocalDb();
    return { insertId: newId, affectedRows: 1 };
  }

  // INSERT INTO ai_messages
  if (normalized.startsWith('insert into ai_messages')) {
    const newId = (localDb.ai_messages.length ? Math.max(...localDb.ai_messages.map((m) => m.id)) : 0) + 1;
    const msg = {
      id: newId,
      conversation_id: Number(params[0]),
      sender: params[1],
      message: params[2],
      created_at: new Date().toISOString(),
    };
    localDb.ai_messages.push(msg);

    // Update conversation updated_at
    const conv = localDb.ai_conversations.find((c) => c.id === msg.conversation_id);
    if (conv) conv.updated_at = new Date().toISOString();

    saveLocalDb();
    return { insertId: newId, affectedRows: 1 };
  }

  // DELETE FROM ai_conversations
  if (normalized.startsWith('delete from ai_conversations')) {
    const id = Number(params[0]);
    localDb.ai_conversations = localDb.ai_conversations.filter((c) => c.id !== id);
    localDb.ai_messages = localDb.ai_messages.filter((m) => m.conversation_id !== id);
    saveLocalDb();
    return { affectedRows: 1 };
  }

  // INSERT INTO favorites
  if (normalized.startsWith('insert into favorites')) {
    const user_id = Number(params[0]);
    const product_id = String(params[1]);
    const exists = localDb.favorites.some((f) => f.user_id === user_id && f.product_id === product_id);
    if (!exists) {
      const newId = (localDb.favorites.length ? Math.max(...localDb.favorites.map((f) => f.id)) : 0) + 1;
      localDb.favorites.push({
        id: newId,
        user_id,
        product_id,
        created_at: new Date().toISOString(),
      });
      saveLocalDb();
      return { insertId: newId, affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // DELETE FROM favorites
  if (normalized.startsWith('delete from favorites')) {
    const user_id = Number(params[0]);
    const product_id = String(params[1]);
    const lenBefore = localDb.favorites.length;
    localDb.favorites = localDb.favorites.filter((f) => !(f.user_id === user_id && f.product_id === product_id));
    saveLocalDb();
    return { affectedRows: lenBefore - localDb.favorites.length };
  }

  // INSERT INTO activity_logs
  if (normalized.startsWith('insert into activity_logs')) {
    const newId = (localDb.activity_logs.length ? Math.max(...localDb.activity_logs.map((a) => a.id)) : 0) + 1;
    localDb.activity_logs.push({
      id: newId,
      user_id: params[0] ? Number(params[0]) : null,
      action: params[1],
      ip_address: params[2] || '127.0.0.1',
      user_agent: params[3] || 'Browser',
      created_at: new Date().toISOString(),
    });
    saveLocalDb();
    return { insertId: newId, affectedRows: 1 };
  }

  // INSERT INTO notifications
  if (normalized.startsWith('insert into notifications')) {
    const newId = (localDb.notifications.length ? Math.max(...localDb.notifications.map((n) => n.id)) : 0) + 1;
    localDb.notifications.push({
      id: newId,
      user_id: Number(params[0]),
      title: params[1],
      message: params[2],
      is_read: 0,
      created_at: new Date().toISOString(),
    });
    saveLocalDb();
    return { insertId: newId, affectedRows: 1 };
  }

  // INSERT / UPDATE products (Admin)
  if (normalized.startsWith('insert into products')) {
    const newProd = {
      id: params[0],
      name: params[1],
      image: params[2],
      description: params[3],
      category: params[4],
      price: Number(params[5]),
      currency: params[6] || 'LKR',
      version: params[7],
      platform: params[8],
      status: params[9] || 'AVAILABLE',
      features: typeof params[10] === 'string' ? JSON.parse(params[10]) : params[10],
      requirements: params[11],
      license: params[12],
      file_type: params[13] || '.zip',
      support_info: 'WhatsApp: 0724332896 / Telegram: @blackhatmrx',
      last_updated: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    localDb.products = localDb.products.filter((p) => p.id !== newProd.id);
    localDb.products.push(newProd);
    saveLocalDb();
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('update products')) {
    const id = params[params.length - 1];
    const prod = localDb.products.find((p) => p.id === id);
    if (prod) {
      prod.name = params[0];
      prod.description = params[1];
      prod.category = params[2];
      prod.price = Number(params[3]);
      prod.version = params[4];
      prod.status = params[5];
      prod.requirements = params[6];
      prod.license = params[7];
      if (params[8]) {
        prod.features = typeof params[8] === 'string' ? JSON.parse(params[8]) : params[8];
      }
      prod.last_updated = new Date().toISOString().split('T')[0];
      saveLocalDb();
      return { affectedRows: 1 };
    }
  }

  if (normalized.startsWith('delete from products')) {
    const id = params[0];
    const len = localDb.products.length;
    localDb.products = localDb.products.filter((p) => p.id !== id);
    saveLocalDb();
    return { affectedRows: len - localDb.products.length };
  }

  // INSERT INTO password_resets
  if (normalized.startsWith('insert into password_resets')) {
    localDb.password_resets.push({
      email: params[0],
      token: params[1],
      expires_at: params[2],
      used: false,
      created_at: new Date().toISOString(),
    });
    saveLocalDb();
    return { affectedRows: 1 };
  }

  // UPDATE password_resets
  if (normalized.startsWith('update password_resets set used = true')) {
    const token = params[0];
    const r = localDb.password_resets.find((x) => x.token === token);
    if (r) {
      r.used = true;
      saveLocalDb();
      return { affectedRows: 1 };
    }
  }

  return { affectedRows: 1 };
}
