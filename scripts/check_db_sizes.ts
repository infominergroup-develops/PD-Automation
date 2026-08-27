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
    
    console.log("Checking collection sizes...");
    const collections = await db.collections();
    
    for (const coll of collections) {
      const stats = await db.command({ collStats: coll.collectionName });
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`${coll.collectionName}: ${stats.count} documents, ${sizeMB} MB`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
