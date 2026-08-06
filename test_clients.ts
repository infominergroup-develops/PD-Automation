import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://infominergroupdev_db_user:ah9lwaTpGOM3mKja@cluster0.ea2qhi2.mongodb.net/?appName=Cluster0";
async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('InfominerGroup_db');
  
  const newestClients = await db.collection('clients').find().sort({_id: -1}).limit(5).toArray();
  console.log("Newest Clients in DB:");
  newestClients.forEach(c => {
    console.log(`- ID: ${c._id}, name: ${c.name}, id (string): ${c.id}`);
  });
  
  await client.close();
}
run().catch(console.error);
