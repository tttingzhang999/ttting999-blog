export default defineNuxtRouteMiddleware((to, from) => {
  const preference = useCookie('editorial-language', {default:()=> 'zh-TW',sameSite:'lax'});
  if (!to.path.startsWith('/blog')) {
    preference.value = /^\/en(?:\/|$)/.test(to.path) ? 'en' : /^\/ja(?:\/|$)/.test(to.path) ? 'ja' : 'zh-TW';
  }
  if (/^\/(en\/?|ja\/?)?$/.test(from.path)) {
    useState('writing-home', () => '/#writing').value = `${from.path}#writing`;
  }
});
