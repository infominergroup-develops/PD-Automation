# Infominer Personal Discussion (PD) Automator

> **An enterprise-grade B2B fintech SaaS for automating field investigation and credit underwriting reports for MSME loans.**

---

## 2. Project Overview

**What this software is:**
The Infominer PD Automator is a full-stack web application designed to streamline the Personal Discussion (PD) process for micro, small, and medium enterprise (MSME) lending. It provides a comprehensive suite of tools for credit managers and field officers to assess business financials, capture field investigation proofs, and generate institutional-grade credit reports.

**Why it was built & Business Problem:**
Traditional credit underwriting relies heavily on manual data entry, scattered field notes, and subjective financial analysis, leading to high turnaround times (TAT) and errors. This software digitizes the entire workflow, enforcing policy compliance (e.g., DSCR, FOIR) and automating the generation of PDF reports.

**Target Users & Domain:**
- **Users:** Credit Managers, Field Investigation Officers, and System Administrators.
- **Domain:** Fintech, Banking, and NBFC (Non-Banking Financial Companies) Credit Underwriting.

**High-Level Architecture:**
The application operates as a Single Page Application (SPA) built with React and TailwindCSS on the frontend. It is served by a Node.js/Express backend that communicates directly with a MongoDB database. The system also integrates Google's Gemini AI to synthesize field notes into executive summaries.

---

## 3. Objectives

- **Primary Objectives:** Digitize and automate the MSME loan Personal Discussion (PD) workflow.
- **Business Goals:** Reduce credit report generation TAT, enforce institutional lending policies, and minimize human error in financial calculations.
- **Technical Goals:** Provide a responsive, real-time auto-saving interface with dynamic "Waterfall" cash flow engines and custom PDF generation.
- **Long-term Vision:** Become a multi-tenant SaaS platform integrating with major core banking systems, providing AI-driven risk scoring and automated cloud document backups (e.g., Google Drive).
- **Expected Benefits:** Faster loan approvals, standardized audit trails, and improved underwriting accuracy.

---

## 4. Features

### Authentication & Role Management
- **Purpose:** Secure the application and enforce access control.
- **How it works:** Users log in with an email/password. The backend validates credentials and returns a session role (`ADMIN`, `MANAGER`, `EMPLOYEE`). The UI adapts based on these roles (e.g., only Managers can force-approve loans or add new employees).
- **Pages:** `AuthView.tsx`, `EmployeeManagementView.tsx`.
- **Related APIs:** `POST /api/auth/login`.

### PD Tool & Waterfall Cash Flow Engine
- **Purpose:** Capture granular business financials and calculate debt service capacity.
- **How it works:** Real-time syncing of variables (daily footfall, ticket size, working days) into an itemized Income/Expense Waterfall. Automatically calculates DSCR and FOIR.
- **Pages:** `PDToolView.tsx`.
- **Related APIs:** `PATCH /api/clients/:clientId/applicants/:appId`.

### Field Investigation & Photo Upload
- **Purpose:** Capture on-site proof of business existence.
- **How it works:** Employees upload photos of signboards and inventory. The backend simulates EXIF extraction to append GPS coordinates.
- **Pages:** `PDToolView.tsx`.
- **Related APIs:** `POST /api/upload/photo`.

### AI Executive Summary
- **Purpose:** Standardize credit officer notes.
- **How it works:** Pushes raw financial metrics and field observations to Google Gemini AI to generate a professional underwriting summary.
- **Pages:** `AIReportGeneratorView.tsx`, `PDToolView.tsx`.
- **Related APIs:** `POST /api/ai/generate-summary`.

### PDF Report Generation & Printing
- **Purpose:** Export physical/digital reports for bank credit committees.
- **How it works:** Injects state data into raw HTML templates and triggers the browser's native `window.print()` functionality to generate formatted PDFs (including custom client formats like Moneyboxx).
- **Pages:** `pdReportPrinter.ts`.

### AI Chatbot & Editable QnA Autofill
- **Purpose:** Provide a seamless way to populate text-heavy QnA inputs.
- **How it works:** A collapsible chatbot interface allows users to paste markdown-formatted QnA text. The tool automatically parses the tables and populates corresponding editable text areas across the PD form, reducing manual data entry while maintaining user editability prior to printing.
- **Pages:** `PDToolView.tsx`.

---

## 5. Current Implementation Status

