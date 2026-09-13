/** Keep the previous frame intact until the replacement is ready. */
export function useVisualTransition() {
  const busy = useState('visual-transition-busy', () => false);
  async function run(update: () => Promise<void>) {
    if (busy.value) return;
    busy.value = true;
    try {
      if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        await update();
        return;
      }
      const transition = document.startViewTransition(update);
      let animation: Animation | undefined;
      try {
        await transition.ready;
        animation = document.documentElement.animate(
          { opacity: [1, 0] },
          { duration: 320, easing: 'ease-out', fill: 'forwards', pseudoElement: '::view-transition-old(root)' },
        );
        await animation.finished;
      } catch (error) {
        // A backgrounded tab can skip snapshots; the DOM update must still finish.
        if (!(error instanceof DOMException && ['AbortError', 'InvalidStateError'].includes(error.name))) throw error;
      }
      await transition.updateCallbackDone;
      try { await transition.finished; } finally { animation?.cancel(); }
    } finally {
      busy.value = false;
    }
  }
  return { run, busy: readonly(busy) };
}
