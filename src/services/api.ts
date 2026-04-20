import axios from 'axios'
import type {
  ApiKeyCreateResponse,
  ApiKeyInfo,
  AuditoriaItem,
  Cliente,
  ConfirmarEmailResponse,
  ConsultarNotaPayload,
  ConsultarNotaResponse,
  DashboardResumo,
  EsqueciSenhaPayload,
  ExtratoItem,
  IniciarPedidoRequest,
  IniciarPedidoResponse,
  LoginPayload,
  Pedido,
  PedidoDetalhe,
  RedefinirSenhaPayload,
  RegisterPayload,
  ReenviarConfirmacaoPayload,
  SaldoResumo,
  SimuladorResponse,
  TipoConsulta,
  TokenResponse,
  UfConsulta,
} from '@/types'
import { API_BASE_URL, USE_MOCK_API } from '@/config/runtime'
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '@/utils/authStorage'

const apiBaseUrl = API_BASE_URL

async function loadMockApi() {
  return import('@/mocks/mockApi')
}

const http = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

function unwrapPayload<T>(payload: unknown): T {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const nested = record.data
    if (nested !== undefined) return unwrapPayload<T>(nested)
  }
  return payload as T
}

function unwrapList<T>(payload: unknown): T[] {
  const value = unwrapPayload<unknown>(payload)
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const candidates = [record.items, record.results, record.rows, record.records, record.content]
    const list = candidates.find(Array.isArray)
    if (Array.isArray(list)) return list as T[]
  }
  return []
}

function normalizeDashboardResumo(payload: unknown): DashboardResumo {
  const raw = unwrapPayload<Record<string, unknown>>(payload)
  return {
    saldo_disponivel: String(raw.saldo_disponivel ?? raw.saldo ?? '0.00'),
    saldo_expira_em: typeof raw.saldo_expira_em === 'string'
      ? raw.saldo_expira_em
      : typeof raw.expira_em === 'string'
        ? raw.expira_em
        : null,
    saldo_status: String(raw.saldo_status ?? raw.status ?? 'SEM_SALDO') as DashboardResumo['saldo_status'],
    consultas_periodo: Number(raw.consultas_periodo ?? raw.consultas_no_periodo ?? 0),
    gasto_periodo: String(raw.gasto_periodo ?? '0.00'),
    consultas_hoje: Number(raw.consultas_hoje ?? 0),
    gasto_hoje: String(raw.gasto_hoje ?? '0.00'),
    prox_consulta_custo: typeof raw.prox_consulta_custo === 'string' ? raw.prox_consulta_custo : null,
    prox_faixa: typeof raw.prox_faixa === 'string' ? raw.prox_faixa : null,
  }
}

function normalizeSaldoResumo(payload: unknown): SaldoResumo {
  const raw = unwrapPayload<Record<string, unknown>>(payload)
  return {
    saldo_disponivel: String(raw.saldo_disponivel ?? '0.00'),
    valor_inicial: typeof raw.valor_inicial === 'string' ? raw.valor_inicial : null,
    expira_em: typeof raw.expira_em === 'string' ? raw.expira_em : null,
    status: String(raw.status ?? 'SEM_SALDO') as SaldoResumo['status'],
    consultas_no_periodo: Number(raw.consultas_no_periodo ?? raw.consultas_periodo ?? 0),
  }
}

function normalizeAuditoriaItem(payload: unknown): AuditoriaItem {
  const raw = unwrapPayload<Record<string, unknown>>(payload)
  const custo = typeof raw.custo === 'string'
    ? raw.custo
    : typeof raw.custo_consulta === 'string'
      ? raw.custo_consulta
      : null

  return {
    id: String(raw.id ?? ''),
    chave_nf: String(raw.chave_nf ?? ''),
    modelo: String(raw.modelo ?? '55') as AuditoriaItem['modelo'],
    cnpj_emitente: String(raw.cnpj_emitente ?? ''),
    status: String(raw.status ?? 'PENDENTE') as AuditoriaItem['status'],
    status_sefaz: typeof raw.status_sefaz === 'string' ? raw.status_sefaz : null,
    cache_hit: Boolean(raw.cache_hit),
    custo,
    custo_consulta: custo,
    saldo_antes: typeof raw.saldo_antes === 'string' ? raw.saldo_antes : null,
    saldo_depois: typeof raw.saldo_depois === 'string' ? raw.saldo_depois : null,
    criado_em: typeof raw.criado_em === 'string' ? raw.criado_em : new Date().toISOString(),
    processado_em: typeof raw.processado_em === 'string' ? raw.processado_em : null,
  }
}