| Feature | Status | Description | Pending Improvements |
|---------|--------|-------------|----------------------|
| **Authentication** | Completed | Role-based login and UI rendering. | Implement JWT backend validation. |
| **PD Tool (Waterfall)** | Completed | Auto-calculates financials and auto-saves to DB. | Break down monolithic component. |
| **Photo Upload** | Completed | Base64 upload with simulated EXIF. | Migrate storage to AWS S3. |
| **PDF Generation** | Completed | Multi-format HTML-to-PDF printing. | Implement Google Drive Auto-Sync. |
| **Role Management** | Completed | Manager/Admin hierarchies enforced. | Add granular permission tables. |

---

## 6. Project Workflow

1. **Login:** User accesses `/`, enters credentials. `AuthView` sends `POST /api/auth/login`. On success, state is elevated to `App.tsx`.
2. **Company Selection:** User selects their internal operating company (e.g., Infominer).
3. **Dashboard:** User views aggregate metrics and selects an action (e.g., "Start New PD").
4. **Client Selection:** User selects the Client Bank (e.g., Axis, Moneyboxx).
5. **Applicant Search/Load:** User searches for a loan application in `PDToolView`.
6. **Field Investigation:** Employee edits borrower details, inputs footfall data, and uploads photos. The UI auto-saves via `PATCH /api/clients/:clientId/applicants/:appId`.
7. **Waterfall Analysis:** The engine recalculates margins and DSCR in real-time.
8. **Report Generation:** Manager reviews the AI summary and clicks "Print Report", triggering `pdReportPrinter.ts` to generate the PDF.

---

## 7. Folder Structure

```
├── .env                  # Environment configurations
├── package.json          # Project dependencies and scripts
├── server.ts             # Express.js backend entry point & API routes
├── seed.ts               # Database seeding script
├── src/
│   ├── App.tsx           # Main React component (State & Custom Routing)
│   ├── index.css         # TailwindCSS entry and global styles
│   ├── main.tsx          # React DOM mounting
│   ├── components/       # React UI Components
│   │   ├── AuthView.tsx  # Login screen
│   │   ├── PDToolView.tsx # Core Personal Discussion underwriting interface
│   │   ├── DashboardView.tsx # Analytics and landing page
│   │   └── ...           # Other modular views
│   ├── data/             # Static configurations and mock data fallbacks
│   ├── services/
│   │   └── api.ts        # Frontend HTTP client wrapper for backend APIs
│   ├── types.ts          # Global TypeScript interfaces and types
│   └── utils/
│       └── pdReportPrinter.ts # HTML/PDF template generation logic
```

---

## 8. Technology Stack

| Category | Technology | Why it is used |
|----------|------------|----------------|
| **Frontend** | React 19, Vite | Fast HMR, component-based UI, modern SPA standards. |
| **Styling** | TailwindCSS 4 | Rapid, utility-first responsive styling without external CSS files. |
| **Icons & Charts**| Lucide-React, Recharts | Consistent SVG iconography and dynamic data visualization. |
| **Backend** | Node.js, Express | Lightweight, unopinionated server to handle APIs and serve static assets. |
| **Database** | MongoDB | Flexible NoSQL schema suited for varying financial document structures. |
| **AI Integration**| Google GenAI (@google/genai) | Powerful LLM for natural language processing of credit summaries. |
| **PDF Export** | Browser `window.print()` | Ensures pixel-perfect HTML rendering for complex financial tables. |

---

## 9. Backend Architecture

- **Routing & Controllers:** Consolidated in `server.ts`. Express routes define RESTful paths (`/api/*`) and immediately execute controller logic using async/await.
- **Database Connection:** Native `MongoClient` is instantiated on startup and shared globally.
- **Error Handling:** Standard `try/catch` blocks returning `500` status codes with JSON error messages.
- **Request Flow:** Express receives HTTP request -> Parses JSON body -> Validates via DB -> Mutates DB -> Returns JSON.

---

## 10. Frontend Architecture

- **State Management:** Lifted state via React `useState` at the `App.tsx` level (for authentication and navigation), and local state in complex components like `PDToolView.tsx` (for form fields).
- **Routing:** A custom `popstate` event listener approach is currently used in `App.tsx` to handle browser navigation instead of a dedicated library like `react-router-dom`.
- **Hooks:** Extensive use of `useEffect` for real-time auto-saving (debounced) and `useMemo` for derived financial calculations.

