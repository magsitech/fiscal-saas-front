# fiscal-saas-front

Frontend do `validaeNota`, publicado no Vercel e preparado para operar com dados mockados enquanto a integração com a API no Railway e com o PostgreSQL não é ativada.

## Visão geral

Hoje o projeto entrega:

- landing page pública em `https://validaenota.com.br`
- página de preços em `https://validaenota.com.br/pricing`
- área do cliente em `https://app.validaenota.com.br`
- autenticação e dados de demonstração com mock local
- tema com alternância entre modo `escuro` e `claro`
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

## Execução local

Instale as dependências:

```bash
npm install
```

Inicie o ambiente local:

```bash
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Variáveis de ambiente

Use o arquivo `.env.example` como base para o ambiente local.

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:8000
```

### Significado

- `VITE_USE_MOCK_API=true`
  Mantém a aplicação funcionando com dados mockados.

- `VITE_USE_MOCK_API=false`
  Faz o frontend consumir a API real usando `VITE_API_BASE_URL`.

- `VITE_API_BASE_URL`
  Define a URL base da API real quando o mock estiver desligado.

## Modo mock

Enquanto a integração real não estiver ativa, o projeto pode ser testado com mock de:

- autenticação
- dashboard
- histórico de validações
- consumo
- pagamentos
- créditos
- simulador

### Credenciais de teste

```text
demo@validaenota.com.br
Demo@123
```

## Deploy no Vercel

Configuração atual do projeto:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Variáveis no Vercel

Para publicar com mocks ativos:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=https://api.validaenota.com.br
```

## Domínios

- `validaenota.com.br`: landing page principal
- `www.validaenota.com.br`: redirecionamento para `validaenota.com.br`
- `app.validaenota.com.br`: área do cliente
- `api.validaenota.com.br`: reservado para a API

## Identidade visual atual

- favicon configurado com `public/validaenota.png`
- rodapé padronizado nas páginas públicas e na área autenticada
- tema padrão em modo escuro
- modo claro persistido quando o usuário selecionar manualmente

## Próximo passo de integração

Quando a API real estiver pronta:

1. manter o frontend no Vercel
2. alterar `VITE_USE_MOCK_API` para `false`
3. manter `VITE_API_BASE_URL=https://api.validaenota.com.br`
4. conectar o backend e o banco PostgreSQL

## Observação sobre Docker

O projeto não utiliza Docker no fluxo atual.

Como o frontend é publicado no Vercel como aplicação estática do Vite, a estrutura foi simplificada para esse modelo de deploy.
