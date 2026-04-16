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

## Conteúdo e UX

Para manter consistência editorial nas telas internas, consulte:

- `docs/content-style.md`

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
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Regras

- `VITE_APP_ENV` é obrigatório e deve ser `staging` ou `main`
- `VITE_API_BASE_URL` é obrigatório
- `VITE_MERCADO_PAGO_PUBLIC_KEY` é opcional, mas recomendada para fluxos client-side do Mercado Pago
- o build falha se a URL do backend não corresponder ao ambiente configurado
- não existe fallback implícito para `staging`
- `VITE_USE_MOCK_API=true` é proibido em `main`
- `Access Token` e demais segredos do Mercado Pago não devem ser expostos no frontend
- `Client ID` e `Client Secret` só são necessários quando o backend usa OAuth com Mercado Pago

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
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-41c18da9-bf04-4d94-b2f3-f605f20f617a
```

Deploy esperado:
- frontend em `https://app.validaenota.com.br`
- backend em `https://api.validaenota.com.br`

#### Staging (`staging`)

```env
VITE_APP_ENV=staging
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://staging.api.validaenota.com.br
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-576e7d43-b119-4935-b307-6f78789a3455
```

Deploy esperado:
- frontend em `https://staging.validaenota.com.br`
- backend em `https://staging.api.validaenota.com.br`

#### Mock isolado, se necessário

```env
VITE_APP_ENV=staging
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=https://staging.api.validaenota.com.br
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-576e7d43-b119-4935-b307-6f78789a3455
```

### Mercado Pago no deploy

- No Vercel, configure apenas `VITE_MERCADO_PAGO_PUBLIC_KEY` no frontend quando precisar de fluxo client-side.
- `staging` deve usar `TEST-576e7d43-b119-4935-b307-6f78789a3455` e `main` deve usar `APP_USR-41c18da9-bf04-4d94-b2f3-f605f20f617a`.
- `Access Token` deve ficar somente no backend/servidor que cria pagamentos, assinaturas e tokens privados.
- O `Access Token` de `staging` deve ser configurado apenas no backend de testes, nunca no Vercel deste frontend.
- `Client ID` e `Client Secret` não precisam ser adicionados no Vercel deste frontend para o checkout comum; use-os apenas se o backend realmente implementar OAuth.
- Para cartão recorrente, o frontend espera que o backend devolva uma URL de continuação do fluxo em `checkout_url`, `redirect_url`, `init_point` ou dentro de `gateway_payload`.

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
