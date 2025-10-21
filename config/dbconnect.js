const { Pool } = require('pg');

// Database configuration

// const USER = 'postgres';
// const PWD = 'Postgres@123';
// const DATABASE = 'cuspdev';
// const DB_HOST_NAME = '16.16.254.120';
const USER = 'postgres';
const PWD = 'Password123';
const DATABASE = 'nrlmdb';
const DB_HOST_NAME = '168.231.123.9';
const MAX_POOL_SIZE = 100;
//const MIN_POOL_SIZE = 50;

// Create a PostgreSQL connection pool
const PgConPool = new Pool({
    host: DB_HOST_NAME,
    port: 5432,
    user: USER,
    password: PWD,
    database: DATABASE,
    max: MAX_POOL_SIZE,
   // min: MIN_POOL_SIZE,
    min: 0,
    idleTimeoutMillis: 30000, // Optional: adjust the idle timeout
    connectionTimeoutMillis: 20000, // Adjust connection timeout
});
// Export the PostgreSQL connection pool
exports.PgConPool = PgConPool;
