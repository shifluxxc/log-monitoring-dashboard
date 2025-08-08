import { pool } from './database.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Check if database is ready
    let retries = 0;
    const maxRetries = 10;
    
    while (retries < maxRetries) {
      try {
        await pool.query('SELECT 1');
        console.log('Database connection established');
        break;
      } catch (error) {
        retries++;
        console.log(`Database connection attempt ${retries}/${maxRetries} failed, retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (retries >= maxRetries) {
      throw new Error('Failed to connect to database after multiple attempts');
    }
    
    // Check if tables already exist (to avoid re-running schema)
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('Database schema already exists, skipping initialization');
      return;
    }
    
    // Read and execute schema
    const schemaPath = join(__dirname, '..', '..', 'src', 'config', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
} 