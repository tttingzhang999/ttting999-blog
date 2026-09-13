<template>
  <div class="writing-shell">
    <main><slot /></main>
    <footer class="writing-footer"><NuxtLink :to="home">{{ isArticle ? '回到首頁文章區' : homeLabel }}</NuxtLink><span>Ting Zhang</span></footer>
  </div>
</template>
<script setup lang="ts">
import '~/assets/css/writing.css';
import '~/assets/css/interior.css';
const route = useRoute();
const { language } = useSiteLanguage();
const isArticle = computed(() => route.path.startsWith('/blog'));
const homeLabel = computed(() => ({ 'zh-TW': '首頁', en: 'Home', ja: 'ホーム' })[language.value]);
const writingHome = useState('writing-home', () => '/#writing');
const home = computed(() => isArticle.value ? writingHome.value : language.value === 'zh-TW' ? '/' : `/${language.value}`);
</script>
