import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://infominergroupdev_db_user:ah9lwaTpGOM3mKja@cluster0.ea2qhi2.mongodb.net/?appName=Cluster0";
async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('InfominerGroup_db');
  
  // Sort by natural order descending to see the newest ones
  const newestApplicants = await db.collection('applicants').find().sort({_id: -1}).limit(5).toArray();
  console.log("Newest Applicants in DB:");
  newestApplicants.forEach(app => {
    console.log(`- ID: ${app._id}, Name: ${app.applicantName}, clientId: ${app.clientId} (${typeof app.clientId})`);
  });
  
  await client.close();
}
run().catch(console.error);
