import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
import { CLIENT_BANKS } from "../src/data/clientBanksData.js";

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("InfominerGroup_db");
    console.log("Connected to MongoDB.");
    
    console.log("Dropping existing clients collection...");
    try {
      await db.collection("clients").drop();
    } catch(e) {
      console.log("Collection clients doesn't exist or couldn't drop.");
    }
    
    console.log("Inserting new clients...");
    await db.collection("clients").insertMany(CLIENT_BANKS.map(c => ({...c, createdAt: new Date().toISOString()})));
    console.log("Successfully updated clients in DB!");
  } catch (err) {
    console.error("Error updating db", err);
  } finally {
    await client.close();
  }
}

run();
