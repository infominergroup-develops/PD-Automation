import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const uri = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(uri as string);
  try {
    await client.connect();
    const db = client.db('InfominerGroup_db');
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // We will delete logs older than 30 days to free up space
    // Sometimes Atlas blocks even deletes if it's over quota, but let's try.
    // If this fails, we may need to drop the collection entirely.
    console.log("Attempting to delete auditLogs older than 30 days to free space...");
    
    // If the timestamps are strings in ISO format, string comparison works
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
    
    const result = await db.collection('auditLogs').deleteMany({
      timestamp: { $lt: thirtyDaysAgoStr }
    });
    
    console.log(`Deleted ${result.deletedCount} old audit logs.`);
    
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
