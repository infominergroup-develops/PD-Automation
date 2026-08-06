import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://infominergroupdev_db_user:ah9lwaTpGOM3mKja@cluster0.ea2qhi2.mongodb.net/?appName=Cluster0";
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
