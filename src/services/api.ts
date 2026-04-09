import axios from 'axios'
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
  TokenResponse,
  ValidarNotaPayload,
  ValidarNotaResponse,
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
    const { data } = await http.post<Cliente>('/clientes', payload)
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
}

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

export const dashboardApi = {
  resumo: async () => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.resumo()
    }
    const { data } = await http.get<DashboardResumo>('/dashboard/resumo')
    return data
  },

  auditoria: async (params?: { status?: string; limit?: number; offset?: number }) => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.auditoria(params)
    }
    const { data } = await http.get<AuditoriaItem[]>('/dashboard/auditoria', { params })
    return data
  },

  extrato: async (params?: { tipo?: string; limit?: number; offset?: number }) => {
    if (USE_MOCK_API) {
      const { mockDashboardApi } = await loadMockApi()
      return mockDashboardApi.extrato(params)
    }
    const { data } = await http.get<ExtratoItem[]>('/dashboard/extrato', { params })
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

export const pedidosApi = {
  iniciar: async (metodo_pagamento: 'PIX' | 'BOLETO' | 'CARTAO', valor: number) => {
    if (USE_MOCK_API) {
      const { mockPedidosApi } = await loadMockApi()
      return mockPedidosApi.iniciar(metodo_pagamento, valor)
    }
    const { data } = await http.post<IniciarPedidoResponse>('/pedidos/iniciar', {
      metodo_pagamento,
      valor,
    })
    return data
  },

  listar: async () => {
    if (USE_MOCK_API) {
      const { mockPedidosApi } = await loadMockApi()
      return mockPedidosApi.listar()
    }
    const { data } = await http.get<Pedido[]>('/pedidos')
    return data
  },
}

export const fiscalApi = {
  validar: async (payload: ValidarNotaPayload) => {
    if (USE_MOCK_API) {
      const { mockFiscalApi } = await loadMockApi()
      return mockFiscalApi.validar(payload)
    }
    const { data } = await http.post<ValidarNotaResponse>('/validar-nota', payload)
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
