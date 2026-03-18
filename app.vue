<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage
        :key="locale"
        :transition="{
          name: 'page',
          mode: 'out-in'
        }"
      />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
</script>

<style>
/* Simple fade transition — no slide */
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

/* Theme transition with circular reveal animation */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 2;
  animation: reveal 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes reveal {
  from {
    clip-path: circle(0 at var(--x, 50%) var(--y, 50%));
  }
  to {
    clip-path: circle(var(--r, 100vmax) at var(--x, 50%) var(--y, 50%));
  }
}
</style>
