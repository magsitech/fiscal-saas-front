# fiscal-saas-front

Frontend do `validaeNota`, publicado no Vercel, com separação explícita entre ambiente `staging` para testes e ambiente `main` para produção.

## Ambientes oficiais

### Frontend

- `staging` / testes:
  `https://staging.validaenota.com.br`
- `main` / produção:
  `https://app.validaenota.com.br`

### Backend

- `staging` / testes:
  `https://staging.api.validaenota.com.br`
- `main` / produção:
  `https://api.validaenota.com.br`

## Visão geral

Hoje o projeto entrega:

- landing page pública em `https://validaenota.com.br`
- página de preços em `https://validaenota.com.br/pricing`
- área do cliente com ambientes separados de `staging` e `main`
- autenticação e consumo da API real
- validação explícita de ambiente no build
- bloqueio de mock em `main`
- responsividade para desktop e mobile

## Stack

- React 18
- TypeScript
- Vite
- React Router DOM
- Zustand
- Axios
- `react-hot-toast`
- `lucide-react`
- `date-fns`

## Execução local

Instale as dependências:

```bash
npm install
```

Crie um `.env.local` a partir de `.env.example` e inicie o ambiente local:

```bash
npm run dev
```

## Build e checagens

```bash
npm run lint
npm run build
npm run preview
```

## Variáveis de ambiente

Use o arquivo `.env.example` como base.

```env
VITE_APP_ENV=staging
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://staging.api.validaenota.com.br
```

### Regras

- `VITE_APP_ENV` é obrigatório e deve ser `staging` ou `main`
- `VITE_API_BASE_URL` é obrigatório
- o build falha se a URL do backend não corresponder ao ambiente configurado
- não existe fallback implícito para `staging`
- `VITE_USE_MOCK_API=true` é proibido em `main`

### Modo mock

Use `VITE_USE_MOCK_API=true` apenas para testes isolados de interface.
Mesmo em modo mock, mantenha `VITE_APP_ENV` e `VITE_API_BASE_URL` coerentes com o ambiente do deploy.

## Deploy no Vercel

Configuração atual do projeto:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci`

### Variáveis no Vercel

#### Produção (`main`)

```env
VITE_APP_ENV=main
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://api.validaenota.com.br
```

Deploy esperado:
- frontend em `https://app.validaenota.com.br`
- backend em `https://api.validaenota.com.br`

#### Staging (`staging`)

```env
VITE_APP_ENV=staging
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://staging.api.validaenota.com.br
```

Deploy esperado:
- frontend em `https://staging.validaenota.com.br`
- backend em `https://staging.api.validaenota.com.br`

#### Mock isolado, se necessário

```env
VITE_APP_ENV=staging
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=https://staging.api.validaenota.com.br
```

## Endurecimento atual

O frontend foi ajustado para reduzir risco operacional:

- build bloqueado quando ambiente e API não batem
- build bloqueado quando `main` tenta usar mock
- badge explícito de ambiente no topo da aplicação
- aviso reforçado quando mock está ativo
- remoção de fallback implícito para `staging`
- tokens movidos para `sessionStorage`
- limpeza seletiva das chaves da aplicação
- bootstrap inicial de autenticação antes de liberar rotas privadas
- CI validando `staging` e `main`

## Domínios

- `validaenota.com.br`: landing page principal
- `www.validaenota.com.br`: redirecionamento para `validaenota.com.br`
- `app.validaenota.com.br`: frontend `main`
- `staging.validaenota.com.br`: frontend `staging`
- `api.validaenota.com.br`: backend `main`
- `staging.api.validaenota.com.br`: backend `staging`

## CI

O repositório possui workflow para validar:

- `npm run lint`
- `npm run build` com configuração de `staging`
- `npm run build` com configuração de `main`

## Infra atual

O frontend é publicado no Vercel como aplicação estática do Vite.
O backend roda em container no Railway.
A separação entre `staging` e `main` depende de branch, variáveis de ambiente e domínio.
