import { MongoClient } from 'mongodb';
import { Firestore } from '@google-cloud/firestore';
import dotenv from "dotenv";

dotenv.config();

const db = new Firestore({
  projectId: 'vouchr-f4d9e',
  keyFilename: './firebase-service-account.json',
  preferRest: true
});

const mongoUri = process.env.MONGODB_URI;

async function migrateCollection(mongoDb: any, collectionName: string) {
  console.log(`Migrating collection: ${collectionName}...`);
  const mongoCol = mongoDb.collection(collectionName);
  
  console.log(`Downloading all documents for ${collectionName}... This might take a few minutes if data is large.`);
  const documents = await mongoCol.find({}).toArray();
  
  if (documents.length === 0) {
    console.log(`Collection ${collectionName} is empty. Skipping.`);
    return;
  }
  
  console.log(`Downloaded ${documents.length} documents for ${collectionName}. Starting upload to Firestore...`);

  let totalMigrated = 0;

  for (const docData of documents) {
    const id = docData._id.toString();
    delete docData._id;

    const docRef = db.collection(collectionName).doc(id);
    try {
      await docRef.set(docData);
      totalMigrated++;
      console.log(`Migrated doc: ${id}`);
    } catch (e) {
      console.error(`Failed to migrate doc ${id}:`, e);
    }
  }
  
  console.log(`Successfully migrated ${totalMigrated} documents to ${collectionName}.`);
}

async function runMigration() {
  if (!mongoUri) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const mongoDb = client.db("InfominerGroup_db");

    const collections = ['clients', 'applicants', 'categories', 'products', 'auditLogs', 'users'];

    for (const col of collections) {
      await migrateCollection(mongoDb, col);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
  }
}

runMigration();
