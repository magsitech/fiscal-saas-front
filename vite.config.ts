import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const EXPECTED_API_BASE_URLS = {
  staging: 'https://staging.api.validaenota.com.br',
  main: 'https://api.validaenota.com.br',
} as const

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appEnv = env.VITE_APP_ENV
  const apiBaseUrl = env.VITE_API_BASE_URL?.replace(/\/$/, '')
  const useMockApi = env.VITE_USE_MOCK_API === 'true'

  if (appEnv !== 'staging' && appEnv !== 'main') {
    throw new Error('VITE_APP_ENV deve ser "staging" ou "main".')
  }

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL é obrigatório. O build foi interrompido para evitar ambiente implícito.')
  }

  if (appEnv === 'main' && useMockApi) {
    throw new Error('VITE_USE_MOCK_API=true não é permitido em main/produção.')
  }

  if (apiBaseUrl !== EXPECTED_API_BASE_URLS[appEnv]) {
    throw new Error(
      `VITE_API_BASE_URL inválido para ${appEnv}. Esperado: ${EXPECTED_API_BASE_URLS[appEnv]}. Recebido: ${apiBaseUrl}.`
    )
  }

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          rewrite: (p) => p.replace(/^\/api/, ''),
          changeOrigin: true,
        },
      },
    },
  }
})
