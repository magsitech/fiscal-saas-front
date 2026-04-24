import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react'
import { PublicNav } from '@/components/layout/PublicNav'

type LegalSection = {
  title: string
  paragraphs: string[]
}

function LegalLayout({
  eyebrow,
  title,
  subtitle,
  updatedAt,
  sections,
  accentIcon,
}: {
  eyebrow: string
  title: string
  subtitle: string
  updatedAt: string
  sections: LegalSection[]
  accentIcon: ReactNode
}) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
      <PublicNav />

      <main style={{ maxWidth: '940px', margin: '0 auto', padding: '56px 24px 96px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            width: 'fit-content',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <section
          style={{
            background: 'linear-gradient(145deg, color-mix(in srgb, var(--surface) 82%, var(--accent-dim) 18%), var(--surface))',
            border: '1px solid var(--border)',
            borderRadius: '28px',
            padding: '34px',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-glow)',
              color: 'var(--accent)',
            }}
          >
            {accentIcon}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)' }}>
            {eyebrow}
          </div>
          <h1 style={{ fontSize: '42px', lineHeight: 1.08, margin: 0, letterSpacing: '-0.04em' }}>{title}</h1>
          <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.8, color: 'var(--text-muted)', maxWidth: '64ch' }}>{subtitle}</p>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Última atualização: {updatedAt}</div>
        </section>

        <section style={{ display: 'grid', gap: '18px' }}>
          {sections.map((section) => (
            <article
              key={section.title}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '22px',
                padding: '28px',
                boxShadow: '0 18px 40px rgba(0,0,0,0.08)',
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: '14px', fontSize: '22px', letterSpacing: '-0.02em' }}>{section.title}</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} style={{ margin: 0, fontSize: '14px', lineHeight: 1.8, color: 'var(--text-muted)' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

const TERMS_SECTIONS: LegalSection[] = [
  {
    title: '1. Aceitação e finalidade do serviço',
    paragraphs: [
      'Ao criar uma conta e utilizar o ValidaeNota, você declara que leu, compreendeu e concorda com estes Termos de Uso. O serviço é destinado à validação fiscal de documentos eletrônicos e ao gerenciamento operacional das consultas contratadas.',
      'O uso da plataforma deve ocorrer apenas para finalidades legítimas, compatíveis com a legislação aplicável, com as regras fiscais vigentes e com os limites operacionais definidos pelo ValidaeNota.',
    ],
  },
  {
    title: '2. Cadastro, acesso e responsabilidade da conta',
    paragraphs: [
      'Você deve fornecer informações verdadeiras, completas e atualizadas no cadastro. O titular da conta é responsável pela guarda de credenciais, pelo uso da plataforma e por toda atividade realizada com seu login.',
      'Caso haja suspeita de acesso indevido, compartilhamento não autorizado ou qualquer incidente de segurança, você deve alterar a senha imediatamente e comunicar o ValidaeNota sem demora.',
    ],
  },
  {
    title: '3. Regras de uso da plataforma',
    paragraphs: [
      'É vedado utilizar o serviço para fraude, abuso de recursos, tentativas de contornar mecanismos de segurança, engenharia reversa, sobrecarga deliberada de infraestrutura ou qualquer atividade que possa comprometer a estabilidade da plataforma.',
      'Também não é permitido utilizar o ValidaeNota em desacordo com normas da SEFAZ, com contratos firmados com clientes finais ou com obrigações legais relacionadas a tratamento de dados, documentos fiscais e auditoria.',
    ],
  },
  {
    title: '4. Créditos, pedidos e pagamentos',
    paragraphs: [
      'A compra de créditos ocorre por pedido gerado no backend do ValidaeNota. A liberação do fluxo depende da confirmação oficial do pagamento pelo backend, inclusive quando a cobrança for emitida por PIX ou boleto.',
      'A criação da cobrança não significa pagamento concluído. Créditos somente serão disponibilizados quando o pedido for confirmado como pago pela fonte oficial processada pelo backend.',
    ],
  },
  {
    title: '5. Disponibilidade, limites e suporte',
    paragraphs: [
      'O ValidaeNota busca manter operação estável, mas a disponibilidade pode ser afetada por manutenção, falhas de terceiros, indisponibilidade de provedores externos ou eventos fora do controle razoável da plataforma.',
      'O serviço pode adotar limites técnicos, filas, monitoramento e mecanismos de proteção para preservar segurança, desempenho e continuidade operacional de todos os clientes.',
    ],
  },
  {
    title: '6. Propriedade intelectual e conteúdo',
    paragraphs: [
      'A marca ValidaeNota, a interface da plataforma, a documentação, os fluxos operacionais, o software e os elementos visuais relacionados ao serviço são protegidos pela legislação aplicável e não podem ser reproduzidos sem autorização.',
      'Você mantém a responsabilidade pelos dados enviados, pelas informações fiscais consultadas e pelo uso dado aos resultados retornados pela plataforma.',
    ],
  },
  {
    title: '7. Suspensão, encerramento e alterações',
    paragraphs: [
      'O ValidaeNota poderá suspender ou restringir o acesso em caso de violação destes Termos, indícios de uso indevido, exigência legal, risco operacional relevante ou necessidade de proteção do ambiente.',
      'Estes Termos podem ser atualizados periodicamente. A continuidade de uso após a publicação de nova versão representa ciência e concordância com o texto vigente.',
    ],
  },
]

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: '1. Escopo desta política',
    paragraphs: [
      'Esta Política de Privacidade descreve como o ValidaeNota coleta, utiliza, armazena, protege e compartilha dados pessoais relacionados ao uso da plataforma, ao cadastro de clientes e à operação dos serviços oferecidos.',
      'Ao utilizar o serviço, você declara ciência de que seus dados poderão ser tratados conforme as finalidades descritas nesta política e de acordo com a legislação aplicável, especialmente a Lei Geral de Proteção de Dados Pessoais.',
    ],
  },
  {
    title: '2. Dados que podemos coletar',
    paragraphs: [
      'Podemos coletar dados cadastrais como nome, e-mail, documento, telefone, informações da empresa, credenciais de acesso, registros de autenticação e histórico de uso da plataforma.',
      'Também podem ser tratados dados operacionais, logs técnicos, dados de pedidos, informações de pagamento retornadas pelo backend e registros necessários para auditoria, suporte, segurança e conformidade.',
    ],
  },
  {
    title: '3. Finalidades do tratamento',
    paragraphs: [
      'Os dados são utilizados para criar e administrar contas, autenticar usuários, executar consultas fiscais, emitir pedidos, acompanhar pagamentos, prestar suporte e proteger a plataforma contra fraude, abuso e incidentes de segurança.',
      'O ValidaeNota também poderá tratar dados para cumprir obrigações legais e regulatórias, produzir registros de auditoria, melhorar a experiência do produto e manter a estabilidade operacional do ambiente.',
    ],
  },
  {
    title: '4. Compartilhamento de dados',
    paragraphs: [
      'O compartilhamento de dados poderá ocorrer com provedores de infraestrutura, serviços de autenticação, sistemas de pagamento, suporte técnico e outros operadores necessários para a execução do serviço, sempre dentro de bases legais adequadas.',
      'O ValidaeNota também poderá compartilhar dados quando houver obrigação legal, ordem de autoridade competente, necessidade de defesa de direitos ou prevenção de fraude e incidentes.',
    ],
  },
  {
    title: '5. Retenção e segurança',
    paragraphs: [
      'Os dados são armazenados pelo período necessário para atender às finalidades do serviço, obrigações legais, requisitos de auditoria, prevenção a fraudes e preservação de histórico operacional.',
      'Adotamos medidas técnicas e organizacionais razoáveis para reduzir riscos de acesso indevido, alteração, perda, vazamento ou destruição não autorizada de informações.',
    ],
  },
  {
    title: '6. Direitos do titular',
    paragraphs: [
      'Nos termos da legislação aplicável, você poderá solicitar confirmação do tratamento, acesso, correção, atualização, anonimização, eliminação quando cabível e informações sobre compartilhamento de dados.',
      'As solicitações poderão ser avaliadas conforme a base legal aplicável, obrigações de retenção, necessidade de preservação de evidências e limites técnicos ou regulatórios do serviço.',
    ],
  },
  {
    title: '7. Contato e atualizações',
    paragraphs: [
      'Dúvidas, solicitações relacionadas à privacidade e pedidos vinculados ao tratamento de dados poderão ser encaminhados pelos canais oficiais de atendimento do ValidaeNota.',
      'Esta Política poderá ser atualizada para refletir mudanças legais, operacionais ou técnicas. A versão vigente será sempre a publicada nas rotas oficiais da plataforma.',
    ],
  },
]

export function TermsOfServicePage() {
  return (
    <LegalLayout
      eyebrow="Documento Legal"
      title="Termos de Uso"
      subtitle="Estes termos regulam o acesso e a utilização da plataforma ValidaeNota, incluindo cadastro, uso operacional, compra de créditos, segurança da conta e regras gerais do serviço."
      updatedAt="22 de abril de 2026"
      sections={TERMS_SECTIONS}
      accentIcon={<FileText size={24} />}
    />
  )
}

export function PrivacyPolicyPage() {
  return (
    <LegalLayout
      eyebrow="Proteção de Dados"
      title="Política de Privacidade"
      subtitle="Esta política explica quais dados podem ser tratados pelo ValidaeNota, para quais finalidades, com quem podem ser compartilhados e quais são os principais direitos do titular."
      updatedAt="22 de abril de 2026"
      sections={PRIVACY_SECTIONS}
      accentIcon={<ShieldCheck size={24} />}
    />
  )
}
