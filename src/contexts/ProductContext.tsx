import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/types";

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProductQuantity: (productId: string, newQuantity: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider = ({ children }: ProductProviderProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: crypto.randomUUID(),
    };
    setProducts([...products, newProduct]);
  };

  const updateProductQuantity = (productId: string, newQuantity: number) => {
    setProducts(products.map(p =>
      p.id === productId
        ? { ...p, quantity: newQuantity }
        : p
    ));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProductQuantity }}>
      {children}
    </ProductContext.Provider>
  );
};
