type SiteLanguage = 'zh-TW' | 'en' | 'ja';

export function useSiteLanguage() {
  const route = useRoute();
  const nuxtApp = useNuxtApp();
  const preference = useCookie<SiteLanguage>('editorial-language', {default: () => 'zh-TW', sameSite: 'lax'});
  const language = computed<SiteLanguage>(() => route.path.startsWith('/blog') ? preference.value : /^\/en(?:\/|$)/.test(route.path) ? 'en' : /^\/ja(?:\/|$)/.test(route.path) ? 'ja' : 'zh-TW');
  const position = useState<{path:string;y:number} | null>('locale-position', () => null);
  const {run, busy} = useVisualTransition();

  async function switchLanguage(value: string) {
    if (!['zh-TW','en','ja'].includes(value) || value === language.value || busy.value) return;
    const next = value as SiteLanguage;
    const path = route.path.replace(/^\/(en|ja)(?=\/|$)/, '') || '/';
    const article = path.startsWith('/blog');
    const target = article ? path : next === 'zh-TW' ? path : `/${next}${path === '/' ? '' : path}`;
    // fullPage owns the live hash; Nuxt's route may lag behind its history writes.
    const scenes = document.querySelector<HTMLElement>('.home-scenes');
    const nativeHome = path === '/' && scenes?.dataset.mode === 'reading';
    const hash = path === '/' && scenes?.dataset.scene ? '#' + ['intro','writing','practice'][Number(scenes.dataset.scene)] : location.hash;
    const y = scrollY;
    if (path === '/') await import('~/utils/home/runtime');
    await run(async () => {
      preference.value = next;
      if (article) { await nextTick(); return; }
      position.value = {path: target, y};
      let finish: (() => void) | undefined;
      const rendered = new Promise<void>(resolve => { finish = resolve; });
      const unhook = nuxtApp.hook('page:finish', () => finish?.());
      let homeReady: (() => void) | undefined;
      const homeRendered = new Promise<void>(resolve => {homeReady = resolve});
      const onHomeReady = () => homeReady?.();
      if (path === '/') window.addEventListener('home-runtime-ready', onHomeReady, {once:true});
      try {
        const result = await navigateTo({path: target, query: route.query, hash});
        if (result) return;
        await rendered;
        await nextTick();
        if (path === '/') await homeRendered;
        if (nativeHome) window.scrollTo({top:y,behavior:'instant'});
        else if (path !== '/') {
          const anchor = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
          if (anchor) anchor.scrollIntoView({behavior:'instant'});
          else window.scrollTo({top:y,behavior:'instant'});
        }
      } finally {
        unhook();
        window.removeEventListener('home-runtime-ready', onHomeReady);
        position.value = null;
      }
    });
  }
  return {language, switchLanguage, switching:busy};
}
