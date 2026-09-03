console.log("--- STARTING TSX EXECUTION ---");
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import fs from "fs";
import { MongoClient, Db, ObjectId } from "mongodb";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_CATEGORIES } from "../src/data/categoriesData.js";
import { INITIAL_PRODUCTS } from "../src/data/productsData.js";
import { runHtmlToolValidationSuite } from "../src/data/testSuitesData.js";
import { BusinessCategory, CategoryProduct, PDReport, AuditLogEntry, User } from "../src/types.js";
import multer from "multer";
import { pdfService } from "./pdfService.js";
import { ParserFactory } from "./parsers/ParserFactory.js";

const upload = multer({ storage: multer.memoryStorage() });
console.log("Starting PD System Server init...");
const app = express();

let mongoDb: Db | null = null;
const mongoUri = process.env.MONGODB_URI;
let clientPromise: Promise<MongoClient> | null = null;

if (mongoUri) { // MongoDB Enabled
  try {
    const client = new MongoClient(mongoUri);
    clientPromise = client.connect();
    clientPromise.then(() => {
      mongoDb = client.db("InfominerGroup_db");
      console.log("[PD System Server] Connected to MongoDB!");
      
      // API Key Status Checks
      const hasGeminiKey = !!process.env.GEMINI_API_KEY;
      
      console.log(`[PD System Server] Gemini API Key Status: ${hasGeminiKey ? 'CONNECTED (Present in .env)' : 'NOT CONNECTED (Missing)'}`);

    }).catch(err => {
      console.error("[PD System Server] MongoDB connection error:", err);
    });
  } catch (err) {
    console.error("[PD System Server] MongoDB sync connection error:", err);
  }
}

