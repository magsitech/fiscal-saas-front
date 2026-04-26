import type {
  ApiKeyCreateResponse,
  ApiKeyInfo,
  AuditoriaItem,
  Cliente,
  DashboardResumo,
  ExtratoItem,
  IniciarPedidoRequest,
  IniciarPedidoResponse,
  LoginPayload,
  Pedido,
  PedidoDetalhe,
  PedidosConfig,
  RegisterPayload,
  SaldoResumo,
  SimuladorResponse,
  StatusAuditoria,
  TipoMovimentacao,
  TokenResponse,
  AtualizarPerfilPayload,
  ConsultarNotaPayload,
  ConsultarNotaResponse,
  TipoConsulta,
  UfConsulta,
} from '@/types'

type MockUser = Cliente & { senha: string }

type MockDb = {
  apiKey: {
    prefixo: string
    sufixo: string
    criado_em: string
    revogado_em: string | null
  } | null
  users: MockUser[]
  pedidos: Pedido[]
  auditoria: AuditoriaItem[]
  extrato: ExtratoItem[]
  saldo: SaldoResumo
}

const DB_KEY = 'validaenota-mock-db-v2'
const SESSION_KEY = 'validaenota-mock-session-v2'
const MOCK_PIX_QR_CODE =
  'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 240 240%22%3E%3Crect width=%22240%22 height=%22240%22 rx=%2228%22 fill=%22white%22/%3E%3Crect x=%2220%22 y=%2220%22 width=%2260%22 height=%2260%22 rx=%2210%22 fill=%22%23041620%22/%3E%3Crect x=%2234%22 y=%2234%22 width=%2232%22 height=%2232%22 rx=%226%22 fill=%22white%22/%3E%3Crect x=%22160%22 y=%2220%22 width=%2260%22 height=%2260%22 rx=%2210%22 fill=%22%23041620%22/%3E%3Crect x=%22174%22 y=%2234%22 width=%2232%22 height=%2232%22 rx=%226%22 fill=%22white%22/%3E%3Crect x=%2220%22 y=%22160%22 width=%2260%22 height=%2260%22 rx=%2210%22 fill=%22%23041620%22/%3E%3Crect x=%2234%22 y=%22174%22 width=%2232%22 height=%2232%22 rx=%226%22 fill=%22white%22/%3E%3Cg fill=%22%23041620%22%3E%3Crect x=%22104%22 y=%2228%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22124%22 y=%2228%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22104%22 y=%2248%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22124%22 y=%2268%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22144%22 y=%2296%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22164%22 y=%2296%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22184%22 y=%2296%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22104%22 y=%22116%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22124%22 y=%22116%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22164%22 y=%22116%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22104%22 y=%22136%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22144%22 y=%22136%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22184%22 y=%22136%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%2296%22 y=%22160%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22116%22 y=%22160%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22136%22 y=%22160%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22176%22 y=%22160%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%2296%22 y=%22180%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22136%22 y=%22180%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22156%22 y=%22180%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22176%22 y=%22180%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22116%22 y=%22200%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22156%22 y=%22200%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3Crect x=%22196%22 y=%22200%22 width=%2212%22 height=%2212%22 rx=%223%22/%3E%3C/g%3E%3C/svg%3E'

const DEMO_USER: MockUser = {
  id: 'usr_demo_001',
  tipo: 'PJ',
  nome: 'Conta Demo Operações',
  nome_fantasia: 'Demo Fiscal',
  email: 'demo@validaenota.com.br',
  telefone: '11999999999',
  nr_documento: '12345678000123',
  ativo: true,
  criado_em: '2026-03-01T10:00:00.000Z',
  atualizado_em: '2026-03-01T10:00:00.000Z',
  senha: 'Demo@123',
}

function ago(days = 0, hours = 0, minutes = 0) {
  return new Date(Date.now() - (((days * 24) + hours) * 60 + minutes) * 60 * 1000).toISOString()
}

