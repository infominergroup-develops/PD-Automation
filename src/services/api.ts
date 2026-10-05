import { BusinessCategory, CategoryProduct, User, UserRole } from '../types';
import { ClientBank, CLIENT_BANKS } from '../data/clientBanksData';
import type { ApplicantPayload, ApplicantRecord } from '../types/applicant';

export interface EmployeeRecord extends User {
  designation: string;
  password?: string; // write-only: sent when creating an employee or resetting a password
  createdAt?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

/** Photo as stored by the API; coordinates are present only when the client supplied them. */
export interface UploadedPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  gpsCoordinates: { latitude: number; longitude: number } | null;
}

const BASE_URL = '';

// Session token lives in memory only, so a page refresh signs the user out (as before)
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null) => { authToken = token; };
export const setUnauthorizedHandler = (handler: (() => void) | null) => { onUnauthorized = handler; };

/** fetch() for this app's own API: adds the session token and ends the session on a 401. */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);
  const response = await fetch(input, { ...init, headers });
  if (response.status === 401 && authToken) {
    setAuthToken(null);
    onUnauthorized?.();
  }
  return response;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText }));
    console.error("API Error Response:", response.status, errorBody);
    throw new Error(errorBody.error || `HTTP Error ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth
  login: async (credentials: { email: string; role: UserRole; password: string }): Promise<EmployeeRecord> => {
    const data = await handleResponse<{ user: EmployeeRecord; token: string }>(
      await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
    );
    setAuthToken(data.token);
    return data.user;
  },

  // Employees Management
  getEmployees: async (): Promise<EmployeeRecord[]> => {
    const data = await handleResponse<{ employees: EmployeeRecord[] }>(
      await authFetch(`${BASE_URL}/api/employees`)
    );
    return data.employees;
  },

  saveEmployee: async (employeeData: Partial<EmployeeRecord>): Promise<EmployeeRecord> => {
    const data = await handleResponse<{ employee: EmployeeRecord }>(
      await authFetch(`${BASE_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      })
    );
    return data.employee;
  },

  deleteEmployee: async (id: string): Promise<boolean> => {
    await handleResponse(
      await authFetch(`${BASE_URL}/api/employees/${id}`, { method: 'DELETE' })
    );
    return true;
  },

  // Clients
  getClients: async (): Promise<ClientBank[]> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await authFetch(`${BASE_URL}/api/clients`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await handleResponse<{ clients: ClientBank[] }>(response);
      // Merge DB clients with hardcoded ones, or just return DB clients
      const dbClients = data.clients || [];
      const hardcodedIds = CLIENT_BANKS.map(c => c.id);
      const customClients = dbClients.filter(c => !hardcodedIds.includes(c.id));
      return [...CLIENT_BANKS, ...customClients];
    } catch (e) {
      console.error("Failed to fetch clients from DB, falling back to static", e);
      return CLIENT_BANKS;
    }
  },

  saveClient: async (clientData: Partial<ClientBank>): Promise<ClientBank> => {
    const data = await handleResponse<{ client: ClientBank }>(
      await authFetch(`${BASE_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      })
    );
    return data.client;
  },

  getApplicants: async (clientId: string): Promise<ApplicantRecord[]> => {
    const data = await handleResponse<{ applicants: ApplicantRecord[] }>(
      await authFetch(`${BASE_URL}/api/clients/${clientId}/applicants`)
    );
    return data.applicants;
  },

  createApplicant: async (clientId: string, newApplicantData: ApplicantPayload): Promise<ApplicantRecord> => {
    const data = await handleResponse<{ applicant: ApplicantRecord }>(
      await authFetch(`${BASE_URL}/api/clients/${clientId}/applicants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplicantData)
      })
    );
    return data.applicant;
  },

  updateApplicant: async (clientId: string, appId: string, updateData: ApplicantPayload): Promise<ApplicantRecord> => {
    const data = await handleResponse<{ applicant: ApplicantRecord }>(
      await authFetch(`${BASE_URL}/api/clients/${clientId}/applicants/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
    );
    return data.applicant;
  },

  deleteApplicant: async (clientId: string, appId: string): Promise<boolean> => {
    await handleResponse(
      await authFetch(`${BASE_URL}/api/clients/${clientId}/applicants/${appId}`, { method: 'DELETE' })
    );
    return true;
  },

  deleteAllApplicants: async (): Promise<{ deletedCount: number }> => {
    return handleResponse<{ deletedCount: number }>(
      await authFetch(`${BASE_URL}/api/applicants/all`, { method: 'DELETE' })
    );
  },

  // Categories
  getCategories: async (): Promise<BusinessCategory[]> => {
    const data = await handleResponse<{ categories: BusinessCategory[] }>(
      await authFetch(`${BASE_URL}/api/categories`)
    );
    return data.categories;
  },

  saveCategory: async (category: Partial<BusinessCategory>): Promise<BusinessCategory> => {
    const data = await handleResponse<{ category: BusinessCategory }>(
      await authFetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      })
    );
    return data.category;
  },

  // Products
  getProducts: async (categoryId?: string): Promise<CategoryProduct[]> => {
    const url = categoryId ? `${BASE_URL}/api/products?categoryId=${categoryId}` : `${BASE_URL}/api/products`;
    const data = await handleResponse<{ products: CategoryProduct[] }>(
      await authFetch(url)
    );
    return data.products;
  },

  saveProduct: async (product: Partial<CategoryProduct>): Promise<CategoryProduct> => {
    const data = await handleResponse<{ product: CategoryProduct }>(
      await authFetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })
    );
    return data.product;
  },

  // Photo Upload with Server EXIF processing
  uploadPhoto: async (fileName: string, base64Data: string, lat?: number, lng?: number): Promise<UploadedPhoto> => {
    const data = await handleResponse<{ photo: UploadedPhoto }>(
      await authFetch(`${BASE_URL}/api/upload/photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, base64Data, latitude: lat, longitude: lng })
      })
    );
    return data.photo;
  }
};