function normalizeExtratoItem(payload: unknown): ExtratoItem {
  const raw = unwrapPayload<Record<string, unknown>>(payload)
  const saldoDepois = typeof raw.saldo_depois === 'string'
    ? raw.saldo_depois
    : typeof raw.saldo_resultante === 'string'
      ? raw.saldo_resultante
      : null
  const valor = typeof raw.valor === 'string'
    ? raw.valor
    : typeof raw.custo === 'string'
      ? raw.custo
      : '0.00'

  return {
    id: String(raw.id ?? ''),
    tipo: String(raw.tipo ?? 'DEBITO') as ExtratoItem['tipo'],
    valor,
    custo: typeof raw.custo === 'string' ? raw.custo : null,
    saldo_antes: typeof raw.saldo_antes === 'string' ? raw.saldo_antes : null,
    saldo_depois: saldoDepois,
    saldo_resultante: saldoDepois,
    descricao: typeof raw.descricao === 'string' ? raw.descricao : null,
    expira_em: typeof raw.expira_em === 'string' ? raw.expira_em : null,
    pedido_id: typeof raw.pedido_id === 'string' ? raw.pedido_id : null,
    log_auditoria_id: typeof raw.log_auditoria_id === 'string'
      ? raw.log_auditoria_id
      : typeof raw.auditoria_id === 'string'
        ? raw.auditoria_id
        : null,
    criado_em: typeof raw.criado_em === 'string' ? raw.criado_em : new Date().toISOString(),
  }
}

function normalizeMetodo(value: unknown) {
  if (value === 'PIX' || value === 'BOLETO' || value === 'CARTAO') return value as Pedido['metodo']
  return 'PIX' as Pedido['metodo']
}

function normalizePedidoBase(raw: Record<string, unknown>) {
  return {
    id: String(raw.id ?? raw.pedido_id ?? ''),
    metodo: normalizeMetodo(raw.metodo ?? raw.metodo_pagamento),
    valor: String(raw.valor ?? '0.00'),
    status: String(raw.status ?? 'PENDENTE') as Pedido['status'],
    mp_status: typeof raw.mp_status === 'string' ? raw.mp_status : null,
    mp_status_detail: typeof raw.mp_status_detail === 'string' ? raw.mp_status_detail : null,
    descricao: typeof raw.descricao === 'string' ? raw.descricao : null,
    gateway_id: typeof raw.gateway_id === 'string' ? raw.gateway_id : raw.gateway_id == null ? null : String(raw.gateway_id),
    gateway_payload: (raw.gateway_payload ?? null) as Pedido['gateway_payload'],
    checkout_url: typeof raw.checkout_url === 'string' ? raw.checkout_url : null,
    pix_copia_cola: typeof raw.pix_copia_cola === 'string' ? raw.pix_copia_cola : null,
    pix_qr_code_url: typeof raw.pix_qr_code_url === 'string' ? raw.pix_qr_code_url : null,
    boleto_linha_digitavel: typeof raw.boleto_linha_digitavel === 'string' ? raw.boleto_linha_digitavel : null,
    boleto_url: typeof raw.boleto_url === 'string' ? raw.boleto_url : null,
    expira_em: typeof raw.expira_em === 'string' ? raw.expira_em : null,
    credito_expira_em: typeof raw.credito_expira_em === 'string' ? raw.credito_expira_em : null,
    confirmado_em: typeof raw.confirmado_em === 'string' ? raw.confirmado_em : null,
    criado_em: typeof raw.criado_em === 'string' ? raw.criado_em : new Date().toISOString(),
  }
}

function normalizePedido(payload: unknown): Pedido {
  const raw = unwrapPayload<Record<string, unknown>>(payload)
  return normalizePedidoBase(raw)
}

function normalizePedidoDetalhe(payload: unknown): PedidoDetalhe {
  const raw = unwrapPayload<Record<string, unknown>>(payload)
  return normalizePedidoBase(raw)
}