function ahead(days = 0, hours = 0, minutes = 0) {
  return new Date(Date.now() + (((days * 24) + hours) * 60 + minutes) * 60 * 1000).toISOString()
}

const DEFAULT_SALDO: SaldoResumo = {
  saldo_disponivel: '1247.92',
  valor_inicial: '1500.00',
  expira_em: ahead(21),
  status: 'ATIVO',
  consultas_no_periodo: 4328,
}

const DEFAULT_AUDITORIA: AuditoriaItem[] = [
  {
    id: 'aud_001',
    chave_nf: '35260412345678000123550010000012341000012345',
    modelo: '55',
    cnpj_emitente: '12345678000123',
    status: 'AUTORIZADA',
    status_sefaz: '100',
    cache_hit: false,
    custo: '0.1800',
    custo_consulta: '0.1800',
    saldo_antes: '1248.10',
    saldo_depois: '1247.92',
    criado_em: ago(0, 1, 12),
    processado_em: ago(0, 1, 11),
  },
  {
    id: 'aud_002',
    chave_nf: '35260498765432000199550010000043211000098765',
    modelo: '65',
    cnpj_emitente: '98765432000199',
    status: 'CACHE_HIT',
    status_sefaz: '100',
    cache_hit: true,
    custo: null,
    custo_consulta: null,
    saldo_antes: null,
    saldo_depois: null,
    criado_em: ago(0, 2, 5),
    processado_em: ago(0, 2, 4),
  },
  {
    id: 'aud_003',
    chave_nf: '31260445678901000188550010000022221000045678',
    modelo: '55',
    cnpj_emitente: '45678901000188',
    status: 'PROCESSANDO',
    status_sefaz: null,
    cache_hit: false,
    custo: null,
    custo_consulta: null,
    saldo_antes: null,
    saldo_depois: null,
    criado_em: ago(0, 0, 24),
    processado_em: null,
  },
  {
    id: 'aud_004',
    chave_nf: '41260411122233000144550010000055551000011122',
    modelo: '55',
    cnpj_emitente: '11122233000144',
    status: 'ERRO',
    status_sefaz: null,
    cache_hit: false,
    custo: null,
    custo_consulta: null,
    saldo_antes: null,
    saldo_depois: null,
    criado_em: ago(1, 4, 18),
    processado_em: ago(1, 4, 17),
  },
  {
    id: 'aud_005',
    chave_nf: '35260422446688000110550010000076541000022211',
    modelo: '55',
    cnpj_emitente: '22446688000110',
    status: 'DENEGADA',
    status_sefaz: '301',
    cache_hit: false,
    custo: '0.1800',
    custo_consulta: '0.1800',
    saldo_antes: '1248.28',
    saldo_depois: '1248.10',
    criado_em: ago(1, 7, 2),
    processado_em: ago(1, 7, 1),
  },
  {
    id: 'aud_006',
    chave_nf: '35260466554433000188550010000011221000033344',
    modelo: '65',
    cnpj_emitente: '66554433000188',
    status: 'CANCELADA',
    status_sefaz: '101',
    cache_hit: false,
    custo: '0.1800',
    custo_consulta: '0.1800',
    saldo_antes: '1248.46',
    saldo_depois: '1248.28',
    criado_em: ago(2, 3, 40),
    processado_em: ago(2, 3, 39),
  },
  {
    id: 'aud_007',
    chave_nf: '35260499887766000177550010000022221000055566',
    modelo: '55',
    cnpj_emitente: '99887766000177',
    status: 'PENDENTE',
    status_sefaz: null,
    cache_hit: false,
    custo: null,
    custo_consulta: null,
    saldo_antes: null,
    saldo_depois: null,
    criado_em: ago(3, 1, 20),
    processado_em: null,
  },
  {
    id: 'aud_008',
    chave_nf: '35260444556677000122550010000099991000077788',
    modelo: '65',
    cnpj_emitente: '44556677000122',
    status: 'AUTORIZADA',
    status_sefaz: '100',
    cache_hit: false,
    custo: '0.1800',
    custo_consulta: '0.1800',
    saldo_antes: '1248.64',
    saldo_depois: '1248.46',
    criado_em: ago(4, 5, 12),
    processado_em: ago(4, 5, 10),
  },
]

