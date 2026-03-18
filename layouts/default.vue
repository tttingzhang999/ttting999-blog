<template>
  <div class="min-h-screen bg-surface text-foreground transition-colors duration-300">
    <!-- Top Navigation Bar -->
    <LayoutTopBar />

    <!-- Mobile Sidebar -->
    <LayoutSidebar />

    <!-- Main Content Area -->
    <main class="pt-16 min-h-[calc(100vh-4rem)]">
      <slot />
    </main>

    <!-- Footer -->
    <LayoutFooter />
  </div>
</template>

<script setup lang="ts">
// Layout uses auto-imported components from components/layout/
</script>
