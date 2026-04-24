// CreditsScreen — PIX/BOLETO checkout (staging branch)

const PRESETS = ['50', '100', '200', '500', '1000']

function CardNumberInput({ value, onChange }) {
  const fmt = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  return <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" maxLength={19} value={fmt(value)} onChange={e => onChange(e.target.value.replace(/\s/g,''))} style={{ width:'100%', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'12px', padding:'12px 14px', color:'var(--text)', fontSize:'14px', fontFamily:'var(--font-mono)', outline:'none', boxSizing:'border-box', letterSpacing:'2px' }} />
}

function CreditsScreen({ navigate }) {
  const [metodo, setMetodo] = React.useState('PIX')
  const [valor, setValor] = React.useState('100')
  const [stage, setStage] = React.useState('idle') // idle | awaiting | paid
  const [card, setCard] = React.useState({ numero: '', nome: '', validade: '', cvv: '' })
  const [cardErros, setCardErros] = React.useState({})
  const [parcelas, setParcelas] = React.useState('1')

  const fmtMoney = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  function actionBtnStyle(tone = 'accent', disabled = false) {
    return {
      flex: 1, minHeight: '56px', display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '0 18px', borderRadius: '18px',
      border: tone === 'accent' ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
      background: tone === 'accent' ? 'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 88%, transparent), color-mix(in srgb, var(--info-dim) 56%, transparent))' : 'var(--surface)',
      color: 'var(--text)', opacity: disabled ? 0.55 : 1,
      boxShadow: tone === 'accent' ? '0 16px 40px rgba(0,212,170,0.10)' : '0 14px 32px rgba(15,23,42,0.10)',
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)',
    }
  }

  return (
    <AppShell screen="credits" navigate={navigate} title="Comprar créditos" subtitle="Gere um PIX ou boleto e acompanhe o pagamento por aqui" badge="Financeiro">
      <div style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Checkout card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em' }}>Compra de créditos</span>
          </div>

          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Info banner */}
            <div style={{ padding: '20px 22px', borderRadius: '18px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 88%, transparent), color-mix(in srgb, var(--info-dim) 42%, transparent))', border: '1px solid var(--accent-glow)', fontSize: '13px', lineHeight: 1.8, boxShadow: '0 16px 34px rgba(0,212,170,0.08)', color: 'var(--text-muted)' }}>
              Gere seu pagamento por PIX ou boleto e acompanhe tudo por aqui. Assim que a confirmação chegar, você poderá continuar.
            </div>

            {/* Método */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '12px' }}>Método de pagamento</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[{ id: 'PIX', label: 'PIX', note: 'Copia e cola imediato com QR Code.' },
                  { id: 'BOLETO', label: 'Boleto bancário', note: 'Linha digitável e link do boleto.' },
                  { id: 'CARTAO', label: 'Cartão de crédito', note: 'Débito imediato com parcelamento.' },
                ].map(opt => {
                  const active = metodo === opt.id
                  return (
                    <button key={opt.id} onClick={() => setMetodo(opt.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '18px 20px', borderRadius: '20px', border: `1px solid ${active ? 'var(--accent-glow)' : 'var(--border)'}`, background: active ? 'linear-gradient(135deg, var(--accent-dim), color-mix(in srgb, var(--info-dim) 40%, transparent))' : 'color-mix(in srgb, var(--surface-2) 92%, transparent)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--sans)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${active ? 'var(--accent-glow)' : 'var(--border)'}`, background: active ? 'rgba(0,212,170,0.08)' : 'var(--surface-2)', fontSize: '18px' }}>
                          {opt.id === 'PIX' ? '✦' : opt.id === 'BOLETO' ? '🏛' : '💳'}
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: active ? 'var(--text)' : 'var(--text-muted)' }}>{opt.label}</span>
                          <span style={{ fontSize: '11px', color: active ? 'var(--text-muted)' : 'var(--text-dim)' }}>{opt.note}</span>
                        </span>
                      </span>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: active ? 'var(--accent)' : 'var(--border-bright)', boxShadow: active ? '0 0 0 4px rgba(0,212,170,0.15)' : 'none' }} />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Valor */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '12px' }}>Valor</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                {PRESETS.map(p => {
                  const active = valor === p
                  return (
                    <button key={p} onClick={() => setValor(p)} style={{ padding: '10px 20px', borderRadius: '999px', border: `1px solid ${active ? 'var(--accent-glow)' : 'var(--border)'}`, background: active ? 'var(--accent-dim)' : 'color-mix(in srgb, var(--surface-2) 88%, transparent)', color: active ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      <span style={{ fontSize: '10px', opacity: 0.7, marginRight: '3px' }}>R$</span>{p}
                    </button>
                  )
                })}
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--text-dim)', pointerEvents: 'none' }}>R$</span>
                <input type="number" min={50} value={valor} onChange={e => setValor(e.target.value)} style={{ width: '100%', paddingLeft: '48px', paddingRight: '18px', paddingTop: '16px', paddingBottom: '16px', borderRadius: '16px', border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>Valor mínimo: R$ 50,00</p>
            </div>

            {/* Formulário cartão de crédito */}
            {metodo === 'CARTAO' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)' }}>Dados do cartão</div>

                {/* AbacatePay tokenization notice */}
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'var(--info-dim)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>🔒</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                    <strong style={{ color: 'var(--text)' }}>Tokenização segura via AbacatePay.</strong>{' '}
                    Os dados são enviados diretamente ao gateway — o backend nunca recebe o número completo. O frontend envia um{' '}
                    <code style={{ background: 'var(--surface-3)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>card_token</code>{' '}
                    com <code style={{ background: 'var(--surface-3)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>payment_method_id</code> e <code style={{ background: 'var(--surface-3)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>installments</code>.
                    Suporte a 3DS via <code style={{ background: 'var(--surface-3)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>three_ds_creq</code>.
                  </div>
                </div>

                {/* Card visual preview */}
                <div style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #0d1f1a, #0b1612)', border: '1px solid var(--accent-glow)', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,212,170,0.14)' }}>
                  <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.18), transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '-4px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(239,68,68,0.7)', marginRight: '-8px' }} />
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(245,158,11,0.7)' }} />
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--accent)', opacity: 0.8 }}>validaENota</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '17px', fontWeight: 600, letterSpacing: '3px', color: 'rgba(226,244,239,0.9)' }}>
                    {card.numero ? card.numero.replace(/(.{4})/g,'$1 ').trim().padEnd(19, ' ·') : '···· ···· ···· ····'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(226,244,239,0.45)', marginBottom: '3px' }}>Titular</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(226,244,239,0.8)', textTransform: 'uppercase', letterSpacing: '1px' }}>{card.nome || 'SEU NOME'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(226,244,239,0.45)', marginBottom: '3px' }}>Validade</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(226,244,239,0.8)' }}>{card.validade || 'MM/AA'}</div>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '6px' }}>Número do cartão</div>
                    <CardNumberInput value={card.numero} onChange={v => setCard(c => ({ ...c, numero: v }))} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '6px' }}>Nome do titular</div>
                    <input placeholder="NOME COMO NO CARTÃO" value={card.nome} onChange={e => setCard(c => ({ ...c, nome: e.target.value.toUpperCase() }))} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box', letterSpacing: '1px', textTransform: 'uppercase' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '6px' }}>Validade</div>
                    <input placeholder="MM/AA" maxLength={5} value={card.validade} onChange={e => {
                      let v = e.target.value.replace(/\D/g,'')
                      if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2,4)
                      setCard(c => ({ ...c, validade: v }))
                    }} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '6px' }}>CVV</div>
                    <input placeholder="···" maxLength={4} value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'') }))} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box', letterSpacing: '4px' }} />
                  </div>
                </div>

                {/* Parcelas */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '8px' }}>Parcelas</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['1', '2', '3', '6', '12'].map(p => {
                      const v = parseFloat(valor) || 0
                      const por = (v / parseInt(p)).toFixed(2)
                      const ativo = parcelas === p
                      return (
                        <button key={p} onClick={() => setParcelas(p)} style={{ padding: '8px 14px', borderRadius: '12px', border: `1px solid ${ativo ? 'var(--accent-glow)' : 'var(--border)'}`, background: ativo ? 'var(--accent-dim)' : 'var(--surface-2)', color: ativo ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '70px' }}>
                          <span>{p}×</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.8 }}>R$ {por}</span>
                        </button>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>Sem juros em até 3×. Acima disso, consulte as condições.</p>
                </div>
              </div>
            )}

            {/* Gerar botão */}
            <button onClick={() => setStage('awaiting')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '18px 24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.14)', background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, white))', color: '#041311', fontFamily: 'var(--sans)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,212,170,0.22)' }}>
              {metodo === 'PIX' ? '✦' : metodo === 'BOLETO' ? '🏛' : '💳'}
              {metodo === 'PIX' ? 'Gerar pedido PIX' : metodo === 'BOLETO' ? 'Gerar boleto' : `Pagar ${parcelas}× de R$ ${(parseFloat(valor)/parseInt(parcelas)).toFixed(2)}`} — {parseFloat(valor) > 0 ? fmtMoney(valor) : '--'}
            </button>
          </div>
        </div>

        {/* Order summary */}
        {stage !== 'idle' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em' }}>Resumo do pedido</span>
              <button style={{ minHeight: '44px', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '0 18px', borderRadius: '999px', border: '1px solid color-mix(in srgb, var(--accent-glow) 72%, var(--border))', background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--accent-dim) 62%, transparent))', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 16px 36px rgba(0,212,170,0.12)' }}>
                ↻ Atualizar status
              </button>
            </div>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {[['Pedido', 'a1b2c3d4-e5f6-...'], ['Status', null], ['Valor', fmtMoney(valor)], ['Expira em', '17/05/2026 12:00']].map(([lbl, val]) => (
                  <div key={lbl} style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>{lbl}</div>
                    {lbl === 'Status' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: stage === 'paid' ? 'var(--accent-dim)' : 'var(--warn-dim)', color: stage === 'paid' ? 'var(--accent)' : 'var(--warn)' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {stage === 'paid' ? 'Pago' : 'Aguardando Pagamento'}
                      </span>
                    ) : (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)' }}>{val}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* State panel */}
              <div style={{ padding: '18px', borderRadius: '16px', border: stage === 'paid' ? '1px solid var(--accent-glow)' : '1px solid var(--warn)', background: stage === 'paid' ? 'var(--accent-dim)' : 'var(--warn-dim)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', fontWeight: 700, color: 'var(--text)' }}>
                  {stage === 'paid' ? '✓' : '↻'} {stage === 'paid' ? 'Pagamento confirmado' : 'Aguardando pagamento'}
                </div>
                {stage === 'paid' ? 'Pagamento confirmado pelo backend e crédito já lançado.' : 'Pedido aguardando pagamento. Assim que a confirmação chegar, continuaremos por aqui.'}
              </div>

              {/* PIX section */}
              {metodo === 'PIX' && (
                <>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-muted)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 95%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', border: '1px solid color-mix(in srgb, var(--accent-glow) 55%, var(--border))', borderRadius: '18px', padding: '20px', lineHeight: 1.8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
                    00020101021226580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540{parseFloat(valor).toFixed(2).replace('.', '')}5802BR5913ValidaeNota6009SAO PAULO62070503***63042B8F
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={actionBtnStyle('accent')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,212,170,0.14)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)', fontSize: '16px' }}>⎘</span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Copiar código PIX</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Use no app do banco e acompanhe a confirmação por aqui</span>
                        </span>
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>PIX</span>
                    </button>
                  </div>
                </>
              )}

              {/* BOLETO section */}
              {metodo === 'BOLETO' && (
                <>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 95%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', border: '1px solid color-mix(in srgb, var(--info) 16%, var(--border))', borderRadius: '18px', padding: '20px', lineHeight: 1.8 }}>
                    10491.23456 78901.234567 89012.345678 9 01010000010000
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={actionBtnStyle('neutral')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--info)', border: '1px solid var(--border)', fontSize: '16px' }}>⎘</span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Copiar linha digitável</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Use no internet banking ou repasse ao financeiro</span>
                        </span>
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--info)' }}>BOL</span>
                    </button>
                    <button style={actionBtnStyle('accent')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,212,170,0.14)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)', fontSize: '14px' }}>↗</span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Abrir boleto</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Visualize ou baixe o boleto</span>
                        </span>
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>↗</span>
                    </button>
                  </div>
                </>
              )}

              {/* CARTÃO section */}
              {metodo === 'CARTAO' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '18px 20px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--info-dim)', border: '1px solid var(--info-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>💳</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>
                        Cartão final {card.numero ? card.numero.slice(-4).padStart(4,'·') : '····'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {parcelas}× de R$ {(parseFloat(valor)/parseInt(parcelas)).toFixed(2)} · {card.nome || 'Titular'}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: stage === 'paid' ? 'var(--accent-dim)' : 'var(--warn-dim)', color: stage === 'paid' ? 'var(--accent)' : 'var(--warn)' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {stage === 'paid' ? 'Aprovado' : 'Processando'}
                      </span>
                    </div>
                  </div>
                  {stage === 'paid' && (
                    <div style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--accent-glow)', background: 'var(--accent-dim)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                      <strong style={{ color: 'var(--accent)' }}>✓ Pagamento aprovado.</strong> Os créditos foram lançados automaticamente na sua conta.
                    </div>
                  )}
                </div>
              )}

              {/* Simular pagamento */}
              {stage !== 'paid' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                  <button onClick={() => setStage('paid')} style={{ padding: '8px 20px', borderRadius: '999px', border: '1px solid var(--accent-glow)', background: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    ↻ Simular pagamento confirmado
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

Object.assign(window, { CreditsScreen })
