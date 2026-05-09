import type { Ref } from "vue";
import { ref, onMounted, onBeforeUnmount } from "vue";

/**
 * Drives the global custom cursor:
 * - Fine-pointer devices only (no-op on touch / coarse pointers)
 * - Tracks pointer with eased RAF interpolation
 * - Switches to "hover" state on interactive elements
 *
 * Caller binds `hovering` and `visible` to class state on the cursor element.
 */
export function useSiteCursor(cursorEl: Ref<HTMLElement | null>) {
  const hovering = ref(false);
  const visible = ref(false);

  let raf = 0;
  let targetX = -100;
  let targetY = -100;
  let curX = -100;
  let curY = -100;
  let unbinders: Array<() => void> = [];

  function isInteractive(el: EventTarget | null): boolean {
    if (!(el instanceof Element)) return false;
    return !!el.closest(
      'a, button, [role="button"], input, textarea, select, label, summary',
    );
  }

  onMounted(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      visible.value = true;
    };
    const onOver = (e: MouseEvent) => {
      hovering.value = isInteractive(e.target);
    };
    const onLeave = () => {
      visible.value = false;
    };
    const onEnter = () => {
      visible.value = true;
    };

    const tick = () => {
      curX += (targetX - curX) * 0.22;
      curY += (targetY - curY) * 0.22;
      const el = cursorEl.value;
      if (el) {
        el.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(tick);

    unbinders.push(
      () => document.removeEventListener("mousemove", onMove),
      () => document.removeEventListener("mouseover", onOver),
      () => document.removeEventListener("mouseleave", onLeave),
      () => document.removeEventListener("mouseenter", onEnter),
      () => cancelAnimationFrame(raf),
    );
  });

  onBeforeUnmount(() => {
    unbinders.forEach((fn) => fn());
    unbinders = [];
  });

  return { hovering, visible };
}
