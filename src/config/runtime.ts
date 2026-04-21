export const STAGING_FRONTEND_URL = 'https://staging.validaenota.com.br'
export const MAIN_FRONTEND_URL = 'https://app.validaenota.com.br'

export const STAGING_API_BASE_URL = 'https://staging.api.validaenota.com.br'
export const MAIN_API_BASE_URL = 'https://api.validaenota.com.br'

export type AppEnvironment = 'staging' | 'main'

const ENVIRONMENT_URLS: Record<AppEnvironment, { frontendUrl: string; apiBaseUrl: string }> = {
  staging: {
    frontendUrl: STAGING_FRONTEND_URL,
    apiBaseUrl: STAGING_API_BASE_URL,
  },
  main: {
    frontendUrl: MAIN_FRONTEND_URL,
    apiBaseUrl: MAIN_API_BASE_URL,
  },
}

const rawAppEnv = import.meta.env.VITE_APP_ENV
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
const rawUseMockApi = import.meta.env.VITE_USE_MOCK_API === 'true'
if (rawAppEnv !== 'staging' && rawAppEnv !== 'main') {
  throw new Error('VITE_APP_ENV deve ser "staging" ou "main".')
}

if (!rawApiBaseUrl) {
  throw new Error('VITE_API_BASE_URL é obrigatório para evitar deploy com ambiente implícito.')
}

if (rawAppEnv === 'main' && rawUseMockApi) {
  throw new Error('VITE_USE_MOCK_API=true não é permitido em main/produção.')
}

export const APP_ENV: AppEnvironment = rawAppEnv
export const EXPECTED_FRONTEND_URL = ENVIRONMENT_URLS[APP_ENV].frontendUrl
export const EXPECTED_API_BASE_URL = ENVIRONMENT_URLS[APP_ENV].apiBaseUrl

if (rawApiBaseUrl !== EXPECTED_API_BASE_URL) {
  throw new Error(
    `VITE_API_BASE_URL inválido para ${APP_ENV}. Esperado: ${EXPECTED_API_BASE_URL}. Recebido: ${rawApiBaseUrl}.`
  )
}

export const USE_MOCK_API = rawUseMockApi
export const API_BASE_URL = rawApiBaseUrl
export const ENVIRONMENT_LABEL = APP_ENV === 'main' ? 'Produção' : 'Staging'
