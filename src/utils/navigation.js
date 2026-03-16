import { prefersReducedMotion } from './motion'

/**
 * Executes navigation with view transition if supported and not disabled by user preference
 * @param {import('vue-router').Router} router
 * @param {string|object|function} target - Route location or function that performs navigation
 * @returns {Promise<void>}
 */
export async function navigateWithTransition (router, target) {
  const navigate = () => {
    if (typeof target === 'function') {
      return target()
    }
    return router.push(target)
  }

  if (
    typeof document !== 'undefined'
    && typeof document.startViewTransition === 'function'
    && !prefersReducedMotion()
  ) {
    document.startViewTransition(() => navigate())
    return
  }

  await navigate()
}

/**
 * Navigates back in history or to a fallback route if no history exists
 * @param {import('vue-router').Router} router
 * @param {string|object} fallbackRoute
 * @returns {Promise<void>}
 */
export async function goBack (router, fallbackRoute = { name: 'home' }) {
  return navigateWithTransition(router, () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    return router.push(fallbackRoute)
  })
}