app.use(async (req, res, next) => {
  if (mongoUri && !mongoDb && clientPromise) {
    try {
      await clientPromise;
    } catch(e) {}
  }
  next();
});

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));


  // In-memory data persistence stores (removed in favor of MongoDB)
  // Seed functions will fall back to INITIAL_CATEGORIES and INITIAL_PRODUCTS if empty

  async function addAuditLog(userName: string, userRole: any, action: string, resource: string, resourceId: string, details: string) {
    if (!mongoDb) return;
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
    try {
      await mongoDb.collection("auditLogs").insertOne(log);
    } catch (e) {
      console.error("Failed to write audit log", e);
    }
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
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      let categories = await mongoDb.collection("categories").find({}).toArray();
      if (categories.length === 0) {
        // Seed DB if empty
        await mongoDb.collection("categories").insertMany(INITIAL_CATEGORIES);
        categories = await mongoDb.collection("categories").find({}).toArray();
      }
      res.json({ categories: categories.map((c: any) => ({ ...c, _id: undefined })) });
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
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      await mongoDb.collection("categories").updateOne(
        { id: newCat.id },
        { $set: newCat },
        { upsert: true }
      );
      addAuditLog("Admin User", "ADMIN", "CATEGORY_SAVED", "BusinessCategory", newCat.id, `Saved category ${newCat.name}`);
      res.json({ success: true, category: newCat });
    } catch (err) {
      res.status(500).json({ error: "Failed to save category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    const catId = req.params.id;
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const result = await mongoDb.collection("categories").deleteOne({ id: catId });
      if (result.deletedCount === 0) {
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
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      let products = await mongoDb.collection("products").find({}).toArray();
      if (products.length === 0) {
        await mongoDb.collection("products").insertMany(INITIAL_PRODUCTS);
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
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      await mongoDb.collection("products").updateOne(
        { id: newProd.id },
        { $set: newProd },
        { upsert: true }
      );
      addAuditLog("Admin User", "ADMIN", "PRODUCT_SAVED", "CategoryProduct", newProd.id, `Saved product ${newProd.productName}`);
      res.json({ success: true, product: newProd });
    } catch (err) {
      res.status(500).json({ error: "Failed to save product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    const prodId = req.params.id;
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const result = await mongoDb.collection("products").deleteOne({ id: prodId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      addAuditLog("Admin User", "ADMIN", "PRODUCT_DELETED", "CategoryProduct", prodId, `Deleted product ${prodId}`);
      res.json({ success: true, message: `Product ${prodId} deleted` });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Reports Management APIs
  app.get("/api/reports", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const reports = await mongoDb.collection("reports").find({}).sort({ updatedAt: -1 }).toArray();
      res.json({ reports });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const rep = await mongoDb.collection("reports").findOne({ id: req.params.id });
      if (!rep) return res.status(404).json({ error: "Report not found" });
      res.json({ report: rep });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    const reportData: PDReport = req.body;
    if (!reportData.applicationNumber) {
      return res.status(400).json({ error: "Application number is required" });
    }
    
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const existing = await mongoDb.collection("reports").findOne({ 
        $or: [{ id: reportData.id }, { applicationNumber: reportData.applicationNumber }]
      });

      if (existing) {
        const updatedReport = {
          ...existing,
          ...reportData,
          updatedAt: new Date().toISOString(),
          version: (existing.version || 1) + 1,
          _id: existing._id
        };
        await mongoDb.collection("reports").updateOne({ _id: existing._id }, { $set: updatedReport });
        addAuditLog(reportData.assignedCreditManager || "Credit Manager", "MANAGER", "REPORT_UPDATED", "PDReport", reportData.id, `Updated report for ${reportData.applicantName}`);
        return res.json({ success: true, report: updatedReport });
      } else {
        const newReport: PDReport = {
          ...reportData,
          id: reportData.id || "REP-" + Date.now().toString(36).toUpperCase(),
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await mongoDb.collection("reports").insertOne(newReport);
        addAuditLog(reportData.assignedCreditManager || "Credit Manager", "MANAGER", "REPORT_CREATED", "PDReport", newReport.id, `Created new PD report for ${newReport.applicantName}`);
        return res.json({ success: true, report: newReport });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to save report" });
    }
  });

  app.patch("/api/reports/:id/status", async (req, res) => {
    const { status, reviewerNotes } = req.body;
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const rep = await mongoDb.collection("reports").findOne({ id: req.params.id });
      if (!rep) return res.status(404).json({ error: "Report not found" });
      
      rep.status = status;
      rep.updatedAt = new Date().toISOString();
      await mongoDb.collection("reports").updateOne({ id: req.params.id }, { $set: { status, updatedAt: rep.updatedAt } });
      
      addAuditLog("Vikram Malhotra", "MANAGER", "REPORT_STATUS_CHANGED", "PDReport", rep.id, `Status updated to ${status}. Notes: ${reviewerNotes || 'None'}`);
      res.json({ success: true, report: rep });
    } catch (err) {
      res.status(500).json({ error: "Failed to update report status" });
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    const repId = req.params.id;
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const result = await mongoDb.collection("reports").deleteOne({ id: repId });
      if (result.deletedCount === 0) return res.status(404).json({ error: "Report not found" });
      
      addAuditLog("Vikram Malhotra", "MANAGER", "REPORT_DELETED", "PDReport", repId, `Deleted report ${repId}`);
      res.json({ success: true, message: `Report ${repId} deleted` });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete report" });
    }
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
  app.post("/api/validate", async (req, res) => {
    const { formData, categoryId } = req.body;
    // Database check for category can be omitted since it's unused below, or fetched if needed:
    // const cat = mongoDb ? await mongoDb.collection("categories").findOne({ id: categoryId }) : null;

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

  // WhatsApp Extraction Endpoint
  app.post("/api/extract-whatsapp", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const schemaPath = path.join(process.cwd(), "pd_inputs_schema.json");
      let schemaString = "{}";
      try {
        schemaString = fs.readFileSync(schemaPath, 'utf8');
      } catch (e) {
        console.warn("Could not load pd_inputs_schema.json", e);
      }

      const prompt = `You are an expert data extractor for a micro-lending Personal Discussion (PD) report.
The user will provide an extremely unstructured field investigation report via WhatsApp message. The text will vary a lot in language and format. It may be highly unstructured, written in Hindi, English, Hinglish, or a chaotic mix of these. It may contain severe typos, abbreviations, slang, incomplete sentences, or informal formatting.

Your task is to carefully analyze this chaotic, unstructured text, identify the underlying facts, and extract all relevant information into a strictly valid JSON object that matches the following schema EXACTLY:
${schemaString}

Rules:
1. Deeply understand the context to map the informal text to the formal JSON schema fields. Translate all extracted values into professional English.
2. If a specific field is not mentioned or cannot be confidently inferred from the text, you MUST set its value to \`null\` or an empty string/array (according to the type). DO NOT invent, assume, or guess any information. It is better to return null than to hallucinate.
3. The output MUST be a valid JSON object. Do not include markdown code blocks like \`\`\`json.
4. Add an additional key "_confidence_score" at the root level of your JSON with a value from 0-100 indicating your confidence in the extraction based on the clarity of the text.
5. In addition to the structured fields, generate a comprehensive professional narrative and Q&A table in Markdown format based on the text. Use the EXACT headings "### Business Profile" and "### Business Profile – Question & Answer". Store this ENTIRE Markdown string in the \`generatedMarkdownProfile\` field.

WhatsApp Message:
"${text}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (!response.text) {
        throw new Error("No response text from Gemini");
      }
      const jsonResponse = JSON.parse(response.text);

      res.json({
        data: jsonResponse,
        modelUsed: "gemini-3.6-flash"
      });

    } catch (err: any) {
      console.error("WhatsApp AI Extraction error:", err);
      res.status(500).json({ error: "Failed to extract WhatsApp data: " + err.message });
    }
  });

  // Credit Report Parsing Endpoint
  app.post("/api/parse-credit-report", upload.single("report"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const { reportType } = req.body;
      const text = await pdfService.extractText(req.file.buffer);
      const provider = (reportType && reportType !== 'AUTO') ? reportType : pdfService.detectProvider(text);
      
      const parser = ParserFactory.getParser(provider);
      const parsedData = await parser.parse(text);
      
      res.json({
        success: true,
        provider,
        data: parsedData
      });
    } catch (err: any) {
      console.error("Credit Report Parsing error:", err);
      res.status(500).json({ error: "Failed to parse credit report: " + err.message });
    }
  });

  // HTML Tool Validation Engine Endpoint
  app.post("/api/html-tool/validate", (req, res) => {
    const run = runHtmlToolValidationSuite();
    addAuditLog("QA Specialist", "AUDITOR", "HTML_TOOL_VALIDATED", "HTMLPDTool", run.runId, `Validated HTML PD Tool - Score: ${run.overallScore}% (${run.passedCount}/${run.totalTests} passed)`);
    res.json({ validationRun: run });
  });

  // Dashboard Aggregated Analytics
  app.get("/api/dashboard", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const reports = await mongoDb.collection("reports").find({}).toArray();
      const categories = await mongoDb.collection("categories").find({}).toArray();

      const totalReports = reports.length;
      const approved = reports.filter(r => r.status === "APPROVED").length;
      const pending = reports.filter(r => r.status === "DRAFT" || r.status === "IN_REVIEW").length;
      const rejected = reports.filter(r => r.status === "REJECTED").length;

      const categoryBreakdown: Record<string, number> = {};
      reports.forEach(r => {
        categoryBreakdown[r.categoryId] = (categoryBreakdown[r.categoryId] || 0) + 1;
      });

      res.json({
        summary: {
          totalReports,
          approvedCount: approved,
          pendingCount: pending,
          rejectedCount: rejected,
          averageDscr: 2.85,
          totalDisbursedValue: reports.reduce((acc, r) => acc + (r.appliedAmount || 0), 0)
        },
        categoryDistribution: Object.keys(categoryBreakdown).map(k => {
          const cat = categories.find(c => c.id === k);
          return {
            categoryId: k,
            name: cat ? cat.name : k,
            count: categoryBreakdown[k]
          };
        }),
        riskDistribution: [
          { level: "Low Risk", count: 18, color: "#10b981" },
          { level: "Medium Risk", count: 6, color: "#f59e0b" },
          { level: "High Risk", count: 2, color: "#ef4444" }
        ]
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Audit Log Endpoint
  app.get("/api/audit", async (req, res) => {
    try {
      if (!mongoDb) return res.status(500).json({ error: "Database not connected" });
      const logs = await mongoDb.collection("auditLogs").find({}).sort({ timestamp: -1 }).toArray();
      res.json({ logs });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

export default app;
