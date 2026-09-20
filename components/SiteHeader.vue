<script setup lang="ts">
import '~/assets/css/site-header.css';

const route = useRoute();
const hydrated = ref(false);
onMounted(() => { hydrated.value = true; });
const { language, switchLanguage, switching } = useSiteLanguage();
const copy = {
  'zh-TW': { home: '首頁', resume: '履歷', projects: '專案', writing: '文章', menu: '選單' },
  en: { home: 'Home', resume: 'Resume', projects: 'Projects', writing: 'Writing', menu: 'Menu' },
  ja: { home: 'ホーム', resume: '経歴', projects: 'プロジェクト', writing: '記事', menu: 'メニュー' },
};
const labels = computed(() => copy[language.value]);
const localLink = (path: string) => language.value === 'zh-TW' ? path : `/${language.value}${path === '/' ? '' : path}`;
const links = computed(() => [
  { path: localLink('/'), label: labels.value.home, key: 'home' },
  { path: localLink('/resume'), label: labels.value.resume, key: 'resume' },
  { path: localLink('/projects'), label: labels.value.projects, key: 'projects' },
  { path: '/blog', label: labels.value.writing, key: 'writing' },
]);
const isBlog = computed(() => /^\/blog(?:\/|$)/.test(route.path));
const languageMenu = ref<HTMLDetailsElement | null>(null);
const languageLinks = computed(() => {
  const path = route.path.replace(/^\/(en|ja)(?=\/|$)/, '') || '/';
  return [
    { code: 'zh-TW', label: '中文' },
    { code: 'en', label: 'EN' },
    { code: 'ja', label: '日本語' },
  ].map(item => ({ ...item, href: item.code === 'zh-TW' ? path : '/' + item.code + (path === '/' ? '' : path) }));
});
async function navigateLanguage(event: MouseEvent, code: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  if (languageMenu.value) languageMenu.value.open = false;
  closeMenu();
  await switchLanguage(code);
}
const active = computed(() => route.path.startsWith('/blog') ? 'writing'
  : route.path.includes('/resume') ? 'resume'
  : route.path.includes('/projects') ? 'projects'
  : 'home');
const mobileMenu = ref<HTMLDetailsElement | null>(null);
const closeMenu = () => { if (mobileMenu.value) mobileMenu.value.open = false; };
watch(() => route.fullPath, closeMenu);
const nuxtApp = useNuxtApp();
const {run} = useVisualTransition();
const headerTarget = useState<string | null>('header-navigation-target', () => null);
let navigationRequest = 0;
async function navigateHeader(event: MouseEvent, path: string) {
  closeMenu();
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  if (route.path === path) {
    const scenes = document.querySelector('.home-scenes');
    if (path === localLink('/') && scenes) {
      event.preventDefault();
      scenes.dispatchEvent(new CustomEvent('scene-navigate', {detail:{anchor:'intro',focus:event.detail === 0}}));
    }
    return;
  }
  event.preventDefault();
  const request = ++navigationRequest;
  if (switching.value) await new Promise<void>(resolve => {
    const stop = watch(switching, value => { if (!value) { stop(); resolve(); } });
  });
  if (request !== navigationRequest) return;
  const home = path === localLink('/');
  if (home) await import('~/utils/home/runtime');
  await run(async () => {
    headerTarget.value = path;
    let complete: (() => void) | undefined;
    const rendered = new Promise<void>(resolve => {complete = resolve});
    const unhook = nuxtApp.hook('page:finish', () => complete?.());
    let homeComplete: (() => void) | undefined;
    const homeRendered = new Promise<void>(resolve => {homeComplete = resolve});
    const onHomeReady = () => homeComplete?.();
    if (home) window.addEventListener('home-runtime-ready', onHomeReady, {once:true});
    try {
      const result = await navigateTo(path);
      if (result) return;
      await rendered;
      await nextTick();
      if (home) await homeRendered;
      else window.scrollTo({top:0,behavior:'instant'});
    } finally {
      unhook();
      window.removeEventListener('home-runtime-ready', onHomeReady);
      headerTarget.value = null;
    }
  });
}
async function changeLanguage(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (value !== 'zh-TW' && value !== 'en' && value !== 'ja') return;
  closeMenu();
  await switchLanguage(value);
}
</script>

<template>
  <header class="site-header writing-nav" :aria-busy="!hydrated || switching">
    <NuxtLink class="site-logo" :to="localLink('/')" aria-label="Ting Zhang" @click.capture="navigateHeader($event, localLink('/'))">Ting Zhang<span aria-hidden="true">↗</span></NuxtLink>
    <nav class="site-primary" :aria-label="labels.menu">
      <NuxtLink v-for="link in links" :key="link.key" :to="link.path" :aria-current="active === link.key ? 'page' : undefined" @click.capture="navigateHeader($event, link.path)">{{ link.label }}</NuxtLink>
    </nav>
    <div class="site-tools">
      <ThemeToggle :language="language" />
      <label v-if="isBlog" class="site-language"><span class="sr-only">Language</span><select :value="language" aria-label="Language" :disabled="switching" @change="changeLanguage"><option value="zh-TW" :selected="language === 'zh-TW'">中文</option><option value="en" :selected="language === 'en'">EN</option><option value="ja" :selected="language === 'ja'">日本語</option></select></label>
      <details v-else ref="languageMenu" class="site-language-links">
        <summary aria-label="Language">{{ languageLinks.find(item => item.code === language)?.label }}</summary>
        <nav aria-label="Languages">
          <a v-for="item in languageLinks" :key="item.code" :href="item.href" :hreflang="item.code" :lang="item.code" :aria-current="item.code === language ? 'page' : undefined" @click="navigateLanguage($event, item.code)">{{ item.label }}</a>
        </nav>
      </details>
      <details ref="mobileMenu" class="mobile-menu"><summary>{{ labels.menu }}<span aria-hidden="true">＋</span></summary><nav :aria-label="labels.menu"><NuxtLink v-for="link in links" :key="link.key" :to="link.path" :aria-current="active === link.key ? 'page' : undefined" @click.capture="navigateHeader($event, link.path)">{{ link.label }}</NuxtLink></nav></details>
    </div>
  </header>
</template>
