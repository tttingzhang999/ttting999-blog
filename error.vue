<template>
  <NuxtLayout>
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div class="max-w-xl text-center">
        <p
          class="text-7xl md:text-8xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent"
        >
          {{ statusCode }}
        </p>
        <h1
          class="mt-4 text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100"
        >
          {{ title }}
        </h1>
        <p class="mt-3 text-gray-600 dark:text-gray-400">
          {{ message }}
        </p>

        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button
            class="px-5 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            @click="handleHome"
          >
            {{ homeLabel }}
          </button>
          <button
            class="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="handleBack"
          >
            {{ backLabel }}
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();

const { locale } = useI18n();
const localePath = useLocalePath();

const statusCode = computed(() => props.error?.statusCode ?? 500);
const is404 = computed(() => statusCode.value === 404);

const copy = {
  "zh-TW": {
    title404: "找不到頁面",
    msg404: "你要找的頁面不存在或已被移動。",
    title500: "伺服器發生錯誤",
    msg500: "我們這邊出了點狀況，請稍後再試。",
    home: "回到首頁",
    back: "返回上一頁",
  },
  en: {
    title404: "Page not found",
    msg404: "The page you're looking for doesn't exist or has been moved.",
    title500: "Something went wrong",
    msg500: "An unexpected error occurred. Please try again later.",
    home: "Back to home",
    back: "Go back",
  },
  ja: {
    title404: "ページが見つかりません",
    msg404: "お探しのページは存在しないか、移動された可能性があります。",
    title500: "エラーが発生しました",
    msg500:
      "予期しないエラーが発生しました。しばらくしてから再度お試しください。",
    home: "ホームに戻る",
    back: "前のページへ",
  },
} as const;

const t = computed(
  () => copy[locale.value as keyof typeof copy] ?? copy["zh-TW"],
);
const title = computed(() =>
  is404.value ? t.value.title404 : t.value.title500,
);
const message = computed(() => (is404.value ? t.value.msg404 : t.value.msg500));
const homeLabel = computed(() => t.value.home);
const backLabel = computed(() => t.value.back);

const handleHome = () => clearError({ redirect: localePath("/") });
const handleBack = () => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
  } else {
    handleHome();
  }
};

useHead({ title: () => `${statusCode.value} · ${title.value}` });
</script>
