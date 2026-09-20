<template>
  <div class="archive-page">
    <header class="archive-heading"><h1>Writing<span>.</span></h1><p>技術實作、工程筆記，以及生活裡的觀察。</p></header>
    <form class="archive-tools" role="search" @submit.prevent>
      <label class="archive-search">搜尋文章<input v-model="search" type="search" placeholder="標題、關鍵字或主題" /></label>
      <label>分類<select v-model="category"><option value="all">所有分類</option><option v-for="item in categories" :key="item" :value="item">{{ item }}</option></select></label>
      <label>年份<select v-model="year"><option value="all">所有年份</option><option v-for="item in years" :key="item" :value="item">{{ item }}</option></select></label>
    </form>
    <div class="archive-status"><p role="status">{{ filtered.length }} 篇文章</p><button v-if="hasFilters" @click="clearFilters">清除篩選</button></div>
    <div v-if="error" class="archive-empty"><p>文章暫時無法載入。</p><button @click="refresh()">重新載入</button></div>
    <p v-else-if="!filtered.length" class="archive-empty">沒有符合的文章</p>
    <ol v-else class="archive-list">
      <li v-for="article in filtered" :key="article.path" class="archive-entry">
        <time :datetime="article.date">{{ article.date.slice(0,10).replaceAll('-', '.') }}</time>
        <NuxtLink :to="article.path"><span class="archive-category">{{ article.category }}</span><h2>{{ article.title }}</h2><p>{{ article.description }}</p><span class="archive-open" aria-hidden="true">↗</span></NuxtLink>
      </li>
    </ol>
  </div>
</template>
<script setup lang="ts">
import { filterArticles } from '~/utils/blog/filter';
defineI18nRoute(false);
definePageMeta({layout:'editorial'});
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
// SEO Meta tags
const fullTitle = computed(() => `張碩庭 Ting Zhang - ${t("seo.blog.title")}`);

const ogImageAbs = useAbsoluteUrl("/og-image.jpg");
const ogUrlAbs = useAbsoluteUrl(useRoute().path);

useSeoMeta({
  title: () => t("seo.blog.title"),
  description: () => t("seo.blog.description"),
  ogTitle: () => fullTitle.value,
  ogDescription: () => t("seo.blog.description"),
  ogImage: ogImageAbs,
  ogUrl: ogUrlAbs,
  ogType: "website",
  ogSiteName: "張碩庭 Ting Zhang",
  twitterCard: "summary_large_image",
  twitterTitle: () => fullTitle.value,
  twitterDescription: () => t("seo.blog.description"),
  twitterImage: ogImageAbs,
});


const { data: articles, error, refresh } = await useAsyncData('writing-metadata', () =>
  queryCollection('blog').select('path','title','description','date','category','tags').order('date','DESC').all(),
);
const queryValue = (key: string, fallback: string) => typeof route.query[key] === 'string' ? route.query[key] as string : fallback;
const update = (key: string, value: string) => router.replace({query: {...route.query, [key]: value && value !== 'all' ? value : undefined}});
const search = computed({get:()=>queryValue('q',''),set:(value:string)=>{ void update('q',value); }});
const category = computed({get:()=>queryValue('category','all'),set:(value:string)=>{ void update('category',value); }});
const year = computed({get:()=>queryValue('year','all'),set:(value:string)=>{ void update('year',value); }});
const categories = computed(()=>[...new Set((articles.value ?? []).map(a=>a.category))].sort());
const years = computed(()=>[...new Set((articles.value ?? []).map(a=>a.date.slice(0,4)))].sort().reverse());
const filtered = computed(()=>filterArticles(articles.value ?? [],{q:search.value,category:category.value,year:year.value}));
const hasFilters = computed(()=>Boolean(search.value || category.value !== 'all' || year.value !== 'all'));
const clearFilters = () => router.replace({query:{}});
const archiveReturn = useState('archive-return',()=>'/blog');
const archiveScroll = useState('archive-scroll',()=>({url:'',y:0}));
onBeforeRouteLeave((_to, from)=>{
  archiveReturn.value = from.fullPath;
  archiveScroll.value = {url:from.fullPath,y:window.scrollY};
});
</script>
