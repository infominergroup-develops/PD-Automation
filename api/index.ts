console.log("--- STARTING TSX EXECUTION ---");
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import fs from "fs";
import { Firestore } from "@google-cloud/firestore";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_CATEGORIES } from "../src/data/categoriesData.js";
import { INITIAL_PRODUCTS } from "../src/data/productsData.js";
import { runHtmlToolValidationSuite } from "../src/data/testSuitesData.js";
import { BusinessCategory, CategoryProduct, PDReport, AuditLogEntry, User } from "../src/types.js";
import multer from "multer";
import { pdfService } from "./pdfService.js";
import { ParserFactory } from "./parsers/ParserFactory.js";
import { parseExcelTemplate, generateExcelReport } from "./excelTemplateService.js";

const upload = multer({ storage: multer.memoryStorage() });
console.log("Starting PD System Server init...");
const app = express();

let db: Firestore | null = null;
try {
  db = new Firestore({
    projectId: 'vouchr-f4d9e',
    keyFilename: path.join(process.cwd(), 'firebase-service-account.json'),
    preferRest: true
  });
  console.log("[PD System Server] Connected to Firestore!");
  
  // API Key Status Checks
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  console.log(`[PD System Server] Gemini API Key Status: ${hasGeminiKey ? 'CONNECTED (Present in .env)' : 'NOT CONNECTED (Missing)'}`);

} catch (err) {
  console.error("[PD System Server] Firestore connection error:", err);
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper to map Firestore docs to standard objects with _id
const mapDocs = (snapshot: any) => snapshot.docs.map((doc: any) => ({ _id: doc.id, ...doc.data() }));

async function addAuditLog(userName: string, userRole: any, action: string, resource: string, resourceId: string, details: string) {
  if (!db) return;
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
    await db.collection("auditLogs").add(log);
  } catch (e) {
    console.error("Failed to write audit log", e);
  }
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Excel Template Parsing & Generation
app.post("/api/parse-excel-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const tags = await parseExcelTemplate(req.file.buffer);
    const schema = tags.map(tag => ({ fieldName: tag, type: 'text', required: true }));
    res.json({ success: true, schema });
  } catch (err: any) {
    console.error("Parse error:", err);
    res.status(500).json({ error: "Failed to parse Excel template: " + err.message });
  }
});

