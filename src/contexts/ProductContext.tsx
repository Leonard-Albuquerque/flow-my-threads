import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { Product } from "@/types";
import { productsApi } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProductQuantity: (productId: string, newQuantity: number) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshProducts = useCallback(async () => {
    if (!isAuthenticated) return; // Não carrega se não autenticado
    
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshProducts();
  }, [isAuthenticated, refreshProducts]); // Recarrega quando autenticação muda

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    try {
      setLoading(true);
      const newProduct = await productsApi.create(product);
      setProducts(prev => [...prev, newProduct]);
      toast.success("Produto criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      toast.error("Erro ao criar produto");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProductQuantity = useCallback(async (productId: string, newQuantity: number) => {
    try {
      setLoading(true);
      const updatedProduct = await productsApi.update(productId, { quantity: newQuantity });
      setProducts(prev => prev.map(p =>
        p.id === productId ? updatedProduct : p
      ));
      toast.success("Quantidade atualizada!");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast.error("Erro ao atualizar produto");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      await productsApi.delete(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success("Produto deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      toast.error("Erro ao deletar produto");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    products,
    loading,
    addProduct,
    updateProductQuantity,
    deleteProduct,
    refreshProducts
  }), [products, loading, addProduct, updateProductQuantity, deleteProduct, refreshProducts]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
