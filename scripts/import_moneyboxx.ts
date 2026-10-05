import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';

const uri = process.env.MONGODB_URI!;

async function importData() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('InfominerGroup_db');
    
    const data = JSON.parse(fs.readFileSync('./src/data/moneyboxx.json', 'utf8'));
    
    // Clean existing applicants for this client
    await db.collection('applicants').deleteMany({ clientId: 'moneyboxx' });
    console.log("Cleared existing moneyboxx applicants.");

    const toInsert = data.map(applicant => {
      const { _id, ...rest } = applicant;
      return {
        ...rest,
        _id: _id ? new ObjectId(_id) : new ObjectId()
      };
    });
    
    const result = await db.collection('applicants').insertMany(toInsert);
    console.log(`Successfully inserted ${result.insertedCount} applicants for MoneyBoxx!`);
  } catch (e) {
    console.error("Error importing data:", e);
  } finally {
    await client.close();
  }
}

importData();
