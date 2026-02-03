import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST || "210.246.215.19",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "punchmade",
  password: process.env.DB_PASSWORD || "PunchMade@123!",
  database: process.env.DB_NAME || "punchvv",
};

let pool: mysql.Pool | null = null;

/**
 * Get a connection pool for MySQL. Reused across SSR requests.
 * For production, set DB_* in environment and avoid default credentials.
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * Execute a query on the server (SSR). Use in Server Components or Route Handlers.
 */
export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params?: unknown[]
): Promise<T> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

/**
 * Run multiple queries in a transaction. On error, rolls back and rethrows.
 */
export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
