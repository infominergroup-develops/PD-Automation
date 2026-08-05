import { BusinessCategory, CategoryProduct, PDReport, AuditLogEntry, HTMLToolValidationRun, RiskAssessmentResult, User, UserRole } from '../types';
import { ClientBank } from '../data/clientBanksData';

export interface EmployeeRecord extends User {
  designation: string;
  createdAt?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

const BASE_URL = '';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorBody.error || `HTTP Error ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth
  login: async (credentials: { email?: string; role: UserRole; password?: string }): Promise<{ user: EmployeeRecord; token: string }> => {
    return handleResponse<{ user: EmployeeRecord; token: string }>(
      await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
    );
  },

  signup: async (userData: { name: string; email: string; role: UserRole; designation?: string; agency?: string; password?: string }): Promise<{ user: EmployeeRecord; token: string }> => {
    return handleResponse<{ user: EmployeeRecord; token: string }>(
      await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
    );
  },

  // Employees Management
  getEmployees: async (): Promise<EmployeeRecord[]> => {
    const data = await handleResponse<{ employees: EmployeeRecord[] }>(
      await fetch(`${BASE_URL}/api/employees`)
    );
    return data.employees;
  },

  saveEmployee: async (employeeData: Partial<EmployeeRecord>): Promise<EmployeeRecord> => {
    const data = await handleResponse<{ employee: EmployeeRecord }>(
      await fetch(`${BASE_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      })
    );
    return data.employee;
  },

  deleteEmployee: async (id: string): Promise<boolean> => {
    await handleResponse(
      await fetch(`${BASE_URL}/api/employees/${id}`, { method: 'DELETE' })
    );
    return true;
  },

  // Clients (MongoDB)
  getClients: async (): Promise<ClientBank[]> => {
    const data = await handleResponse<{ clients: ClientBank[] }>(
      await fetch(`${BASE_URL}/api/clients`)
    );
    return data.clients;
  },

  saveClient: async (clientData: Partial<ClientBank>): Promise<ClientBank> => {
    const data = await handleResponse<{ client: ClientBank }>(
      await fetch(`${BASE_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      })
    );
    return data.client;
  },

  getApplicants: async (clientId: string): Promise<any[]> => {
    const data = await handleResponse<{ applicants: any[] }>(
      await fetch(`${BASE_URL}/api/clients/${clientId}/applicants`)
    );
    return data.applicants;
  },

  createApplicant: async (clientId: string, newApplicantData: any): Promise<any> => {
    const data = await handleResponse<{ applicant: any }>(
      await fetch(`${BASE_URL}/api/clients/${clientId}/applicants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplicantData)
      })
    );
    return data.applicant;
  },

  updateApplicant: async (clientId: string, appId: string, updateData: any): Promise<any> => {
    const data = await handleResponse<{ applicant: any }>(
      await fetch(`${BASE_URL}/api/clients/${clientId}/applicants/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
    );
    return data.applicant;
  },

  // Categories
  getCategories: async (): Promise<BusinessCategory[]> => {
    const data = await handleResponse<{ categories: BusinessCategory[] }>(
      await fetch(`${BASE_URL}/api/categories`)
    );
    return data.categories;
  },

  saveCategory: async (category: Partial<BusinessCategory>): Promise<BusinessCategory> => {
    const data = await handleResponse<{ category: BusinessCategory }>(
      await fetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      })
    );
    return data.category;
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    await handleResponse(
      await fetch(`${BASE_URL}/api/categories/${id}`, { method: 'DELETE' })
    );
    return true;
  },

  // Products
  getProducts: async (categoryId?: string): Promise<CategoryProduct[]> => {
    const url = categoryId ? `${BASE_URL}/api/products?categoryId=${categoryId}` : `${BASE_URL}/api/products`;
    const data = await handleResponse<{ products: CategoryProduct[] }>(
      await fetch(url)
    );
    return data.products;
  },

  saveProduct: async (product: Partial<CategoryProduct>): Promise<CategoryProduct> => {
    const data = await handleResponse<{ product: CategoryProduct }>(
      await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })
    );
    return data.product;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await handleResponse(
      await fetch(`${BASE_URL}/api/products/${id}`, { method: 'DELETE' })
    );
    return true;
  },

  // Reports
  getReports: async (): Promise<PDReport[]> => {
    const data = await handleResponse<{ reports: PDReport[] }>(
      await fetch(`${BASE_URL}/api/reports`)
    );
    return data.reports;
  },

  getReportById: async (id: string): Promise<PDReport> => {
    const data = await handleResponse<{ report: PDReport }>(
      await fetch(`${BASE_URL}/api/reports/${id}`)
    );
    return data.report;
  },

  saveReport: async (report: Partial<PDReport>): Promise<PDReport> => {
    const data = await handleResponse<{ report: PDReport }>(
      await fetch(`${BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      })
    );
    return data.report;
  },

  updateReportStatus: async (id: string, status: string, reviewerNotes?: string): Promise<PDReport> => {
    const data = await handleResponse<{ report: PDReport }>(
      await fetch(`${BASE_URL}/api/reports/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewerNotes })
      })
    );
    return data.report;
  },

  deleteReport: async (id: string): Promise<boolean> => {
    await handleResponse(
      await fetch(`${BASE_URL}/api/reports/${id}`, { method: 'DELETE' })
    );
    return true;
  },

  // Business Validation & Risk Engine
  validateBusinessData: async (formData: Record<string, any>, categoryId: string): Promise<RiskAssessmentResult> => {
    return handleResponse<RiskAssessmentResult>(
      await fetch(`${BASE_URL}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, categoryId })
      })
    );
  },

  // Server Gemini AI Report Generator
  generateAiReport: async (payload: {
    applicantName?: string;
    categoryName?: string;
    firmName?: string;
    appliedAmount?: number;
    financials?: any;
    observations?: any;
    risks?: any;
  }): Promise<{ narrative: string; isAiGenerated: boolean; modelUsed: string }> => {
    return handleResponse<{ narrative: string; isAiGenerated: boolean; modelUsed: string }>(
      await fetch(`${BASE_URL}/api/ai/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    );
  },

  // QA HTML Tool Validation Suite
  runHtmlValidation: async (): Promise<HTMLToolValidationRun> => {
    const data = await handleResponse<{ validationRun: HTMLToolValidationRun }>(
      await fetch(`${BASE_URL}/api/html-tool/validate`, {
        method: 'POST'
      })
    );
    return data.validationRun;
  },

  // Dashboard Metrics
  getDashboardMetrics: async (): Promise<any> => {
    return handleResponse<any>(
      await fetch(`${BASE_URL}/api/dashboard`)
    );
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    const data = await handleResponse<{ logs: AuditLogEntry[] }>(
      await fetch(`${BASE_URL}/api/audit`)
    );
    return data.logs;
  },

  // Photo Upload with Server EXIF processing
  uploadPhoto: async (fileName: string, base64Data: string, lat?: number, lng?: number): Promise<any> => {
    const data = await handleResponse<{ photo: any }>(
      await fetch(`${BASE_URL}/api/upload/photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, base64Data, latitude: lat, longitude: lng })
      })
    );
    return data.photo;
  }
};