const DEFAULT_EXTRATO: ExtratoItem[] = [
  {
    id: 'fin_001',
    tipo: 'CREDITO',
    valor: '1000.0000',
    custo: null,
    saldo_antes: '248.64',
    saldo_depois: '1248.64',
    saldo_resultante: '1248.64',
    descricao: 'Crédito confirmado por pagamento via PIX',
    expira_em: ahead(21),
    pedido_id: 'ped_001',
    log_auditoria_id: null,
    criado_em: ago(5, 2, 0),
  },
  {
    id: 'fin_002',
    tipo: 'DEBITO',
    valor: '0.1800',
    custo: '0.1800',
    saldo_antes: '1248.10',
    saldo_depois: '1247.92',
    saldo_resultante: '1247.92',
    descricao: 'Débito por consulta fiscal autorizada',
    expira_em: null,
    pedido_id: null,
    log_auditoria_id: 'aud_001',
    criado_em: ago(0, 1, 11),
  },
  {
    id: 'fin_003',
    tipo: 'DEBITO',
    valor: '0.1800',
    custo: '0.1800',
    saldo_antes: '1248.28',
    saldo_depois: '1248.10',
    saldo_resultante: '1248.10',
    descricao: 'Débito por consulta fiscal denegada',
    expira_em: null,
    pedido_id: null,
    log_auditoria_id: 'aud_005',
    criado_em: ago(1, 7, 1),
  },
  {
    id: 'fin_004',
    tipo: 'DEBITO',
    valor: '0.1800',
    custo: '0.1800',
    saldo_antes: '1248.46',
    saldo_depois: '1248.28',
    saldo_resultante: '1248.28',
    descricao: 'Débito por consulta fiscal cancelada',
    expira_em: null,
    pedido_id: null,
    log_auditoria_id: 'aud_006',
    criado_em: ago(2, 3, 39),
  },
  {
    id: 'fin_005',
    tipo: 'ESTORNO',
    valor: '15.0000',
    custo: null,
    saldo_antes: '1233.46',
    saldo_depois: '1248.46',
    saldo_resultante: '1248.46',
    descricao: 'Estorno operacional liberado pelo suporte',
    expira_em: null,
    pedido_id: null,
    log_auditoria_id: null,
    criado_em: ago(3, 2, 15),
  },
  {
    id: 'fin_006',
    tipo: 'EXPIRACAO',
    valor: '32.5000',
    custo: null,
    saldo_antes: '1265.96',
    saldo_depois: '1233.46',
    saldo_resultante: '1233.46',
    descricao: 'Expiração parcial de saldo antigo do período anterior',
    expira_em: ago(1),
    pedido_id: null,
    log_auditoria_id: null,
    criado_em: ago(6, 0, 30),
  },
]

