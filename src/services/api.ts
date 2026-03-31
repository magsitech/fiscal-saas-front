import axios from 'axios'
import type {
  TokenResponse, Usuario, LoginPayload, RegisterPayload,
  SaldoResumo, DashboardResumo, ValidacaoItem, ConsumoItem,
  SimuladorResponse, Pagamento, IniciarPagamentoResponse,
} from '@/types'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api'

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
    const { data } = await http.post<Usuario>('/auth/registro', payload)
    return data
  },

  me: async () => {
    const { data } = await http.get<Usuario>('/auth/me')
    return data
  },
}

// ── Saldo ────────────────────────────────────────────────────
export const saldoApi = {
  resumo: async () => {
    const { data } = await http.get<SaldoResumo>('/saldo')
    return data
  },
}

// ── Dashboard ────────────────────────────────────────────────
export const dashboardApi = {
  resumo: async () => {
    const { data } = await http.get<DashboardResumo>('/dashboard/resumo')
    return data
  },

  validacoes: async (params?: { status?: string; limit?: number; offset?: number }) => {
    const { data } = await http.get<ValidacaoItem[]>('/dashboard/validacoes', { params })
    return data
  },

  consumo: async (params?: { limit?: number; offset?: number }) => {
    const { data } = await http.get<ConsumoItem[]>('/dashboard/consumo', { params })
    return data
  },

  simulador: async (quantidade: number) => {
    const { data } = await http.get<SimuladorResponse>('/dashboard/simulador', {
      params: { quantidade },
    })
    return data
  },
}

// ── Pagamentos ───────────────────────────────────────────────
export const pagamentosApi = {
  iniciar: async (metodo: 'PIX' | 'BOLETO', valor: number) => {
    const { data } = await http.post<IniciarPagamentoResponse>('/pagamentos/iniciar', {
      metodo,
      valor,
    })
    return data
  },

  listar: async () => {
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
    const { data } = await http.post('/validar-nota', payload)
    return data
  },

  consultar: async (id: string) => {
    const { data } = await http.get(`/validar-nota/${id}`)
    return data
  },
}

export default http