function normalizePedidoCriado(payload: unknown): IniciarPedidoResponse {
  const raw = unwrapPayload<Record<string, unknown>>(payload)
  return {
    pedido_id: String(raw.pedido_id ?? raw.id ?? ''),
    metodo: normalizeMetodo(raw.metodo ?? raw.metodo_pagamento),
    valor: String(raw.valor ?? '0.00'),
    status: String(raw.status ?? 'PENDENTE') as IniciarPedidoResponse['status'],
    mp_status: typeof raw.mp_status === 'string' ? raw.mp_status : null,
    mp_status_detail: typeof raw.mp_status_detail === 'string' ? raw.mp_status_detail : null,
    gateway_id: typeof raw.gateway_id === 'string' ? raw.gateway_id : raw.gateway_id == null ? null : String(raw.gateway_id),
    gateway_payload: (raw.gateway_payload ?? null) as IniciarPedidoResponse['gateway_payload'],
    checkout_url: typeof raw.checkout_url === 'string' ? raw.checkout_url : null,
    pix_copia_cola: typeof raw.pix_copia_cola === 'string' ? raw.pix_copia_cola : null,
    pix_qr_code_url: typeof raw.pix_qr_code_url === 'string' ? raw.pix_qr_code_url : null,
    boleto_linha_digitavel: typeof raw.boleto_linha_digitavel === 'string' ? raw.boleto_linha_digitavel : null,
    boleto_url: typeof raw.boleto_url === 'string' ? raw.boleto_url : null,
    expira_em: typeof raw.expira_em === 'string' ? raw.expira_em : null,
    credito_expira_em: typeof raw.credito_expira_em === 'string' ? raw.credito_expira_em : null,
    criado_em: typeof raw.criado_em === 'string' ? raw.criado_em : null,
    confirmado_em: typeof raw.confirmado_em === 'string' ? raw.confirmado_em : null,
    credito_lancado: typeof raw.credito_lancado === 'boolean' ? raw.credito_lancado : false,
  }
}

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = false
let queue: Array<() => void> = []

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && !original._retry) {
      if (refreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(http(original)))
        })
      }
      original._retry = true
      refreshing = true

      try {
        const refresh = getRefreshToken()
        if (!refresh) throw new Error('no refresh')

        const { data } = await axios.post<TokenResponse>(`${apiBaseUrl}/auth/refresh`, {
          refresh_token: refresh,
        })
        setAuthTokens(data.access_token, data.refresh_token)
        queue.forEach((fn) => fn())
        queue = []
        return http(original)
      } catch {
        clearAuthTokens()
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('validaenota-auth')
          window.location.href = '/login'
        }
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (payload: LoginPayload) => {
    if (USE_MOCK_API) {
      const { mockAuthApi } = await loadMockApi()
      return mockAuthApi.login(payload)
    }
    const form = new URLSearchParams({
      username: payload.username,
      password: payload.password,
    })
    const { data } = await http.post<TokenResponse>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },

  register: async (payload: RegisterPayload) => {
    if (USE_MOCK_API) {
      const { mockAuthApi } = await loadMockApi()
      return mockAuthApi.register(payload)
    }
    const { data } = await http.post<Cliente>('/clientes', {
      ...payload,
      tipo_cliente: payload.tipo_cliente,
    })
    return data
  },

  me: async () => {
    if (USE_MOCK_API) {
      const { mockAuthApi } = await loadMockApi()
      return mockAuthApi.me()
    }
    const { data } = await http.get<Cliente>('/auth/me')
    return data
  },

  confirmarEmail: async (token: string) => {
    const { data } = await axios.get<ConfirmarEmailResponse>(`${apiBaseUrl}/clientes/confirmar-email`, {
      params: { token },
    })
    return data
  },

  reenviarConfirmacao: async (payload: ReenviarConfirmacaoPayload) => {
    const { data } = await axios.post(`${apiBaseUrl}/clientes/reenviar-confirmacao`, payload)
    return data
  },

  esqueciSenha: async (payload: EsqueciSenhaPayload) => {
    const { data } = await axios.post(`${apiBaseUrl}/auth/esqueci-senha`, payload)
    return data
  },

  redefinirSenha: async (payload: RedefinirSenhaPayload) => {
    const { data } = await axios.post(`${apiBaseUrl}/auth/redefinir-senha`, payload)
    return data
  },
}

