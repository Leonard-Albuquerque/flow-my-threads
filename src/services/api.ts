import axios from 'axios';
import { Product, Transaction } from '@/types';
import { API_CONFIG } from '@/config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  update: async (id: string, product: Partial<Omit<Product, 'id'>>): Promise<Product> => {
    const response = await api.patch(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// Transactions API
export const transactionsApi = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions');
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  createSale: async (sale: {
    productId: string;
    quantity: number;
    sellingPrice: number;
    date: string;
  }): Promise<Transaction> => {
    const response = await api.post('/transactions/sale', sale);
    return response.data;
  },

  createMultipleSale: async (sale: {
    products: Array<{
      productId: string;
      quantity: number;
      sellingPrice: number;
    }>;
    date: string;
  }): Promise<Transaction> => {
    const response = await api.post('/transactions/multiple-sale', sale);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};

// Dashboard API
export const dashboardApi = {
  getMetrics: async (): Promise<{
    balance: number;
    totalIncome: number;
    totalExpense: number;
    totalInvestment: number;
  }> => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  },
};

export default api;
