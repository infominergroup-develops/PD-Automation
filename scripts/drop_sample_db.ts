import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const uri = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(uri as string);
  try {
    await client.connect();
    
    console.log("Dropping sample_mflix database to free up space...");
    const sampleDb = client.db('sample_mflix');
    await sampleDb.dropDatabase();
    console.log("Successfully dropped sample_mflix!");
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
