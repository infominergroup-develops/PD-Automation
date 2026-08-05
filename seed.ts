import { MongoClient } from 'mongodb';
import { CLIENT_BANKS } from './src/data/clientBanksData';

const uri = "mongodb+srv://infominergroupdev_db_user:ah9lwaTpGOM3mKja@cluster0.ea2qhi2.mongodb.net/?appName=Cluster0";

async function seedDatabase() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('InfominerGroup_db');
    
    console.log("Connected! Clearing existing clients and applicants...");
    await db.collection('clients').deleteMany({});
    await db.collection('applicants').deleteMany({});
    
    console.log("Inserting default clients...");
    const clientResult = await db.collection('clients').insertMany(CLIENT_BANKS);
    console.log(`Successfully inserted ${clientResult.insertedCount} clients into the database!`);
    
    console.log("Generating dummy applicants for each client...");
    const applicants = [];
    
    for (const bank of CLIENT_BANKS) {
      // Add Applicant 1 (Kirana Store)
      applicants.push({
        clientId: bank.id,
        applicationNumber: `INF/2026/${Math.floor(Math.random() * 90000) + 10000}`,
        applicantName: `Ramesh Kumar (${bank.shortCode})`,
        categoryId: "kirana",
        product: bank.defaultScheme,
        appliedAmount: Math.floor(Math.random() * 500000) + 100000,
        tenureMonths: 24,
        purpose: "Shop Inventory Expansion",
        status: "APPROVED",
        firmName: `${bank.shortCode} Kirana Store`,
        mobileNumber: "9876543210",
        panNumber: "ABCDE1234F",
        aadhaarNumber: "1234 5678 9012",
        residenceAddress: "123 Market Road, City Center",
        residenceOwnership: "Owned",
        cibilScore: 750,
        dependentsCount: 4,
        constitution: "Proprietorship",
        yearsInBusiness: 5,
        shopOwnership: "Rented",
        monthlyRent: 15000,
        shopAreaSqFt: 250,
        inventoryValue: 300000,
        dailyFootfall: 45,
        avgTicketValue: 200,
        workingDays: 26,
        neighborFeedback: "Good reputation, regular shop hours.",
        landlordFeedback: "Pays rent on time.",
        interestRatePct: 24,
        statedMonthlySales: 250000,
        cogsMarginPct: 75,
        salariesExpense: 20000,
        utilitiesExpense: 5000,
        transportExpense: 3000,
        miscExpense: 2000,
        otherIncome: 0,
        householdExpenses: 25000,
        existingEmis: 5000,
        photos: [
          {
            id: "photo-1",
            url: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop",
            caption: "Business Signboard & Premises",
            timestamp: new Date().toISOString(),
            gpsCoordinates: { latitude: 26.9124, longitude: 75.7873 },
            categoryTag: "Field Proof"
          }
        ],
        createdAt: new Date().toISOString()
      });
      
      // Add Applicant 2 (Pharmacy)
      applicants.push({
        clientId: bank.id,
        applicationNumber: `INF/2026/${Math.floor(Math.random() * 90000) + 10000}`,
        applicantName: `Priya Sharma (${bank.shortCode})`,
        categoryId: "pharmacy",
        product: bank.defaultScheme,
        appliedAmount: Math.floor(Math.random() * 1000000) + 200000,
        tenureMonths: 36,
        purpose: "Working Capital & Setup",
        status: "IN_REVIEW",
        firmName: `${bank.shortCode} Medical Agency`,
        mobileNumber: "9123456789",
        panNumber: "XYZPQ9876S",
        aadhaarNumber: "9876 5432 1098",
        residenceAddress: "45 Health Avenue, Uptown",
        residenceOwnership: "Rented",
        cibilScore: 780,
        dependentsCount: 2,
        constitution: "Partnership",
        yearsInBusiness: 8,
        shopOwnership: "Owned",
        monthlyRent: 0,
        shopAreaSqFt: 400,
        inventoryValue: 800000,
        dailyFootfall: 120,
        avgTicketValue: 150,
        workingDays: 30,
        neighborFeedback: "Busy pharmacy, reliable.",
        landlordFeedback: "N/A - Owned Property",
        interestRatePct: 22,
        statedMonthlySales: 550000,
        cogsMarginPct: 80,
        salariesExpense: 40000,
        utilitiesExpense: 8000,
        transportExpense: 2000,
        miscExpense: 3000,
        otherIncome: 15000,
        householdExpenses: 35000,
        existingEmis: 12000,
        photos: [
          {
            id: "photo-2",
            url: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&auto=format&fit=crop",
            caption: "Pharmacy Stock & Shelves",
            timestamp: new Date().toISOString(),
            gpsCoordinates: { latitude: 26.9220, longitude: 75.7980 },
            categoryTag: "Field Proof"
          }
        ],
        createdAt: new Date().toISOString()
      });
    }
    
    const appResult = await db.collection('applicants').insertMany(applicants);
    console.log(`Successfully inserted ${appResult.insertedCount} dummy applicants!`);

    console.log("Inserting default users...");
    await db.collection('users').deleteMany({});
    const defaultUsers = [
      {
        id: "EMP-1001",
        name: "Admin User",
        email: "admin@infominers.com",
        password: "password123",
        role: "ADMIN",
        designation: "System Administrator",
        agency: "Infominers Group",
        createdAt: new Date().toISOString(),
        status: "ACTIVE"
      },
      {
        id: "EMP-1002",
        name: "Manager User",
        email: "manager@infominers.com",
        password: "password123",
        role: "MANAGER",
        designation: "Credit Manager",
        agency: "Infominers Group",
        createdAt: new Date().toISOString(),
        status: "ACTIVE"
      },
      {
        id: "EMP-1003",
        name: "Employee User",
        email: "employee@infominers.com",
        password: "password123",
        role: "EMPLOYEE",
        designation: "Field Officer",
        agency: "Infominers Group",
        createdAt: new Date().toISOString(),
        status: "ACTIVE"
      }
    ];
    const userResult = await db.collection('users').insertMany(defaultUsers);
    console.log(`Successfully inserted ${userResult.insertedCount} users into the database!`);
    
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    await client.close();
  }
}

seedDatabase();

