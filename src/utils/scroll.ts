export function resetWindowScroll() {
  const activeElement = document.activeElement
  if (activeElement instanceof HTMLElement) {
    activeElement.blur()
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.querySelector<HTMLElement>('.app-workspace')?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.querySelector<HTMLElement>('.app-main')?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}
