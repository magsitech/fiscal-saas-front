// ─── Auth ────────────────────────────────────────────────────
export interface LoginPayload {
  username: string // email (OAuth2 form field)
  password: string
}

export interface RegisterPayload {
  nome: string
  email: string
  cpf: string
  senha: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface Usuario {
  id: string
  nome: string
  email: string
  cpf: string
  ativo: boolean
  criado_em: string
}

// ─── Saldo ───────────────────────────────────────────────────
export interface SaldoResumo {
  saldo_disponivel: string
  expira_em: string | null
  status: 'ATIVO' | 'EXPIRADO' | 'ZERADO' | 'SEM_SALDO'
  consultas_no_periodo: number
  valor_inicial?: string
}

// ─── Dashboard ───────────────────────────────────────────────
export interface DashboardResumo {
  saldo_disponivel: string
  saldo_expira_em: string | null
  saldo_status: string
  consultas_periodo: number
  gasto_periodo: string
  consultas_hoje: number
  gasto_hoje: string
  prox_consulta_custo: string
  prox_faixa: string
}

export interface ValidacaoItem {
  id: string
  chave_nf: string
  modelo: string
  cnpj_emitente: string
  status: string
  status_sefaz: string | null
  cache_hit: boolean
  criado_em: string
  processado_em: string | null
}

export interface ConsumoItem {
  id: string
  chave_nf: string
  faixa: string
  custo: string
  saldo_antes: string
  saldo_depois: string
  criado_em: string
}

export interface SimuladorResponse {
  quantidade: number
  acumulado_atual: number
  custo_total: string
  custo_medio_por_consulta: string
  detalhes_por_faixa: Array<{
    faixa: string
    consultas: number
    preco_unitario: string
    custo_faixa: string
  }>
}

// ─── Pagamentos ──────────────────────────────────────────────
export type MetodoPagamento = 'PIX' | 'BOLETO'
export type StatusPagamento = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'EXPIRADO'

export interface Pagamento {
  id: string
  metodo: MetodoPagamento
  valor: string
  status: StatusPagamento
  confirmado_em: string | null
  criado_em: string
}

export interface IniciarPagamentoResponse {
  pagamento_id: string
  metodo: MetodoPagamento
  valor: string
  status: string
  pix_copia_cola?: string
  pix_qr_code_url?: string
  boleto_linha_digitavel?: string
  boleto_url?: string
  expira_em?: string
}

// ─── Validação ───────────────────────────────────────────────
export interface ValidarNotaResponse {
  validacao_id: string
  chave_nf: string
  modelo: string
  status: string
  mensagem: string
  cache_hit: boolean
  resultado?: Record<string, string>
}
