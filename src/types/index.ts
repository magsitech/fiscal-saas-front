export type TipoCliente = 'PF' | 'PJ'
export type ModeloNotaFiscal = '55' | '65'
export type MetodoPagamento = 'PIX' | 'BOLETO' | 'CARTAO'
export type GatewayPayload = Record<string, unknown> | string | null
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
  valor_inicial?: string | null
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
  prox_consulta_custo: string | null
  prox_faixa: string | null
}

export interface AuditoriaItem {
  id: string
  chave_nf: string
  modelo: ModeloNotaFiscal
  cnpj_emitente: string
  status: StatusAuditoria
  status_sefaz: string | null
  cache_hit: boolean
  custo: string | null
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
  custo: string | null
  saldo_antes: string | null
  saldo_depois: string | null
  saldo_resultante: string | null
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

export type GatewayPixBoleto = 'mercadopago' | 'abacatepay'

export interface PedidosConfig {
  public_key: string
  sandbox: boolean
  gateway_pix_boleto: GatewayPixBoleto
  gateway_pix_boleto_sandbox: boolean
}

export interface PedidoBoletoPayerPayload {
  payer_zip_code: string
  payer_street_name: string
  payer_street_number: string
  payer_neighborhood: string
  payer_city: string
  payer_federal_unit: string
}

export interface IniciarPedidoRequest extends Partial<PedidoBoletoPayerPayload> {
  metodo: Extract<MetodoPagamento, 'PIX' | 'BOLETO'>
  valor: number
  descricao?: string
}

export interface PedidoStatusGatewayInfo {
  mp_status?: string | null
  mp_status_detail?: string | null
  gateway_id?: string | null
  gateway_payload?: GatewayPayload
}

export interface PedidoPagamentoData {
  checkout_url?: string | null
  pix_copia_cola?: string | null
  pix_qr_code_url?: string | null
  boleto_linha_digitavel?: string | null
  boleto_url?: string | null
}

export interface PedidoBase extends PedidoStatusGatewayInfo, PedidoPagamentoData {
  id: string
  metodo: MetodoPagamento
  valor: string
  status: StatusPedido
  expira_em: string | null
  credito_expira_em: string | null
  confirmado_em: string | null
  criado_em: string
}

export interface Pedido extends PedidoBase {}

export interface PedidoDetalhe extends PedidoBase {
  descricao?: string | null
}

export interface IniciarPedidoResponse extends PedidoPagamentoData, PedidoStatusGatewayInfo {
  pedido_id: string
  metodo: MetodoPagamento
  valor: string
  status: StatusPedido
  expira_em?: string | null
  credito_expira_em?: string | null
  criado_em?: string | null
  confirmado_em?: string | null
  credito_lancado?: boolean
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
