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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export type TransactionType = "income" | "expense" | "investment";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  isProduct?: boolean;
  size?: string;
  color?: string;
}

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
}

export const TransactionForm = ({ onAddTransaction }: TransactionFormProps) => {
  const [type, setType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isProduct, setIsProduct] = useState(false);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !description) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (type === "income" && isProduct && (!size || !color)) {
      toast.error("Preencha tamanho e cor do produto");
      return;
    }

    const transaction = {
      type,
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString(),
      ...(type === "income" && isProduct && {
        isProduct: true,
        size,
        color,
      }),
    };

    onAddTransaction(transaction);

    // Reset form
    setAmount("");
    setDescription("");
    setIsProduct(false);
    setSize("");
    setColor("");
    
    toast.success("Transação adicionada com sucesso!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Venda</SelectItem>
                <SelectItem value="expense">Compra</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
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

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Venda de camisetas"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {type === "income" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isProduct"
                  checked={isProduct}
                  onCheckedChange={(checked) => setIsProduct(checked as boolean)}
                />
                <Label htmlFor="isProduct" className="cursor-pointer">
                  É um produto (roupa)?
                </Label>
              </div>

              {isProduct && (
                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="size">Tamanho</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger id="size">
                        <SelectValue placeholder="Selecione o tamanho" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PP">PP</SelectItem>
                        <SelectItem value="P">P</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="GG">GG</SelectItem>
                        <SelectItem value="XG">XG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      placeholder="Ex: Preto, Branco, Azul..."
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full">
            Adicionar Transação
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