const DEFAULT_PEDIDOS: Pedido[] = [
  {
    id: 'ped_001',
    metodo: 'PIX',
    valor: '1000.00',
    status: 'PAGO',
    gateway_status: 'approved',
    gateway_status_detail: 'PAID',
    mp_status: null,
    mp_status_detail: null,
    confirmado_em: ago(5, 1, 40),
    expira_em: ago(5, 1, 10),
    credito_expira_em: ahead(21),
    criado_em: ago(5, 2, 0),
    checkout_url: null,
    pix_copia_cola: '000201mockped001100000',
    pix_qr_code_url: MOCK_PIX_QR_CODE,
    boleto_linha_digitavel: null,
    boleto_url: null,
    gateway_id: 'mock_001',
  },
  {
    id: 'ped_002',
    metodo: 'BOLETO',
    valor: '500.00',
    status: 'AGUARDANDO_PAGAMENTO',
    gateway_status: 'pending',
    gateway_status_detail: 'PENDING',
    mp_status: null,
    mp_status_detail: null,
    confirmado_em: null,
    expira_em: ahead(1, 6),
    credito_expira_em: null,
    criado_em: ago(0, 4, 30),
    checkout_url: null,
    pix_copia_cola: null,
    pix_qr_code_url: null,
    boleto_linha_digitavel: '34191.79001 01043.510047 91020.150008 1 95870026000',
    boleto_url: 'https://example.com/mock-boleto.pdf',
    gateway_id: 'mock_002',
  },
  {
    id: 'ped_003',
    metodo: 'PIX',
    valor: '250.00',
    status: 'AGUARDANDO_PAGAMENTO',
    gateway_status: 'pending',
    gateway_status_detail: 'PENDING',
    mp_status: null,
    mp_status_detail: null,
    confirmado_em: null,
    expira_em: ahead(0, 0, 25),
    credito_expira_em: null,
    criado_em: ago(0, 0, 5),
    checkout_url: null,
    pix_copia_cola: '000201mockped003250000',
    pix_qr_code_url: MOCK_PIX_QR_CODE,
    boleto_linha_digitavel: null,
    boleto_url: null,
    gateway_id: 'mock_003',
  },
  {
    id: 'ped_004',
    metodo: 'CARTAO',
    valor: '750.00',
    status: 'CANCELADO',
    gateway_status: 'cancelled',
    gateway_status_detail: 'CANCELLED',
    mp_status: null,
    mp_status_detail: null,
    confirmado_em: null,
    expira_em: ago(2, 1),
    credito_expira_em: null,
    criado_em: ago(2, 4, 5),
    checkout_url: null,
    pix_copia_cola: null,
    pix_qr_code_url: null,
    boleto_linha_digitavel: null,
    boleto_url: null,
    gateway_id: 'mock_004',
  },
  {
    id: 'ped_005',
    metodo: 'BOLETO',
    valor: '300.00',
    status: 'EXPIRADO',
    gateway_status: 'cancelled',
    gateway_status_detail: 'EXPIRED',
    mp_status: null,
    mp_status_detail: null,
    confirmado_em: null,
    expira_em: ago(7, 3),
    credito_expira_em: null,
    criado_em: ago(8, 1, 20),
    checkout_url: null,
    pix_copia_cola: null,
    pix_qr_code_url: null,
    boleto_linha_digitavel: '34191.79001 01043.510047 91020.150008 1 95870026000',
    boleto_url: 'https://example.com/mock-boleto-expired.pdf',
    gateway_id: 'mock_005',
  },
]

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function fail(message: string, status = 400): never {
  throw {
    response: {
      status,
      data: { detail: message },
    },
  }
}

function createDefaultDb(): MockDb {
  return {
    apiKey: null,
    users: [DEMO_USER],
    pedidos: DEFAULT_PEDIDOS,
    auditoria: DEFAULT_AUDITORIA,
    extrato: DEFAULT_EXTRATO,
    saldo: DEFAULT_SALDO,
  }
}

function ensureMockDb(db: Partial<MockDb>): MockDb {
  const users = Array.isArray(db.users) ? db.users : []
  const hasDemoUser = users.some((user) => user.email.toLowerCase() === DEMO_USER.email.toLowerCase())

  return {
    apiKey: db.apiKey ?? null,
    users: hasDemoUser ? users : [DEMO_USER, ...users],
    pedidos: Array.isArray(db.pedidos) ? db.pedidos : DEFAULT_PEDIDOS,
    auditoria: Array.isArray(db.auditoria) ? db.auditoria : DEFAULT_AUDITORIA,
    extrato: Array.isArray(db.extrato) ? db.extrato : DEFAULT_EXTRATO,
    saldo: db.saldo ?? DEFAULT_SALDO,
  }
}

