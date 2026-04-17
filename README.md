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

- landing page pública em `https://validaenota.com.br`
- página de preços em `https://validaenota.com.br/pricing`
- área do cliente com ambientes separados de `staging` e `main`
- autenticação com JWT e refresh token
- consumo da API real com interceptors de autenticação
- integração de pedidos/créditos com backend em `/pedidos`
- compra de créditos por `PIX` e `BOLETO`
- reabertura de pedidos com consulta em `GET /pedidos/{pedido_id}`
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

## Fluxo de pedidos e créditos

O frontend usa o backend de pedidos como fonte única de verdade para criação, consulta e status do pagamento.

### Rotas consumidas

- `POST /pedidos/iniciar`
- `GET /pedidos`
- `GET /pedidos/{pedido_id}`

### Métodos habilitados

- `PIX`
- `BOLETO`

O cartão recorrente não faz parte do fluxo atual de compra de créditos.

### Regras atuais do frontend

- o frontend nunca credita saldo por conta própria
- o status real do pedido vem do backend
- o botão `Concluir transação` é exibido quando `checkout_url` existir
- o botão é reaproveitado ao reabrir a tela de créditos ou ao consultar o detalhe do pedido
- pedidos com status `AGUARDANDO_PAGAMENTO` continuam com instruções e ação de continuidade
- pedidos com status `PAGO` exibem confirmação
- pedidos com status `CANCELADO` ou `EXPIRADO` desabilitam a continuidade

### Contrato esperado na criação do pedido

Exemplo para `PIX`:

```json
{
  "metodo": "PIX",
  "valor": 100
}
```

Exemplo para `BOLETO`:

```json
{
  "metodo": "BOLETO",
  "valor": 100,
  "payer_zip_code": "01310930",
  "payer_street_name": "Avenida Paulista",
  "payer_street_number": "1000",
  "payer_neighborhood": "Bela Vista",
  "payer_city": "Sao Paulo",
  "payer_federal_unit": "SP"
}
```

Resposta esperada:

```json
{
  "pedido_id": "uuid",
  "metodo": "PIX",
  "valor": "100.00",
  "status": "AGUARDANDO_PAGAMENTO",
  "mp_status": "pending",
  "mp_status_detail": "pending_waiting_transfer",
  "pix_copia_cola": "000201...",
  "pix_qr_code_url": "base64...",
  "boleto_linha_digitavel": null,
  "boleto_url": null,
  "checkout_url": "https://...",
  "expira_em": "2026-04-17T12:00:00+00:00",
  "credito_expira_em": "2026-05-17T12:00:00+00:00",
  "credito_lancado": false
}
```

### Contrato esperado no detalhe do pedido

```json
{
  "id": "uuid",
  "metodo": "PIX",
  "valor": "100.00",
  "status": "AGUARDANDO_PAGAMENTO",
  "mp_status": "pending",
  "mp_status_detail": "pending_waiting_transfer",
  "descricao": null,
  "gateway_id": "123",
  "checkout_url": "https://...",
  "expira_em": "2026-04-17T12:00:00+00:00",
  "credito_expira_em": "2026-05-17T12:00:00+00:00",
  "confirmado_em": null,
  "criado_em": "2026-04-17T11:00:00+00:00"
}
```

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

O mock local já acompanha o contrato atual de pedidos:

- `POST /pedidos/iniciar`
- `GET /pedidos`
- `GET /pedidos/{pedido_id}`

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

## Mercado Pago no deploy

No frontend hospedado no Vercel, configure apenas:

- `VITE_MERCADO_PAGO_PUBLIC_KEY`

Não configure no frontend:

- `Access Token`
- `Client ID`
- `Client Secret`

Esses segredos devem permanecer somente no backend.

### Resumo de responsabilidade

- frontend:
  usa `checkout_url`, exibe dados de `PIX` ou `BOLETO`, consulta status e renderiza o botão de continuidade
- backend:
  cria o pedido, fala com o Mercado Pago, retorna `checkout_url`, informa status real e credita saldo quando aplicável

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
- polling de pedidos para atualização de status na compra de créditos
- consulta de detalhe de pedido para reexibição de `checkout_url`

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
