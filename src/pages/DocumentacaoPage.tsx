import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

type DocSection = 'rj-resumida' | 'rj-completa' | 'sp'

interface DocOption {
  id: DocSection
  label: string
  tag?: string
  disabled?: boolean
}

const DOC_OPTIONS: DocOption[] = [
  { id: 'rj-resumida', label: 'Consulta NF-e — RJ Resumida' },
  { id: 'rj-completa', label: 'Consulta NF-e — RJ Completa' },
  { id: 'sp', label: 'Consulta NF-e — SP', tag: 'Em breve', disabled: true },
]

const BASE_URL = 'https://api.validaenota.com.br'

interface DocContent {
  endpoint: string
  method: string
  description: string
  requestFields: Array<{ field: string; type: string; required: boolean; description: string }>
  curlExample: string
  pythonExample: string
  jsExample: string
  responseExample: string
}

const DOCS: Record<Exclude<DocSection, 'sp'>, DocContent> = {
  'rj-resumida': {
    endpoint: `${BASE_URL}/rj/consultar-nota/resumida`,
    method: 'POST',
    description:
      'Consulta resumida de NF-e/NFC-e emitidas no Estado do Rio de Janeiro. Retorna status SEFAZ e dados básicos da nota. Processamento assíncrono — use o auditoria_id para consultar o resultado.',
    requestFields: [
      { field: 'chave_nf', type: 'string', required: true, description: 'Chave de acesso da nota fiscal (44 dígitos)' },
      { field: 'webhook_url', type: 'string', required: false, description: 'URL para receber callback quando o resultado estiver disponível' },
    ],
    curlExample: `curl -X POST "${BASE_URL}/rj/consultar-nota/resumida" \\
  -H "Authorization: Bearer <SUA_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chave_nf": "35240112345678000190550010000012341234567890",
    "webhook_url": null
  }'`,
    pythonExample: `import requests

url = "${BASE_URL}/rj/consultar-nota/resumida"
headers = {
    "Authorization": "Bearer <SUA_API_KEY>",
    "Content-Type": "application/json"
}
payload = {
    "chave_nf": "35240112345678000190550010000012341234567890",
    "webhook_url": None
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    jsExample: `const response = await fetch("${BASE_URL}/rj/consultar-nota/resumida", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <SUA_API_KEY>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    chave_nf: "35240112345678000190550010000012341234567890",
    webhook_url: null
  })
});

const data = await response.json();
console.log(data);`,
    responseExample: `{
  "auditoria_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "chave_nf": "35240112345678000190550010000012341234567890",
  "modelo": "55",
  "uf": "rj",
  "status": "AUTORIZADA",
  "mensagem": "Nota autorizada pela SEFAZ",
  "cache_hit": false,
  "dados_nf": {
    "numero": "12341",
    "serie": "001",
    "valor_total": "1500.00",
    "emitente_cnpj": "12345678000190",
    "emitente_nome": "Empresa Exemplo Ltda"
  }
}`,
  },
  'rj-completa': {
    endpoint: `${BASE_URL}/rj/consultar-nota/completa`,
    method: 'POST',
    description:
      'Consulta completa de NF-e/NFC-e emitidas no Estado do Rio de Janeiro. Retorna XML completo e todos os dados da nota. Processamento assíncrono — use o auditoria_id para consultar o resultado.',
    requestFields: [
      { field: 'chave_nf', type: 'string', required: true, description: 'Chave de acesso da nota fiscal (44 dígitos)' },
      { field: 'webhook_url', type: 'string', required: false, description: 'URL para receber callback quando o resultado estiver disponível' },
    ],
    curlExample: `curl -X POST "${BASE_URL}/rj/consultar-nota/completa" \\
  -H "Authorization: Bearer <SUA_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chave_nf": "35240112345678000190550010000012341234567890",
    "webhook_url": null
  }'`,
    pythonExample: `import requests

url = "${BASE_URL}/rj/consultar-nota/completa"
headers = {
    "Authorization": "Bearer <SUA_API_KEY>",
    "Content-Type": "application/json"
}
payload = {
    "chave_nf": "35240112345678000190550010000012341234567890",
    "webhook_url": None
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    jsExample: `const response = await fetch("${BASE_URL}/rj/consultar-nota/completa", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <SUA_API_KEY>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    chave_nf: "35240112345678000190550010000012341234567890",
    webhook_url: null
  })
});

