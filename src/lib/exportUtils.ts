import * as XLSX from 'xlsx';
import { Transaction } from '@/components/TransactionForm';

export const exportToExcel = (transactions: Transaction[]) => {
  // Preparar dados para exportação
  const data = transactions.map(t => ({
    'Data': new Date(t.date).toLocaleDateString('pt-BR'),
    'Tipo': t.type === 'income' ? 'Venda' : t.type === 'expense' ? 'Compra' : 'Investimento',
    'Descrição': t.description,
    'Valor (R$)': t.amount.toFixed(2),
  }));

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar largura das colunas
  ws['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
  ];

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Transações');

  // Gerar arquivo e fazer download
  XLSX.writeFile(wb, `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.xlsx`);
};
