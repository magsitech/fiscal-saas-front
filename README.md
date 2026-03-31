# fiscal-saas-front

Frontend do validaeNota.

Hoje este projeto roda como frontend React + Vite publicado no Vercel, com suporte a dados mockados para testes antes da integracao com a API no Railway e com o PostgreSQL.

## Stack

- React 18 + TypeScript
- Vite
- React Router v6
- Zustand
- Axios
- lucide-react
- react-hot-toast
- date-fns

## Estado atual do projeto

- Landing page publica em `/`
- Painel do usuario em `/app`
- Tema com modos `claro`, `escuro` e `sistema`
- Modo mock para autenticacao, dashboard, consumo, pagamentos e simulacoes
- Deploy principal via Vercel
- Dominio do app: `app.validaenota.com.br`

## Estrutura principal

```text
src/
  components/
    auth/
    layout/
    ui/
  config/
  hooks/
  mocks/
  pages/
  services/
  store/
  types/
  utils/
```

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Variaveis de ambiente

Use o arquivo `.env.example` como base.

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:8000
```

### Significado

- `VITE_USE_MOCK_API=true`
  Mantem a aplicacao funcionando com dados mockados.

- `VITE_USE_MOCK_API=false`
  Faz o frontend consumir a API real usando `VITE_API_BASE_URL`.

- `VITE_API_BASE_URL`
  URL base da API real quando o mock estiver desligado.

## Credenciais mock para teste

```text
demo@validaenota.com.br
Demo@123
```

## Deploy no Vercel

Configuracao usada hoje:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Variaveis no Vercel

Para testar com mocks no dominio real:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=https://api.validaenota.com.br
```

### Dominios

- `validaenota.com.br`: landing page
- `www.validaenota.com.br`: redireciona para `validaenota.com.br`
- `app.validaenota.com.br`: painel/app

## Proximo passo de integracao

Quando o backend real estiver pronto:

1. manter o deploy no Vercel
2. alterar `VITE_USE_MOCK_API` para `false`
3. manter `VITE_API_BASE_URL=https://api.validaenota.com.br`

## Observacao sobre Docker

O projeto nao usa mais Docker no fluxo atual.

Como o frontend e publicado no Vercel como app estatico do Vite, os arquivos de Docker/Nginx foram removidos para simplificar o repositorio e evitar manutencao desnecessaria.