function readDb(): MockDb {
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) {
    const seeded = createDefaultDb()
    writeDb(seeded)
    return seeded
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MockDb>
    const safeDb = ensureMockDb(parsed)
    writeDb(safeDb)
    return safeDb
  } catch {
    const seeded = createDefaultDb()
    writeDb(seeded)
    return seeded
  }
}

function writeDb(db: MockDb) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

function sanitizeUser(user: MockUser): Cliente {
  const { senha: _senha, ...safeUser } = user
  return safeUser
}

function issueTokens(userId: string): TokenResponse {
  return {
    access_token: `mock-access-${userId}`,
    refresh_token: `mock-refresh-${userId}`,
    token_type: 'bearer',
    expires_in: 900,
  }
}

function setSession(userId: string) {
  localStorage.setItem(SESSION_KEY, userId)
}

function getCurrentUserOrFail(): MockUser {
  const db = readDb()
  const sessionId = localStorage.getItem(SESSION_KEY) || DEMO_USER.id
  const user = db.users.find((item) => item.id === sessionId) || db.users[0]
  if (!user) fail('Sessão mock não encontrada', 401)
  return user
}

function localDateKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function countToday(items: AuditoriaItem[]) {
  const today = localDateKey(new Date())
  return items.filter((item) => localDateKey(item.criado_em) === today).length
}

function totalDebitos(items: ExtratoItem[]) {
  return items
    .filter((item) => item.tipo === 'DEBITO')
    .reduce((sum, item) => sum + Number(item.valor), 0)
}

function buildResumo(db: MockDb): DashboardResumo {
  const debitosHoje = db.extrato.filter((item) => {
    return item.tipo === 'DEBITO' && localDateKey(item.criado_em) === localDateKey(new Date())
  })

  return {
    saldo_disponivel: db.saldo.saldo_disponivel,
    saldo_expira_em: db.saldo.expira_em,
    saldo_status: db.saldo.status,
    consultas_periodo: db.saldo.consultas_no_periodo,
    gasto_periodo: totalDebitos(db.extrato).toFixed(2),
    consultas_hoje: countToday(db.auditoria),
    gasto_hoje: debitosHoje.reduce((sum, item) => sum + Number(item.valor), 0).toFixed(2),
    prox_consulta_custo: '0.1800',
    prox_faixa: '501-2.000',
  }
}

function getFaixas() {
  return [
    { limite: 500, preco: 0.22, nome: '1-500' },
    { limite: 2000, preco: 0.18, nome: '501-2.000' },
    { limite: 5000, preco: 0.16, nome: '2.001-5.000' },
    { limite: 10000, preco: 0.15, nome: '5.001-10.000' },
    { limite: 30000, preco: 0.13, nome: '10.001-30.000' },
    { limite: 50000, preco: 0.12, nome: '30.001-50.000' },
    { limite: Infinity, preco: 0.11, nome: '50.001+' },
  ]
}

function buildSimulacao(quantidade: number, acumuladoAtual = 1384): SimuladorResponse {
  let restante = quantidade
  let base = acumuladoAtual
  let total = 0
  const detalhes: SimuladorResponse['detalhes_por_faixa'] = []

  for (const faixa of getFaixas()) {
    if (restante <= 0) break
    const capacidade = faixa.limite === Infinity ? restante : Math.max(faixa.limite - base, 0)
    const consultas = Math.min(restante, capacidade)
    if (consultas <= 0) continue

    const custoFaixa = consultas * faixa.preco
    detalhes.push({
      faixa: faixa.nome,
      consultas,
      preco_unitario: faixa.preco.toFixed(4),
      custo_faixa: custoFaixa.toFixed(2),
    })
    total += custoFaixa
    restante -= consultas
    base += consultas
  }

  return {
    quantidade,
    acumulado_atual: acumuladoAtual,
    custo_total: total.toFixed(2),
    custo_medio_por_consulta: (total / quantidade).toFixed(4),
    detalhes_por_faixa: detalhes,
  }
}

