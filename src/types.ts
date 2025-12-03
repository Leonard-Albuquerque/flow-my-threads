

// ===============================
// TIPOS AJUSTADOS
// ===============================

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface TransactionProduct {
  id: string;
  transactionId: string;
  productId: string;
  quantity: number;
  sellingPrice: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    costPrice: string;
    quantity: number;
    color: string | null;
    size: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE" | "INVESTMENT";
  amount: number;
  description: string;
  date: string;

  // Venda simples
  productId?: string;
  quantity?: number;

  // Venda com vários itens (adicionar esta linha)
  transactionProducts?: TransactionProduct[];
  
  // Venda com vários itens (formato alternativo - manter para compatibilidade)
  products?: TransactionProduct[];
}