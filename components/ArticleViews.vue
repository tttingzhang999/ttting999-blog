<template>
  <span v-if="views !== null" class="article-views" role="status" aria-label="文章點閱數">{{ views.toLocaleString('zh-TW') }} 次瀏覽</span>
</template>
<script setup lang="ts">
import { loadArticleViews } from '~/utils/article-views';
const props = defineProps<{ slug: string }>();
const views = ref<number | null>(null);
let cancel: (() => void) | undefined;
onMounted(() => {
  const request = loadArticleViews(props.slug);
  cancel = request.cancel;
  void request.result.then(count => { views.value = count; });
});
onBeforeUnmount(() => cancel?.());
</script>
