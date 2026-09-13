<template>
  <nav class="chapter-nav" :aria-label="label"><NuxtLink v-for="link in links" :key="link.id" :to="'#' + link.id" :aria-current="active === link.id ? 'location' : undefined">{{ link.label }}</NuxtLink></nav>
</template>
<script setup lang="ts">
const props = defineProps<{links:{id:string;label:string}[];label:string}>();
const active = useChapterPosition(() => props.links.map(link=>link.id));
</script>
