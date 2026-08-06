import fs from 'fs';
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://infominergroupdev_db_user:ah9lwaTpGOM3mKja@cluster0.ea2qhi2.mongodb.net/?appName=Cluster0";

function generateDummyData(applicant: any, index: number) {
  const pan = `ABCDE${1000 + index}F`;
  const aadhaar = `1234 5678 ${1000 + index}`;
  const cibil = 700 + Math.floor(Math.random() * 100);
  const amount = (Math.floor(Math.random() * 5) + 1) * 100000;
  const tenure = 12 + Math.floor(Math.random() * 3) * 12; // 12, 24, 36, 48
  const interest = 12 + Math.floor(Math.random() * 6);
  
  return {
    ...applicant,
    appliedAmount: applicant.appliedAmount || amount,
    tenureMonths: applicant.tenureMonths || tenure,
    interestRatePct: applicant.interestRatePct || interest,
    panNumber: applicant.panNumber || pan,
    aadhaarNumber: applicant.aadhaarNumber || aadhaar,
    cibilScore: applicant.cibilScore || cibil,
    statedMonthlySales: applicant.statedMonthlySales || (amount / 2),
    inventoryValue: applicant.inventoryValue || (amount * 0.8),
    dailyFootfall: applicant.dailyFootfall || 20 + Math.floor(Math.random() * 30),
    avgTicketValue: applicant.avgTicketValue || 200 + Math.floor(Math.random() * 300),
    transportExpense: applicant.transportExpense || 2000,
    miscExpense: applicant.miscExpense || 1000,
    otherIncome: applicant.otherIncome || 0,
    cogsMarginPct: applicant.cogsMarginPct || 70,
  };
}

async function run() {
  const filePath = './src/data/moneyboxx.json';
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const filledData = data.map((app: any, i: number) => generateDummyData(app, i));
  
  fs.writeFileSync(filePath, JSON.stringify(filledData, null, 2));
  console.log("Updated moneyboxx.json with dummy data for null fields.");
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('InfominerGroup_db');
    
    for (const app of filledData) {
      const { _id, ...rest } = app;
      await db.collection('applicants').updateOne(
        { applicationNumber: app.applicationNumber },
        { $set: rest },
        { upsert: true }
      );
    }
    console.log("Uploaded updated data to MongoDB.");
  } finally {
    await client.close();
  }
}

run().catch(console.error);
