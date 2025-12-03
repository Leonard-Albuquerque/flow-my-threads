"use client";
import { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { CashFlowChart } from "@/components/CashFlowChart";
import { Store, FileDown, Package, FileUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToExcel, importFromExcel } from "@/lib/exportUtils";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Transaction } from "@/types";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { transactionsApi, dashboardApi } from "@/services/api";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalInvestment: 0,
  });
  const [loading, setLoading] = useState(false);
  const { products, refreshProducts } = useProducts();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsApi.getAll();
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast.error("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await dashboardApi.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
      toast.error("Erro ao carregar métricas");
    }
  };

  useEffect(() => {
    loadTransactions();
    loadMetrics();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      setLoading(true);
      const newTransaction = await transactionsApi.create(transaction);
      setTransactions([newTransaction, ...transactions]);
      await loadMetrics();
      toast.success("Transação criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      toast.error("Erro ao criar transação");
    } finally {
      setLoading(false);
    }
  };

  const sellProduct = async (productId: string, quantity: number, sellingPrice: number) => {
    try {
      setLoading(true);
      const newTransaction = await transactionsApi.createSale({
        productId,
        quantity,
        sellingPrice,
        date: new Date().toISOString(),
      });
      setTransactions([newTransaction, ...transactions]);
      await refreshProducts();
      await loadMetrics();
      toast.success("Venda registrada com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao registrar venda";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sellMultipleProducts = async (productSales: Array<{ productId: string; quantity: number; sellingPrice: number }>) => {
    try {
      setLoading(true);
      const newTransaction = await transactionsApi.createMultipleSale({
        products: productSales,
        date: new Date().toISOString(),
      });
      setTransactions([newTransaction, ...transactions]);
      await refreshProducts();
      await loadMetrics();
      toast.success("Venda múltipla registrada com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar venda múltipla:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Erro ao registrar venda múltipla";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (transactions.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }
    exportToExcel(transactions);
    toast.success("Relatório exportado com sucesso!");
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Por favor, selecione um arquivo Excel (.xlsx ou .xls)");
      return;
    }

    try {
      setLoading(true);
      const importedTransactions = await importFromExcel(file);

      if (importedTransactions.length === 0) {
        toast.error("Nenhum dado válido encontrado no arquivo");
        return;
      }

      // Adicionar transações via API
      for (const transaction of importedTransactions) {
        await transactionsApi.create(transaction);
      }

      // Recarregar dados
      await loadTransactions();
      await loadMetrics();

      toast.success(`${importedTransactions.length} transação(ões) importada(s) com sucesso!`);
    } catch (error) {
      console.error("Erro ao importar arquivo:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao importar arquivo");
    } finally {
      setLoading(false);
      // Limpar input file
      event.target.value = '';
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">MGF - Amí Fitness</h1>
                <p className="text-sm text-muted-foreground">Gestão da sua loja de roupas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/products">
                <Button variant="outline" className="gap-2">
                  <Package className="h-4 w-4" />
                  Gerenciar Produtos
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Export/Import Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              Exportar para Excel
            </Button>
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                className="hidden"
                id="excel-import"
                disabled={loading}
              />
              <Button
                variant="outline"
                className="gap-2"
                disabled={loading}
                onClick={() => document.getElementById('excel-import')?.click()}
              >
                <FileUp className="h-4 w-4" />
                Importar do Excel
              </Button>
            </div>
          </div>

          {/* Dashboard Cards */}
          <Dashboard
            balance={metrics.balance}
            totalIncome={metrics.totalIncome}
            totalExpense={metrics.totalExpense}
            totalInvestment={metrics.totalInvestment}
            transactions={transactions}
            products={products}
          />

          {/* Chart */}
         <div className="hidden md:block">
          <CashFlowChart transactions={transactions} />
         </div>

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
