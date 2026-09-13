export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const headerTarget = useState<string | null>('header-navigation-target', () => null);
  const localePosition = useState<{path:string;y:number} | null>('locale-position', () => null);
  const archiveScroll = useState('archive-scroll', () => ({url:'',y:0}));
  // Position the mounted archive before paint; the router returns the same
  // position afterwards instead of issuing its default scroll-to-top.
  nuxtApp.hook('page:finish', () => {
    const route = router.currentRoute.value;
    if (headerTarget.value !== route.path && route.path === '/blog' && archiveScroll.value.url === route.fullPath) {
      window.scrollTo({top:archiveScroll.value.y,behavior:'instant'});
    }
  });
  onNuxtReady(() => {
    const original = router.options.scrollBehavior;
    router.options.scrollBehavior = async (to, from, saved) => {
      const fromHeader = headerTarget.value === to.path;
      const locale = localePosition.value?.path === to.path ? localePosition.value : null;
      const position = await original?.(to, from, saved);
      if (fromHeader) return /^\/(en|ja)?$/.test(to.path) ? false : {left:0,top:0,behavior:'instant'};
      if (locale) {
        if (/^\/(en|ja)?$/.test(to.path)) return false;
        return to.hash && position ? {...position, behavior:'instant'} : {left:0,top:locale.y,behavior:'instant'};
      }
      if (!saved && to.path === '/blog' && to.path !== from.path && archiveScroll.value.url === to.fullPath) {
        return {left:0,top:archiveScroll.value.y,behavior:'instant'};
      }
      if (!saved && to.path === from.path && to.hash && position && document.querySelector('.writing-shell')) {
        return {...position, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'};
      }
      return position;
    };
  });
});
