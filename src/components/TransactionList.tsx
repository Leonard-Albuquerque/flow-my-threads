import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types";
import { Product } from "@/types";
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  products: Product[];
}

export const TransactionList = ({ transactions, products }: TransactionListProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "income":
        return <ArrowUpCircle className="h-4 w-4 text-success" />;
      case "expense":
        return <ArrowDownCircle className="h-4 w-4 text-destructive" />;
      case "investment":
        return <DollarSign className="h-4 w-4 text-primary" />;
    }
  };

  const getTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "income":
        return "Venda";
      case "expense":
        return "Compra";
      case "investment":
        return "Investimento";
    }
  };

  const getTypeBadgeVariant = (type: Transaction["type"]) => {
    switch (type) {
      case "income":
        return "default" as const;
      case "expense":
        return "destructive" as const;
      case "investment":
        return "secondary" as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma transação registrada ainda
          </p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                    {transaction.productId && transaction.quantity && (
                      <p className="text-xs text-muted-foreground">
                        Produto: {products.find(p => p.id === transaction.productId)?.name} (Qtd: {transaction.quantity})
                      </p>
                    )}
                    {transaction.products && transaction.products.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <p>Produtos:</p>
                        {transaction.products.map((item, index) => (
                          <p key={index}>
                            {products.find(p => p.id === item.productId)?.name} (Qtd: {item.quantity}, R$ {item.sellingPrice.toFixed(2).replace('.', ',')})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      transaction.type === "income"
                        ? "text-success"
                        : transaction.type === "expense"
                        ? "text-destructive"
                        : "text-primary"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <Badge variant={getTypeBadgeVariant(transaction.type)} className="mt-1">
                    {getTypeLabel(transaction.type)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
