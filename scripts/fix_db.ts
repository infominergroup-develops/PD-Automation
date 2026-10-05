import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('InfominerGroup_db');
    
    // Update the MoneyBoxx client to have id 'moneyboxx'
    const result = await db.collection('clients').updateOne(
      { name: 'MoneyBoxx' }, 
      { $set: { id: 'moneyboxx' } }
    );
    console.log(`Updated client MoneyBoxx id to 'moneyboxx': matched ${result.matchedCount}, modified ${result.modifiedCount}`);
    
  } finally {
    await client.close();
  }
}
run().catch(console.error);
