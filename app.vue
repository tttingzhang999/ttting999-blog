<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global custom cursor — visible in both light & dark modes via difference blend -->
    <div
      ref="siteCursorEl"
      class="site-cursor"
      :class="{ 'is-hovering': cursorHovering, 'is-visible': cursorVisible }"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const siteCursorEl = ref<HTMLElement | null>(null)
const cursorHovering = ref(false)
const cursorVisible = ref(false)

let raf = 0
let targetX = -100
let targetY = -100
let curX = -100
let curY = -100
let unbinders: Array<() => void> = []

function isInteractive(el: EventTarget | null): boolean {
  if (!(el instanceof Element)) return false
  return !!el.closest('a, button, [role="button"], input, textarea, select, label, summary')
}

onMounted(() => {
  if (typeof window === 'undefined') return
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!isFinePointer) return

  const onMove = (e: MouseEvent) => {
    targetX = e.clientX
    targetY = e.clientY
    cursorVisible.value = true
  }
  const onOver = (e: MouseEvent) => {
    cursorHovering.value = isInteractive(e.target)
  }
  const onLeave = () => {
    cursorVisible.value = false
  }
  const onEnter = () => {
    cursorVisible.value = true
  }

  const tick = () => {
    curX += (targetX - curX) * 0.22
    curY += (targetY - curY) * 0.22
    if (siteCursorEl.value) {
      siteCursorEl.value.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`
    }
    raf = requestAnimationFrame(tick)
  }

  document.addEventListener('mousemove', onMove, { passive: true })
  document.addEventListener('mouseover', onOver, { passive: true })
  document.addEventListener('mouseleave', onLeave)
  document.addEventListener('mouseenter', onEnter)
  raf = requestAnimationFrame(tick)

  unbinders.push(
    () => document.removeEventListener('mousemove', onMove),
    () => document.removeEventListener('mouseover', onOver),
    () => document.removeEventListener('mouseleave', onLeave),
    () => document.removeEventListener('mouseenter', onEnter),
    () => cancelAnimationFrame(raf)
  )
})

onBeforeUnmount(() => {
  unbinders.forEach((fn) => fn())
  unbinders = []
})
</script>

<style>
/* Page fade transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
}

/* Theme transition: animation is driven imperatively via Web Animations API
   in useThemeTransition.ts (clip-path circular reveal). These rules just set
   up the stacking + blending so the new view cleanly covers the old. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) {
  z-index: 1;
}
::view-transition-new(root) {
  z-index: 9999;
}

/* During the theme transition, suppress expensive SVG filters that get
   double-snapshotted by the View Transitions API and cause flicker. */
html.theme-transitioning .motto-reveal,
html.theme-transitioning .at-reveal,
html.theme-transitioning .site-cursor {
  filter: none !important;
  animation-play-state: paused !important;
}

/* Hide default OS cursor on devices where the custom cursor is active */
@media (hover: hover) and (pointer: fine) {
  html,
  html * {
    cursor: none !important;
  }
}

/* ===== Global custom cursor ===== */
.site-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 18px var(--color-accent);
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  opacity: 0;
  transform: translate3d(-100px, -100px, 0) translate(-50%, -50%);
  transition: opacity 0.25s ease, width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
    height 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.2s ease,
    border-color 0.2s ease, box-shadow 0.25s ease;
}
.site-cursor.is-visible {
  opacity: 1;
}
.site-cursor.is-hovering {
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1.5px solid var(--color-accent);
  box-shadow: 0 0 28px color-mix(in oklab, var(--color-accent) 60%, transparent);
}

/* Hide custom cursor on touch devices and when reduced motion preferred */
@media (hover: none), (pointer: coarse) {
  .site-cursor {
    display: none !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  .site-cursor {
    transition: none;
  }
}
</style>
