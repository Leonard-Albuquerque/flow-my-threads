import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ProductForm } from "./ProductForm";
import { MultipleProductSaleForm } from "./MultipleProductSaleForm";
import { Product, Transaction } from "@/types";

export type TransactionType = "INCOME" | "EXPENSE" | "INVESTMENT";
export type TransactionTypeWithoutIncome = Exclude<TransactionType, "INCOME">;


interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onSellProduct: (productId: string, quantity: number, sellingPrice: number) => void;
  onSellMultipleProducts: (productSales: Array<{ productId: string; quantity: number; sellingPrice: number }>) => void;
  products: Product[];
}

export const TransactionForm = ({
  onAddTransaction,
  onSellProduct,
  onSellMultipleProducts,
  products
}: TransactionFormProps) => {
  const [type, setType] = useState<TransactionType>("INVESTMENT");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === "INCOME") {
      // For sales, use the sell product function
      if (!selectedProductId || !quantity || !amount) {
        toast.error("Selecione um produto, quantidade e preço de venda");
        return;
      }
      onSellProduct(selectedProductId, parseInt(quantity), parseFloat(amount));
      setSelectedProductId("");
      setQuantity("");
      setAmount("");
      return;
    }

    if (!amount || !description) {
      toast.error("Preencha todos os campos");
      return;
    }

    const transaction = {
      type,
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString(),
    };

    onAddTransaction(transaction);

    // Reset form
    setAmount("");
    setDescription("");

    toast.success("Transação adicionada com sucesso!");
  };

  return (
    <div className="space-y-6">
      <MultipleProductSaleForm
        onSellMultipleProducts={onSellMultipleProducts}
        products={products}
      />

      <Card>
        <CardHeader>
          <CardTitle>Nova Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(value) => setType(value as TransactionTypeWithoutIncome)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="INCOME">Venda</SelectItem>  */}
                  <SelectItem value="EXPENSE">Compra</SelectItem>
                  <SelectItem value="INVESTMENT">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {type === "INCOME" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="product">Produto</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Estoque: {product.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Venda de camisetas"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              {type === "INCOME" ? "Vender Produto" : "Adicionar Transação"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
