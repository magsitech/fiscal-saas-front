import type {
  AuditoriaItem,
  Cliente,
  DashboardResumo,
  ExtratoItem,
  IniciarPedidoResponse,
  LoginPayload,
  Pedido,
  RegisterPayload,
  SaldoResumo,
  SimuladorResponse,
  StatusAuditoria,
  TipoMovimentacao,
  TokenResponse,
  ValidarNotaPayload,
  ValidarNotaResponse,
} from '@/types'

type MockUser = Cliente & { senha: string }

type MockDb = {
  users: MockUser[]
  pedidos: Pedido[]
  auditoria: AuditoriaItem[]
  extrato: ExtratoItem[]
  saldo: SaldoResumo
}

const DB_KEY = 'validaenota-mock-db'
const SESSION_KEY = 'validaenota-mock-session'

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

const DEFAULT_SALDO: SaldoResumo = {
  saldo_disponivel: '842.38',
  expira_em: '2026-04-29T23:59:59.000Z',
  status: 'ATIVO',
  consultas_no_periodo: 1384,
}

const DEFAULT_AUDITORIA: AuditoriaItem[] = [
  {
    id: 'aud_001',
    chave_nf: '35260312345678000123550010000012341000012345',
    modelo: '55',
    cnpj_emitente: '12345678000123',
    status: 'AUTORIZADA',
    status_sefaz: '100',
    cache_hit: false,
    custo_consulta: '0.1800',
    saldo_antes: '842.56',
    saldo_depois: '842.38',
    criado_em: '2026-03-30T17:12:00.000Z',
    processado_em: '2026-03-30T17:12:08.000Z',
  },
  {
    id: 'aud_002',
    chave_nf: '35260398765432000199550010000043211000098765',
    modelo: '65',
    cnpj_emitente: '98765432000199',
    status: 'CACHE_HIT',
    status_sefaz: '100',
    cache_hit: true,
    custo_consulta: null,
    saldo_antes: null,
    saldo_depois: null,
    criado_em: '2026-03-30T14:40:00.000Z',
    processado_em: '2026-03-30T14:40:01.000Z',
  },
  {
    id: 'aud_003',
    chave_nf: '31260345678901000188550010000022221000045678',
    modelo: '55',
    cnpj_emitente: '45678901000188',
    status: 'PROCESSANDO',
    status_sefaz: null,
    cache_hit: false,
    custo_consulta: null,
    saldo_antes: null,
    saldo_depois: null,
    criado_em: '2026-03-30T12:22:00.000Z',
    processado_em: null,
  },
  {
    id: 'aud_004',
    chave_nf: '41260311122233000144550010000055551000011122',
    modelo: '55',
    cnpj_emitente: '11122233000144',
    status: 'ERRO',
    status_sefaz: null,
    cache_hit: false,
    custo_consulta: null,
    saldo_antes: null,
    saldo_depois: null,
    criado_em: '2026-03-29T19:03:00.000Z',
    processado_em: '2026-03-29T19:03:11.000Z',
  },
]

const DEFAULT_EXTRATO: ExtratoItem[] = [
  {
    id: 'fin_001',
    tipo: 'CREDITO',
    valor: '500.0000',
    saldo_resultante: '842.56',
    descricao: 'Credito gerado pela confirmacao do pedido',
    expira_em: '2026-04-29T23:59:59.000Z',
    pedido_id: 'ped_001',
    log_auditoria_id: null,
    criado_em: '2026-03-25T13:20:00.000Z',
  },
  {
    id: 'fin_002',
    tipo: 'DEBITO',
    valor: '0.1800',
    saldo_resultante: '842.38',
    descricao: 'Debito por consulta fiscal',
    expira_em: null,
    pedido_id: null,
    log_auditoria_id: 'aud_001',
    criado_em: '2026-03-30T17:12:08.000Z',
  },
  {
    id: 'fin_003',
    tipo: 'DEBITO',
    valor: '0.1800',
    saldo_resultante: '842.20',
    descricao: 'Debito por consulta fiscal',
    expira_em: null,
    pedido_id: null,
    log_auditoria_id: 'aud_003',
    criado_em: '2026-03-30T18:02:08.000Z',
  },
]