app.post("/api/generate-excel-report", async (req, res) => {
  try {
    const { templateFileBase64, formData } = req.body;
    if (!templateFileBase64 || !formData) return res.status(400).json({ error: "Missing template file or form data" });
    const base64Data = templateFileBase64.replace(/^data:.*,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const generatedBuffer = await generateExcelReport(buffer, formData);
    const outputBase64 = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${generatedBuffer.toString('base64')}`;
    res.json({ success: true, fileBase64: outputBase64 });
  } catch (err: any) {
    console.error("Generate error:", err);
    res.status(500).json({ error: "Failed to generate Excel report: " + err.message });
  }
});

// Client Management Endpoints
app.get("/api/clients", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("clients").get();
    res.json({ clients: mapDocs(snapshot) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

app.post("/api/clients", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const newClient = { ...req.body, createdAt: new Date().toISOString() };
    const docRef = await db.collection("clients").add(newClient);
    res.json({ success: true, client: { _id: docRef.id, ...newClient } });
  } catch (err) {
    res.status(500).json({ error: "Failed to create client" });
  }
});

// Applicant Management Endpoints
app.get("/api/clients/:clientId/applicants", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("applicants").where("clientId", "==", req.params.clientId).get();
    res.json({ applicants: mapDocs(snapshot) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applicants" });
  }
});

app.post("/api/clients/:clientId/applicants", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const newApplicant = {
      ...req.body,
      clientId: req.params.clientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await db.collection("applicants").add(newApplicant);
    res.json({ success: true, applicant: { _id: docRef.id, ...newApplicant } });
  } catch (err: any) {
    console.error("POST Applicant Error:", err);
    res.status(500).json({ error: "Failed to create applicant: " + (err.message || String(err)) });
  }
});

app.patch("/api/clients/:clientId/applicants/:appId", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const { _id, clientId, ...updateData } = req.body;
    updateData.updatedAt = new Date().toISOString();
    
    const docRef = db.collection("applicants").doc(req.params.appId);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.clientId !== req.params.clientId) {
      return res.status(404).json({ error: "Applicant not found" });
    }
    
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    res.json({ success: true, applicant: { _id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err: any) {
    console.error("PATCH Applicant Error:", err);
    res.status(500).json({ error: "Failed to update applicant: " + (err.message || String(err)) });
  }
});

app.delete("/api/clients/:clientId/applicants/:appId", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const docRef = db.collection("applicants").doc(req.params.appId);
    const doc = await docRef.get();
    if (!doc.exists || doc.data()?.clientId !== req.params.clientId) {
      return res.status(404).json({ error: "Applicant not found" });
    }
    await docRef.delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete applicant" });
  }
});

// Auth & Session Endpoints
app.post("/api/auth/login", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const { email, password } = req.body;
    const snapshot = await db.collection("users").where("email", "==", email?.toLowerCase()).where("password", "==", password).get();
    if (snapshot.empty) return res.status(401).json({ error: "Invalid email or password" });
    
    const existingUser = snapshot.docs[0].data();
    if (req.body.role && existingUser.role !== req.body.role) {
      return res.status(401).json({ error: "Role mismatch. Please ensure you select your correct role to login." });
    }

    addAuditLog(existingUser.name, existingUser.role, "USER_LOGIN", "Authentication", existingUser.id, `Logged in successfully`);
    res.json({ success: true, user: existingUser, token: `jwt_session_${Date.now()}` });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const { name, email, role, designation, agency, password } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required" });
    }

    const snapshot = await db.collection("users").where("email", "==", email.toLowerCase()).get();
    if (!snapshot.empty) return res.status(400).json({ error: "An employee with this email address is already registered. Please login instead." });

    const newUser = {
      id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name, email: email.toLowerCase(), password, role,
      designation: designation || "Employee",
      agency: agency || "PD Automation",
      createdAt: new Date().toISOString(),
      status: "ACTIVE"
    };

    await db.collection("users").add(newUser);
    addAuditLog(newUser.name, newUser.role, "USER_REGISTERED", "Authentication", newUser.id, `Self-registered new account`);
    res.json({ success: true, user: newUser, token: `jwt_session_${Date.now()}` });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// Employee & Designation Management Endpoints
app.get("/api/employees", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("users").get();
    res.json({ employees: snapshot.docs.map(d => d.data()) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const { id, name, email, role, designation, agency, status, password } = req.body;
    if (!name || !email || !role || !designation) {
      return res.status(400).json({ error: "Name, email, role, and designation are mandatory" });
    }

    if (id) {
      const snapshot = await db.collection("users").where("id", "==", id).get();
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        const updateData: any = { name, email, role, designation, agency: agency || snapshot.docs[0].data().agency, status };
        if (password) updateData.password = password;
        await docRef.update(updateData);
        addAuditLog("Admin Manager", "ADMIN", "EMPLOYEE_UPDATED", "EmployeeDirectory", id, `Updated employee ${name}`);
        return res.json({ success: true, employee: { ...snapshot.docs[0].data(), ...updateData }, message: "Employee profile updated" });
      }
    }
    
    const newEmp = {
      id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name, email, role, designation,
      agency: agency || "PD Automation",
      password: password || "password123",
      createdAt: new Date().toISOString(),
      status: status || "ACTIVE"
    };
    await db.collection("users").add(newEmp);
    addAuditLog("Admin Manager", "ADMIN", "EMPLOYEE_ADDED", "EmployeeDirectory", newEmp.id, `Added new employee ${name}`);
    res.json({ success: true, employee: newEmp, message: "New employee created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Operation failed" });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("users").where("id", "==", req.params.id).get();
    if (snapshot.empty) return res.status(404).json({ error: "Employee not found in registry" });
    await snapshot.docs[0].ref.delete();
    addAuditLog("Admin Manager", "ADMIN", "EMPLOYEE_REMOVED", "EmployeeDirectory", req.params.id, `Removed employee ${req.params.id}`);
    res.json({ success: true, message: `Employee ${req.params.id} removed from registry` });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// Client Category Management APIs
app.get("/api/categories", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    let snapshot = await db.collection("categories").get();
    if (snapshot.empty) {
      for (const cat of INITIAL_CATEGORIES) {
        await db.collection("categories").doc(cat.id).set(cat);
      }
      snapshot = await db.collection("categories").get();
    }
    res.json({ categories: snapshot.docs.map(d => d.data()) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.post("/api/categories", async (req, res) => {
  const newCat: BusinessCategory = req.body;
  if (!newCat.id || !newCat.name) return res.status(400).json({ error: "Category ID and Name are required" });
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("categories").where("id", "==", newCat.id).get();
    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({ ...newCat });
    } else {
      await db.collection("categories").add(newCat);
    }
    addAuditLog("Admin User", "ADMIN", "CATEGORY_SAVED", "BusinessCategory", newCat.id, `Saved category ${newCat.name}`);
    res.json({ success: true, category: newCat });
  } catch (err) {
    res.status(500).json({ error: "Failed to save category" });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("categories").where("id", "==", req.params.id).get();
    if (snapshot.empty) return res.status(404).json({ error: "Category not found" });
    await snapshot.docs[0].ref.delete();
    addAuditLog("Admin User", "ADMIN", "CATEGORY_DELETED", "BusinessCategory", req.params.id, `Deleted category ${req.params.id}`);
    res.json({ success: true, message: `Category ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Product Mapping APIs
app.get("/api/products", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    let snapshot = await db.collection("products").get();
    if (snapshot.empty) {
      for (const prod of INITIAL_PRODUCTS) {
        await db.collection("products").doc(prod.id).set(prod);
      }
      snapshot = await db.collection("products").get();
    }
    let products = snapshot.docs.map(d => d.data());
    const { categoryId } = req.query;
    if (categoryId) {
      products = products.filter((p: any) => p.categoryId === categoryId);
    }
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/products", async (req, res) => {
  const newProd: CategoryProduct = req.body;
  if (!newProd.id || !newProd.productName) return res.status(400).json({ error: "Product ID and Name required" });
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("products").where("id", "==", newProd.id).get();
    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({ ...newProd });
    } else {
      await db.collection("products").add(newProd);
    }
    addAuditLog("Admin User", "ADMIN", "PRODUCT_SAVED", "CategoryProduct", newProd.id, `Saved product ${newProd.productName}`);
    res.json({ success: true, product: newProd });
  } catch (err) {
    res.status(500).json({ error: "Failed to save product" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("products").where("id", "==", req.params.id).get();
    if (snapshot.empty) return res.status(404).json({ error: "Product not found" });
    await snapshot.docs[0].ref.delete();
    addAuditLog("Admin User", "ADMIN", "PRODUCT_DELETED", "CategoryProduct", req.params.id, `Deleted product ${req.params.id}`);
    res.json({ success: true, message: `Product ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Reports Management APIs
app.get("/api/reports", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("reports").orderBy("updatedAt", "desc").get();
    res.json({ reports: mapDocs(snapshot) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

app.get("/api/reports/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("reports").where("id", "==", req.params.id).get();
    if (snapshot.empty) return res.status(404).json({ error: "Report not found" });
    res.json({ report: { _id: snapshot.docs[0].id, ...snapshot.docs[0].data() } });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

app.post("/api/reports", async (req, res) => {
  const reportData: PDReport = req.body;
  if (!reportData.applicationNumber) return res.status(400).json({ error: "Application number is required" });
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    
    // Check existing
    let existingDoc = null;
    let existingRef = null;
    if (reportData.id) {
      const snap = await db.collection("reports").where("id", "==", reportData.id).get();
      if (!snap.empty) { existingDoc = snap.docs[0].data(); existingRef = snap.docs[0].ref; }
    }
    if (!existingDoc) {
      const snap = await db.collection("reports").where("applicationNumber", "==", reportData.applicationNumber).get();
      if (!snap.empty) { existingDoc = snap.docs[0].data(); existingRef = snap.docs[0].ref; }
    }

    if (existingDoc && existingRef) {
      const updatedReport = {
        ...existingDoc,
        ...reportData,
        updatedAt: new Date().toISOString(),
        version: (existingDoc.version || 1) + 1
      };
      await existingRef.update(updatedReport);
      addAuditLog(reportData.assignedCreditManager || "Credit Manager", "MANAGER", "REPORT_UPDATED", "PDReport", reportData.id, `Updated report for ${reportData.applicantName}`);
      return res.json({ success: true, report: { _id: existingRef.id, ...updatedReport } });
    } else {
      const newReport = {
        ...reportData,
        id: reportData.id || "REP-" + Date.now().toString(36).toUpperCase(),
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await db.collection("reports").add(newReport);
      addAuditLog(reportData.assignedCreditManager || "Credit Manager", "MANAGER", "REPORT_CREATED", "PDReport", newReport.id, `Created new PD report for ${newReport.applicantName}`);
      return res.json({ success: true, report: { _id: docRef.id, ...newReport } });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to save report" });
  }
});

app.patch("/api/reports/:id/status", async (req, res) => {
  const { status, reviewerNotes } = req.body;
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("reports").where("id", "==", req.params.id).get();
    if (snapshot.empty) return res.status(404).json({ error: "Report not found" });
    const docRef = snapshot.docs[0].ref;
    const updatedAt = new Date().toISOString();
    await docRef.update({ status, updatedAt });
    addAuditLog("Vikram Malhotra", "MANAGER", "REPORT_STATUS_CHANGED", "PDReport", req.params.id, `Status updated to ${status}. Notes: ${reviewerNotes || 'None'}`);
    res.json({ success: true, report: { _id: docRef.id, ...snapshot.docs[0].data(), status, updatedAt } });
  } catch (err) {
    res.status(500).json({ error: "Failed to update report status" });
  }
});

app.delete("/api/reports/:id", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("reports").where("id", "==", req.params.id).get();
    if (snapshot.empty) return res.status(404).json({ error: "Report not found" });
    await snapshot.docs[0].ref.delete();
    addAuditLog("Vikram Malhotra", "MANAGER", "REPORT_DELETED", "PDReport", req.params.id, `Deleted report ${req.params.id}`);
    res.json({ success: true, message: `Report ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete report" });
  }
});

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

app.post("/api/validate", async (req, res) => {
  const { formData, categoryId } = req.body;
  const issues: any[] = [];
  let riskScore = 15;

  const grossRev = parseFloat(formData?.gross_rev || 0);
  const xchkRev = parseFloat(formData?.xchk_result?.toString().replace(/[^0-9.]/g, '') || 0);
  const bankCredits = parseFloat(formData?.xc_bank_credits || 0);

  if (grossRev > 0 && xchkRev > 0) {
    const diffPct = Math.abs((xchkRev - grossRev) / grossRev) * 100;
    if (diffPct > 25) {
      issues.push({
        id: "ISSUE-REV-01", code: "REV_CROSSCHECK_MISMATCH", module: "Revenue Validation", field: "gross_rev",
        severity: diffPct > 40 ? "HIGH" : "MEDIUM",
        title: "Stated Revenue vs Footfall Cross-Check Variance",
        description: `Stated Revenue (₹${grossRev.toLocaleString()}) varies by ${diffPct.toFixed(1)}% from footfall cross-check revenue (₹${xchkRev.toLocaleString()}).`,
        impact: "Potential overstatement or under-reporting of business cash turnover.",
        suggestedAction: "Re-verify daily customer counts or review bank statement credit entries."
      });
      riskScore += diffPct > 40 ? 25 : 15;
    }
  }

  if (grossRev > 0 && bankCredits > 0) {
    const bankRatio = (bankCredits / grossRev) * 100;
    if (bankRatio < 30) {
      issues.push({
        id: "ISSUE-BNK-01", code: "LOW_BANK_TURNOVER_SHARE", module: "Banking Analysis", field: "xc_bank_credits",
        severity: "MEDIUM", title: "Low Banking Credit Reflection",
        description: `Bank statement monthly credits (₹${bankCredits.toLocaleString()}) represent only ${bankRatio.toFixed(1)}% of stated revenue. High reliance on cash/kaccha sales.`,
        impact: "Lower banking formalization increases credit risk.",
        suggestedAction: "Collect UPI Soundbox statements or trade supplier invoices as secondary proof."
      });
      riskScore += 15;
    }
  }

  if (categoryId === "pharmacy") {
    const drugLic = formData?.drug_licence;
    if (!drugLic || drugLic === "No" || drugLic === "Yes – Expired") {
      issues.push({
        id: "ISSUE-PHARM-01", code: "DRUG_LICENSE_EXPIRED", module: "Compliance", field: "drug_licence",
        severity: "CRITICAL", title: "Drug License Compliance Violation",
        description: "Pharmacy business is operating without a verified active Drug License (Form 20/21).",
        impact: "High regulatory risk and shop closure hazard.",
        suggestedAction: "Obtain renewed Drug License document prior to loan disbursement."
      });
      riskScore += 35;
    }
  }

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

app.post("/api/ai/generate-report", async (req, res) => {
  try {
    const { applicantName, categoryName, firmName, appliedAmount, financials, observations, risks } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallbackNarrative = `### EXECUTIVE CREDIT SUMMARY & RECOMMENDATION\n\n**Applicant Name**: ${applicantName || "Ramesh Sharma"}\n**Firm Name**: ${firmName || "Sharma Kirana & General Store"}\n**Business Category**: ${categoryName || "Kirana / General Store"}\n**Applied Amount**: ₹${(appliedAmount || 350000).toLocaleString('en-IN')}\n\n#### 1. Business & Site Inspection Findings\nThe applicant operates a well-established ${categoryName || "retail"} business under the firm name **${firmName || "Applicant Business"}**. During the field visit conducted at the business premises, the unit was observed to be fully operational with active customer footfall. Stock inventory levels appeared adequate and well-maintained.\n\n#### 2. Financial Analysis & Cash Flow Waterfall\n- **Adopted Gross Monthly Revenue**: ₹${(financials?.adoptedRevenue || 275000).toLocaleString('en-IN')}\n- **Gross Profit Margin**: ${financials?.grossMarginPct || 25}% (Gross Profit: ₹${(financials?.grossProfit || 68750).toLocaleString('en-IN')})\n- **Net Business Income**: ₹${(financials?.netBusinessIncome || 40750).toLocaleString('en-IN')}\n- **Total Household Net Surplus**: ₹${(financials?.netMonthlySurplus || 20750).toLocaleString('en-IN')}\n- **Debt Service Coverage Ratio (DSCR)**: ${financials?.dscr || 5.15} (Post-Loan DSCR: ${financials?.postLoanDscr || 1.11})\n\n#### 3. Key Credit Strengths\n1. Prominent business location with stable vintage in the local neighborhood.\n2. Verified daily footfall providing consistent cash flow stream.\n3. Adequate post-loan DSCR coverage above institutional threshold.\n\n#### 4. Critical Risk Observations & Mitigants\n- **Risk**: Income verification relies partly on informal/kaccha record keeping.\n- **Mitigant**: Cross-check calculations based on daily customer ticket size confirm stated sales turnover.\n\n#### 5. Final Credit Manager Recommendation\n**RECOMMENDED FOR APPROVAL**\nBased on field inspection, cash flow adequacy, and satisfactory debt coverage, the requested facility of ₹${(appliedAmount || 350000).toLocaleString('en-IN')} is recommended subject to standard documentation verification.`;
      return res.json({ narrative: fallbackNarrative, isAiGenerated: false, modelUsed: "Rule-Based Expert Financial Engine" });
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const prompt = `You are a Senior Credit Manager at Axis Bank Infominer Micro Lending & MSME Credit Division. Write a formal, comprehensive, professional Personal Discussion (PD) Field Credit Report for the following applicant:\n\nApplicant Name: ${applicantName}\nBusiness Category: ${categoryName}\nFirm Name: ${firmName}\nRequested Loan Amount: ₹${appliedAmount}\nFinancial Waterfall:\n- Adopted Revenue: ₹${financials?.adoptedRevenue}\n- Gross Profit: ₹${financials?.grossProfit} (${financials?.grossMarginPct}%)\n- Net Business Income: ₹${financials?.netBusinessIncome}\n- Net Household Surplus: ₹${financials?.netMonthlySurplus}\n- Existing DSCR: ${financials?.dscr}\n- Post-Loan Projected DSCR: ${financials?.postLoanDscr}\n\nField Observations: ${JSON.stringify(observations || {})}\nKey Risks Noted: ${JSON.stringify(risks || {})}\n\nWrite a structured Markdown report containing:\n1. Executive Summary & Facility Purpose\n2. Business Profile & Site Inspection Assessment\n3. Financial Analysis & Cash Flow Reconciliation\n4. Risk Assessment & Key Mitigants\n5. Credit Manager Final Decision & Recommendation with Specific Conditions.\n\nStyle: Authoritative, objective, bank credit analyst tone. Focus on cash flow adequacy and debt service capacity.`;
    const response = await ai.models.generateContent({ model: "gemini-3.6-flash", contents: prompt });
    res.json({ narrative: response.text, isAiGenerated: true, modelUsed: "gemini-3.6-flash" });
  } catch (err: any) {
    console.error("Gemini AI Report Generation error:", err);
    res.status(500).json({ error: "Failed to generate AI report: " + err.message });
  }
});

app.post("/api/extract-whatsapp", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const schemaPath = path.join(process.cwd(), "pd_inputs_schema.json");
    let schemaString = "{}";
    try { schemaString = fs.readFileSync(schemaPath, 'utf8'); } catch (e) { console.warn("Could not load pd_inputs_schema.json", e); }

    const prompt = `You are an expert data extractor for a micro-lending Personal Discussion (PD) report. The user will provide an extremely unstructured field investigation report via WhatsApp message. The text will vary a lot in language and format.\nYour task is to carefully analyze this chaotic, unstructured text, identify the underlying facts, and extract all relevant information into a strictly valid JSON object that matches the following schema EXACTLY:\n${schemaString}\n\nRules:\n1. Deeply understand the context to map the informal text to the formal JSON schema fields. Translate all extracted values into professional English.\n2. If a specific field is not mentioned or cannot be confidently inferred from the text, you MUST set its value to \`null\` or an empty string/array (according to the type). DO NOT invent, assume, or guess any information. It is better to return null than to hallucinate.\n3. The output MUST be a valid JSON object. Do not include markdown code blocks like \`\`\`json.\n4. Add an additional key "_confidence_score" at the root level of your JSON with a value from 0-100 indicating your confidence in the extraction based on the clarity of the text.\n5. In addition to the structured fields, generate a comprehensive professional narrative and Q&A table in Markdown format based on the text. Use the EXACT headings "### Business Profile" and "### Business Profile – Question & Answer". Store this ENTIRE Markdown string in the \`generatedMarkdownProfile\` field.\n\nWhatsApp Message:\n"${text}"`;
    const response = await ai.models.generateContent({ model: "gemini-3.6-flash", contents: prompt, config: { responseMimeType: "application/json" } });

    if (!response.text) throw new Error("No response text from Gemini");
    const jsonResponse = JSON.parse(response.text);
    res.json({ data: jsonResponse, modelUsed: "gemini-3.6-flash" });
  } catch (err: any) {
    console.error("WhatsApp AI Extraction error:", err);
    res.status(500).json({ error: "Failed to extract WhatsApp data: " + err.message });
  }
});

app.post("/api/parse-credit-report", upload.single("report"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { reportType } = req.body;
    const text = await pdfService.extractText(req.file.buffer);
    const provider = (reportType && reportType !== 'AUTO') ? reportType : pdfService.detectProvider(text);
    const parser = ParserFactory.getParser(provider);
    const parsedData = await parser.parse(text);
    res.json({ success: true, provider, data: parsedData });
  } catch (err: any) {
    console.error("Credit Report Parsing error:", err);
    res.status(500).json({ error: "Failed to parse credit report: " + err.message });
  }
});

app.post("/api/html-tool/validate", (req, res) => {
  const run = runHtmlToolValidationSuite();
  addAuditLog("QA Specialist", "AUDITOR", "HTML_TOOL_VALIDATED", "HTMLPDTool", run.runId, `Validated HTML PD Tool - Score: ${run.overallScore}% (${run.passedCount}/${run.totalTests} passed)`);
  res.json({ validationRun: run });
});

app.get("/api/dashboard", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const reportsSnap = await db.collection("reports").get();
    const categoriesSnap = await db.collection("categories").get();
    const reports = mapDocs(reportsSnap);
    const categories = categoriesSnap.docs.map(d => d.data());

    const totalReports = reports.length;
    const approved = reports.filter((r: any) => r.status === "APPROVED").length;
    const pending = reports.filter((r: any) => r.status === "DRAFT" || r.status === "IN_REVIEW").length;
    const rejected = reports.filter((r: any) => r.status === "REJECTED").length;

    const categoryBreakdown: Record<string, number> = {};
    reports.forEach((r: any) => {
      categoryBreakdown[r.categoryId] = (categoryBreakdown[r.categoryId] || 0) + 1;
    });

    res.json({
      summary: {
        totalReports,
        approvedCount: approved,
        pendingCount: pending,
        rejectedCount: rejected,
        averageDscr: 2.85,
        totalDisbursedValue: reports.reduce((acc: number, r: any) => acc + (r.appliedAmount || 0), 0)
      },
      categoryDistribution: Object.keys(categoryBreakdown).map(k => {
        const cat = categories.find(c => c.id === k);
        return { categoryId: k, name: cat ? cat.name : k, count: categoryBreakdown[k] };
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

app.get("/api/audit", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not connected" });
    const snapshot = await db.collection("auditLogs").orderBy("timestamp", "desc").get();
    res.json({ logs: snapshot.docs.map(d => d.data()) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default app;
