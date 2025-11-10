import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TransactionForm, Transaction } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { CashFlowChart } from "@/components/CashFlowChart";
import { Store, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/exportUtils";
import { toast } from "sonner";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions([newTransaction, ...transactions]);
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Controle Financeiro</h1>
              <p className="text-sm text-muted-foreground">Gestão da sua loja de roupas</p>
            </div>
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
              <TransactionForm onAddTransaction={addTransaction} />
            </div>
            <div className="lg:col-span-2">
              <TransactionList transactions={transactions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
