# fiscal-saas-front

Frontend da Plataforma SaaS Fiscal — painel do gestor.
Repositório separado do back-end (`fiscal-saas`).

## Stack

| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript | UI e tipagem |
| Vite | Build e dev server |
| React Router v6 | Roteamento (SPA) |
| Zustand | Estado global (auth) |
| Axios | HTTP + refresh token automático |
| lucide-react | Ícones |
| react-hot-toast | Notificações |
| date-fns | Formatação de datas |
| Nginx | Serve build + proxy API |

## Estrutura

```
src/
├── App.tsx                    # Rotas (React Router)
├── main.tsx                   # Entrypoint
├── index.css                  # Design tokens (CSS vars)
├── types/index.ts             # Todos os tipos TypeScript
├── services/api.ts            # Axios + interceptor JWT
├── store/auth.ts              # Zustand (usuário + tokens)
├── hooks/useFetch.ts          # Hooks de fetching e polling
├── utils/fmt.ts               # Formatadores (BRL, CNPJ, CPF…)
└── components/
    ├── ui/index.tsx           # Button, Badge, Card, Table, Input…
    ├── layout/
    │   ├── Sidebar.tsx        # Navegação lateral com NavLink
    │   └── AppLayout.tsx      # Layout com topbar
    └── auth/
        └── ProtectedRoute.tsx # Guards de rota
└── pages/
    ├── AuthPage.tsx           # Login + Cadastro (tab único)
    ├── DashboardPage.tsx      # KPIs, saldo, faixas, últimas NFs
    ├── ManagementPages.tsx    # Validações, Consumo, Pagamentos,
    │                          # Simulador, Comprar Créditos
    └── PerfilPage.tsx         # Perfil, senha, empresa, zona perigo
```

## Rodando localmente

```bash
# Instalar dependências
npm install

# Dev server com proxy para API local (localhost:8000)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## Docker

```bash
# Build da imagem
docker build -t fiscal-saas-front .

# Rodar (API deve estar acessível em http://api:8000)
docker run -p 3000:80 fiscal-saas-front
```

## Deploy no Railway

1. Criar novo serviço no Railway apontando para este repositório
2. Railway detecta o `Dockerfile` automaticamente
3. Configurar variável `API_URL` se necessário (ver `nginx.conf`)
4. O serviço de frontend é independente do back-end

## Deploy no Vercel

1. Importar este repositório no Vercel
2. Framework preset: `Vite`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Configurar a variável de ambiente `VITE_API_BASE_URL` com a URL pública do back-end

O arquivo `vercel.json` já inclui o rewrite necessário para o `BrowserRouter` funcionar em rotas diretas.

## Páginas

| Rota | Página | Autenticação |
|---|---|---|
| `/login` | Login + Cadastro | Pública |
| `/app` | Dashboard | Protegida |
| `/app/validacoes` | Histórico de validações | Protegida |
| `/app/consumo` | Auditoria de consumo | Protegida |
| `/app/creditos` | Comprar créditos | Protegida |
| `/app/pagamentos` | Histórico de pagamentos | Protegida |
| `/app/simulador` | Simulador de custos | Protegida |
| `/app/perfil` | Perfil do usuário | Protegida |

## Autenticação

- Access token (15 min) armazenado no Zustand + localStorage
- Refresh token (30 dias) renovado automaticamente via interceptor Axios
- Rotas protegidas redirecionam para `/login` se não autenticado
- Rotas públicas redirecionam para `/app` se já autenticado

## Design

Paleta escura com tokens CSS em `src/index.css`. Todos os componentes
consomem as variáveis diretamente — trocar o tema é alterar as variáveis
na raiz. Fontes: Space Grotesk (UI) + IBM Plex Mono (valores numéricos).
