# fiscal-saas-front

Frontend do `validaeNota`, publicado no Vercel, com producao conectada ao backend no Railway e um ambiente `staging` separado para operar com dados mockados.

## Visao geral

Hoje o projeto entrega:

- landing page publica em `https://validaenota.com.br`
- pagina de precos em `https://validaenota.com.br/pricing`
- area do cliente em `https://app.validaenota.com.br`
- autenticacao e consumo da API real em producao
- ambiente `staging` com dados de demonstracao via mock local
- tema com alternancia entre modo `escuro` e `claro`
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
public/
```

## Execucao local

Instale as dependencias:

```bash
npm install
```

Inicie o ambiente local:

```bash
npm run dev
```

## Build de producao

```bash
npm run build
npm run preview
```

## Variaveis de ambiente

Use o arquivo `.env.example` como base para o ambiente local.

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://api.validaenota.com.br
```

### Significado

- `VITE_USE_MOCK_API=true`
  Mantem a aplicacao funcionando com dados mockados. Deve ser usado apenas no ambiente `staging`.

- `VITE_USE_MOCK_API=false`
  Faz o frontend consumir a API real usando `VITE_API_BASE_URL`. Este deve ser o valor da `main`.

- `VITE_API_BASE_URL`
  Define a URL base da API real quando o mock estiver desligado.

## Modo mock

O mock continua disponivel para homologacao em `staging`, cobrindo:

- autenticacao
- dashboard
- historico de validacoes
- consumo
- pagamentos
- creditos
- simulador

### Credenciais de teste

```text
demo@validaenota.com.br
Demo@123
```

## Deploy no Vercel

Configuracao atual do projeto:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Variaveis no Vercel

#### Producao (`main`)

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://api.validaenota.com.br
```

#### Staging (`staging`)

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=https://api.validaenota.com.br
```

No Vercel, configure a branch `staging` para gerar um ambiente separado e associe o dominio `staging.validaenota.com.br` a esse deploy.

## Dominios

- `validaenota.com.br`: landing page principal
- `www.validaenota.com.br`: redirecionamento para `validaenota.com.br`
- `app.validaenota.com.br`: area do cliente
- `api.validaenota.com.br`: backend publicado no Railway
- `staging.validaenota.com.br`: frontend de homologacao no Vercel usando mock

## Fluxo recomendado

Para manter os ambientes separados:

1. manter `main` publicada no Vercel com `VITE_USE_MOCK_API=false`
2. criar e publicar a branch `staging` a partir da `main`
3. definir `VITE_USE_MOCK_API=true` apenas na branch `staging`
4. manter `VITE_API_BASE_URL=https://api.validaenota.com.br` para producao e futuras validacoes reais
5. apontar `staging.validaenota.com.br` para o projeto no Vercel

## Infra atual

O frontend nao utiliza Docker no deploy.

O backend roda em container com PostgreSQL no ambiente de aplicacao e esta publicado no Railway.
Como o frontend e publicado no Vercel como aplicacao estatica do Vite, a separacao entre producao e staging deve ser feita por branch, variaveis de ambiente e dominio.
