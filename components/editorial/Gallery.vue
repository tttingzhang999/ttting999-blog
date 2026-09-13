<template>
  <div v-if="images.length" class="project-gallery">
    <div v-if="images.length > 1" class="gallery-controls"><button type="button" :disabled="index === 0" aria-label="Previous image" @click="move(-1)">←</button><span aria-live="polite">{{ index + 1 }} / {{ images.length }}</span><button type="button" :disabled="index === images.length - 1" aria-label="Next image" @click="move(1)">→</button></div>
    <div ref="track" class="case-gallery" tabindex="0" role="region" :aria-label="title" @scroll.passive="updateIndex"><img v-for="(src, i) in images" :key="src" :src="src" :alt="title + ' — ' + (i + 1)" loading="lazy" /></div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{images:string[];title:string}>();
const track = ref<HTMLElement | null>(null);
const index = ref(0);
function updateIndex() {
  const element = track.value;
  if (!element) return;
  const width = (element.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
  index.value = Math.max(0,Math.min(props.images.length-1,Math.round(element.scrollLeft/(width+20))));
}
function move(direction:number) {
  const element = track.value;
  const next = element?.children[index.value+direction] as HTMLElement | undefined;
  if (!element || !next) return;
  element.scrollTo({left:next.offsetLeft-(element.firstElementChild as HTMLElement).offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
</script>