---

## 11. Database

**Current Implementation:** MongoDB Atlas (Cloud NoSQL).
**Collections:**
- `clients`: Client Bank configurations and formatting preferences.
- `applicants`: Loan applications containing nested financial data, addresses, and Base64 photos.
- `users`: Employee credentials and roles.

**Recommendations:** 
Move Base64 photo payloads out of the MongoDB documents and into a dedicated object storage (AWS S3), storing only the URL in MongoDB to prevent document bloat.

---

## 12. APIs

| Method | URL | Purpose | Body / Params | Authentication |
|--------|-----|---------|---------------|----------------|
| `POST` | `/api/auth/login` | Authenticate users | `{ email, password }` | None |
| `GET` | `/api/clients` | List all client banks | N/A | None (Implicit) |
| `GET` | `/api/clients/:clientId/applicants` | List applicants for a bank | URL Params | None (Implicit) |
| `POST`| `/api/clients/:clientId/applicants` | Create new applicant | JSON Applicant Object | None (Implicit) |
| `PATCH`| `/api/clients/:clientId/applicants/:appId`| Auto-save applicant edits | JSON Applicant Update | None (Implicit) |
| `POST` | `/api/upload/photo` | Simulate EXIF extraction | `{ fileName, base64Data, lat, lng }` | None (Implicit) |
| `POST` | `/api/ai/generate-summary` | Generate AI summary | Prompt variables | None (Implicit) |

---

## 13. Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server running port | No | `3000` |
| `MONGODB_URI` | Connection string for DB | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/`|
| `GEMINI_API_KEY`| API Key for Google GenAI | Yes | `AIzaSyB...` |

---

## 14. Dependencies

**Frontend Core:** `react`, `react-dom`, `vite`
**UI & Styling:** `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `recharts`, `motion`
**Backend Core:** `express`, `mongodb`, `dotenv`
**AI & Utilities:** `@google/genai`, `jspdf` (reserved for future pure-PDF generation)
**Build Tools:** `typescript`, `esbuild`, `tsx`

---

## 15. AI Integration

- **Provider:** Google (Gemini API)
- **Workflow:** The UI collects raw financial data and field observations. It constructs a structured prompt injecting variables (turnover, margins, DSCR).
- **Execution:** `POST /api/ai/generate-summary` sends the prompt to the Gemini model.
- **Fallback:** If the API fails or no key is provided, the backend returns a hardcoded, templated string fallback.

---

## 16. Authentication

**Current Implementation:** Basic email/password check in `server.ts` against the `users` MongoDB collection. It returns user data to the frontend which dictates role-based UI rendering. 
**Missing:** There is currently **no JWT or server-side session middleware** validating requests to standard API endpoints. 
**Recommendation:** Implement JWT (JSON Web Tokens) generated on login, stored in `HttpOnly` cookies, and validated via an Express middleware on all `/api/*` routes.

---

## 17. Report Generation

**Workflow:** 
1. Data is collected via `PDToolView.tsx`.
2. When "Print Report" is clicked, `pdReportPrinter.ts` is invoked.
3. The utility maps the JSON data to an HTML template (supporting custom templates based on Client Bank, e.g., Moneyboxx).
4. An invisible `iframe` (or new window) is created, the HTML is injected, and `window.print()` is called. 
5. This leverages the browser's native PDF engine to save or print the document perfectly.

---

## 18. File Storage

**Current Implementation:** Photos uploaded in the UI are converted to Base64 strings. The backend accepts these strings and saves them directly into the MongoDB `applicants` collection.
**Future Recommendations:** Base64 storage in databases drastically inflates storage costs and slows down queries. Implement AWS S3 or Google Cloud Storage. The backend should handle Multer file uploads, stream to S3, and save the resulting public URL to MongoDB.

---

## 19. Application Flow Diagram

```mermaid
graph TD
    A[User (Browser)] -->|Login| B(Express Backend)
    B -->|Verify Auth| C[(MongoDB)]
    A -->|Select Client & Load App| B
    A -->|Edit Fields / Upload Photo| B
    B -->|Save Data| C
    A -->|Trigger AI Summary| B
    B -->|Generate| D[Google Gemini API]
    A -->|Print Report| E[Browser PDF Engine]
```

---

## 20. Security

