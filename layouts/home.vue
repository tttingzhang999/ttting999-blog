<template>
  <div class="min-h-screen bg-surface text-foreground transition-colors duration-300">
    <main class="min-h-screen">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Homepage-only layout: no global TopBar, Sidebar or Footer.
// The page renders its own minimal chrome (HomeControls + inline footer strip).
</script>
