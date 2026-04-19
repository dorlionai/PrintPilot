import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('printpilot.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      customer_id INTEGER,
      printer_id INTEGER,
      filament_weight REAL,
      print_time REAL,
      cost_price REAL,
      sale_price REAL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      notes TEXT,
      last_seen TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS printers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      model TEXT,
      electricity_per_hour REAL DEFAULT 0.5,
      depreciation_per_hour REAL DEFAULT 1.0,
      total_hours REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT,
      material TEXT DEFAULT 'PLA',
      weight_total REAL DEFAULT 1000,
      weight_used REAL DEFAULT 0,
      cost_per_kg REAL,
      purchase_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

// Orders
export const getOrders = () => db.getAllSync('SELECT * FROM orders ORDER BY created_at DESC');
export const addOrder = (order: any) => db.runSync(
  'INSERT INTO orders (customer_name, customer_id, printer_id, filament_weight, print_time, cost_price, sale_price, notes) VALUES (?,?,?,?,?,?,?,?)',
  [order.customer_name, order.customer_id, order.printer_id, order.filament_weight, order.print_time, order.cost_price, order.sale_price, order.notes]
);
export const deleteOrder = (id: number) => db.runSync('DELETE FROM orders WHERE id=?', [id]);

// Customers
export const getCustomers = () => db.getAllSync('SELECT * FROM customers ORDER BY name ASC');
export const addCustomer = (c: any) => db.runSync('INSERT INTO customers (name, phone, email, address, notes) VALUES (?,?,?,?,?)', [c.name, c.phone, c.email, c.address, c.notes]);
export const deleteCustomer = (id: number) => db.runSync('DELETE FROM customers WHERE id=?', [id]);
export const updateCustomerLastSeen = (id: number) => db.runSync("UPDATE customers SET last_seen=datetime('now') WHERE id=?", [id]);

// Printers
export const getPrinters = () => db.getAllSync('SELECT * FROM printers ORDER BY name ASC');
export const addPrinter = (p: any) => db.runSync('INSERT INTO printers (name, model, electricity_per_hour, depreciation_per_hour) VALUES (?,?,?,?)', [p.name, p.model, p.electricity_per_hour, p.depreciation_per_hour]);
export const deletePrinter = (id: number) => db.runSync('DELETE FROM printers WHERE id=?', [id]);

// Stock
export const getStock = () => db.getAllSync('SELECT * FROM stock ORDER BY name ASC');
export const addStock = (s: any) => db.runSync('INSERT INTO stock (name, color, material, weight_total, cost_per_kg) VALUES (?,?,?,?,?)', [s.name, s.color, s.material, s.weight_total, s.cost_per_kg]);
export const deleteStock = (id: number) => db.runSync('DELETE FROM stock WHERE id=?', [id]);

// Settings
export const getSetting = (key: string) => { const r = db.getFirstSync('SELECT value FROM settings WHERE key=?', [key]) as any; return r?.value; };
export const setSetting = (key: string, value: string) => db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)', [key, value]);

export default db;