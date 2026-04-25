# validaENota Design System

## Overview

**validaENota** is a Brazilian B2B SaaS platform for fiscal note validation (NF-e and NFC-e) via official SEFAZ services. Built and operated by **MAGSI TECH CONSULTORIA EM TECNOLOGIA DA INFORMACAO LTDA** (CNPJ: 66.328.989/0001-75).

The product is a credit-based API + dashboard that allows companies to validate fiscal notes with full audit trail, financial history, cost simulation, and credit management.

### Sources

- **Codebase**: `github.com/magsitech/fiscal-saas-front` (React 18 + TypeScript + Vite)
- **Live app**: `https://app.validaenota.com.br`
- **Landing page**: `https://validaenota.com.br`
- **Pricing page**: `https://validaenota.com.br/pricing`

---

## Products / Surfaces

| Surface | Description |
|---|---|
| **Landing page** | Public marketing page at `validaenota.com.br` |
| **Pricing page** | Public pricing at `validaenota.com.br/pricing` |
| **Auth** | Login / register / password reset at `/login` |
| **App (SPA)** | Authenticated client dashboard at `app.validaenota.com.br` |

### App routes

- `/app` — Dashboard (balance summary, KPIs)
- `/app/auditoria` — Fiscal audit history
- `/app/extrato` — Financial statement
- `/app/perfil` — User profile
- `/app/creditos` — Buy credits (PIX / BOLETO / CARTÃO)
- `/app/pedidos` — Orders / payment history
- `/app/simulador` — Cost simulator
- `/app/meu-plano` — Subscription plan details
- `/app/documentacao` — API docs

---

## CONTENT FUNDAMENTALS

### Language

- All copy is **Brazilian Portuguese (PT-BR)** with correct accents and current orthography
- Tone is **objective, reliable, and operational** — no marketing fluff, no dramatization
- Voice is **direct and professional** — not warm/casual, not cold/robotic
- No emoji in UI copy

### Formula per screen

```
menu label:   short    (e.g. "Auditoria")
page title:   descriptive  (e.g. "Histórico de auditoria fiscal")
subtitle:     action-oriented  (e.g. "Revise o status das consultas fiscais e identifique ocorrências com rapidez.")
button:       direct verb  (e.g. "Calcular", "Gerar boleto", "Copiar código PIX")
```

### Specific examples

- **Hero CTA**: "Começar gratuitamente" / "Ver preços →"
- **Empty states**: "Nenhuma auditoria registrada ainda" (neutral, no drama)
- **Status badges**: "Autorizada", "Cancelada", "Processando", "Pendente"
- **Financial terms**: créditos, débitos, saldo, extrato (Portuguese, not anglicisms)

### Casing

- Page titles and section headers: **Sentence case** (first word capitalized only)
- Buttons: **Sentence case**
- Menu labels: **Title case** (single word, so always capitalized)
- Table headers / kickers / labels: **UPPERCASE** via CSS `text-transform: uppercase`

---

## VISUAL FOUNDATIONS

### Colors

**Dark mode (default)**
- Background: `#0a0c0f` — near-black with slight blue tint
- Surface levels: `#111418` → `#181c22` → `#1e2530`
- Borders: `#1e2530` (dim) / `#2a3340` (bright)
- Text: `#e8edf2` (full) / `#6b7d8f` (muted) / `#3d4f5e` (dim)
- Accent: `#00d4aa` — teal/mint; the brand's signature color
- Warn: `#f59e0b` (amber), Danger: `#ef4444` (red), Info: `#3b82f6` (blue), Success: `#22c55e`

**Light mode** shifts to muted navy/slate backgrounds with a darker teal accent (`#007f69`).

### Background treatment

The body uses **layered radial gradients**:
- Top-left: subtle teal glow (accent at 9% opacity)
- Top-right: subtle blue glow (info at 7% opacity)
- Base: near-black `#0a0c0f`

No heavy gradients, no textures. Clean, dark, technical.

