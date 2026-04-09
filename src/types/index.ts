export type TipoCliente = 'PF' | 'PJ'
export type ModeloNotaFiscal = '55' | '65'
export type MetodoPagamento = 'PIX' | 'BOLETO' | 'CARTAO'
export type StatusPedido =
  | 'PENDENTE'
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGO'
  | 'CANCELADO'
  | 'EXPIRADO'
export type TipoMovimentacao = 'CREDITO' | 'DEBITO' | 'EXPIRACAO' | 'ESTORNO'
export type StatusAuditoria =
  | 'PENDENTE'
  | 'PROCESSANDO'
  | 'AUTORIZADA'
  | 'CANCELADA'
  | 'DENEGADA'
  | 'ERRO'
  | 'CACHE_HIT'

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  tipo: TipoCliente
  nome: string
  nome_fantasia?: string | null
  email: string
  telefone?: string | null
  nr_documento: string
  senha: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface Cliente {
  id: string
  tipo: TipoCliente
  nome: string
  nome_fantasia: string | null
  email: string
  telefone: string | null
  nr_documento: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface SaldoResumo {
  saldo_disponivel: string
  expira_em: string | null
  status: 'ATIVO' | 'SEM_SALDO'
  consultas_no_periodo: number
}

export interface DashboardResumo {
  saldo_disponivel: string
  saldo_expira_em: string | null
  saldo_status: 'ATIVO' | 'SEM_SALDO'
  consultas_periodo: number
  gasto_periodo: string
  consultas_hoje: number
  gasto_hoje: string
}

export interface AuditoriaItem {
  id: string
  chave_nf: string
  modelo: ModeloNotaFiscal
  cnpj_emitente: string
  status: StatusAuditoria
  status_sefaz: string | null
  cache_hit: boolean
  custo_consulta: string | null
  saldo_antes: string | null
  saldo_depois: string | null
  criado_em: string
  processado_em: string | null
}

export interface ExtratoItem {
  id: string
  tipo: TipoMovimentacao
  valor: string
  saldo_resultante: string
  descricao: string | null
  expira_em: string | null
  pedido_id: string | null
  log_auditoria_id: string | null
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

export interface Pedido {
  id: string
  metodo_pagamento: MetodoPagamento
  valor: string
  status: StatusPedido
  confirmado_em: string | null
  expira_em: string | null
  credito_expira_em: string | null
  criado_em: string
}

export interface IniciarPedidoResponse {
  pedido_id: string
  metodo_pagamento: MetodoPagamento
  valor: string
  status: StatusPedido
  gateway_id?: string | null
  gateway_payload?: string | null
  pix_copia_cola?: string
  pix_qr_code_url?: string
  boleto_linha_digitavel?: string
  boleto_url?: string
  expira_em?: string | null
  credito_expira_em?: string | null
  criado_em?: string
  atualizado_em?: string
}

export interface ValidarNotaPayload {
  chave_nf: string
  modelo: ModeloNotaFiscal
  cnpj_emitente: string
  cpf_destinatario?: string
  valor_total_informado?: number
}

export interface ValidarNotaResponse {
  auditoria_id: string
  chave_nf: string
  modelo: ModeloNotaFiscal
  status: StatusAuditoria
  cache_hit: boolean
}

export interface ApiKeyInfo {
  prefixo: string
  sufixo: string
  criado_em: string
  ativa: boolean
}

export interface ApiKeyCreateResponse extends ApiKeyInfo {
  chave: string
}
