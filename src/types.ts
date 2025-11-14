export interface Product {
  id: string;
  name: string;
  costPrice: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE" | "INVESTMENT";
  amount: number;
  description: string;
  date: string;
  productId?: string; // Optional, for linking to products (single product sales)
  quantity?: number; // For sales, how many units sold (single product)
  products?: Array<{ // For multiple product sales
    productId: string;
    quantity: number;
    sellingPrice: number;
  }>;
}