export const saldoApi = {
  resumo: async () => {
    if (USE_MOCK_API) {
      const { mockSaldoApi } = await loadMockApi()
      return mockSaldoApi.resumo()
    }
    const { data } = await http.get<SaldoResumo>('/saldo')
    return normalizeSaldoResumo(data)
  },
}

export const dashboardApi = {
  resumo: async () => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.resumo()
    }
    const { data } = await http.get<DashboardResumo>('/dashboard/resumo')
    return normalizeDashboardResumo(data)
  },

  auditoria: async (params?: { status?: string; limit?: number; offset?: number }) => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.auditoria(params)
    }
    const { data } = await http.get<AuditoriaItem[]>('/dashboard/auditoria', { params })
    return unwrapList<Record<string, unknown>>(data).map(normalizeAuditoriaItem)
  },

  extrato: async (params?: { tipo?: string; limit?: number; offset?: number }) => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.extrato(params)
    }
    const { data } = await http.get<ExtratoItem[]>('/dashboard/extrato', { params })
    return unwrapList<Record<string, unknown>>(data).map(normalizeExtratoItem)
  },

  simulador: async (quantidade: number) => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.simulador(quantidade)
    }
    const { data } = await http.get<SimuladorResponse>('/dashboard/simulador', {
      params: { quantidade },
    })
    return unwrapPayload<SimuladorResponse>(data)
  },
}

export const pedidosApi = {
  iniciar: async (payload: IniciarPedidoRequest) => {
    if (USE_MOCK_API) {
      const { mockPedidosApi } = await loadMockApi()
      return mockPedidosApi.iniciar(payload)
    }
    const { data } = await http.post<IniciarPedidoResponse>('/pedidos/iniciar', payload)
    return normalizePedidoCriado(data)
  },

  listar: async () => {
    if (USE_MOCK_API) {
      const { mockPedidosApi } = await loadMockApi()
      return mockPedidosApi.listar()
    }
    const { data } = await http.get<Pedido[]>('/pedidos')
    return unwrapList<Record<string, unknown>>(data).map(normalizePedido)
  },

  detalhar: async (pedidoId: string) => {
    if (USE_MOCK_API) {
      const { mockPedidosApi } = await loadMockApi()
      return mockPedidosApi.detalhar(pedidoId)
    }
    const { data } = await http.get<PedidoDetalhe>(`/pedidos/${pedidoId}`)
    return normalizePedidoDetalhe(data)
  },
}

export const fiscalApi = {
  consultar: async (uf: UfConsulta, tipo: TipoConsulta = 'resumida', payload: ConsultarNotaPayload) => {
    if (USE_MOCK_API) {
      const { mockFiscalApi } = await loadMockApi()
      return mockFiscalApi.consultar(uf, tipo, payload)
    }
    const path = uf === 'sp' ? '/sp/consultar-nota' : `/rj/consultar-nota/${tipo}`
    const { data } = await http.post<ConsultarNotaResponse>(path, payload)
    return data
  },

  obterResultado: async (uf: UfConsulta, auditoriaId: string, tipo: TipoConsulta = 'resumida') => {
    if (USE_MOCK_API) {
      const { mockFiscalApi } = await loadMockApi()
      return mockFiscalApi.obterResultado(uf, auditoriaId, tipo)
    }
    const path = uf === 'sp' ? `/sp/consultar-nota/${auditoriaId}` : `/rj/consultar-nota/${tipo}/${auditoriaId}`
    const { data } = await http.get<ConsultarNotaResponse>(path)
    return data
  },
}

export const apiKeyApi = {
  obter: async () => {
    if (USE_MOCK_API) {
      const { mockApiKeyApi } = await loadMockApi()
      return mockApiKeyApi.obter()
    }

    try {
      const { data } = await http.get<ApiKeyInfo>('/clientes/api-key')
      return unwrapPayload<ApiKeyInfo>(data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  gerar: async () => {
    if (USE_MOCK_API) {
      const { mockApiKeyApi } = await loadMockApi()
      return mockApiKeyApi.gerar()
    }

    const { data } = await http.post<ApiKeyCreateResponse>('/clientes/api-key')
    return unwrapPayload<ApiKeyCreateResponse>(data)
  },

  revogar: async () => {
    if (USE_MOCK_API) {
      const { mockApiKeyApi } = await loadMockApi()
      return mockApiKeyApi.revogar()
    }

    await http.delete('/clientes/api-key')
  },
}

export default http
