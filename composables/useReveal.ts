import { ref, onMounted, onBeforeUnmount } from "vue";

interface UseRevealOptions {
  /** IntersectionObserver threshold (0–1). Default 0.15. */
  threshold?: number;
  /** Reveal only once then stop observing. Default true. */
  once?: boolean;
  /** rootMargin passed to the observer. Default '0px 0px -10% 0px'. */
  rootMargin?: string;
}

/**
 * Scroll-reveal primitive shared across resume sections.
 *
 * Returns an element ref to bind and a reactive `revealed` flag that flips
 * true when the element scrolls into view. Honors prefers-reduced-motion by
 * revealing immediately. Mirrors the IntersectionObserver pattern used in
 * components/home/HomeAbout.vue.
 */
export function useReveal(options: UseRevealOptions = {}) {
  const {
    threshold = 0.15,
    once = true,
    rootMargin = "0px 0px -10% 0px",
  } = options;

  const el = ref<HTMLElement | null>(null);
  const revealed = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!el.value) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealed.value = true;
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          revealed.value = true;
          if (once) {
            observer?.disconnect();
            observer = null;
          }
        } else if (!once) {
          revealed.value = false;
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el.value);
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });

  return { el, revealed };
}