const DEFAULT_PEDIDOS: Pedido[] = [
  {
    id: 'ped_001',
    metodo_pagamento: 'PIX',
    valor: '500.00',
    status: 'PAGO',
    confirmado_em: '2026-03-25T13:20:00.000Z',
    expira_em: '2026-03-25T13:45:00.000Z',
    credito_expira_em: '2026-04-29T23:59:59.000Z',
    criado_em: '2026-03-25T13:15:00.000Z',
  },
  {
    id: 'ped_002',
    metodo_pagamento: 'BOLETO',
    valor: '250.00',
    status: 'AGUARDANDO_PAGAMENTO',
    confirmado_em: null,
    expira_em: '2026-03-30T09:00:00.000Z',
    credito_expira_em: null,
    criado_em: '2026-03-27T09:00:00.000Z',
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

function countToday(items: AuditoriaItem[]) {
  const today = new Date().toISOString().slice(0, 10)
  return items.filter((item) => item.criado_em.slice(0, 10) === today).length
}

function totalDebitos(items: ExtratoItem[]) {
  return items
    .filter((item) => item.tipo === 'DEBITO')
    .reduce((sum, item) => sum + Number(item.valor), 0)
}

function buildResumo(db: MockDb): DashboardResumo {
  const debitosHoje = db.extrato.filter((item) => {
    return item.tipo === 'DEBITO' && item.criado_em.slice(0, 10) === new Date().toISOString().slice(0, 10)
  })

  return {
    saldo_disponivel: db.saldo.saldo_disponivel,
    saldo_expira_em: db.saldo.expira_em,
    saldo_status: db.saldo.status,
    consultas_periodo: db.saldo.consultas_no_periodo,
    gasto_periodo: totalDebitos(db.extrato).toFixed(2),
    consultas_hoje: countToday(db.auditoria),
    gasto_hoje: debitosHoje.reduce((sum, item) => sum + Number(item.valor), 0).toFixed(2),
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
      tipo: payload.tipo,
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
  async iniciar(metodo_pagamento: 'PIX' | 'BOLETO' | 'CARTAO', valor: number) {
    const db = readDb()
    const now = Date.now()
    const novoPedido: Pedido = {
      id: `ped_${now}`,
      metodo_pagamento,
      valor: valor.toFixed(2),
      status: metodo_pagamento === 'PIX' ? 'PENDENTE' : 'AGUARDANDO_PAGAMENTO',
      confirmado_em: null,
      expira_em: new Date(now + 30 * 60 * 1000).toISOString(),
      credito_expira_em: null,
      criado_em: new Date(now).toISOString(),
    }

    db.pedidos.unshift(novoPedido)
    writeDb(db)

    const response: IniciarPedidoResponse = {
      pedido_id: novoPedido.id,
      metodo_pagamento,
      valor: novoPedido.valor,
      status: novoPedido.status,
      expira_em: novoPedido.expira_em,
      pix_copia_cola: metodo_pagamento === 'PIX'
        ? `000201mock${novoPedido.id}${valor.toFixed(2).replace('.', '')}`
        : undefined,
      boleto_linha_digitavel: metodo_pagamento === 'BOLETO'
        ? '34191.79001 01043.510047 91020.150008 1 95870026000'
        : undefined,
      boleto_url: metodo_pagamento === 'BOLETO'
        ? 'https://example.com/mock-boleto.pdf'
        : undefined,
    }

    return delay(response)
  },

  async listar() {
    return delay(readDb().pedidos)
  },
}

export const mockFiscalApi = {
  async validar(payload: ValidarNotaPayload) {
    const db = readDb()
    const saldoAntes = Number(db.saldo.saldo_disponivel)
    const custoConsulta = 0.18
    const saldoDepois = Math.max(saldoAntes - custoConsulta, 0)
    const auditoriaId = `aud_${Date.now()}`

    const auditoria: AuditoriaItem = {
      id: auditoriaId,
      chave_nf: payload.chave_nf,
      modelo: payload.modelo,
      cnpj_emitente: payload.cnpj_emitente,
      status: badgeToStatus('PROCESSANDO'),
      status_sefaz: null,
      cache_hit: false,
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
      saldo_resultante: saldoDepois.toFixed(2),
      descricao: 'Debito por consulta fiscal',
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

    const response: ValidarNotaResponse = {
      auditoria_id: auditoriaId,
      chave_nf: payload.chave_nf,
      modelo: payload.modelo,
      status: 'PROCESSANDO',
      cache_hit: false,
    }

    return delay(response)
  },

  async consultar(id: string) {
    const item = readDb().auditoria.find((auditoria) => auditoria.id === id)
    if (!item) fail('Auditoria não encontrada', 404)
    return delay(item)
  },
}
