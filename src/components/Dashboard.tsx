import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react";
import { Transaction, Product } from "@/types";

interface DashboardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  transactions: Transaction[];
  products: Product[];
}

export const Dashboard = ({
  balance,
  totalIncome,
  totalExpense,
  totalInvestment,
  transactions,
  products
}: DashboardProps) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // ===============================
  // 👇 CÁLCULO DE LUCRO TOTAL AJUSTADO
  // ===============================
  const totalProfit = transactions
  .filter(t => t.type === "INCOME")
  .reduce((acc, t) => {
    // Caso 1: Venda de múltiplos produtos (verificar ambos os nomes)
    const productsList = t.transactionProducts || t.products;
    
    if (productsList && productsList.length > 0) {
      const profitFromList = productsList.reduce((prodAcc, tp) => {
        const costPrice = parseFloat(tp.product.costPrice);
        const sellingPrice = Number(tp.sellingPrice);
        const profitPerUnit = sellingPrice - costPrice;
        
        return prodAcc + profitPerUnit * tp.quantity;
      }, 0);

      return acc + profitFromList;
    }

    // Caso 2: Venda simples (productId + quantity)
    if (t.productId && t.quantity) {
      const product = products.find(pr => pr.id === t.productId);
      if (!product) return acc;

      const sellingPrice = t.amount / t.quantity;
      const profitPerUnit = sellingPrice - product.costPrice;

      return acc + profitPerUnit * t.quantity;
    }

    return acc;
  }, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      
      {/* Saldo Atual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground mt-1">Capital disponível</p>
        </CardContent>
      </Card>

      {/* Investimento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investimento Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
          <p className="text-xs text-muted-foreground mt-1">Capital injetado</p>
        </CardContent>
      </Card>

      {/* Total de Vendas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Receitas</p>
        </CardContent>
      </Card>

      {/* Lucro Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
          <p className="text-xs text-muted-foreground mt-1">Lucro líquido</p>
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Despesas</p>
        </CardContent>
      </Card>
    </div>
  );
};