### Typography

- **Display / UI**: Space Grotesk (Google Fonts) — weights 300–700. Used for all body, headings, labels.
- **Mono**: IBM Plex Mono (Google Fonts) — weights 400–600. Used for all numbers (KPIs, financial values, NF keys), code, and step numbers.
- Font size base: 16px (15px on mobile ≤640px)
- Heading scale: 48px hero → 28px section → 16px card title → 14px sub-heading → 13px body → 12px small → 11px label → 10px kicker

### Spacing & Layout

- Base grid: 8px unit
- Content max-width: 1280px (`app-content-stack`), 1040px narrow
- Card padding: 24–28px (featured), 22px standard
- Section gaps: 40px between major sections
- Card gaps: 20–28px in grids

### Cards

- Background: `var(--surface)` (#111418)
- Border: 1px solid `var(--border)` (#1e2530)
- Border radius: 8px (`--radius`) or 12px (`--radius-lg`)
- Shadow: `0 16px 40px rgba(0,0,0,0.12)` soft, `0 20px 50px rgba(0,0,0,0.32)` strong
- Featured KPI card: left 4px accent bar + accent-tinted border

### Buttons

- **Primary**: Teal gradient (`var(--accent)` to lighter teal), dark text `#041311`, rounded-full (`border-radius: 18px`)
- **Ghost**: Semi-transparent surface gradient, neutral border
- **Danger**: Red tint background, red text — fills on hover
- **Soft**: Accent-dim to info-dim tint, accent text
- All buttons: `hover:-translate-y-1px`, `active:translate-y-0`, `shadow`, 200ms transition

### Badges

- Pill shape, `border-radius: 999px`
- Small dot indicator + label
- Tonal (green/yellow/red/blue/gray) using dim backgrounds

### Inputs

- Background: `color-mix(surface-2, 94%, transparent)`
- Border: 1px solid `var(--border)`, focus: `var(--accent)` + ring
- Border radius: 12px (`rounded-xl`)
- Label: 11px uppercase bold `var(--text-dim)`, `letter-spacing: 0.14em`

### Sidebar nav

- Width: 230px, sticky, blur backdrop
- Nav items: rounded-[14px], `var(--accent-dim)` bg + `var(--accent-glow)` border when active
- Icon container: 30×30px rounded-[10px] with `var(--surface-2)` bg
- Section headers: 10px uppercase `var(--text-dim)`, `letter-spacing: 0.16em`

### Animations / Transitions

- Standard: `200ms cubic-bezier(0.4, 0, 0.2, 1)` (CSS `--transition`)
- Progress bars: `1.2s cubic-bezier(0.4,0,0.2,1)` width animation
- Button hover: `translateY(-1px)` lift
- No bounces, no spring animations — clean, professional

### Hover / Press states

- Buttons: `brightness(105%)` hover, `brightness(95%)` active; + `-1px` Y lift
- Ghost buttons: border brightens to `var(--border-bright)`, bg shifts to `var(--surface-3)`
- Nav items: opacity and color shift; no scale
- Danger button: fills red on hover (full color inversion)
- Table rows: `var(--surface-2)` background on hover

### Scrollbar

- Width: 6px, track `var(--surface)`, thumb `var(--border-bright)`

### Selection

- Background `var(--accent-dim)`, text `var(--accent)` — teal selection highlight

---

## ICONOGRAPHY

**Icon system**: [Lucide React](https://lucide.dev/) — thin stroke (strokeWidth 2), consistent 14–16px size in most contexts.

Icons used in sidebar navigation:
- Dashboard: `LayoutDashboard`
- Auditoria: `FileText`
- Extrato: `TrendingUp`
- Perfil: `User`
- Créditos: `CreditCard`
- Pedidos: `Receipt`
- Simulador: `Calculator`
- Meu Plano: `Star`
- Documentação: `Book`
- Sair: `LogOut`
- Fechar: `X`
- Navegar: `ArrowRight`

Icon containers: 30×30px, `border-radius: 10px`, `var(--surface-2)` background with `var(--border)` border.

Inline SVG icons are used in the landing page (Shield, Activity, Dollar, Monitor, Users) — hand-drawn in 24×24 viewBox with stroke=2.

No icon font. No emoji. No PNG icon packs.

---

## Files in this Design System

```
README.md                     ← This file
SKILL.md                      ← Agent skill manifest
colors_and_type.css           ← CSS vars: tokens + semantic
assets/
  validaenota.png             ← Brand logo (PNG, 34×34px usage)
preview/
  colors-dark.html            ← Dark mode color palette
  colors-light.html           ← Light mode color palette
  colors-semantic.html        ← Semantic / status colors
  typography-scale.html       ← Type scale specimen
  typography-mono.html        ← Monospace / data type specimen
  spacing-tokens.html         ← Spacing, radius, shadow tokens
  buttons.html                ← Button variants & states
  badges.html                 ← Badge variants
  inputs.html                 ← Input & select
  cards.html                  ← Card patterns
  tables.html                 ← Table component
  kpi-cards.html              ← KPI card patterns
ui_kits/
  app/
    index.html                ← Full app UI kit (dashboard + screens)
    README.md                 ← App UI kit notes
```

---

## Branch `feat/planos-assinatura`

Esta branch contém a implementação mais avançada do produto. Diferenças-chave em relação à `staging`:

### AuthPage — fluxo unificado com tab bar
- Tab bar inline **Entrar / Criar conta** (não mais páginas separadas)
- Fluxo de cadastro: tipo (PF/PJ) → formulário específico
- PF: Nome, E-mail, CPF, Senha + confirmação, força de senha
- PJ: Razão social, CNPJ, Responsável, E-mail, Senha + confirmação

### Cartão de crédito — tokenização AbacatePay
O tipo `CARTAO` está presente em `MetodoPagamento` e o contrato completo existe nos tipos:

```ts
interface PedidoCartaoPayerPayload {
  card_token: string          // token gerado pelo SDK AbacatePay no browser
  payment_method_id: string   // bandeira do cartão
  installments?: number       // número de parcelas
  issuer_id?: string
  payer_doc_type?: string
  payer_doc_number?: string
}
```

Resposta com suporte a **3DS**:
```ts
interface IniciarPedidoResponse {
  three_ds_external_resource_url?: string | null  // URL de autenticação 3DS
  three_ds_creq?: string | null                   // challenge request 3DS
}
```

**Fluxo no frontend:**
1. SDK AbacatePay tokeniza os dados do cartão → retorna `card_token`
2. Frontend envia `{ metodo: 'CARTAO', valor, card_token, payment_method_id, installments }`
3. Se resposta tiver `three_ds_creq`, redirecionar para autenticação 3DS
4. Após autenticação, polling de status do pedido até `PAGO`

### Gateway configurável
```ts
type GatewayPixBoleto = 'mercadopago' | 'abacatepay'
interface PedidosConfig {
  gateway_pix_boleto: GatewayPixBoleto  // qual gateway usar para PIX/BOLETO
  gateway_pix_boleto_sandbox: boolean
}
```

### AssinaturaResumo — planos com ciclo de faturamento
```ts
interface AssinaturaResumo {
  plano: 'TRIAL' | 'BASICO' | 'PRO' | 'BUSINESS' | 'CANCELADO'
  trial_ativo: boolean
  trial_expira_em: string | null
  ciclo_inicio: string | null
  ciclo_expira_em: string | null
  franquia_usada: number | null
  franquia_limite: number | null   // consultas inclusas no plano
  franquia_restante: number | null
  proximo_plano: string | null     // mudança agendada para o próximo ciclo
}
```

---

## Stack

React 18 · TypeScript · Vite · React Router DOM · Zustand · Axios · react-hot-toast · lucide-react · date-fns · Space Grotesk · IBM Plex Mono