const data = await response.json();
console.log(data);`,
    responseExample: `{
  "auditoria_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "chave_nf": "35240112345678000190550010000012341234567890",
  "modelo": "55",
  "uf": "rj",
  "status": "AUTORIZADA",
  "mensagem": "Nota autorizada pela SEFAZ",
  "cache_hit": false,
  "dados_nf": {
    "numero": "12341",
    "serie": "001",
    "valor_total": "1500.00",
    "emitente_cnpj": "12345678000190",
    "emitente_nome": "Empresa Exemplo Ltda",
    "destinatario_cnpj": "98765432000199",
    "destinatario_nome": "Cliente Destino SA",
    "itens": [
      {
        "descricao": "Produto Exemplo",
        "quantidade": "10",
        "valor_unitario": "150.00",
        "valor_total": "1500.00"
      }
    ],
    "xml": "<?xml version=\"1.0\"?>..."
  }
}`,
  },
}

const STATUS_TABLE = [
  { status: 'AUTORIZADA', color: '#00d4aa', description: 'Nota autorizada pela SEFAZ' },
  { status: 'CANCELADA', color: '#ef4444', description: 'Nota cancelada pelo emitente' },
  { status: 'DENEGADA', color: '#f97316', description: 'Nota denegada pela SEFAZ' },
  { status: 'PROCESSANDO', color: '#a78bfa', description: 'Consulta em andamento' },
  { status: 'CACHE_HIT', color: '#60a5fa', description: 'Resultado retornado do cache (sem custo adicional)' },
  { status: 'ERRO', color: '#ef4444', description: 'Falha na comunicação com a SEFAZ' },
]

type Lang = 'curl' | 'python' | 'javascript'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        borderRadius: '8px',
        background: copied ? 'rgba(0,212,170,0.12)' : 'var(--surface-2)',
        border: '1px solid var(--border)',
        color: copied ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: '11px',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'var(--sans)',
        transition: 'all .15s',
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  )
}

export function DocumentacaoPage() {
  const [active, setActive] = useState<DocSection>('rj-resumida')
  const [lang, setLang] = useState<Lang>('curl')

  const doc = active !== 'sp' ? DOCS[active] : null

  const codeMap: Record<Lang, string> = doc
    ? { curl: doc.curlExample, python: doc.pythonExample, javascript: doc.jsExample }
    : { curl: '', python: '', javascript: '' }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.03em' }}>
          Documentação da API
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Referência de integração para consulta de notas fiscais.{' '}
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontSize: '12px' }}>
            {BASE_URL}
          </span>
        </p>
      </div>

      {/* Selector */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '28px',
          padding: '6px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
        }}
      >
        {DOC_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={opt.disabled}
            onClick={() => !opt.disabled && setActive(opt.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '11px',
              fontSize: '13px',
              fontWeight: 700,
              border: active === opt.id ? '1px solid var(--accent-glow)' : '1px solid transparent',
              background: active === opt.id ? 'var(--accent-dim)' : 'transparent',
              color: opt.disabled ? 'var(--text-dim)' : active === opt.id ? 'var(--accent)' : 'var(--text-muted)',
              cursor: opt.disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--sans)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all .15s',
              opacity: opt.disabled ? 0.5 : 1,
            }}
          >
            {opt.label}
            {opt.tag && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-dim)',
                  letterSpacing: '.04em',
                }}
              >
                {opt.tag}
              </span>
            )}
          </button>
        ))}
      </div>

      {doc && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Endpoint */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '10px' }}>
              Endpoint
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0,212,170,0.1)',
                  border: '1px solid rgba(0,212,170,0.2)',
                  color: 'var(--accent)',
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'var(--mono)',
                  letterSpacing: '.06em',
                }}
              >
                {doc.method}
              </span>
              <code style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)', wordBreak: 'break-all' }}>
                {doc.endpoint}
              </code>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '14px', marginBottom: 0 }}>
              {doc.description}
            </p>
          </div>

          {/* Auth */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '10px' }}>
              Autenticação
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '10px' }}>
              Envie sua API Key no header <code style={{ fontFamily: 'var(--mono)', color: 'var(--text)', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: '5px' }}>Authorization</code> como Bearer token:
            </p>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '12px 14px',
                color: 'var(--text-muted)',
              }}
            >
              Authorization: Bearer <span style={{ color: 'var(--accent)' }}>{'<SUA_API_KEY>'}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '10px', marginBottom: 0 }}>
              Gere e gerencie suas API Keys na página de{' '}
              <span style={{ color: 'var(--accent)' }}>Perfil</span>.
            </p>
          </div>

          {/* Request body */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '14px' }}>
              Corpo da Requisição (JSON)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>
                    {['Campo', 'Tipo', 'Obrigatório', 'Descrição'].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text-dim)',
                          fontWeight: 700,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '.1em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doc.requestFields.map((f) => (
                    <tr key={f.field}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        {f.field}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {f.type}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: f.required ? 'rgba(0,212,170,0.1)' : 'var(--surface-2)',
                            border: `1px solid ${f.required ? 'rgba(0,212,170,0.2)' : 'var(--border)'}`,
                            color: f.required ? 'var(--accent)' : 'var(--text-dim)',
                          }}
                        >
                          {f.required ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {f.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Code examples */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '14px' }}>
              Exemplo de Código
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
              {(['curl', 'python', 'javascript'] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  style={{
                    padding: '5px 13px',
                    borderRadius: '9px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: lang === l ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
                    background: lang === l ? 'var(--accent-dim)' : 'var(--surface-2)',
                    color: lang === l ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'var(--sans)',
                    transition: 'all .15s',
                    textTransform: l === 'curl' ? 'uppercase' : 'capitalize',
                  }}
                >
                  {l}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <CopyButton text={codeMap[lang]} />
            </div>
            <pre
              style={{
                margin: 0,
                padding: '16px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                color: 'var(--text)',
                overflowX: 'auto',
                lineHeight: 1.7,
                whiteSpace: 'pre',
              }}
            >
              {codeMap[lang]}
            </pre>
          </div>

          {/* Response example */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px 24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                Exemplo de Resposta
              </div>
              <CopyButton text={doc.responseExample} />
            </div>
            <pre
              style={{
                margin: 0,
                padding: '16px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                color: 'var(--text)',
                overflowX: 'auto',
                lineHeight: 1.7,
                whiteSpace: 'pre',
              }}
            >
              {doc.responseExample}
            </pre>
          </div>

          {/* Status table */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '14px' }}>
              Status Possíveis
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {STATUS_TABLE.map(({ status, color, description }) => (
                <div
                  key={status}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 9px',
                      borderRadius: '7px',
                      background: `${color}18`,
                      border: `1px solid ${color}33`,
                      color,
                      fontFamily: 'var(--mono)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      letterSpacing: '.04em',
                    }}
                  >
                    {status}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Async note */}
          <div
            style={{
              background: 'rgba(167,139,250,0.06)',
              border: '1px solid rgba(167,139,250,0.18)',
              borderRadius: '14px',
              padding: '16px 20px',
              fontSize: '13px',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: '#a78bfa' }}>Processamento assíncrono</strong> — A consulta retorna imediatamente com o{' '}
            <code style={{ fontFamily: 'var(--mono)', color: 'var(--text)', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: '4px' }}>auditoria_id</code>.
            {' '}Use esse ID para acompanhar o resultado na aba <strong style={{ color: 'var(--text)' }}>Auditoria</strong> ou configure um{' '}
            <code style={{ fontFamily: 'var(--mono)', color: 'var(--text)', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: '4px' }}>webhook_url</code>{' '}
            para receber o callback automaticamente quando o processamento concluir.
          </div>
        </div>
      )}
    </div>
  )
}
