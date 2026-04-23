import { PublicNav } from '@/components/layout/PublicNav'

export function ContactPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', minHeight: '100vh' }}>
      <PublicNav current="contact" />

      <section
        style={{
          padding: '64px 40px 40px',
          maxWidth: '760px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>
          Contato
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '16px' }}>
          Fale com a nossa equipe
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.8, margin: '0 auto' }}>
          Se você quiser tirar dúvidas, conversar sobre a plataforma ou entender melhor como podemos ajudar, estaremos à disposição.
        </p>
      </section>

      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '0 40px 72px' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: 'var(--shadow)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '12px' }}>
            Nosso e-mail
          </div>
          <a
            href="mailto:contato@magsitech.com.br"
            style={{
              display: 'inline-block',
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--accent)',
              textDecoration: 'none',
              wordBreak: 'break-word',
            }}
          >
            contato@magsitech.com.br
          </a>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, margin: '18px auto 0', maxWidth: '520px' }}>
            Envie sua mensagem e retornaremos assim que possível.
          </p>
        </div>
      </section>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '28px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6 }}>
          © 2026 validaeNota. Plataforma de validação fiscal brasileira.
          <br />
          MAGSI TECH CONSULTORIA EM TECNOLOGIA DA INFORMACAO LTDA - CNPJ: 66.328.989/0001-75
        </span>
      </footer>
    </div>
  )
}
