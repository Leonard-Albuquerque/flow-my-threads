import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CashFlowChartProps {
  transactions: Transaction[];
}

export const CashFlowChart = ({ transactions }: CashFlowChartProps) => {
  // Group transactions by date and calculate cumulative balance
  const chartData = (transactions || [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });

      const lastBalance = acc.length > 0 ? acc[acc.length - 1].saldo : 0;
      
      let change = 0;
      if (transaction.type === "INCOME" || transaction.type === "INVESTMENT") {
        change = transaction.amount;
      } else if (transaction.type === "EXPENSE") {
        change = -transaction.amount;
      }

      const newBalance = lastBalance + change;

      acc.push({
        data: date,
        saldo: newBalance,
        transacao: change,
      });

      return acc;
    }, [] as Array<{ data: string; saldo: number; transacao: number }>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Capital</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Adicione transações para visualizar o gráfico
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="data" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                name="Saldo"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
