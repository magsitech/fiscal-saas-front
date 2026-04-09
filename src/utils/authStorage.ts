const ACCESS_TOKEN_KEY = 'validaenota-access-token'
const REFRESH_TOKEN_KEY = 'validaenota-refresh-token'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function getAccessToken() {
  if (!canUseStorage()) return null
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  if (!canUseStorage()) return null
  return window.sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  if (!canUseStorage()) return
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearAuthTokens() {
  if (!canUseStorage()) return
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}