function nextSaldo(db: MockDb, novoValor: number) {
  const atual = Number(db.saldo.saldo_disponivel)
  const saldoAtualizado = (atual + novoValor).toFixed(2)
  db.saldo = {
    ...db.saldo,
    saldo_disponivel: saldoAtualizado,
    status: Number(saldoAtualizado) > 0 ? 'ATIVO' : 'SEM_SALDO',
  }
}

function extratoPorTipo(items: ExtratoItem[], tipo?: string) {
  if (!tipo) return items
  return items.filter((item) => item.tipo === tipo)
}

function auditoriaPorStatus(items: AuditoriaItem[], status?: string) {
  if (!status) return items
  return items.filter((item) => item.status === status)
}

function badgeToStatus(value: string): StatusAuditoria {
  return value as StatusAuditoria
}

function randomKeyChunk(length: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

function buildApiKeyValue() {
  return `vn_${randomKeyChunk(40)}`
}

export const mockAuthApi = {
  async login(payload: LoginPayload) {
    const db = readDb()
    const user = db.users.find((item) => item.email.toLowerCase() === payload.username.toLowerCase())
    if (!user || user.senha !== payload.password) fail('Credenciais inválidas', 401)
    setSession(user.id)
    return delay(issueTokens(user.id))
  },

  async register(payload: RegisterPayload) {
    const db = readDb()
    const exists = db.users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase())
    if (exists) fail('Já existe uma conta com esse e-mail', 409)

    const user: MockUser = {
      id: `cli_${Date.now()}`,
      tipo: payload.tipo_cliente,
      nome: payload.nome,
      nome_fantasia: payload.nome_fantasia ?? null,
      email: payload.email,
      telefone: payload.telefone ?? null,
      nr_documento: payload.nr_documento,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      senha: payload.senha,
    }

    db.users.unshift(user)
    writeDb(db)
    return delay(sanitizeUser(user))
  },

  async me() {
    return delay(sanitizeUser(getCurrentUserOrFail()))
  },

  async atualizarPerfil(payload: AtualizarPerfilPayload) {
    const db = readDb()
    const user = getCurrentUserOrFail()
    const idx = db.users.findIndex((u) => u.id === user.id)
    if (idx !== -1) {
      if (payload.nome !== undefined) db.users[idx].nome = payload.nome
      if (payload.nome_fantasia !== undefined) db.users[idx].nome_fantasia = payload.nome_fantasia ?? null
      if (payload.telefone !== undefined) db.users[idx].telefone = payload.telefone ?? null
      writeDb(db)
    }
    return delay(sanitizeUser(db.users[idx]))
  },
}

export const mockSaldoApi = {
  async resumo() {
    return delay(readDb().saldo)
  },
}

export const mockDashboardApi = {
  async resumo() {
    return delay(buildResumo(readDb()))
  },

  async auditoria(params?: { status?: string; limit?: number; offset?: number }) {
    const { auditoria } = readDb()
    const filtered = auditoriaPorStatus(auditoria, params?.status)
    const offset = params?.offset ?? 0
    const limit = params?.limit ?? filtered.length
    return delay(filtered.slice(offset, offset + limit))
  },

  async extrato(params?: { tipo?: string; limit?: number; offset?: number }) {
    const { extrato } = readDb()
    const filtered = extratoPorTipo(extrato, params?.tipo)
    const offset = params?.offset ?? 0
    const limit = params?.limit ?? filtered.length
    return delay(filtered.slice(offset, offset + limit))
  },

  async simulador(quantidade: number) {
    return delay(buildSimulacao(quantidade))
  },
}

