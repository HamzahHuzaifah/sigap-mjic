import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
export const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sigap_db',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

// Helper for queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}
