<template>
  <section id="comments" ref="section" class="article-comments" aria-labelledby="comments-heading">
    <h2 id="comments-heading">留言</h2>
    <p v-if="status === 'loading'" role="status">留言載入中…</p>
    <div v-if="status === 'error'" role="status">
      <p>留言暫時無法載入。</p>
      <button type="button" @click="loadComments">重試留言</button>
    </div>
    <div ref="container" />
    <a href="https://github.com/tttingzhang999/ttting999-blog/discussions/categories/announcements" target="_blank" rel="noopener noreferrer">在 GitHub 查看討論</a>
  </section>
</template>

<script setup lang="ts">
import type { GiscusWidget } from 'giscus';

const props = defineProps<{ slug: string }>();
const colorMode = useColorMode();
const theme = computed(() => colorMode.value === 'dark' ? 'dark_dimmed' : 'light');
const section = ref<HTMLElement | null>(null);
const container = ref<HTMLElement | null>(null);
const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle');
let widget: GiscusWidget | undefined;
let timeout: ReturnType<typeof setTimeout> | undefined;
let disposed = false;
let attempt: symbol | undefined;
let observer: IntersectionObserver | undefined;

function fail() {
  clearTimeout(timeout);
  widget?.remove();
  widget = undefined;
  status.value = 'error';
}

function onMessage(event: MessageEvent) {
  if (event.origin !== 'https://giscus.app' || event.source !== widget?.iframeRef?.contentWindow) return;
  const message = event.data?.giscus;
  if (!message || message.signOut) return;
  if (typeof message.error === 'string' && /Bad credentials|Invalid state value|State has expired/.test(message.error)) {
    // Keep the widget alive so its own listener can clear the expired session and reload.
    clearTimeout(timeout);
    status.value = 'loading';
    timeout = setTimeout(fail, 15_000);
    return;
  }
  if (typeof message.error === 'string' && !message.error.includes('Discussion not found')) {
    fail();
  } else if (message.resizeHeight > 0 || message.error?.includes('Discussion not found')) {
    clearTimeout(timeout);
    status.value = 'ready';
  }
}

async function loadComments() {
  if (status.value === 'loading' || status.value === 'ready') return;
  const current = Symbol();
  attempt = current;
  status.value = 'loading';
  timeout = setTimeout(fail, 15_000);
  try {
    const { GiscusWidget } = await import('giscus');
    if (disposed || attempt !== current || status.value !== 'loading') return;
    widget = new GiscusWidget();
    const attributes = {
      repo: 'tttingzhang999/ttting999-blog', repoid: 'R_kgDOMgcb4A',
      category: 'Announcements', categoryid: 'DIC_kwDOMgcb4M4DI_BI',
      mapping: 'specific', term: props.slug, strict: '1',
      reactionsenabled: '1', emitmetadata: '1', inputposition: 'top',
      theme: theme.value, lang: 'zh-TW',
    };
    for (const [name, value] of Object.entries(attributes)) widget.setAttribute(name, value);
    container.value?.append(widget);
  } catch {
    if (!disposed && attempt === current) fail();
  }
}

watch(theme, value => widget?.setAttribute('theme', value));
onMounted(() => {
  window.addEventListener('message', onMessage);
  // Consume the OAuth session immediately, including when the section is off-screen.
  if (new URL(location.href).searchParams.has('giscus')) {
    void loadComments();
    return;
  }
  observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer?.disconnect();
    void loadComments();
  }, { rootMargin: '300px 0px' });
  if (section.value) observer.observe(section.value);
});
onBeforeUnmount(() => {
  disposed = true;
  clearTimeout(timeout);
  observer?.disconnect();
  window.removeEventListener('message', onMessage);
  widget?.remove();
});
</script>

<style scoped>
.article-comments { margin-block: 3rem; padding-top: 2rem; border-top: 1px solid var(--color-border); }
.article-comments h2 { font-size: 1.4rem; }
.article-comments p { margin-block: 0.75rem; }
.article-comments button { margin-block: 0.75rem; padding: 0.5rem 1rem; border: 1px solid currentColor; border-radius: 0.25rem; }
.article-comments a { display: inline-block; margin-top: 1rem; text-decoration: underline; }
</style>