export const mockPedidosApi = {
  async config(): Promise<PedidosConfig> {
    return delay({
      public_key: 'mock_public_key',
      sandbox: true,
      gateway_pix_boleto: 'mercadopago' as const,
      gateway_pix_boleto_sandbox: true,
    })
  },

  async simularPagamento(pedidoId: string) {
    const db = readDb()
    const pedido = db.pedidos.find((item) => item.id === pedidoId)
    if (!pedido) fail('Pedido não encontrado', 404)
    pedido.status = 'PAGO'
    pedido.gateway_status = 'approved'
    pedido.gateway_status_detail = 'PAID'
    pedido.mp_status = 'approved'
    pedido.mp_status_detail = 'accredited'
    pedido.confirmado_em = new Date().toISOString()
    pedido.credito_lancado = true
    writeDb(db)
    return delay({ ok: true })
  },

  async iniciar(payload: IniciarPedidoRequest) {
    const db = readDb()
    const now = Date.now()
    const metodo = payload.metodo
    const novoPedido: Pedido = {
      id: `ped_${now}`,
      metodo,
      valor: payload.valor.toFixed(2),
      status: 'AGUARDANDO_PAGAMENTO',
      gateway_status: 'pending',
      gateway_status_detail: 'PENDING',
      mp_status: null,
      mp_status_detail: metodo === 'PIX' ? 'pending_waiting_transfer' : 'pending_waiting_payment',
      confirmado_em: null,
      expira_em: new Date(now + 30 * 60 * 1000).toISOString(),
      credito_expira_em: null,
      criado_em: new Date(now).toISOString(),
      checkout_url: metodo === 'BOLETO'
        ? 'https://example.com/mock-boleto-checkout'
        : metodo === 'CARTAO'
          ? 'https://example.com/mock-abacatepay-checkout'
          : null,
      pix_copia_cola: metodo === 'PIX'
        ? `000201mockped${now}${payload.valor.toFixed(2).replace('.', '')}`
        : null,
      pix_qr_code_url: metodo === 'PIX' ? MOCK_PIX_QR_CODE : null,
      boleto_linha_digitavel: metodo === 'BOLETO'
        ? '34191.79001 01043.510047 91020.150008 1 95870026000'
        : null,
      boleto_url: metodo === 'BOLETO' ? 'https://example.com/mock-boleto.pdf' : null,
      gateway_id: `mock_${now}`,
      credito_lancado: false,
    }

    db.pedidos.unshift(novoPedido)
    writeDb(db)

    const response: IniciarPedidoResponse = {
      pedido_id: novoPedido.id,
      metodo,
      valor: novoPedido.valor,
      status: novoPedido.status,
      gateway_status: novoPedido.gateway_status,
      gateway_status_detail: novoPedido.gateway_status_detail,
      mp_status: novoPedido.mp_status,
      mp_status_detail: novoPedido.mp_status_detail,
      expira_em: novoPedido.expira_em,
      credito_expira_em: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
      checkout_url: novoPedido.checkout_url,
      gateway_id: novoPedido.gateway_id,
      gateway_payload: JSON.stringify({
        provider: 'gateway',
        flow: 'checkout',
        checkout_url: novoPedido.checkout_url,
      }),
      pix_copia_cola: novoPedido.pix_copia_cola,
      pix_qr_code_url: novoPedido.pix_qr_code_url,
      boleto_linha_digitavel: novoPedido.boleto_linha_digitavel,
      boleto_url: novoPedido.boleto_url,
      credito_lancado: false,
    }

    return delay(response)
  },

  async listar() {
    return delay(readDb().pedidos)
  },

  async detalhar(pedidoId: string) {
    const pedido = readDb().pedidos.find((item) => item.id === pedidoId)
    if (!pedido) fail('Pedido não encontrado', 404)

    const response: PedidoDetalhe = {
      ...pedido,
      descricao: null,
    }

    return delay(response)
  },
}

