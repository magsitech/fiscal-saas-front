import type {
  ConsumoItem,
  DashboardResumo,
  IniciarPagamentoResponse,
  LoginPayload,
  Pagamento,
  RegisterPayload,
  SaldoResumo,
  SimuladorResponse,
  TokenResponse,
  Usuario,
  ValidacaoItem,
  ValidarNotaResponse,
} from '@/types'

type MockUser = Usuario & { senha: string }

type MockDb = {
  users: MockUser[]
  pagamentos: Pagamento[]
  validacoes: ValidacaoItem[]
  consumos: ConsumoItem[]
  saldo: SaldoResumo
}

const DB_KEY = 'validaenota-mock-db'
const SESSION_KEY = 'validaenota-mock-session'

const DEMO_USER: MockUser = {
  id: 'usr_demo_001',
  nome: 'Conta Demo',
  email: 'demo@validaenota.com.br',
  cpf: '12345678901',
  ativo: true,
  criado_em: '2026-03-01T10:00:00.000Z',
  senha: 'Demo@123',
}

const DEFAULT_SALDO: SaldoResumo = {
  saldo_disponivel: '842.38',
  valor_inicial: '1200.00',
  expira_em: '2026-04-29T23:59:59.000Z',
  status: 'ATIVO',
  consultas_no_periodo: 1384,
}

const DEFAULT_VALIDACOES: ValidacaoItem[] = [
  { id: 'val_001', chave_nf: '35260312345678000123550010000012341000012345', modelo: '55', cnpj_emitente: '12345678000123', status: 'AUTORIZADA', status_sefaz: '100', cache_hit: false, criado_em: '2026-03-30T17:12:00.000Z', processado_em: '2026-03-30T17:12:08.000Z' },
  { id: 'val_002', chave_nf: '35260398765432000199550010000043211000098765', modelo: '65', cnpj_emitente: '98765432000199', status: 'CACHE_HIT', status_sefaz: '100', cache_hit: true, criado_em: '2026-03-30T14:40:00.000Z', processado_em: '2026-03-30T14:40:01.000Z' },
  { id: 'val_003', chave_nf: '31260345678901000188550010000022221000045678', modelo: '55', cnpj_emitente: '45678901000188', status: 'PROCESSANDO', status_sefaz: null, cache_hit: false, criado_em: '2026-03-30T12:22:00.000Z', processado_em: null },
  { id: 'val_004', chave_nf: '41260311122233000144550010000055551000011122', modelo: '55', cnpj_emitente: '11122233000144', status: 'ERRO', status_sefaz: null, cache_hit: false, criado_em: '2026-03-29T19:03:00.000Z', processado_em: '2026-03-29T19:03:11.000Z' },
  { id: 'val_005', chave_nf: '35260355566677000188550010000077771000055566', modelo: '65', cnpj_emitente: '55566677000188', status: 'CANCELADA', status_sefaz: '101', cache_hit: false, criado_em: '2026-03-29T11:35:00.000Z', processado_em: '2026-03-29T11:35:10.000Z' },
  { id: 'val_006', chave_nf: '35260322233344000166550010000088881000022233', modelo: '55', cnpj_emitente: '22233344000166', status: 'AUTORIZADA', status_sefaz: '100', cache_hit: false, criado_em: '2026-03-28T08:15:00.000Z', processado_em: '2026-03-28T08:15:07.000Z' },
]

const DEFAULT_CONSUMOS: ConsumoItem[] = [
  { id: 'con_001', chave_nf: DEFAULT_VALIDACOES[0].chave_nf, faixa: '501 - 2.000', custo: '0.1800', saldo_antes: '842.56', saldo_depois: '842.38', criado_em: '2026-03-30T17:12:08.000Z' },
  { id: 'con_002', chave_nf: DEFAULT_VALIDACOES[1].chave_nf, faixa: '501 - 2.000', custo: '0.0300', saldo_antes: '842.59', saldo_depois: '842.56', criado_em: '2026-03-30T14:40:01.000Z' },
  { id: 'con_003', chave_nf: DEFAULT_VALIDACOES[5].chave_nf, faixa: '501 - 2.000', custo: '0.1800', saldo_antes: '842.77', saldo_depois: '842.59', criado_em: '2026-03-28T08:15:07.000Z' },
]

const DEFAULT_PAGAMENTOS: Pagamento[] = [
  { id: 'pag_001', metodo: 'PIX', valor: '500.00', status: 'CONFIRMADO', confirmado_em: '2026-03-25T13:20:00.000Z', criado_em: '2026-03-25T13:15:00.000Z' },
  { id: 'pag_002', metodo: 'BOLETO', valor: '250.00', status: 'PENDENTE', confirmado_em: null, criado_em: '2026-03-27T09:00:00.000Z' },
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
    users: [DEMO_USER],
    pagamentos: DEFAULT_PAGAMENTOS,
    validacoes: DEFAULT_VALIDACOES,
    consumos: DEFAULT_CONSUMOS,
    saldo: DEFAULT_SALDO,
  }
}

function readDb(): MockDb {
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) {
    const seeded = createDefaultDb()
    writeDb(seeded)
    return seeded
  }
  return JSON.parse(raw) as MockDb
}

function writeDb(db: MockDb) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

function sanitizeUser(user: MockUser): Usuario {
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
  if (!user) fail('Sessao mock nao encontrada', 401)
  return user
}

