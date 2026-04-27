export type TipoCliente = 'PF' | 'PJ'
export type ModeloNotaFiscal = '55' | '65'
export type MetodoPagamento = 'PIX' | 'BOLETO' | 'CARTAO'
export type TipoPedido = 'CREDITO' | 'MENSALIDADE'
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
  | 'DADOS_INCONSISTENTES'
  | 'ERRO'
  | 'CACHE_HIT'

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  tipo_cliente: TipoCliente
  nome: string
  nome_fantasia?: string | null
  email: string
  telefone?: string | null
  nr_documento: string
  senha: string
  confirmacao_senha: string
  plano_selecionado?: string | null
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface ConfirmarEmailResponse {
  mensagem: string
}

export interface ReenviarConfirmacaoPayload {
  email: string
}

export interface EsqueciSenhaPayload {
  email: string
}

export interface RedefinirSenhaPayload {
  token: string
  nova_senha: string
}

export interface AtualizarPerfilPayload {
  nome?: string
  nome_fantasia?: string | null
  telefone?: string | null
}

export interface AlterarSenhaPayload {
  senha_atual: string
  nova_senha: string
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
  situacao_atual: 'ATIVO' | 'INATIVO' | 'CANCELADO' | 'SEM_SALDO' | 'TRIAL' | string
  plano_status: TipoPlano | string
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

export interface PedidoCartaoPayerPayload {
  card_token: string
  payment_method_id: string
  installments?: number
  issuer_id?: string
  payer_doc_type?: string
  payer_doc_number?: string
}

export interface PedidoCartaoDiretoPayload {
  card_number: string
  card_holder_name: string
  card_expiry_month: string
  card_expiry_year: string
  card_cvv: string
  card_installments?: number
}

export type IniciarPedidoRequest =
  | { metodo: 'PIX'; valor: number; tipo?: TipoPedido; descricao?: string; plano?: TipoPlano }
  | { metodo: 'BOLETO'; valor: number; tipo?: TipoPedido; descricao?: string; plano?: TipoPlano }
  | { metodo: 'CARTAO'; valor: number; tipo?: TipoPedido; descricao?: string; plano?: TipoPlano; card_installments?: number }

export interface PedidoStatusGatewayInfo {
  gateway_status?: string | null
  gateway_status_detail?: string | null
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
  tipo: TipoPedido
  metodo: MetodoPagamento
  valor: string
  status: StatusPedido
  expira_em: string | null
  credito_expira_em: string | null
  confirmado_em: string | null
  criado_em: string
  credito_lancado?: boolean
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
  three_ds_external_resource_url?: string | null
  three_ds_creq?: string | null
  expira_em?: string | null
  credito_expira_em?: string | null
  criado_em?: string | null
  confirmado_em?: string | null
  credito_lancado?: boolean
  card_last_four?: string | null
  card_brand?: string | null
}

export type UfConsulta = 'rj' | 'sp'
export type TipoConsulta = 'resumida' | 'completa'

export interface ConsultarNotaPayload {
  chave_nf: string
  webhook_url?: string | null
}

export interface ConsultarNotaResponse {
  auditoria_id: string
  chave_nf: string
  modelo: string
  uf: string
  status: StatusAuditoria
  mensagem: string
  cache_hit: boolean
  dados_nf: Record<string, unknown> | null
}

export type TipoPlano = 'TRIAL' | 'BASICO' | 'PRO' | 'BUSINESS' | 'CANCELADO' | 'INATIVO'

export interface AssinaturaResumo {
  plano: TipoPlano
  plano_ativo: boolean
  plano_selecionado: TipoPlano | null
  trial_expira_em: string | null
  trial_ativo: boolean
  assinatura_inicio: string | null
  ciclo_inicio: string | null
  ciclo_expira_em: string | null
  recorrente: boolean | null
  expiracao_em: string | null
  franquia_usada: number | null
  franquia_limite: number | null
  franquia_restante: number | null
  proximo_plano: TipoPlano | null
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

export interface AtivarPlanoPayload {
  plano: TipoPlano
  pedido_id?: string | null
}

export interface WebhookLog {
  id: string
  log_auditoria_id: string
  url: string
  tentativa: number
  status_http: number | null
  sucesso: boolean
  erro: string | null
  criado_em: string
}
