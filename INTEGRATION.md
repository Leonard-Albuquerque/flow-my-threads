# 🔗 Integração Frontend-Backend

Este documento descreve como o frontend React está integrado com o backend NestJS.

## 📋 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto frontend:

```env
VITE_API_URL=http://localhost:3001
```

### 2. Iniciar os Servidores

**Backend (NestJS):**
```bash
cd ami-gestor
npm run start:dev
# Servidor rodando em http://localhost:3001
```

**Frontend (React):**
```bash
cd flow-my-threads
npm run dev
# Aplicação rodando em http://localhost:5173 (ou outra porta)
```

## 🔌 Arquitetura da Integração

### Estrutura de Arquivos

```
flow-my-threads/
├── src/
│   ├── config/
│   │   └── api.config.ts          # Configuração da URL da API
│   ├── services/
│   │   └── api.ts                 # Cliente Axios e funções de API
│   ├── contexts/
│   │   └── ProductContext.tsx     # Context com integração de produtos
│   └── pages/
│       ├── Index.tsx              # Dashboard com transações
│       └── Products.tsx           # Gerenciamento de produtos
```

### Serviço de API (`src/services/api.ts`)

O serviço centraliza todas as chamadas à API:

```typescript
import { productsApi } from '@/services/api';
import { transactionsApi } from '@/services/api';
import { dashboardApi } from '@/services/api';
```

#### Produtos
- `productsApi.getAll()` - Listar todos os produtos
- `productsApi.getById(id)` - Buscar produto por ID
- `productsApi.create(product)` - Criar novo produto
- `productsApi.update(id, product)` - Atualizar produto
- `productsApi.delete(id)` - Deletar produto

#### Transações
- `transactionsApi.getAll()` - Listar todas as transações
- `transactionsApi.create(transaction)` - Criar transação genérica
- `transactionsApi.createSale(sale)` - Criar venda de produto único
- `transactionsApi.createMultipleSale(sale)` - Criar venda múltipla
- `transactionsApi.delete(id)` - Deletar transação

#### Dashboard
- `dashboardApi.getMetrics()` - Obter métricas financeiras

## 🔄 Fluxo de Dados

### 1. Carregamento Inicial

```
Frontend (useEffect) 
  → API Request (GET /products, GET /transactions, GET /dashboard/metrics)
  → Backend (NestJS)
  → Database (PostgreSQL/Neon)
  → Response
  → Frontend (setState)
  → UI Update
```

### 2. Criar Produto

```
User Input (ProductForm)
  → addProduct()
  → API Request (POST /products)
  → Backend Validation
  → Database Insert
  → Response (novo produto)
  → Context Update
  → UI Update
```

### 3. Registrar Venda

```
User Input (TransactionForm)
  → sellProduct()
  → API Request (POST /transactions/sale)
  → Backend:
    - Verifica estoque
    - Cria transação
    - Atualiza quantidade do produto
  → Response
  → Frontend:
    - Atualiza lista de transações
    - Recarrega produtos
    - Atualiza métricas
  → UI Update
```

## 🎯 Funcionalidades Integradas

### ✅ Produtos
- [x] Listar produtos do banco de dados
- [x] Criar novos produtos
- [x] Atualizar quantidade de produtos
- [x] Deletar produtos
- [x] Buscar produtos por nome (filtro local)
- [x] Atualização automática de estoque em vendas

### ✅ Transações
- [x] Listar transações do banco de dados
- [x] Criar transações genéricas (receita, despesa, investimento)
- [x] Registrar vendas de produto único
- [x] Registrar vendas de múltiplos produtos
- [x] Validação de estoque antes de vender
- [x] Atualização automática de métricas

### ✅ Dashboard
- [x] Exibir saldo atual
- [x] Exibir total de receitas
- [x] Exibir total de despesas
- [x] Exibir total de investimentos
- [x] Cálculo automático pelo backend

## 🛡️ Tratamento de Erros

O frontend trata erros da API e exibe mensagens amigáveis:

```typescript
try {
  await productsApi.create(product);
  toast.success("Produto criado com sucesso!");
} catch (error: any) {
  const errorMessage = error.response?.data?.message || "Erro ao criar produto";
  toast.error(errorMessage);
}
```

### Tipos de Erros Tratados

- **400 Bad Request**: Validação de dados
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro no servidor
- **Network Error**: Falha de conexão

## 🔐 CORS

O backend está configurado para aceitar requisições do frontend:

```typescript
// ami-gestor/src/main.ts
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
});
```

## 📊 Estado da Aplicação

### Context API (ProductContext)

Gerencia o estado global dos produtos:

```typescript
const { 
  products,        // Lista de produtos
  loading,         // Estado de carregamento
  addProduct,      // Criar produto
  updateProductQuantity, // Atualizar quantidade
  deleteProduct,   // Deletar produto
  refreshProducts  // Recarregar produtos
} = useProducts();
```

### Estado Local (Index.tsx)

Gerencia transações e métricas:

```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [metrics, setMetrics] = useState({
  balance: 0,
  totalIncome: 0,
  totalExpense: 0,
  totalInvestment: 0,
});
```

## 🧪 Testando a Integração

### 1. Verificar Conexão

Abra o console do navegador e verifique se não há erros de CORS ou conexão.

### 2. Testar Criação de Produto

1. Acesse a página "Gerenciar Produtos"
2. Preencha o formulário
3. Clique em "Adicionar Produto"
4. Verifique se o produto aparece na lista
5. Confirme no backend: `curl http://localhost:3001/products`

### 3. Testar Venda

1. Volte ao Dashboard
2. Selecione um produto
3. Informe quantidade e preço de venda
4. Clique em "Registrar Venda"
5. Verifique se:
   - A transação aparece na lista
   - O estoque foi atualizado
   - As métricas foram atualizadas

## 🚨 Troubleshooting

### Erro de CORS

**Problema:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solução:**
1. Verifique se o backend está rodando
2. Confirme a configuração de CORS no `main.ts`
3. Reinicie o servidor backend

### Erro de Conexão

**Problema:** `Network Error` ou `ERR_CONNECTION_REFUSED`

**Solução:**
1. Verifique se o backend está rodando em `http://localhost:3001`
2. Confirme a variável `VITE_API_URL` no `.env`
3. Teste a API diretamente: `curl http://localhost:3001/products`

### Dados Não Aparecem

**Problema:** Produtos ou transações não carregam

**Solução:**
1. Abra o DevTools (F12) → Network
2. Verifique se as requisições estão sendo feitas
3. Veja se há erros nas respostas
4. Confirme que o banco de dados tem dados

## 📝 Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar loading states visuais
- [ ] Implementar retry automático em caso de falha
- [ ] Adicionar cache de dados
- [ ] Implementar paginação
- [ ] Adicionar filtros avançados
- [ ] Implementar WebSockets para atualizações em tempo real

## 🔗 Links Úteis

- [Documentação da API Backend](../ami-gestor/API_DOCUMENTATION.md)
- [README do Backend](../ami-gestor/README.md)
- [Axios Documentation](https://axios-http.com/)
- [React Context API](https://react.dev/reference/react/useContext)
