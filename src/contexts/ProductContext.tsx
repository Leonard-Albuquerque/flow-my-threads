import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Product } from "@/types";
import { productsApi } from "@/services/api";
import { toast } from "sonner";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshProducts = async () => {
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
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      setLoading(true);
      const newProduct = await productsApi.create(product);
      setProducts([...products, newProduct]);
      toast.success("Produto criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      toast.error("Erro ao criar produto");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProductQuantity = async (productId: string, newQuantity: number) => {
    try {
      setLoading(true);
      const updatedProduct = await productsApi.update(productId, { quantity: newQuantity });
      setProducts(products.map(p =>
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
  };

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      await productsApi.delete(productId);
      setProducts(products.filter(p => p.id !== productId));
      toast.success("Produto deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      toast.error("Erro ao deletar produto");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading,
      addProduct, 
      updateProductQuantity,
      deleteProduct,
      refreshProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};
