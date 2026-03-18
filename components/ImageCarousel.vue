<template>
  <div class="image-carousel">
    <!-- Main Image Display -->
    <div class="relative group">
      <!-- Main Image Container -->
      <div
        class="relative overflow-hidden rounded-lg bg-surface-elevated min-h-[300px] max-h-[600px] flex items-center justify-center"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
      >
        <div
          class="flex transition-transform duration-300 ease-out h-full w-full"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div
            v-for="(image, index) in images"
            :key="index"
            class="w-full flex-shrink-0 flex items-center justify-center"
          >
            <img
              :src="image"
              :alt="`Project image ${index + 1}`"
              class="max-w-full max-h-[600px] h-auto object-contain cursor-grab active:cursor-grabbing"
              draggable="false"
            />
          </div>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <button
        v-if="images.length > 1"
        @click="prev"
        class="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface-card text-foreground hover:bg-surface-elevated transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Previous image"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-if="images.length > 1"
        @click="next"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface-card text-foreground hover:bg-surface-elevated transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Next image"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Dots Indicator -->
      <div
        v-if="images.length > 1"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
      >
        <button
          v-for="(_, index) in images"
          :key="index"
          @click="goTo(index)"
          :class="[
            'w-2 h-2 rounded-full transition-all',
            currentIndex === index
              ? 'bg-white w-8'
              : 'bg-white/50 hover:bg-white/75'
          ]"
          :aria-label="`Go to image ${index + 1}`"
        />
      </div>
    </div>

    <!-- Thumbnail List -->
    <div
      v-if="images.length > 1"
      class="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
    >
      <button
        v-for="(image, index) in images"
        :key="index"
        @click="goTo(index)"
        :class="[
          'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
          currentIndex === index
            ? 'border-accent ring-2 ring-accent/50'
            : 'border-border hover:border-accent'
        ]"
        :aria-label="`View image ${index + 1}`"
      >
        <img
          :src="image"
          :alt="`Thumbnail ${index + 1}`"
          class="w-full h-full object-cover"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  images: string[]
}>()

const currentIndex = ref(0)
let touchStartX = 0
let touchEndX = 0
let isDragging = false
let dragStartX = 0

const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = props.images.length - 1
  }
}

const goTo = (index: number) => {
  currentIndex.value = index
}

// Touch events for mobile swipe
const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
}

const handleTouchMove = (e: TouchEvent) => {
  touchEndX = e.touches[0].clientX
}

const handleTouchEnd = () => {
  const swipeThreshold = 50
  const diff = touchStartX - touchEndX

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      next()
    } else {
      prev()
    }
  }
}

// Mouse drag events for desktop
const handleMouseDown = (e: MouseEvent) => {
  isDragging = true
  dragStartX = e.clientX
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging) {
    touchEndX = e.clientX
  }
}

const handleMouseUp = () => {
  if (isDragging) {
    const swipeThreshold = 50
    const diff = dragStartX - touchEndX

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        next()
      } else {
        prev()
      }
    }

    isDragging = false
    dragStartX = 0
    touchEndX = 0
  }
}

const handleMouseLeave = () => {
  if (isDragging) {
    isDragging = false
    dragStartX = 0
    touchEndX = 0
  }
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    prev()
  } else if (e.key === 'ArrowRight') {
    next()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgb(209 213 219 / 1);
  border-radius: 3px;
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgb(75 85 99 / 1);
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgb(156 163 175 / 1);
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgb(107 114 128 / 1);
}
</style>
