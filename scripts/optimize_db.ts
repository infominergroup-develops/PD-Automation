import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not set in the environment variables.");
  process.exit(1);
}

async function run() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri as string);
  
  try {
    await client.connect();
    const db = client.db('InfominerGroup_db');
    console.log("Connected successfully to database");

    // 1. Audit Logs TTL Index (Delete after 90 days = 7776000 seconds)
    // Note: The field must be a Date object in MongoDB for this to work.
    console.log("Creating TTL index on auditLogs...");
    await db.collection("auditLogs").createIndex(
      { "timestamp": 1 },
      { expireAfterSeconds: 7776000 }
    );
    console.log("✅ Audit logs TTL index created (90 days)");

    // 2. Users Indexes
    console.log("Creating indexes on users...");
    await db.collection("users").createIndex({ "email": 1 }, { unique: true });
    await db.collection("users").createIndex({ "id": 1 }, { unique: true });
    console.log("✅ Users indexes created");

    // 3. Applicants Indexes
    console.log("Creating indexes on applicants...");
    await db.collection("applicants").createIndex({ "clientId": 1 });
    await db.collection("applicants").createIndex({ "id": 1 });
    console.log("✅ Applicants indexes created");

    // 4. Reports Indexes
    console.log("Creating indexes on PDReport...");
    await db.collection("PDReport").createIndex({ "applicantId": 1 });
    await db.collection("PDReport").createIndex({ "assignedCreditManager": 1 });
    console.log("✅ PDReports indexes created");

    console.log("All optimizations applied successfully!");
    
  } catch (error) {
    console.error("Error applying database optimizations:", error);
  } finally {
    await client.close();
    console.log("Database connection closed.");
  }
}

run().catch(console.error);
