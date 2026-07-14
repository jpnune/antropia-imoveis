# 🏠 Antropia Imóveis - CRM & ERP Imobiliário

Este é um projeto imobiliário de nível profissional concebido como portfólio de engenharia de software Full Stack. O sistema oferece uma experiência integrada contendo um portal público de busca e captação de potenciais clientes (leads), juntamente com um painel administrativo privado para corretores contendo funil de vendas (CRM) e métricas de acessos aos imóveis (ERP básico).

---

## 🛠️ Tecnologias Utilizadas

### Frontend (Portal & Painel Administrativo)
*   **Vite + React**: Core da aplicação SPA leve e de altíssima performance.
*   **Vanilla CSS + Custom Properties**: Design system modular e responsivo com variáveis de cores customizadas.
*   **Lucide React**: Biblioteca de ícones vetoriais modernos.

### Backend (Processamento & Automações)
*   **Python + FastAPI**: API assíncrona, robusta e rápida de alta performance.
*   **SQLAlchemy**: Mapeamento objeto-relacional (ORM) para isolamento lógico do banco.
*   **Pydantic**: Camada de validação de dados de entrada/saída das rotas.
*   **Dotenv**: Gerenciamento seguro de configurações de variáveis de ambiente.

### Banco de Dados & Armazenamento (Infraestrutura)
*   **PostgreSQL**: Banco de dados relacional robusto.
*   **Supabase (PostgreSQL Cloud)**: Hospedagem gerenciada na nuvem do banco e buckets de arquivos.

---

## 📐 Arquitetura do Sistema

O projeto adota uma arquitetura desacoplada baseada em serviços independentes, reduzindo custos de infraestrutura a zero através de planos gratuitos em nuvem:

```
[ Usuário / Corretor ] 
       │ (Acessa um único link de frontend na Vercel)
       ▼
 ┌───────────┐         HTTP Requests          ┌─────────────┐
 │ Frontend  ├───────────────────────────────>│   Backend   │
 │ (Vite/React)│                              │  (FastAPI)  │
 └───────────┘                                └──────┬──────┘
                                                     │ Conexão SQL
                                                     ▼
                                              ┌─────────────┐
                                              │ PostgreSQL  │
                                              │ (Supabase)  │
                                              └─────────────┘
```

---

## 📂 Estrutura de Pastas

```
antropia-imoveis/
├── frontend/             # Código da Interface SPA (Vite + React)
│   ├── src/
│   │   ├── components/   # Componentes visuais
│   │   ├── pages/        # Telas (Públicas e Privadas)
│   │   └── services/     # api.js de integração com o Backend
│   └── package.json
└── backend/              # Código da API e Modelos (FastAPI + Python)
    ├── app/
    │   ├── api/          # Rotas/Endpoints e Schemas Pydantic
    │   ├── db/           # Configuração de conexão do banco
    │   └── models/       # Modelos físicos do PostgreSQL (SQLAlchemy)
    ├── main.py
    └── requirements.txt
```

---

## 🚀 Como Executar Localmente

### 1. Inicializar o Banco de Dados
Tenha uma instância do PostgreSQL ativa ou use o SQLite localmente para testes rápidos definindo no arquivo `backend/.env`:
```env
DATABASE_URL=sqlite:///./antropia.db
```

### 2. Executar o Backend
Navegue até a pasta `backend`, ative o ambiente virtual e inicie o servidor FastAPI:
```bash
cd backend
# Ativação do venv (Windows)
.\venv\Scripts\activate
# Executar a aplicação
python -m uvicorn main:app --reload --port 8000
```
A API estará acessível em `http://localhost:8000`.

### 3. Executar o Frontend
Navegue até a pasta `frontend`, instale as dependências e inicie o Vite:
```bash
cd frontend
npm install
npm run dev
```
A interface do usuário estará acessível em `http://localhost:5173`.
*   **Dados de acesso rápido para testes (Demonstração)**: `corretor@antropia.com` / `admin123`
