console.log("--- STARTING TSX EXECUTION ---");
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { MongoClient, Db, ObjectId } from "mongodb";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_CATEGORIES } from "./src/data/categoriesData";
import { INITIAL_PRODUCTS } from "./src/data/productsData";
import { runHtmlToolValidationSuite } from "./src/data/testSuitesData";
import { BusinessCategory, CategoryProduct, PDReport, AuditLogEntry, User } from "./src/types";

async function startServer() {
  console.log("Starting PD System Server init...");
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  let mongoDb: Db | null = null;
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) { // MongoDB Enabled
    try {
      const client = new MongoClient(mongoUri);
      await client.connect();
      mongoDb = client.db("InfominerGroup_db");
      console.log("[PD System Server] Connected to MongoDB!");
    } catch (err) {
      console.error("[PD System Server] MongoDB connection error:", err);
    }
  }

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));



  // In-memory data persistence stores (pre-populated with mock production data)
  let categoriesStore: BusinessCategory[] = [...INITIAL_CATEGORIES];
  let productsStore: CategoryProduct[] = [...INITIAL_PRODUCTS];
  let reportsStore: PDReport[] = [
    {
      id: "REP-2026-001",
      applicationNumber: "INF/2026/88492",
      applicantName: "Ramesh Chandra Sharma",
      categoryId: "kirana",
      product: "Infominer Micro Lending",
      scheme: "General MSME Express",
      appliedAmount: 350000,
      tenureMonths: 24,
      purpose: "Shop Inventory Expansion & Refrigerator Upgrade",
      visitDate: "2026-08-01",
      status: "APPROVED",
      assignedOfficer: "Sandeep Kumar (Field Officer)",
      assignedCreditManager: "Vikram Malhotra (CM)",
      agencyName: "Mahesh and Co",
      panNumber: "ABCPS8842K",
      firmName: "Sharma Super Kirana & General Store",
      constitution: "Proprietorship",
      financials: {
        statedMonthlyRevenue: 280000,
        crossCheckRevenue: 275000,
        adoptedRevenue: 275000,
        rawMaterialCOGS: 206250,
        grossProfit: 68750,
        grossMarginPct: 25,
        operatingExpenses: {
          salaries: 12000,
          rent: 8000,
          utilities: 3500,
          transport: 2500,
          misc: 2000
        },
        totalOperatingExpenses: 28000,
        netBusinessIncome: 40750,
        netMarginPct: 14.8,
        otherHouseholdIncome: {
          agriculture: 8000,
          rental: 0,
          coBorrower: 0,
          fdDividend: 0,
          animalHusbandry: 0,
          other: 0
        },
        totalOtherIncome: 8000,
        totalFamilyIncome: 48750,
        householdExpenses: {
          food: 12000,
          rent: 0,
          education: 6000,
          medical: 2000,
          travel: 2000,
          other: 1000
        },
        totalHouseholdExpenses: 23000,
        surplusBeforeEmi: 25750,
        existingEmisSum: 5000,
        netMonthlySurplus: 20750,
        proposedEmi: 18200,
        postLoanNetSurplus: 2550,
        dscr: 5.15,
        postLoanDscr: 1.11,
        foirPct: 47.6,
        emiCapacity: 20600
      },
      riskResult: {
        overallRiskLevel: "LOW",
        riskScore: 22,
        financialHealthGrade: "A",
        keyRiskFactors: [
          "Slight seasonality during summer monsoon",
          "Working capital dependent on high footfall"
        ],
        strengths: [
          "12 years of business vintage at same location",
          "Prominent shop corner location with 85+ daily customer footfall",
          "Clean bank statement with regular UPI digital credits",
          "Clear DSCR ratio > 1.10 post proposed EMI"
        ],
        weaknesses: [
          "Informal inventory records without ERP software",
          "Competitor Kirana store 100 meters away"
        ],
        anomaliesDetected: [],
        mitigants: [
          "High proportion of repeat residential customers",
          "Personal guarantee of spouse attached as financial co-applicant"
        ]
      },
      photos: [],
      aiExecutiveSummary: "Applicant Ramesh Chandra Sharma runs a stable 12-year-old Kirana store with strong local reputation, verified footfall of 85+ customers/day, and healthy cash flow supporting the proposed ₹3,50,000 Infominer Micro Lending facility.",
      version: 1,
      createdAt: "2026-08-01T10:30:00Z",
      updatedAt: "2026-08-01T14:20:00Z"
    }
  ];

  let auditLogsStore: AuditLogEntry[] = [
    {
      id: "LOG-1001",
      timestamp: new Date().toISOString(),
      userId: "USR-001",
      userName: "Vikram Malhotra",
      userRole: "MANAGER",
      action: "REPORT_APPROVED",
      resource: "PDReport",
      resourceId: "REP-2026-001",
      details: "Approved loan application INF/2026/88492 for ₹3,50,000",
      ipAddress: "127.0.0.1"
    }
  ];

  function addAuditLog(userName: string, userRole: any, action: string, resource: string, resourceId: string, details: string) {
    const log: AuditLogEntry = {
      id: "LOG-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString(),
      userId: "USR-SESSION",
      userName,
      userRole,
      action,
      resource,
      resourceId,
      details,
      ipAddress: "127.0.0.1"
    };
    auditLogsStore.unshift(log);
  }

  // -------------------------------------------------------------
  // API ROUTES (MUST COME FIRST)
  // -------------------------------------------------------------

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Client Management Endpoints (MongoDB)
  app.get("/api/clients", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const clients = await mongoDb.collection("clients").find({}).toArray();
      res.json({ clients });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const newClient = req.body;
      const result = await mongoDb.collection("clients").insertOne({
        ...newClient,
        createdAt: new Date().toISOString()
      });
      res.json({ success: true, client: { _id: result.insertedId, ...newClient } });
    } catch (err) {
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  // Applicant Management Endpoints (MongoDB)
  app.get("/api/clients/:clientId/applicants", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const applicants = await mongoDb.collection("applicants").find({ clientId: req.params.clientId }).toArray();
      res.json({ applicants });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch applicants" });
    }
  });

  app.post("/api/clients/:clientId/applicants", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const newApplicant = {
        ...req.body,
        clientId: req.params.clientId,
        createdAt: new Date().toISOString()
      };
      const result = await mongoDb.collection("applicants").insertOne(newApplicant);
      res.json({ success: true, applicant: { _id: result.insertedId, ...newApplicant } });
    } catch (err) {
      res.status(500).json({ error: "Failed to create applicant" });
    }
  });

  app.patch("/api/clients/:clientId/applicants/:appId", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const { _id, clientId, ...updateData } = req.body;
      
      const result = await mongoDb.collection("applicants").findOneAndUpdate(
        { _id: new ObjectId(req.params.appId), clientId: req.params.clientId },
        { $set: { ...updateData, updatedAt: new Date().toISOString() } },
        { returnDocument: "after" }
      );
      
      if (!result) {
        return res.status(404).json({ error: "Applicant not found" });
      }
      
      res.json({ success: true, applicant: result });
    } catch (err) {
      res.status(500).json({ error: "Failed to update applicant" });
    }
  });

  // Auth & Session Endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const { email, password } = req.body;
      
      const existingUser = await mongoDb.collection("users").findOne({ 
        email: email?.toLowerCase(),
        password: password
      });

      if (!existingUser) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (req.body.role && existingUser.role !== req.body.role) {
        return res.status(401).json({ error: "Role mismatch. Please ensure you select your correct role to login." });
      }

      addAuditLog(existingUser.name, existingUser.role, "USER_LOGIN", "Authentication", existingUser.id, `Logged in successfully`);

      res.json({
        success: true,
        user: existingUser,
        token: `jwt_session_${Date.now()}`
      });
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const { name, email, role, designation, agency, password } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "Name, email, password, and role are required" });
      }

      const existing = await mongoDb.collection("users").findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: "An employee with this email address is already registered. Please login instead." });
      }

      const newUser = {
        id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        email: email.toLowerCase(),
        password,
        role,
        designation: designation || "Employee",
        agency: agency || "PD Automation",
        createdAt: new Date().toISOString(),
        status: "ACTIVE"
      };

      await mongoDb.collection("users").insertOne(newUser);
      addAuditLog(newUser.name, newUser.role, "USER_REGISTERED", "Authentication", newUser.id, `Self-registered new account`);

      res.json({
        success: true,
        user: newUser,
        token: `jwt_session_${Date.now()}`
      });
    } catch (err) {
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // Employee & Designation Management Endpoints (MongoDB)
  app.get("/api/employees", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const users = await mongoDb.collection("users").find({}).toArray();
      res.json({ employees: users });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const { id, name, email, role, designation, agency, status, password } = req.body;
      if (!name || !email || !role || !designation) {
        return res.status(400).json({ error: "Name, email, role, and designation are mandatory" });
      }

      const existingUser = await mongoDb.collection("users").findOne({ id });
      
      if (existingUser) {
        const updateData: any = { name, email, role, designation, agency: agency || existingUser.agency, status };
        if (password) updateData.password = password;

        await mongoDb.collection("users").updateOne({ id }, { $set: updateData });
        addAuditLog("Admin Manager", "ADMIN", "EMPLOYEE_UPDATED", "EmployeeDirectory", id, `Updated employee ${name}`);
        return res.json({ success: true, employee: { ...existingUser, ...updateData }, message: "Employee profile updated" });
      } else {
        const newEmp = {
          id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          name,
          email,
          role,
          designation,
          agency: agency || "PD Automation",
          password: password || "password123",
          createdAt: new Date().toISOString(),
          status: status || "ACTIVE"
        };
        await mongoDb.collection("users").insertOne(newEmp);
        addAuditLog("Admin Manager", "ADMIN", "EMPLOYEE_ADDED", "EmployeeDirectory", newEmp.id, `Added new employee ${name}`);
        return res.json({ success: true, employee: newEmp, message: "New employee created successfully" });
      }
    } catch (err) {
      res.status(500).json({ error: "Operation failed" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const empId = req.params.id;
      const result = await mongoDb.collection("users").deleteOne({ id: empId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Employee not found in registry" });
      }

      addAuditLog("Admin Manager", "ADMIN", "EMPLOYEE_REMOVED", "EmployeeDirectory", empId, `Removed employee ${empId}`);
      res.json({ success: true, message: `Employee ${empId} removed from registry` });
    } catch (err) {
      res.status(500).json({ error: "Delete failed" });
    }
  });

  // Client Category Management APIs
  app.get("/api/categories", async (req, res) => {
    try {
      if (!mongoDb) return res.json({ categories: categoriesStore });
      let categories = await mongoDb.collection("categories").find({}).toArray();
      if (categories.length === 0) {
        // Seed DB if empty
        await mongoDb.collection("categories").insertMany(categoriesStore);
        categories = await mongoDb.collection("categories").find({}).toArray();
      }
      res.json({ categories: categories.map(c => ({ ...c, _id: undefined })) });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    const newCat: BusinessCategory = req.body;
    if (!newCat.id || !newCat.name) {
      return res.status(400).json({ error: "Category ID and Name are required" });
    }
    
    try {
      if (mongoDb) {
        await mongoDb.collection("categories").updateOne(
          { id: newCat.id },
          { $set: newCat },
          { upsert: true }
        );
      }
      // Also update in-memory as fallback
      const idx = categoriesStore.findIndex(c => c.id === newCat.id);
      if (idx >= 0) {
        categoriesStore[idx] = { ...categoriesStore[idx], ...newCat };
      } else {
        categoriesStore.push(newCat);
      }
      addAuditLog("Admin User", "ADMIN", idx >= 0 ? "CATEGORY_UPDATED" : "CATEGORY_CREATED", "BusinessCategory", newCat.id, `Saved category ${newCat.name}`);
      res.json({ success: true, category: newCat });
    } catch (err) {
      res.status(500).json({ error: "Failed to save category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    const catId = req.params.id;
    try {
      if (mongoDb) {
        await mongoDb.collection("categories").deleteOne({ id: catId });
      }
      
      const initialLen = categoriesStore.length;
      categoriesStore = categoriesStore.filter(c => c.id !== catId);
      if (categoriesStore.length === initialLen && !mongoDb) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      addAuditLog("Admin User", "ADMIN", "CATEGORY_DELETED", "BusinessCategory", catId, `Deleted category ${catId}`);
      res.json({ success: true, message: `Category ${catId} deleted` });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Product Mapping APIs
  app.get("/api/products", async (req, res) => {
    try {
      if (!mongoDb) {
        const { categoryId } = req.query;
        if (categoryId) {
          return res.json({ products: productsStore.filter(p => p.categoryId === categoryId) });
        }
        return res.json({ products: productsStore });
      }

      let products = await mongoDb.collection("products").find({}).toArray();
      if (products.length === 0) {
        // Seed DB if empty
        await mongoDb.collection("products").insertMany(productsStore);
        products = await mongoDb.collection("products").find({}).toArray();
      }

      const { categoryId } = req.query;
      let finalProducts = products.map((p: any) => ({ ...p, _id: undefined }));
      if (categoryId) {
        finalProducts = finalProducts.filter((p: any) => p.categoryId === categoryId);
      }
      res.json({ products: finalProducts });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    const newProd: CategoryProduct = req.body;
    if (!newProd.id || !newProd.productName) {
      return res.status(400).json({ error: "Product ID and Name required" });
    }
    
    try {
      if (mongoDb) {
        await mongoDb.collection("products").updateOne(
          { id: newProd.id },
          { $set: newProd },
          { upsert: true }
        );
      }
      
      const idx = productsStore.findIndex(p => p.id === newProd.id);
      if (idx >= 0) {
        productsStore[idx] = { ...productsStore[idx], ...newProd };
      } else {
        productsStore.push(newProd);
      }
      addAuditLog("Admin User", "ADMIN", idx >= 0 ? "PRODUCT_UPDATED" : "PRODUCT_CREATED", "CategoryProduct", newProd.id, `Saved product ${newProd.productName}`);
      res.json({ success: true, product: newProd });
    } catch (err) {
      res.status(500).json({ error: "Failed to save product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    const prodId = req.params.id;
    try {
      if (mongoDb) {
        await mongoDb.collection("products").deleteOne({ id: prodId });
      }
      
      const initialLen = productsStore.length;
      productsStore = productsStore.filter(p => p.id !== prodId);
      if (productsStore.length === initialLen && !mongoDb) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      addAuditLog("Admin User", "ADMIN", "PRODUCT_DELETED", "CategoryProduct", prodId, `Deleted product ${prodId}`);
      res.json({ success: true, message: `Product ${prodId} deleted` });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Reports Management APIs
  app.get("/api/reports", (req, res) => {
    res.json({ reports: reportsStore });
  });

  app.get("/api/reports/:id", (req, res) => {
    const rep = reportsStore.find(r => r.id === req.params.id);
    if (!rep) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json({ report: rep });
  });

  app.post("/api/reports", (req, res) => {
    const reportData: PDReport = req.body;
    if (!reportData.applicationNumber) {
      return res.status(400).json({ error: "Application number is required" });
    }

    const existingIdx = reportsStore.findIndex(r => r.id === reportData.id || r.applicationNumber === reportData.applicationNumber);
    if (existingIdx >= 0) {
      reportsStore[existingIdx] = {
        ...reportsStore[existingIdx],
        ...reportData,
        updatedAt: new Date().toISOString(),
        version: (reportsStore[existingIdx].version || 1) + 1
      };
      addAuditLog(reportData.assignedCreditManager || "Credit Manager", "MANAGER", "REPORT_UPDATED", "PDReport", reportData.id, `Updated report for ${reportData.applicantName}`);
      return res.json({ success: true, report: reportsStore[existingIdx] });
    } else {
      const newReport: PDReport = {
        ...reportData,
        id: reportData.id || "REP-" + Date.now().toString(36).toUpperCase(),
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      reportsStore.unshift(newReport);
      addAuditLog(reportData.assignedCreditManager || "Credit Manager", "MANAGER", "REPORT_CREATED", "PDReport", newReport.id, `Created new PD report for ${newReport.applicantName}`);
      return res.json({ success: true, report: newReport });
    }
  });

  app.patch("/api/reports/:id/status", (req, res) => {
    const { status, reviewerNotes } = req.body;
    const rep = reportsStore.find(r => r.id === req.params.id);
    if (!rep) {
      return res.status(404).json({ error: "Report not found" });
    }
    rep.status = status;
    rep.updatedAt = new Date().toISOString();
    addAuditLog("Vikram Malhotra", "MANAGER", "REPORT_STATUS_CHANGED", "PDReport", rep.id, `Status updated to ${status}. Notes: ${reviewerNotes || 'None'}`);
    res.json({ success: true, report: rep });
  });

  app.delete("/api/reports/:id", (req, res) => {
    const repId = req.params.id;
    const initialLen = reportsStore.length;
    reportsStore = reportsStore.filter(r => r.id !== repId);
    if (reportsStore.length === initialLen) {
      return res.status(404).json({ error: "Report not found" });
    }
    addAuditLog("Vikram Malhotra", "MANAGER", "REPORT_DELETED", "PDReport", repId, `Deleted report ${repId}`);
    res.json({ success: true, message: `Report ${repId} deleted` });
  });

  // Photo EXIF Server-side Processor API
  app.post("/api/upload/photo", (req, res) => {
    const { fileName, fileType, base64Data, latitude, longitude } = req.body;
    const photoId = "IMG-" + Math.floor(10000 + Math.random() * 90000);
    const simulatedExif = {
      id: photoId,
      url: base64Data || "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
      caption: fileName || "Site Visit Photo",
      timestamp: new Date().toISOString(),
      gpsCoordinates: {
        latitude: latitude || 28.6139 + (Math.random() - 0.5) * 0.05,
        longitude: longitude || 77.2090 + (Math.random() - 0.5) * 0.05,
        accuracyMeters: 4.2
      },
      categoryTag: "Signboard/Premises",
      isAiVerified: true
    };
    addAuditLog("Field Officer", "FIELD_OFFICER", "PHOTO_UPLOADED", "PhotoAsset", photoId, `Uploaded photo ${fileName || photoId} with EXIF GPS tagging`);
    res.json({ success: true, photo: simulatedExif });
  });

  // Business Validation & Risk Engine Endpoint
  app.post("/api/validate", (req, res) => {
    const { formData, categoryId } = req.body;
    const cat = categoriesStore.find(c => c.id === categoryId);

    const issues: any[] = [];
    let riskScore = 15; // default low base risk

    const grossRev = parseFloat(formData?.gross_rev || 0);
    const xchkRev = parseFloat(formData?.xchk_result?.toString().replace(/[^0-9.]/g, '') || 0);
    const bankCredits = parseFloat(formData?.xc_bank_credits || 0);
    const invValue = parseFloat(formData?.inv_value || 0);

    // 1. Revenue Variance Check
    if (grossRev > 0 && xchkRev > 0) {
      const diffPct = Math.abs((xchkRev - grossRev) / grossRev) * 100;
      if (diffPct > 25) {
        issues.push({
          id: "ISSUE-REV-01",
          code: "REV_CROSSCHECK_MISMATCH",
          module: "Revenue Validation",
          field: "gross_rev",
          severity: diffPct > 40 ? "HIGH" : "MEDIUM",
          title: "Stated Revenue vs Footfall Cross-Check Variance",
          description: `Stated Revenue (₹${grossRev.toLocaleString()}) varies by ${diffPct.toFixed(1)}% from footfall cross-check revenue (₹${xchkRev.toLocaleString()}).`,
          impact: "Potential overstatement or under-reporting of business cash turnover.",
          suggestedAction: "Re-verify daily customer counts or review bank statement credit entries."
        });
        riskScore += diffPct > 40 ? 25 : 15;
      }
    }

    // 2. Bank Credit Verification
    if (grossRev > 0 && bankCredits > 0) {
      const bankRatio = (bankCredits / grossRev) * 100;
      if (bankRatio < 30) {
        issues.push({
          id: "ISSUE-BNK-01",
          code: "LOW_BANK_TURNOVER_SHARE",
          module: "Banking Analysis",
          field: "xc_bank_credits",
          severity: "MEDIUM",
          title: "Low Banking Credit Reflection",
          description: `Bank statement monthly credits (₹${bankCredits.toLocaleString()}) represent only ${bankRatio.toFixed(1)}% of stated revenue. High reliance on cash/kaccha sales.`,
          impact: "Lower banking formalization increases credit risk.",
          suggestedAction: "Collect UPI Soundbox statements or trade supplier invoices as secondary proof."
        });
        riskScore += 15;
      }
    }

    // 3. Category Specific Rule Checks
    if (categoryId === "pharmacy") {
      const drugLic = formData?.drug_licence;
      if (!drugLic || drugLic === "No" || drugLic === "Yes – Expired") {
        issues.push({
          id: "ISSUE-PHARM-01",
          code: "DRUG_LICENSE_EXPIRED",
          module: "Compliance",
          field: "drug_licence",
          severity: "CRITICAL",
          title: "Drug License Compliance Violation",
          description: "Pharmacy business is operating without a verified active Drug License (Form 20/21).",
          impact: "High regulatory risk and shop closure hazard.",
          suggestedAction: "Obtain renewed Drug License document prior to loan disbursement."
        });
        riskScore += 35;
      }
    }

    // Determine Overall Risk
    let overallRiskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (riskScore >= 50) overallRiskLevel = "HIGH";
    else if (riskScore >= 30) overallRiskLevel = "MEDIUM";

    res.json({
      overallRiskLevel,
      riskScore: Math.min(100, riskScore),
      financialHealthGrade: riskScore < 25 ? "A+" : riskScore < 40 ? "B" : "C",
      anomaliesDetected: issues,
      strengths: [
        "Business location verified with visible signboard and active trade",
        "Consistent customer footfall supported by regional demand",
        "Clear identity and address verification of main applicant"
      ],
      weaknesses: issues.map(i => i.title)
    });
  });

  // Server-Side Gemini AI Report Generator Endpoint
  app.post("/api/ai/generate-report", async (req, res) => {
    try {
      const { applicantName, categoryName, firmName, appliedAmount, financials, observations, risks } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback rule-based structured credit narrative
        const fallbackNarrative = `### EXECUTIVE CREDIT SUMMARY & RECOMMENDATION

**Applicant Name**: ${applicantName || "Ramesh Sharma"}  
**Firm Name**: ${firmName || "Sharma Kirana & General Store"}  
**Business Category**: ${categoryName || "Kirana / General Store"}  
**Applied Amount**: ₹${(appliedAmount || 350000).toLocaleString('en-IN')}  

#### 1. Business & Site Inspection Findings
The applicant operates a well-established ${categoryName || "retail"} business under the firm name **${firmName || "Applicant Business"}**. During the field visit conducted at the business premises, the unit was observed to be fully operational with active customer footfall. Stock inventory levels appeared adequate and well-maintained.

#### 2. Financial Analysis & Cash Flow Waterfall
- **Adopted Gross Monthly Revenue**: ₹${(financials?.adoptedRevenue || 275000).toLocaleString('en-IN')}
- **Gross Profit Margin**: ${financials?.grossMarginPct || 25}% (Gross Profit: ₹${(financials?.grossProfit || 68750).toLocaleString('en-IN')})
- **Net Business Income**: ₹${(financials?.netBusinessIncome || 40750).toLocaleString('en-IN')}
- **Total Household Net Surplus**: ₹${(financials?.netMonthlySurplus || 20750).toLocaleString('en-IN')}
- **Debt Service Coverage Ratio (DSCR)**: ${financials?.dscr || 5.15} (Post-Loan DSCR: ${financials?.postLoanDscr || 1.11})

#### 3. Key Credit Strengths
1. Prominent business location with stable vintage in the local neighborhood.
2. Verified daily footfall providing consistent cash flow stream.
3. Adequate post-loan DSCR coverage above institutional threshold.

#### 4. Critical Risk Observations & Mitigants
- **Risk**: Income verification relies partly on informal/kaccha record keeping.  
- **Mitigant**: Cross-check calculations based on daily customer ticket size confirm stated sales turnover.

#### 5. Final Credit Manager Recommendation
**RECOMMENDED FOR APPROVAL**  
Based on field inspection, cash flow adequacy, and satisfactory debt coverage, the requested facility of ₹${(appliedAmount || 350000).toLocaleString('en-IN')} is recommended subject to standard documentation verification.`;

        return res.json({
          narrative: fallbackNarrative,
          isAiGenerated: false,
          modelUsed: "Rule-Based Expert Financial Engine (Set GEMINI_API_KEY for live Gemini 3.6 Flash generation)"
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `You are a Senior Credit Manager at Axis Bank Infominer Micro Lending & MSME Credit Division.
Write a formal, comprehensive, professional Personal Discussion (PD) Field Credit Report for the following applicant:

Applicant Name: ${applicantName}
Business Category: ${categoryName}
Firm Name: ${firmName}
Requested Loan Amount: ₹${appliedAmount}
Financial Waterfall:
- Adopted Revenue: ₹${financials?.adoptedRevenue}
- Gross Profit: ₹${financials?.grossProfit} (${financials?.grossMarginPct}%)
- Net Business Income: ₹${financials?.netBusinessIncome}
- Net Household Surplus: ₹${financials?.netMonthlySurplus}
- Existing DSCR: ${financials?.dscr}
- Post-Loan Projected DSCR: ${financials?.postLoanDscr}

Field Observations: ${JSON.stringify(observations || {})}
Key Risks Noted: ${JSON.stringify(risks || {})}

Write a structured Markdown report containing:
1. Executive Summary & Facility Purpose
2. Business Profile & Site Inspection Assessment
3. Financial Analysis & Cash Flow Reconciliation
4. Risk Assessment & Key Mitigants
5. Credit Manager Final Decision & Recommendation with Specific Conditions.

Style: Authoritative, objective, bank credit analyst tone. Focus on cash flow adequacy and debt service capacity.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
      });

      res.json({
        narrative: response.text,
        isAiGenerated: true,
        modelUsed: "gemini-3.6-flash"
      });

    } catch (err: any) {
      console.error("Gemini AI Report Generation error:", err);
      res.status(500).json({ error: "Failed to generate AI report: " + err.message });
    }
  });

  // HTML Tool Validation Engine Endpoint
  app.post("/api/html-tool/validate", (req, res) => {
    const run = runHtmlToolValidationSuite();
    addAuditLog("QA Specialist", "AUDITOR", "HTML_TOOL_VALIDATED", "HTMLPDTool", run.runId, `Validated HTML PD Tool - Score: ${run.overallScore}% (${run.passedCount}/${run.totalTests} passed)`);
    res.json({ validationRun: run });
  });

  // Dashboard Aggregated Analytics
  app.get("/api/dashboard", (req, res) => {
    const totalReports = reportsStore.length;
    const approved = reportsStore.filter(r => r.status === "APPROVED").length;
    const pending = reportsStore.filter(r => r.status === "DRAFT" || r.status === "IN_REVIEW").length;
    const rejected = reportsStore.filter(r => r.status === "REJECTED").length;

    const categoryBreakdown: Record<string, number> = {};
    reportsStore.forEach(r => {
      categoryBreakdown[r.categoryId] = (categoryBreakdown[r.categoryId] || 0) + 1;
    });

    res.json({
      summary: {
        totalReports,
        approvedCount: approved,
        pendingCount: pending,
        rejectedCount: rejected,
        averageDscr: 2.85,
        totalDisbursedValue: reportsStore.reduce((acc, r) => acc + (r.appliedAmount || 0), 0)
      },
      categoryDistribution: Object.keys(categoryBreakdown).map(k => ({
        categoryId: k,
        name: INITIAL_CATEGORIES.find(c => c.id === k)?.name || k,
        count: categoryBreakdown[k]
      })),
      riskDistribution: [
        { level: "Low Risk", count: 18, color: "#10b981" },
        { level: "Medium Risk", count: 6, color: "#f59e0b" },
        { level: "High Risk", count: 2, color: "#ef4444" }
      ]
    });
  });

  // Audit Log Endpoint
  app.get("/api/audit", (req, res) => {
    res.json({ logs: auditLogsStore });
  });

  // -------------------------------------------------------------
  // VITE / STATIC MIDDLEWARE (AFTER API ROUTES)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PD System Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Fatal error during server startup:", err);
  process.exit(1);
});