function countToday(validacoes: ValidacaoItem[]) {
  const today = new Date().toISOString().slice(0, 10)
  return validacoes.filter((item) => item.criado_em.slice(0, 10) === today).length
}

function totalSpent(consumos: ConsumoItem[]) {
  return consumos.reduce((sum, item) => sum + Number(item.custo), 0)
}

function buildResumo(db: MockDb): DashboardResumo {
  const gastoTotal = totalSpent(db.consumos)
  const hoje = db.consumos.filter((item) => item.criado_em.slice(0, 10) === new Date().toISOString().slice(0, 10))
  const gastoHoje = hoje.reduce((sum, item) => sum + Number(item.custo), 0)

  return {
    saldo_disponivel: db.saldo.saldo_disponivel,
    saldo_expira_em: db.saldo.expira_em,
    saldo_status: db.saldo.status,
    consultas_periodo: db.saldo.consultas_no_periodo,
    gasto_periodo: gastoTotal.toFixed(2),
    consultas_hoje: countToday(db.validacoes),
    gasto_hoje: gastoHoje.toFixed(2),
    prox_consulta_custo: '0.18',
    prox_faixa: '501 - 2.000',
  }
}

function getFaixas() {
  return [
    { limite: 500, preco: 0.22, nome: '1 - 500' },
    { limite: 2000, preco: 0.18, nome: '501 - 2.000' },
    { limite: 5000, preco: 0.16, nome: '2.001 - 5.000' },
    { limite: 10000, preco: 0.15, nome: '5.001 - 10.000' },
    { limite: 30000, preco: 0.13, nome: '10.001 - 30.000' },
    { limite: 50000, preco: 0.12, nome: '30.001 - 50.000' },
    { limite: Infinity, preco: 0.11, nome: '50.001 - 80.000' },
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
      preco_unitario: faixa.preco.toFixed(2),
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

export const mockAuthApi = {
  async login(payload: LoginPayload) {
    const db = readDb()
    const user = db.users.find((item) => item.email.toLowerCase() === payload.username.toLowerCase())
    if (!user || user.senha !== payload.password) fail('Credenciais invalidas', 401)
    setSession(user.id)
    return delay(issueTokens(user.id))
  },

  async register(payload: RegisterPayload) {
    const db = readDb()
    const exists = db.users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase())
    if (exists) fail('Ja existe uma conta com esse e-mail', 409)

    const user: MockUser = {
      id: `usr_${Date.now()}`,
      nome: payload.nome,
      email: payload.email,
      cpf: payload.cpf || '00000000000',
      ativo: true,
      criado_em: new Date().toISOString(),
      senha: payload.senha,
    }

    db.users.unshift(user)
    writeDb(db)
    return delay(sanitizeUser(user))
  },

  async me() {
    return delay(sanitizeUser(getCurrentUserOrFail()))
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

  async validacoes(params?: { status?: string; limit?: number; offset?: number }) {
    const { validacoes } = readDb()
    const filtered = params?.status ? validacoes.filter((item) => item.status === params.status) : validacoes
    const offset = params?.offset ?? 0
    const limit = params?.limit ?? filtered.length
    return delay(filtered.slice(offset, offset + limit))
  },

  async consumo(params?: { limit?: number; offset?: number }) {
    const { consumos } = readDb()
    const offset = params?.offset ?? 0
    const limit = params?.limit ?? consumos.length
    return delay(consumos.slice(offset, offset + limit))
  },

  async simulador(quantidade: number) {
    return delay(buildSimulacao(quantidade))
  },
}

export const mockPagamentosApi = {
  async iniciar(metodo: 'PIX' | 'BOLETO', valor: number) {
    const db = readDb()
    const novoPagamento: Pagamento = {
      id: `pag_${Date.now()}`,
      metodo,
      valor: valor.toFixed(2),
      status: 'PENDENTE',
      confirmado_em: null,
      criado_em: new Date().toISOString(),
    }

    db.pagamentos.unshift(novoPagamento)
    writeDb(db)

    const response: IniciarPagamentoResponse = {
      pagamento_id: novoPagamento.id,
      metodo,
      valor: novoPagamento.valor,
      status: novoPagamento.status,
      expira_em: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      pix_copia_cola: metodo === 'PIX' ? `000201mock${novoPagamento.id}${valor.toFixed(2).replace('.', '')}` : undefined,
      boleto_linha_digitavel: metodo === 'BOLETO' ? '34191.79001 01043.510047 91020.150008 1 95870026000' : undefined,
      boleto_url: metodo === 'BOLETO' ? 'https://example.com/mock-boleto.pdf' : undefined,
    }

    return delay(response)
  },

  async listar() {
    return delay(readDb().pagamentos)
  },
}

export const mockFiscalApi = {
  async validar(payload: {
    url_qr_code: string
    cnpj_emitente: string
    cpf_destinatario?: string
    valor_total?: number
  }) {
    const response: ValidarNotaResponse = {
      validacao_id: `mock_val_${Date.now()}`,
      chave_nf: payload.url_qr_code.slice(-44).padStart(44, '0'),
      modelo: '55',
      status: 'PROCESSANDO',
      mensagem: 'Validacao mock iniciada com sucesso',
      cache_hit: false,
      resultado: {
        ambiente: 'homologacao',
        emitente: payload.cnpj_emitente,
      },
    }

    return delay(response)
  },

  async consultar(id: string) {
    const item = readDb().validacoes.find((validacao) => validacao.id === id)
    if (!item) fail('Validacao nao encontrada', 404)
    return delay(item)
  },
}