export const mockFiscalApi = {
  async consultar(_uf: UfConsulta, _tipo: TipoConsulta, payload: ConsultarNotaPayload) {
    const db = readDb()
    const saldoAntes = Number(db.saldo.saldo_disponivel)
    const custoConsulta = 0.18
    const saldoDepois = Math.max(saldoAntes - custoConsulta, 0)
    const auditoriaId = `aud_${Date.now()}`

    const auditoria: AuditoriaItem = {
      id: auditoriaId,
      chave_nf: payload.chave_nf,
      modelo: '55',
      cnpj_emitente: '',
      status: badgeToStatus('PROCESSANDO'),
      status_sefaz: null,
      cache_hit: false,
      custo: null,
      custo_consulta: null,
      saldo_antes: null,
      saldo_depois: null,
      criado_em: new Date().toISOString(),
      processado_em: null,
    }

    const lancamento: ExtratoItem = {
      id: `fin_${Date.now()}`,
      tipo: 'DEBITO' as TipoMovimentacao,
      valor: custoConsulta.toFixed(4),
      custo: custoConsulta.toFixed(4),
      saldo_antes: saldoAntes.toFixed(2),
      saldo_depois: saldoDepois.toFixed(2),
      saldo_resultante: saldoDepois.toFixed(2),
      descricao: 'Débito por consulta fiscal',
      expira_em: null,
      pedido_id: null,
      log_auditoria_id: auditoriaId,
      criado_em: new Date().toISOString(),
    }

    db.auditoria.unshift(auditoria)
    db.extrato.unshift(lancamento)
    db.saldo.consultas_no_periodo += 1
    nextSaldo(db, -custoConsulta)
    writeDb(db)

    const response: ConsultarNotaResponse = {
      auditoria_id: auditoriaId,
      chave_nf: payload.chave_nf,
      modelo: '55',
      uf: _uf,
      status: 'PROCESSANDO',
      mensagem: 'Consulta em processamento',
      cache_hit: false,
      dados_nf: null,
    }

    return delay(response)
  },

  async obterResultado(_uf: UfConsulta, id: string, _tipo: TipoConsulta) {
    const item = readDb().auditoria.find((auditoria) => auditoria.id === id)
    if (!item) fail('Auditoria não encontrada', 404)
    const response: ConsultarNotaResponse = {
      auditoria_id: item!.id,
      chave_nf: item!.chave_nf,
      modelo: item!.modelo,
      uf: _uf,
      status: item!.status,
      mensagem: item!.status_sefaz ?? '',
      cache_hit: item!.cache_hit,
      dados_nf: null,
    }
    return delay(response)
  },
}

export const mockApiKeyApi = {
  async obter() {
    const { apiKey } = readDb()
    if (!apiKey || apiKey.revogado_em) return delay(null)

    const response: ApiKeyInfo = {
      prefixo: apiKey.prefixo,
      sufixo: apiKey.sufixo,
      criado_em: apiKey.criado_em,
      ativa: true,
    }

    return delay(response)
  },

  async gerar() {
    const db = readDb()
    const chave = buildApiKeyValue()
    const criadoEm = new Date().toISOString()

    db.apiKey = {
      prefixo: chave.slice(0, 10),
      sufixo: chave.slice(-4),
      criado_em: criadoEm,
      revogado_em: null,
    }

    writeDb(db)

    const response: ApiKeyCreateResponse = {
      chave,
      prefixo: db.apiKey.prefixo,
      sufixo: db.apiKey.sufixo,
      criado_em: db.apiKey.criado_em,
      ativa: true,
    }

    return delay(response)
  },

  async revogar() {
    const db = readDb()
    if (db.apiKey) {
      db.apiKey = {
        ...db.apiKey,
        revogado_em: new Date().toISOString(),
      }
      writeDb(db)
    }

    return delay(undefined)
  },
}
