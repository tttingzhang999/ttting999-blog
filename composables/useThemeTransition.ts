/**
 * Composable for theme transition with circular reveal animation
 * Uses View Transitions API + Web Animations API on the root pseudo-element
 * for a reliable radial reveal centered on the click position.
 */

export const useThemeTransition = () => {
  const toggleThemeWithTransition = async (
    event: MouseEvent,
    colorMode: any
  ) => {
    // Browser support check — fallback to instant toggle.
    // @ts-ignore - View Transitions API not yet in TS lib
    if (!document.startViewTransition) {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // Start the view transition. Keep the callback minimal — any extra
    // pre-paint work here causes a visible jank before the snapshot.
    // @ts-ignore
    const transition = document.startViewTransition(() => {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    })

    // Suppress heavy SVG filters mid-transition only after the API has
    // captured the old-state snapshot, so the suppression itself doesn't
    // race the snapshot.
    transition.ready
      .then(() => {
        document.documentElement.classList.add('theme-transitioning')

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        )
      })
      .catch(() => {})

    transition.finished.catch(() => {}).finally(() => {
      document.documentElement.classList.remove('theme-transitioning')
    })
  }

  return {
    toggleThemeWithTransition
  }
}
