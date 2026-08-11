const { MongoClient } = require('mongodb');
const MONGODB_URI="mongodb+srv://infominergroupdev_db_user:ah9lwaTpGOM3mKja@cluster0.ea2qhi2.mongodb.net/?appName=Cluster0";

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("InfominerGroup_db");
    const count = await db.collection("categories").countDocuments();
    console.log("Current categories count:", count);
    
    // We can fetch INITIAL_CATEGORIES from the TS file if we compile it, 
    // but easier to just use the UI's store, or we can drop and let the server seed it.
    if (count > 0 && count < 10) {
       console.log("Looks like only a few categories exist. Deleting to let server re-seed...");
       await db.collection("categories").deleteMany({});
       console.log("Categories cleared. The server will re-seed on next request.");
    }
  } finally {
    await client.close();
  }
}
run().catch(console.error);
