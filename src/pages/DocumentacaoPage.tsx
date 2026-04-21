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
  postEndpoint: string
  getEndpoint: string
  description: string
  requestFields: Array<{ field: string; type: string; required: boolean; description: string }>
  curlExample: string
  pythonExample: string
  jsExample: string
  javaExample: string
  getCurlExample: string
  getPythonExample: string
  getJsExample: string
  getJavaExample: string
  responseExample: string
}

const DOCS: Record<Exclude<DocSection, 'sp'>, DocContent> = {
  'rj-resumida': {
    postEndpoint: `${BASE_URL}/rj/consultar-nota/resumida`,
    getEndpoint: `${BASE_URL}/rj/consultar-nota/resumida/{auditoria_id}`,
    description:
      'Consulta resumida de NF-e/NFC-e emitidas no Estado do Rio de Janeiro. Retorna status SEFAZ e dados básicos da nota.',
    requestFields: [
      { field: 'chave_nf', type: 'string', required: true, description: 'Chave de acesso da nota fiscal (44 dígitos)' },
      { field: 'webhook_url', type: 'string | null', required: false, description: 'URL para receber o resultado via POST quando o worker terminar. Se omitido, a requisição aguarda de forma síncrona (até 120s).' },
    ],
    curlExample: `curl -X POST "${BASE_URL}/rj/consultar-nota/resumida" \\
  -H "Authorization: Bearer <SUA_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chave_nf": "35240112345678000190550010000012341234567890",
    "webhook_url": "https://meu-sistema.com/webhook/nf"
  }'`,
    pythonExample: `import requests

url = "${BASE_URL}/rj/consultar-nota/resumida"
headers = {
    "Authorization": "Bearer <SUA_API_KEY>",
    "Content-Type": "application/json"
}
payload = {
    "chave_nf": "35240112345678000190550010000012341234567890",
    "webhook_url": "https://meu-sistema.com/webhook/nf"  # ou None para síncrono
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
    webhook_url: "https://meu-sistema.com/webhook/nf" // ou null para síncrono
  })
});

const data = await response.json();
console.log(data);`,
    getCurlExample: `curl -X GET "${BASE_URL}/rj/consultar-nota/resumida/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \\
  -H "Authorization: Bearer <SUA_API_KEY>"`,
    getPythonExample: `import requests

auditoria_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
url = f"${BASE_URL}/rj/consultar-nota/resumida/{auditoria_id}"
headers = {"Authorization": "Bearer <SUA_API_KEY>"}

response = requests.get(url, headers=headers)
print(response.json())`,
    getJsExample: `const auditoriaId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const response = await fetch(
  \`${BASE_URL}/rj/consultar-nota/resumida/\${auditoriaId}\`,
  { headers: { "Authorization": "Bearer <SUA_API_KEY>" } }
);

const data = await response.json();
console.log(data);`,
    javaExample: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();
String body = """
        {
            "chave_nf": "35240112345678000190550010000012341234567890",
            "webhook_url": "https://meu-sistema.com/webhook/nf"
        }
        """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${BASE_URL}/rj/consultar-nota/resumida"))
    .header("Authorization", "Bearer <SUA_API_KEY>")
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,
    getJavaExample: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

String auditoriaId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${BASE_URL}/rj/consultar-nota/resumida/" + auditoriaId))
    .header("Authorization", "Bearer <SUA_API_KEY>")
    .GET()
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,
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
    postEndpoint: `${BASE_URL}/rj/consultar-nota/completa`,
    getEndpoint: `${BASE_URL}/rj/consultar-nota/completa/{auditoria_id}`,
    description:
      'Consulta completa de NF-e/NFC-e emitidas no Estado do Rio de Janeiro. Retorna XML completo e todos os dados estruturados da nota.',
    requestFields: [
      { field: 'chave_nf', type: 'string', required: true, description: 'Chave de acesso da nota fiscal (44 dígitos)' },
      { field: 'webhook_url', type: 'string | null', required: false, description: 'URL para receber o resultado via POST quando o worker terminar. Se omitido, a requisição aguarda de forma síncrona (até 120s).' },
    ],
    curlExample: `curl -X POST "${BASE_URL}/rj/consultar-nota/completa" \\
  -H "Authorization: Bearer <SUA_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chave_nf": "35240112345678000190550010000012341234567890",
    "webhook_url": "https://meu-sistema.com/webhook/nf"
  }'`,
    pythonExample: `import requests

url = "${BASE_URL}/rj/consultar-nota/completa"
headers = {
    "Authorization": "Bearer <SUA_API_KEY>",
    "Content-Type": "application/json"
}
payload = {
    "chave_nf": "35240112345678000190550010000012341234567890",
    "webhook_url": "https://meu-sistema.com/webhook/nf"  # ou None para síncrono
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
    webhook_url: "https://meu-sistema.com/webhook/nf" // ou null para síncrono
  })
});

const data = await response.json();
console.log(data);`,
    getCurlExample: `curl -X GET "${BASE_URL}/rj/consultar-nota/completa/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \\
  -H "Authorization: Bearer <SUA_API_KEY>"`,
    getPythonExample: `import requests

auditoria_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
url = f"${BASE_URL}/rj/consultar-nota/completa/{auditoria_id}"
headers = {"Authorization": "Bearer <SUA_API_KEY>"}

response = requests.get(url, headers=headers)
print(response.json())`,
    getJsExample: `const auditoriaId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const response = await fetch(
  \`${BASE_URL}/rj/consultar-nota/completa/\${auditoriaId}\`,
  { headers: { "Authorization": "Bearer <SUA_API_KEY>" } }
);

const data = await response.json();
console.log(data);`,
    javaExample: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpClient client = HttpClient.newHttpClient();
String body = """
        {
            "chave_nf": "35240112345678000190550010000012341234567890",
            "webhook_url": "https://meu-sistema.com/webhook/nf"
        }
        """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${BASE_URL}/rj/consultar-nota/completa"))
    .header("Authorization", "Bearer <SUA_API_KEY>")
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,
    getJavaExample: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

String auditoriaId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${BASE_URL}/rj/consultar-nota/completa/" + auditoriaId))
    .header("Authorization", "Bearer <SUA_API_KEY>")
    .GET()
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,
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
    "xml": "<?xml version=\\"1.0\\"?>..."
  }
}`,
  },
}

const STATUS_TABLE = [
  { status: 'AUTORIZADA', color: '#00d4aa', description: 'Nota autorizada pela SEFAZ' },
  { status: 'CANCELADA', color: '#ef4444', description: 'Nota cancelada pelo emitente' },
  { status: 'DENEGADA', color: '#f97316', description: 'Nota denegada pela SEFAZ' },
  { status: 'PENDENTE', color: '#a78bfa', description: 'Consulta recebida, aguardando o worker iniciar — tente o GET novamente em alguns segundos' },
  { status: 'PROCESSANDO', color: '#a78bfa', description: 'Consulta em andamento — tente o GET novamente em alguns segundos' },
  { status: 'CACHE_HIT', color: '#60a5fa', description: 'Resultado retornado do cache (sem custo adicional)' },
  { status: 'ERRO', color: '#ef4444', description: 'Falha na comunicação com a SEFAZ' },
]

type Lang = 'curl' | 'python' | 'javascript' | 'java'

const WEBHOOK_PAYLOAD_EXAMPLE = `{
  "auditoria_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "chave_nf": "35240112345678000190550010000012341234567890",
  "modelo": "55",
  "uf": "rj",
  "status": "AUTORIZADA",
  "mensagem": "Nota autorizada pela SEFAZ",
  "cache_hit": false,
  "dados_nf": { ... }
}`

const WEBHOOK_HANDLER_PYTHON = `from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/webhook/nf", methods=["POST"])
def receber_resultado():
    dados = request.get_json()

    auditoria_id = dados["auditoria_id"]
    status = dados["status"]
    dados_nf = dados.get("dados_nf")

    # Processe conforme o status
    if status == "AUTORIZADA":
        print(f"Nota {auditoria_id} autorizada:", dados_nf)
    elif status in ("CANCELADA", "DENEGADA", "ERRO"):
        print(f"Nota {auditoria_id} com problema: {status}")

    return jsonify({"ok": True}), 200`

const WEBHOOK_HANDLER_JAVA = `import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Set;

