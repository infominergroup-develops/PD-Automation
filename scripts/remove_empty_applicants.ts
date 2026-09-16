import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const uri = process.env.MONGODB_URI;

async function run() {
  if (!uri) {
    console.error("No MONGODB_URI found in .env");
    process.exit(1);
  }
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('InfominerGroup_db'); // using the default DB as per cleanup_db.ts
    
    console.log("Looking for applicants with no name or 'Draft Applicant'...");
    
    const result = await db.collection('applicants').deleteMany({
      $or: [
        { applicantName: { $in: [null, "", "Draft Applicant"] } },
        { applicantEntity: { $in: [null, "", "Draft Applicant"] } },
        // if both are missing
        { applicantName: { $exists: false }, applicantEntity: { $exists: false } }
      ]
    });
    
    console.log(`Successfully deleted ${result.deletedCount} applicants with no name.`);
    
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