**Current Implementation:** UI-based Role Based Access Control (RBAC). E.g., `EMPLOYEE` cannot see the "Force Approve" buttons.
**Vulnerabilities:** APIs are completely unauthenticated. Anyone capable of sending a `PATCH` request to the backend can overwrite database records.
**Recommendations:** 
1. Add standard JWT authentication middleware.
2. Implement robust input validation (e.g., using `Zod`) on Express routes.

---

## 21. Performance

**Strengths:** React renders very quickly. Vite provides instant HMR. Auto-save is debounced (1.5s) to prevent spamming the backend.
**Bottlenecks:** 
1. Monolithic components (`PDToolView.tsx` is >2000 lines). Re-renders could become expensive.
2. Transferring Base64 images from DB to client on load will cause massive payload bloat.

---

## 22. Scalability

The Node/Express/React architecture is highly scalable. However, for enterprise adoption:
1. **Component Refactoring:** `PDToolView` must be split into sub-components (`FinancialTab`, `PhotoUploadTab`, etc.).
2. **Database Isolation:** Add strict multi-tenant filtering (filtering strictly by `Company` and `Client`).
3. **Router:** Replace custom `popstate` logic with `react-router-dom`.

---

## 23. Deployment

**Current Method:** Full-stack deployment via Node.js serving compiled Vite static assets.
**Steps:**
1. **Build Frontend:** `npm run build` (Vite compiles React to `dist/`).
2. **Build Backend:** ESBuild bundles `server.ts` to `dist/server.cjs`.
3. **Run:** `npm start` executes the bundled Node server, which hosts APIs and serves the `dist/` static files.

---

## 24. Installation

```bash
# 1. Clone the repository
git clone <repository_url>
cd infominer-personal-discussion-automator

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API Key

# 4. Seed Database (Optional - generates dummy users and apps)
npx tsx seed.ts

# 5. Run Development Server (Frontend + Backend concurrently via Vite)
npm run dev
```

---

## 25. Development Guide

- **Adding a Page:** Create a new component in `src/components/`, then add the routing state logic in `App.tsx` (`activeView`).
- **Adding an API:** Open `server.ts`, define a new `app.get()` or `app.post()` route. Add the corresponding fetch wrapper in `src/services/api.ts`.
- **Modifying the DB:** No strict ORM (Mongoose) is used. Simply modify the JSON object sent to the native `mongoDb.collection.insertOne()` or `findOneAndUpdate()`.

---

## 26. Known Issues

1. **Routing:** Browser back/forward buttons rely on custom state listeners rather than a dedicated library, which can lead to edge-case desyncs.
2. **Security:** Missing backend route protection (JWT).
3. **File Storage:** Base64 images in MongoDB limits scalability.

---

## 27. Future Roadmap

- **Phase 1 (MVP - Current):** Digital PD form, auto-saving, basic roles, AI summary, HTML PDF generation.
- **Phase 2 (Hardening):** Implement AWS S3 for images, JWT Auth, React Router integration, Component splitting.
- **Phase 3 (Mobile):** Build a dedicated React Native companion app tailored exclusively for Field Officers capturing GPS/photos offline.
- **Enterprise Version:** Google Drive auto-sync for PDFs, Core Banking System (CBS) API integrations, SSO Authentication (SAML/OAuth).

---

## 28. Code Quality Analysis

- **Folder Organization:** Logical and standard (components, services, utils, data).
- **Naming Conventions:** Consistent PascalCase for React, camelCase for variables.
- **Reusability:** Good use of helper functions (`getCategoryDefaultItemizedLines`).
- **Technical Debt:** Very high in `PDToolView.tsx` due to massive file size and localized state management.

---

## 29. Improvements

- **High Priority:** 
  - Add JWT Middleware for API protection.
  - Implement AWS S3 for file storage.
- **Medium Priority:** 
  - Refactor `PDToolView.tsx` into smaller sub-components.
  - Install `react-router-dom` for robust navigation.
- **Low Priority:**
  - Add dark mode support.
  - Add E2E tests (Cypress/Playwright).

---

## 30. Conclusion

The Infominer PD Automator is a highly functional, business-critical MVP that significantly reduces friction in the credit underwriting process. Its combination of real-time financial waterfall engines, on-the-fly AI summaries, and dynamic PDF generation provides immense value. With targeted refactoring (API security, state management, and file storage), this platform is well-positioned to scale into a premium enterprise SaaS solution.
