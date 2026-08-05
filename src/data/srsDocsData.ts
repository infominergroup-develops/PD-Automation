export interface DocSection {
  id: string;
  title: string;
  category: 'SRS' | 'ARCHITECTURE' | 'DATABASE' | 'API' | 'TESTING' | 'DEPLOYMENT' | 'MANUALS';
  content: string;
}

export const SRS_DOCUMENTS: DocSection[] = [
  {
    id: 'srs-01',
    title: '1. Software Requirement Specification (SRS)',
    category: 'SRS',
    content: `
# Software Requirement Specification (SRS)
## Personal Discussion (PD) Report Automation System

### 1.1 Scope & Purpose
The Personal Discussion (PD) Report Automation System is designed for financial institutions to digitize, validate, and automate credit field investigations for Infominer Micro Lending, Business Loans, and MSME Credit Assessment. It bridges field observations, applicant interviews, financial cross-checks, and credit manager risk scoring into AI-generated credit reports.

### 1.2 User Roles & Permissions
- **Admin**: Configures business categories, product catalogs, risk rules, margin thresholds, and manages user credentials.
- **Credit Manager (CM)**: Conducts field visits, reviews auto-calculated financial waterfalls, performs risk assessment, generates AI credit reports, and signs off recommendations.
- **Field Officer**: Captures field data, photos, EXIF GPS coordinates, customer/supplier references, and submits applications.
- **Auditor**: Views audit logs, validation test suite runs, report revisions, and compliance logs in read-only mode.

### 1.3 Functional Requirements
- **FR-01 (Category Engine)**: Support 21 pre-configured business categories (Kirana, Hardware, Apparel, Pharmacy, Transport, Restaurant, etc.) with category-specific cross-checks and product mappings.
- **FR-02 (Financial Analysis)**: Auto-calculate Gross Profit, Net Business Income, Household Surplus, Debt Service Coverage Ratio (DSCR), and FOIR.
- **FR-03 (Validation & Risk Engine)**: Auto-detect footfall anomalies, bank credit vs gross revenue mismatches, and compliance flags (e.g. Drug License expiry).
- **FR-04 (AI Report Generator)**: Server-side Gemini API integration to synthesize professional credit analyst narrative reports.
- **FR-05 (HTML Tool Validation)**: Automated test suite runner evaluating the raw HTML PD Tool for mandatory field coverage, formula accuracy, and print layout.
    `
  },
  {
    id: 'arch-01',
    title: '2. High-Level & Low-Level System Architecture',
    category: 'ARCHITECTURE',
    content: `
# High-Level Architecture (HLA)

\`\`\`
[ Client Layer: React 19 + TypeScript + Tailwind CSS + Motion ]
            │
            ▼ (REST APIs via JSON)
[ Express API Server Layer (Port 3000 / Node.js ESM) ]
  ├── /api/auth          ── Role-Based Access Control
  ├── /api/categories    ── Dynamic Category & Rule Management
  ├── /api/products      ── Product Catalog & Margin Engine
  ├── /api/reports       ── PD Report Persistence & History
  ├── /api/validate      ── Business Consistency & Risk Scoring Engine
  ├── /api/ai/report     ── Gemini 3.6 Flash Server-Side AI Report Synthesis
  ├── /api/html-tool     ── Automated HTML Tool Testing Framework
  ├── /api/dashboard     ── Portfolio Metrics & Risk Analytics
  └── /api/audit         ── Audit Logging & Revision Tracking
            │
            ▼
[ Persistence Layer: PostgreSQL / Firestore Abstraction ]
\`\`\`

## Key Architectural Principles
- **Clean Architecture**: Separation of concerns between UI views, REST controllers, business domain logic, and data repositories.
- **Lazy Initialization**: Gemini SDK initialized lazy per request using process.env.GEMINI_API_KEY with 'User-Agent': 'aistudio-build'.
- **Resilient Fallback**: Built-in fallback rule engine if external AI services are unreachable.
    `
  },
  {
    id: 'db-01',
    title: '3. Normalized Database Schemas & ER Diagram',
    category: 'DATABASE',
    content: `
# Database Schema Design (PostgreSQL / Relational Normalized)

\`\`\`sql
-- Users & Roles
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('ADMIN', 'CREDIT_MANAGER', 'FIELD_OFFICER', 'AUDITOR')),
  agency_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Categories
CREATE TABLE business_categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(16),
  description TEXT,
  industry_group VARCHAR(128),
  typical_margin_min NUMERIC(5,2),
  typical_margin_max NUMERIC(5,2),
  required_docs JSONB,
  validation_rules JSONB,
  risk_parameters JSONB
);

-- Products Mapping
CREATE TABLE category_products (
  id VARCHAR(64) PRIMARY KEY,
  category_id VARCHAR(64) REFERENCES business_categories(id),
  product_name VARCHAR(255) NOT NULL,
  product_category VARCHAR(128),
  revenue_contribution_pct NUMERIC(5,2),
  inventory_type VARCHAR(64),
  average_margin_pct NUMERIC(5,2),
  business_importance VARCHAR(32)
);

-- Applicant PD Reports
CREATE TABLE pd_reports (
  id VARCHAR(64) PRIMARY KEY,
  application_number VARCHAR(128) UNIQUE NOT NULL,
  applicant_name VARCHAR(255) NOT NULL,
  category_id VARCHAR(64) REFERENCES business_categories(id),
  product VARCHAR(128),
  scheme VARCHAR(128),
  applied_amount NUMERIC(12,2),
  tenure_months INT,
  purpose VARCHAR(255),
  visit_date DATE,
  status VARCHAR(32) DEFAULT 'DRAFT',
  assigned_officer VARCHAR(255),
  assigned_credit_manager VARCHAR(255),
  financials JSONB,
  risk_result JSONB,
  photos JSONB,
  ai_narrative TEXT,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(64),
  user_name VARCHAR(255),
  user_role VARCHAR(32),
  action VARCHAR(128),
  resource VARCHAR(128),
  resource_id VARCHAR(64),
  details TEXT,
  ip_address VARCHAR(64)
);
\`\`\`
    `
  },
  {
    id: 'api-01',
    title: '4. REST API Specifications',
    category: 'API',
    content: `
# REST API Documentation

### Auth Endpoints
- \`POST /api/auth/login\` : Authenticates user credentials and returns JWT token + user profile.
- \`GET /api/auth/me\` : Returns authenticated user role and session state.

### Category & Product Endpoints
- \`GET /api/categories\` : Retrieves all 21 business categories and business rules.
- \`POST /api/categories\` : (Admin) Adds or updates a business category dynamically.
- \`GET /api/products?categoryId={id}\` : Lists product mapping catalog for a category.
- \`POST /api/products\` : (Admin) Adds new product mapping item.

### Report Management
- \`GET /api/reports\` : Returns paginated list of PD reports with filtering by status & category.
- \`POST /api/reports\` : Creates or updates a PD report draft.
- \`GET /api/reports/:id\` : Fetches full PD report data.

### Financial Validation & AI Synthesis
- \`POST /api/validate\` : Evaluates financial waterfall, footfall vs revenue, and flags risk anomalies.
- \`POST /api/ai/generate-report\` : Invokes server-side Gemini 3.6 Flash to compile a credit manager recommendation report.

### Testing & Audit
- \`POST /api/html-tool/validate\` : Runs automated test suite on the raw HTML PD Tool.
- \`GET /api/dashboard\` : Returns aggregate executive metrics (risk distribution, productivity, DSCR averages).
- \`GET /api/audit\` : Fetches audit log records.
    `
  },
  {
    id: 'test-01',
    title: '5. Testing Strategy & Quality Assurance',
    category: 'TESTING',
    content: `
# Testing Plan & Strategy (Target: 90%+ Test Coverage)

### Test Levels
1. **Unit Testing**: Mathematical verification of Cash Flow Waterfall (Gross Margin, Net Income, DSCR = Surplus / EMI, Post-loan DSCR).
2. **Integration Testing**: End-to-end API validation from report draft submission to Risk Engine analysis.
3. **HTML Tool Automation**: Automated test runner executing TC-01 through TC-12 checking field bindings, EXIF GPS parsing, photo classifier keywords, and print media CSS.
4. **AI Output Quality Assurance**: Prompt formatting tests ensuring AI reports maintain formal Credit Manager tone, highlighting strengths, weaknesses, and clear recommendations.
    `
  },
  {
    id: 'manuals-01',
    title: '6. User & Admin Manuals',
    category: 'MANUALS',
    content: `
# User & Admin Operating Manual

## Credit Manager / Field Officer Guide
1. **Selecting Profile**: Click on the relevant Business Profile card (e.g., Kirana, Hardware, Pharmacy) on the form home screen.
2. **Filling Details**: Complete Sections 0 to 11. Fields marked with asterisks or yellow highlights are critical.
3. **Revenue Cross-Check**: Fill in customer footfall, average ticket size, and operating days to auto-calculate cross-check revenue.
4. **Cash Flow Waterfall**: Review Adopted Revenue vs Stated Revenue variance. Enter expense percentages to auto-populate absolute amounts.
5. **Photo Upload**: Drag and drop site photos in Section 12. The Document Photo Classifier will auto-tag photos and parse GPS EXIF data.
6. **AI Report Studio**: Go to "AI Report Generator" tab to generate a credit manager executive summary via Gemini AI, then print or download PDF.

## Admin Manual
1. **Category Management**: Access "Category & Products Admin" tab to modify margin thresholds, required documents, or add new business profiles.
2. **Product Catalog**: Add products, assign margins, and set inventory movement speeds per category.
3. **HTML Tool Validation**: Access "HTML Validation Studio" and click "Run Full Test Suite" to verify system health before deployment.
    `
  }
];
