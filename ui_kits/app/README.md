# validaENota App UI Kit

Recreação fiel do frontend `fiscal-saas-front` (branch `staging`) como protótipo click-through em HTML/React.

## Fonte de verdade

- Branch: `staging` (magsitech/fiscal-saas-front)
- URL staging: `https://staging.validaenota.com.br`

## Telas cobertas

| Tela | Arquivo | Descrição |
|---|---|---|
| Landing | `LandingScreen.jsx` | SPA com âncoras: Home, Sobre, Planos (4 planos + tabela de faixas), Contato, rodapé |
| Login | `AuthScreen.jsx` | Painel esquerdo com features + tabela de preços; form de login; fluxo "esqueci minha senha" |
| Dashboard | `DashboardScreen.jsx` | Hero financeiro com saldo (gradiente verde escuro), KPIs ×4, tabela de faixas, últimas auditorias |
| Créditos | `CreditsScreen.jsx` | Seletor PIX/BOLETO, presets de valor, geração de pedido, resumo com linha digitável / copia-e-cola |

## Componentes compartilhados

- `AppShell.jsx` — sidebar nav (grupos Principal / Financeiro / Recursos), header com badge de ambiente, layout responsivo
- `colors_and_type.css` — todos os tokens CSS (importado de `../../colors_and_type.css`)

## Navegação

A barra de telas fixa no rodapé (Landing / Login / Dashboard / Créditos) permite alternar entre screens sem recarregar. Dentro de cada tela, os links internos também navegam (ex.: botão "Área do Cliente" → Login; nav lateral → trocam a tela ativa).

## Notas

- Ícones do sidebar usam emoji como substitutos — o projeto real usa `lucide-react` (stroke 2, 14–16px)
- Planos de preço replicados da staging: Trial (grátis), Básico (R$29), Pro (R$99), Business (R$149)
- Pagamentos: simulação local; botão "Simular pagamento confirmado" replica o estado `PAGO`