@RestController
public class WebhookController {

    @PostMapping("/webhook/nf")
    public Map<String, Boolean> receberResultado(
            @RequestBody Map<String, Object> payload) {

        String auditoriaId = (String) payload.get("auditoria_id");
        String status = (String) payload.get("status");

        if ("AUTORIZADA".equals(status)) {
            System.out.println("Nota autorizada: " + auditoriaId);
        } else if (Set.of("CANCELADA", "DENEGADA", "ERRO").contains(status)) {
            System.out.println("Problema: " + auditoriaId + " - " + status);
        }

        // Sempre retorne 200 — o sistema pode retentar se não receber OK
        return Map.of("ok", true);
    }
}`

const WEBHOOK_HANDLER_JS = `import express from "express";

const app = express();
app.use(express.json());

app.post("/webhook/nf", (req, res) => {
  const { auditoria_id, status, dados_nf } = req.body;

  if (status === "AUTORIZADA") {
    console.log("Nota autorizada:", auditoria_id, dados_nf);
  } else if (["CANCELADA", "DENEGADA", "ERRO"].includes(status)) {
    console.warn("Nota com problema:", auditoria_id, status);
  }

  // Sempre responda 200 — caso contrário o sistema pode retentar
  res.json({ ok: true });
});

app.listen(3000);`

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

function CodeBlock({ code, lang, onLangChange, langs }: {
  code: string
  lang: Lang
  onLangChange: (l: Lang) => void
  langs: Lang[]
}) {
  return (
    <>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', alignItems: 'center' }}>
        {langs.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onLangChange(l)}
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
        <CopyButton text={code} />
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
        {code}
      </pre>
    </>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px 24px',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '14px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export function DocumentacaoPage() {
  const [active, setActive] = useState<DocSection>('rj-resumida')
  const [postLang, setPostLang] = useState<Lang>('curl')
  const [getLang, setGetLang] = useState<Lang>('curl')
  const [webhookLang, setWebhookLang] = useState<'python' | 'javascript' | 'java'>('python')

  const doc = active !== 'sp' ? DOCS[active] : null

  const postCodeMap: Record<Lang, string> = doc
    ? { curl: doc.curlExample, python: doc.pythonExample, javascript: doc.jsExample, java: doc.javaExample }
    : { curl: '', python: '', javascript: '', java: '' }

  const getCodeMap: Record<Lang, string> = doc
    ? { curl: doc.getCurlExample, python: doc.getPythonExample, javascript: doc.getJsExample, java: doc.getJavaExample }
    : { curl: '', python: '', javascript: '', java: '' }

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

          {/* POST Endpoint */}
          <Card title="Endpoint — Iniciar Consulta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
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
                POST
              </span>
              <code style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)', wordBreak: 'break-all' }}>
                {doc.postEndpoint}
              </code>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 0 }}>
              {doc.description}
            </p>
          </Card>

          {/* GET Endpoint */}
          <Card title="Endpoint — Consultar Resultado">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(96,165,250,0.1)',
                  border: '1px solid rgba(96,165,250,0.2)',
                  color: '#60a5fa',
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'var(--mono)',
                  letterSpacing: '.06em',
                }}
              >
                GET
              </span>
              <code style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)', wordBreak: 'break-all' }}>
                {doc.getEndpoint}
              </code>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 0 }}>
              Use o <code style={{ fontFamily: 'var(--mono)', color: 'var(--text)', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: '4px' }}>auditoria_id</code> retornado pelo POST para consultar o resultado. Útil quando o status ainda for <strong style={{ color: '#a78bfa' }}>PROCESSANDO</strong>.
            </p>
          </Card>

          {/* Auth */}
          <Card title="Autenticação">
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
                marginBottom: '10px',
              }}
            >
              Authorization: Bearer <span style={{ color: 'var(--accent)' }}>{'<SUA_API_KEY>'}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: 0 }}>
              Gere e gerencie suas API Keys na página de{' '}
              <span style={{ color: 'var(--accent)' }}>Perfil</span>.
            </p>
          </Card>

          {/* Request body */}
          <Card title="Corpo da Requisição (JSON)">
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
          </Card>

          {/* Sync vs Async note */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(0,212,170,0.05)',
                border: '1px solid rgba(0,212,170,0.15)',
                borderRadius: '14px',
                padding: '16px 18px',
                fontSize: '13px',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '6px' }}>Sem webhook_url (síncrono)</strong>
              A requisição aguarda o resultado por até <strong style={{ color: 'var(--text)' }}>120 segundos</strong>. Ideal para integrações simples onde você quer a resposta diretamente no retorno do POST.
            </div>
            <div
              style={{
                background: 'rgba(167,139,250,0.05)',
                border: '1px solid rgba(167,139,250,0.15)',
                borderRadius: '14px',
                padding: '16px 18px',
                fontSize: '13px',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: '#a78bfa', display: 'block', marginBottom: '6px' }}>Com webhook_url (assíncrono)</strong>
              O POST retorna imediatamente com o <code style={{ fontFamily: 'var(--mono)', color: 'var(--text)', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: '4px' }}>auditoria_id</code>. Quando o worker terminar, fazemos um <strong style={{ color: 'var(--text)' }}>POST</strong> na sua URL com o resultado completo.
            </div>
          </div>

          {/* POST example */}
          <Card title="Exemplo — Iniciar Consulta (POST)">
            <CodeBlock
              code={postCodeMap[postLang]}
              lang={postLang}
              onLangChange={setPostLang}
              langs={['curl', 'python', 'javascript', 'java']}
            />
          </Card>

          {/* GET example */}
          <Card title="Exemplo — Consultar Resultado (GET)">
            <CodeBlock
              code={getCodeMap[getLang]}
              lang={getLang}
              onLangChange={setGetLang}
              langs={['curl', 'python', 'javascript', 'java']}
            />
          </Card>

          {/* Response example */}
          <Card title="Exemplo de Resposta">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
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
          </Card>

          {/* Status table */}
          <Card title="Status Possíveis">
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
          </Card>

          {/* Webhook section */}
          <Card title="Recebendo o Resultado via Webhook">
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              Quando o worker conclui o processamento, fazemos um <strong style={{ color: 'var(--text)' }}>POST</strong> na URL que você informou em <code style={{ fontFamily: 'var(--mono)', color: 'var(--text)', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: '4px' }}>webhook_url</code> com o resultado no corpo:
            </p>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>
                Payload enviado para sua URL
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <CopyButton text={WEBHOOK_PAYLOAD_EXAMPLE} />
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
                {WEBHOOK_PAYLOAD_EXAMPLE}
              </pre>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>
                Exemplo de handler no seu sistema
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', alignItems: 'center' }}>
                {(['python', 'javascript', 'java'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setWebhookLang(l)}
                    style={{
                      padding: '5px 13px',
                      borderRadius: '9px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: webhookLang === l ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
                      background: webhookLang === l ? 'var(--accent-dim)' : 'var(--surface-2)',
                      color: webhookLang === l ? 'var(--accent)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontFamily: 'var(--sans)',
                      transition: 'all .15s',
                      textTransform: 'capitalize',
                    }}
                  >
                    {l}
                  </button>
                ))}
                <div style={{ flex: 1 }} />
                <CopyButton text={webhookLang === 'python' ? WEBHOOK_HANDLER_PYTHON : webhookLang === 'java' ? WEBHOOK_HANDLER_JAVA : WEBHOOK_HANDLER_JS} />
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
                {webhookLang === 'python' ? WEBHOOK_HANDLER_PYTHON : webhookLang === 'java' ? WEBHOOK_HANDLER_JAVA : WEBHOOK_HANDLER_JS}
              </pre>
            </div>

            <div
              style={{
                background: 'rgba(249,115,22,0.06)',
                border: '1px solid rgba(249,115,22,0.18)',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: '#f97316' }}>Importante:</strong> sua URL de webhook deve responder com HTTP <strong style={{ color: 'var(--text)' }}>200</strong> dentro de alguns segundos. Se não responder ou retornar erro, o sistema pode retentar a entrega. Certifique-se de que o endpoint seja idempotente.
            </div>
          </Card>

        </div>
      )}
    </div>
  )
}
