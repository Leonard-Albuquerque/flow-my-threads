import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { CashFlowChart } from "@/components/CashFlowChart";
import { Store, FileDown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/exportUtils";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Product, Transaction } from "@/types";
import { useProducts } from "@/contexts/ProductContext";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { products, updateProductQuantity } = useProducts();

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const sellProduct = (productId: string, quantity: number, sellingPrice: number) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.quantity < quantity) {
      toast.error("Produto não encontrado ou quantidade insuficiente");
      return;
    }

    // Update product quantity
    updateProductQuantity(productId, product.quantity - quantity);

    // Add sale transaction
    const saleTransaction: Omit<Transaction, "id"> = {
      type: "income",
      amount: sellingPrice * quantity,
      description: `Venda de ${quantity}x ${product.name}`,
      date: new Date().toISOString(),
      productId,
      quantity,
    };
    addTransaction(saleTransaction);
  };

  const sellMultipleProducts = (productSales: Array<{ productId: string; quantity: number; sellingPrice: number }>) => {
    let totalAmount = 0;
    const productNames: string[] = [];

    for (const sale of productSales) {
      const product = products.find(p => p.id === sale.productId);
      if (!product || product.quantity < sale.quantity) {
        toast.error(`Produto ${product?.name || 'não encontrado'} com quantidade insuficiente`);
        return;
      }
      totalAmount += sale.sellingPrice * sale.quantity;
      productNames.push(`${sale.quantity}x ${product.name}`);
    }

    // Update all product quantities
    for (const sale of productSales) {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        updateProductQuantity(sale.productId, product.quantity - sale.quantity);
      }
    }

    // Add sale transaction
    const saleTransaction: Omit<Transaction, "id"> = {
      type: "income",
      amount: totalAmount,
      description: `Venda múltipla: ${productNames.join(', ')}`,
      date: new Date().toISOString(),
      products: productSales,
    };
    addTransaction(saleTransaction);
  };

  // Calculate metrics
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestment = transactions
    .filter((t) => t.type === "investment")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalInvestment + totalIncome - totalExpense;

  const handleExportExcel = () => {
    if (transactions.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }
    exportToExcel(transactions);
    toast.success("Relatório exportado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Controle Financeiro</h1>
                <p className="text-sm text-muted-foreground">Gestão da sua loja de roupas</p>
              </div>
            </div>
            <Link to="/products">
              <Button variant="outline" className="gap-2">
                <Package className="h-4 w-4" />
                Gerenciar Produtos
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Export Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleExportExcel}
              variant="outline"
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              Exportar para Excel
            </Button>
          </div>

          {/* Dashboard Cards */}
          <Dashboard
            balance={balance}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            totalInvestment={totalInvestment}
          />

          {/* Chart */}
          <CashFlowChart transactions={transactions} />

          {/* Form and List */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <TransactionForm
                onAddTransaction={addTransaction}
                onSellProduct={sellProduct}
                onSellMultipleProducts={sellMultipleProducts}
                products={products}
              />
            </div>
            <div className="lg:col-span-2">
              <TransactionList transactions={transactions} products={products} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
