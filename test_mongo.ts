import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://infominergroupdev_db_user:ah9lwaTpGOM3mKja@cluster0.ea2qhi2.mongodb.net/?appName=Cluster0";
async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('InfominerGroup_db');
  const clientsCount = await db.collection('clients').countDocuments();
  const applicantsCount = await db.collection('applicants').countDocuments();
  console.log(`Clients: ${clientsCount}, Applicants: ${applicantsCount}`);
  
  const sampleClient = await db.collection('clients').findOne();
  console.log("Sample client ID in db:", sampleClient?._id, "id field:", sampleClient?.id);
  
  if (sampleClient) {
    const applicants = await db.collection('applicants').find({ clientId: sampleClient.id }).toArray();
    console.log(`Applicants for client ${sampleClient.id}:`, applicants.length);
    
    // Test what if we query by clientId = string?
  }
  
  const sampleApplicant = await db.collection('applicants').findOne();
  console.log("Sample applicant clientId:", sampleApplicant?.clientId);
  
  await client.close();
}
run().catch(console.error);
