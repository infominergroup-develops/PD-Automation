import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const uri = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(uri as string);
  try {
    await client.connect();
    
    // Check all databases
    const adminDb = client.db('admin');
    const result = await adminDb.admin().listDatabases();
    
    console.log("Databases on cluster:");
    result.databases.forEach((dbInfo: any) => {
      const sizeMB = (dbInfo.sizeOnDisk / (1024 * 1024)).toFixed(2);
      console.log(`- ${dbInfo.name}: ${sizeMB} MB`);
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
