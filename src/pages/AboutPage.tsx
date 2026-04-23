import { useNavigate } from 'react-router-dom'
import { PublicNav } from '@/components/layout/PublicNav'

const PILARES = [
  {
    title: 'Origem prática',
    description: 'Nascemos a partir de um problema vivido no dia a dia, com foco em resolver entraves reais da rotina fiscal.',
  },
  {
    title: 'Infraestrutura moderna',
    description: 'Desenvolvemos soluções com precisão, velocidade e confiabilidade para dar mais segurança às operações.',
  },
  {
    title: 'Visão de plataforma',
    description: 'Pensamos no produto com clareza, construímos com disciplina e entregamos uma base sólida para crescer.',
  },
]

export function AboutPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', minHeight: '100vh' }}>
      <PublicNav current="about" />

      <section
        style={{
          padding: '64px 40px 40px',
          maxWidth: '860px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>
          Sobre
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '16px' }}>
          Criamos infraestrutura fiscal para dar mais clareza e confiança às empresas
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '700px', margin: '0 auto' }}>
          Nascemos de um problema real: a burocracia travando empresas todos os dias.
        </p>
      </section>

      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '0 40px 56px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '30px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'grid', gap: '18px' }}>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.85, margin: 0 }}>
              Depois de lidar de perto com a lentidão, as inconsistências e a complexidade dos serviços da SEFAZ, especialmente no Rio de Janeiro, decidimos parar de aceitar o “jeito que sempre foi feito” e construir algo melhor.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.85, margin: 0 }}>
              Somos uma startup focada em infraestrutura fiscal moderna.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.85, margin: 0 }}>
              Criamos soluções que validam dados de notas fiscais de terceiros com precisão, velocidade e confiabilidade, reduzindo erros, evitando inconsistências e trazendo mais segurança para operações fiscais. Nosso foco é claro: garantir que os dados estejam corretos antes que se tornem um problema.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.85, margin: 0 }}>
              Pensamos como produto, construímos como engenharia e entregamos como plataforma.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.85, margin: 0 }}>
              Hoje, ajudamos empresas a operar com mais confiança e previsibilidade. E estamos só começando. Nosso próximo passo é escalar essa transformação para todo o Brasil.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 40px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {PILARES.map((item) => (
            <div
              key={item.title}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>{item.title}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 82%, var(--accent-dim) 18%), var(--surface))',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '56px 40px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Estamos só começando</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px' }}>
          Se a sua operação precisa de mais previsibilidade, segurança e confiança fiscal, vamos conversar.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            padding: '13px 32px',
            background: 'var(--accent)',
            color: '#04110d',
            border: 'none',
            borderRadius: '9px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
          }}
        >
          Acessar a Área do Cliente
        </button>
      </div>

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
