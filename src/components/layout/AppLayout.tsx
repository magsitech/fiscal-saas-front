import { useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AlertTriangle, Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { ENVIRONMENT_LABEL, USE_MOCK_API } from '@/config/runtime'

const PAGE_META: Record<string, { title: string; description: string; chips: string[] }> = {
  '/app': {
    title: 'Dashboard',
    description: 'Acompanhe o panorama geral da conta, do saldo e da operação em um único lugar.',
    chips: ['Resumo da conta', 'Saldo', 'Operação'],
  },
  '/app/auditoria': {
    title: 'Histórico de auditoria',
    description: 'Revise o status das consultas fiscais, filtre ocorrências e acompanhe o processamento.',
    chips: ['NF-e e NFC-e', 'Status SEFAZ', 'Filtros'],
  },
  '/app/extrato': {
    title: 'Extrato financeiro',
    description: 'Consulte créditos, débitos, estornos e expirações para acompanhar o saldo.',
    chips: ['Créditos', 'Débitos', 'Conciliação'],
  },
  '/app/creditos': {
    title: 'Comprar créditos',
    description: 'Gere pedidos por PIX ou boleto e mantenha saldo suficiente para o volume planejado.',
    chips: ['PIX', 'Boleto', 'Pré-pago'],
  },
  '/app/pedidos': {
    title: 'Pedidos',
    description: 'Acompanhe pagamentos pendentes, concluídos e créditos ainda não confirmados.',
    chips: ['Histórico', 'Confirmações', 'Pendências'],
  },
  '/app/simulador': {
    title: 'Simulador de custos',
    description: 'Projete o custo do próximo lote com base no volume acumulado e nas faixas progressivas.',
    chips: ['Faixas', 'Breakdown', 'Previsão'],
  },
  '/app/perfil': {
    title: 'Meu perfil',
    description: 'Confira dados da conta, mantenha as informações atualizadas e gerencie o acesso.',
    chips: ['Cadastro', 'Segurança', 'Sessão'],
  },
}

export function AppLayout() {
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const workspaceRef = useRef<HTMLDivElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)

  const page = PAGE_META[pathname] ?? {
    title: 'validaeNota',
    description: 'Painel operacional para validação fiscal, consumo e gestão da conta.',
    chips: ['Operação'],
  }

  useLayoutEffect(() => {
    workspaceRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div ref={workspaceRef} className="app-workspace flex min-h-screen flex-1 flex-col min-w-0">
        {USE_MOCK_API && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(239,68,68,.12)',
              borderBottom: '1px solid rgba(239,68,68,.22)',
              color: 'var(--danger)',
              fontSize: '12px',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            <AlertTriangle size={14} />
            Modo mock ativo no ambiente {ENVIRONMENT_LABEL.toLowerCase()}. Não use este modo para validação final de produção.
          </div>
        )}

        <main ref={mainRef} className="app-main">
          <div className="app-content-stack">
            <button
              type="button"
              className="app-mobile-only"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text)',
                borderRadius: '12px',
                padding: '8px',
                marginBottom: '14px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>

            <section
              className="app-route-hero"
              style={{
                marginBottom: '24px',
                padding: '22px',
                borderRadius: '24px',
                border: '1px solid var(--border)',
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--surface-2) 82%, var(--accent-dim) 18%))',
              }}
            >
              <div
                className="app-route-hero-top"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '14px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ maxWidth: '760px', position: 'relative', zIndex: 1 }}>
                  <h2 style={{ fontSize: '32px', lineHeight: 1.02, letterSpacing: '-0.04em', marginBottom: '12px' }}>
                    {page.title}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '70ch', fontSize: '15px' }}>{page.description}</p>
                </div>
              </div>

              <div className="app-route-chip-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {page.chips.map((chip) => (
                  <span
                    key={chip}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '999px',
                      background: 'color-mix(in srgb, var(--surface) 94%, transparent)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </section>

            <Outlet />
          </div>
        </main>

        <footer
          style={{
            borderTop: '1px solid var(--border)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'var(--text-dim)',
            fontSize: '12px',
            background: 'color-mix(in srgb, var(--surface) 94%, transparent)',
          }}
        >
          © 2026 validaENota. Plataforma de validação fiscal brasileira.
          <br />
          MAGSI TECH CONSULTORIA EM TECNOLOGIA DA INFORMACAO LTDA - CNPJ: 66.328.989/0001-75
        </footer>
      </div>
    </div>
  )
}
