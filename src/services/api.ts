import axios from 'axios'
import type {
  TokenResponse, Usuario, LoginPayload, RegisterPayload,
  SaldoResumo, DashboardResumo, ValidacaoItem, ConsumoItem,
  SimuladorResponse, Pagamento, IniciarPagamentoResponse,
} from '@/types'
import { API_BASE_URL, USE_MOCK_API } from '@/config/runtime'

const apiBaseUrl = API_BASE_URL

async function loadMockApi() {
  return import('@/mocks/mockApi')
}

const http = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── Injeta access token em cada requisição ───────────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Renova token automaticamente em 401 ─────────────────────
let refreshing = false
let queue: Array<() => void> = []

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(http(original)))
        })
      }
      original._retry = true
      refreshing = true

      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('no refresh')

        const { data } = await axios.post<TokenResponse>(`${apiBaseUrl}/auth/refresh`, {
          refresh_token: refresh,
        })
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        queue.forEach((fn) => fn())
        queue = []
        return http(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ─────────────────────────────────────────────────────
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
    const { data } = await http.post<Usuario>('/auth/registro', payload)
    return data
  },

  me: async () => {
    if (USE_MOCK_API) {
      const { mockAuthApi } = await loadMockApi()
      return mockAuthApi.me()
    }
    const { data } = await http.get<Usuario>('/auth/me')
    return data
  },
}

// ── Saldo ────────────────────────────────────────────────────
export const saldoApi = {
  resumo: async () => {
    if (USE_MOCK_API) {
      const { mockSaldoApi } = await loadMockApi()
      return mockSaldoApi.resumo()
    }
    const { data } = await http.get<SaldoResumo>('/saldo')
    return data
  },
}

// ── Dashboard ────────────────────────────────────────────────
export const dashboardApi = {
  resumo: async () => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.resumo()
    }
    const { data } = await http.get<DashboardResumo>('/dashboard/resumo')
    return data
  },

  validacoes: async (params?: { status?: string; limit?: number; offset?: number }) => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.validacoes(params)
    }
    const { data } = await http.get<ValidacaoItem[]>('/dashboard/validacoes', { params })
    return data
  },

  consumo: async (params?: { limit?: number; offset?: number }) => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.consumo(params)
    }
    const { data } = await http.get<ConsumoItem[]>('/dashboard/consumo', { params })
    return data
  },

  simulador: async (quantidade: number) => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.simulador(quantidade)
    }
    const { data } = await http.get<SimuladorResponse>('/dashboard/simulador', {
      params: { quantidade },
    })
    return data
  },
}

// ── Pagamentos ───────────────────────────────────────────────
export const pagamentosApi = {
  iniciar: async (metodo: 'PIX' | 'BOLETO', valor: number) => {
    if (USE_MOCK_API) {
      const { mockPagamentosApi } = await loadMockApi()
      return mockPagamentosApi.iniciar(metodo, valor)
    }
    const { data } = await http.post<IniciarPagamentoResponse>('/pagamentos/iniciar', {
      metodo,
      valor,
    })
    return data
  },

  listar: async () => {
    if (USE_MOCK_API) {
      const { mockPagamentosApi } = await loadMockApi()
      return mockPagamentosApi.listar()
    }
    const { data } = await http.get<Pagamento[]>('/pagamentos')
    return data
  },
}

// ── Validação Fiscal ─────────────────────────────────────────
export const fiscalApi = {
  validar: async (payload: {
    url_qr_code: string
    cnpj_emitente: string
    cpf_destinatario?: string
    valor_total?: number
  }) => {
    if (USE_MOCK_API) {
      const { mockFiscalApi } = await loadMockApi()
      return mockFiscalApi.validar(payload)
    }
    const { data } = await http.post('/validar-nota', payload)
    return data
  },

  consultar: async (id: string) => {
    if (USE_MOCK_API) {
      const { mockFiscalApi } = await loadMockApi()
      return mockFiscalApi.consultar(id)
    }
    const { data } = await http.get(`/validar-nota/${id}`)
    return data
  },
}

export default http
