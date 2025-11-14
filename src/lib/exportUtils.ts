import * as XLSX from 'xlsx';
import { Transaction } from '@/types';

export const exportToExcel = (transactions: Transaction[]) => {
  // Preparar dados para exportação
  const data = transactions.map(t => ({
    'Data': new Date(t.date).toLocaleDateString('pt-BR'),
    'Tipo': t.type === 'INCOME' ? 'Venda' : t.type === 'EXPENSE' ? 'Compra' : 'Investimento',
    'Descrição': t.description,
    'Valor (R$)': Number(t.amount).toFixed(2),
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

export const importFromExcel = (file: File): Promise<Omit<Transaction, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Pegar primeira worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          throw new Error('Arquivo Excel deve conter pelo menos uma linha de dados');
        }

        // Verificar cabeçalhos
        const headers = jsonData[0];
        const expectedHeaders = ['Data', 'Tipo', 'Descrição', 'Valor (R$)'];
        const hasValidHeaders = expectedHeaders.every(header => headers.includes(header));

        if (!hasValidHeaders) {
          throw new Error('Cabeçalhos inválidos. Esperado: Data, Tipo, Descrição, Valor (R$)');
        }

        // Processar dados
        const transactions: Omit<Transaction, 'id'>[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length < 4) continue; // Pular linhas incompletas

          const [dataStr, tipoStr, descricao, valorStr] = row;

          // Validar e converter data
          let date: string;
          try {
            const dateParts = dataStr.split('/');
            if (dateParts.length !== 3) throw new Error('Formato de data inválido');
            const [day, month, year] = dateParts.map(Number);
            const dateObj = new Date(year, month - 1, day);
            if (isNaN(dateObj.getTime())) throw new Error('Data inválida');
            date = dateObj.toISOString();
          } catch {
            throw new Error(`Data inválida na linha ${i + 1}: ${dataStr}`);
          }

          // Mapear tipo
          let type: 'INCOME' | 'EXPENSE' | 'INVESTMENT';
          switch (tipoStr) {
            case 'Venda':
              type = 'INCOME';
              break;
            case 'Compra':
              type = 'EXPENSE';
              break;
            case 'Investimento':
              type = 'INVESTMENT';
              break;
            default:
              throw new Error(`Tipo inválido na linha ${i + 1}: ${tipoStr}. Deve ser 'Venda', 'Compra' ou 'Investimento'`);
          }

          // Validar e converter valor
          let amount: number;
          try {
            const cleanValor = String(valorStr).replace(/[^\d.,-]/g, '').replace(',', '.');
            amount = parseFloat(cleanValor);
            if (isNaN(amount)) throw new Error('Valor inválido');
          } catch {
            throw new Error(`Valor inválido na linha ${i + 1}: ${valorStr}`);
          }

          // Validar descrição
          if (!descricao || String(descricao).trim() === '') {
            throw new Error(`Descrição vazia na linha ${i + 1}`);
          }

          transactions.push({
            type,
            amount,
            description: String(descricao).trim(),
            date,
          });
        }

        resolve(transactions);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };

    reader.readAsArrayBuffer(file);
  });
};
