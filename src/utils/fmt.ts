// ── Formatação de valores ─────────────────────────────────────

export function fmtBRL(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function fmtBRL4(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })
}

export function fmtInt(value: number): string {
  return value.toLocaleString('pt-BR')
}

// ── Chave NF-e ────────────────────────────────────────────────
export function chaveShort(chave: string): string {
  return `${chave.slice(0, 10)}…${chave.slice(-4)}`
}

export function extrairUF(chave: string): string {
  const map: Record<string, string> = {
    '11': 'RO','12': 'AC','13': 'AM','14': 'RR','15': 'PA',
    '16': 'AP','17': 'TO','21': 'MA','22': 'PI','23': 'CE',
    '24': 'RN','25': 'PB','26': 'PE','27': 'AL','28': 'SE',
    '29': 'BA','31': 'MG','32': 'ES','33': 'RJ','35': 'SP',
    '41': 'PR','42': 'SC','43': 'RS','50': 'MS','51': 'MT',
    '52': 'GO','53': 'DF',
  }
  return map[chave.slice(0, 2)] ?? '??'
}

export function extrairModelo(chave: string): '55' | '65' | null {
  const m = chave.slice(20, 22)
  return (m === '55' || m === '65') ? m : null
}

// ── CNPJ ──────────────────────────────────────────────────────
export function formatCNPJ(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function formatCPF(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

// ── Datas ─────────────────────────────────────────────────────
export function diasRestantes(isoDate: string): number {
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86_400_000)
}
