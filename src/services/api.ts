import { BusinessCategory, CategoryProduct, User, UserRole } from '../types';
import { ClientBank, CLIENT_BANKS } from '../data/clientBanksData';

export interface EmployeeRecord extends User {
  designation: string;
  createdAt?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

const BASE_URL = '';

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
  login: async (credentials: { email?: string; role: UserRole; password?: string }): Promise<{ user: EmployeeRecord; token: string }> => {
    return handleResponse<{ user: EmployeeRecord; token: string }>(
      await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
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

  // Clients
  getClients: async (): Promise<ClientBank[]> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${BASE_URL}/api/clients`, { signal: controller.signal });
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

  deleteApplicant: async (clientId: string, appId: string): Promise<boolean> => {
    await handleResponse(
      await fetch(`${BASE_URL}/api/clients/${clientId}/applicants/${appId}`, { method: 'DELETE' })
    );
    return true;
  },

  deleteAllApplicants: async (): Promise<{ deletedCount: number }> => {
    return handleResponse<{ deletedCount: number }>(
      await fetch(`${BASE_URL}/api/applicants/all`, { method: 'DELETE' })
    );
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
