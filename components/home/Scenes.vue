<script setup lang="ts">
import { homeSceneCopy, sceneProjects } from "~/data/home-scenes";
import type { HomeArticle } from "~/utils/home/articles";
import "~/assets/css/home-scenes.css";
import "~/assets/css/home-writing.css";
import "fullpage.js/dist/fullpage.css";


const props = defineProps<{
  articles: HomeArticle[];
  timeline: HomeArticle[];
  total: number;
  failed: boolean;
}>();
const { locale } = useI18n();
const localePath = useLocalePath();
const language = computed(() =>
  locale.value in homeSceneCopy
    ? (locale.value as keyof typeof homeSceneCopy)
    : "zh-TW",
);
const copy = computed(() => homeSceneCopy[language.value]);
const root = useTemplateRef<HTMLElement>("root");
const selected = ref(0);
const project = computed(() => sceneProjects[selected.value]!);
const runtimeConfig = useRuntimeConfig();
let cleanup: (() => void) | undefined;
let disposed = false;
function articleFocus(index: number) {
  root.value?.dispatchEvent(
    new CustomEvent("articlevisual", { detail: { index } }),
  );
}
async function selectProject(index: number) {
  selected.value = index;
  await nextTick();
  root.value?.dispatchEvent(
    new CustomEvent("projectvisual", { detail: { index } }),
  );
}
onMounted(async () => {
  try {
    const { mountHomeScenes } = await import("~/utils/home/runtime");
    if (!disposed && root.value)
      cleanup = mountHomeScenes(
        root.value,
        props.timeline,
        runtimeConfig.public.fullpageLicenseKey,
      );
  } catch (error) {
    console.error(
      "Homepage animation could not start; native browsing remains available.",
      error,
    );
    window.dispatchEvent(new Event("home-runtime-ready"));
  }
});
onBeforeUnmount(() => {
  disposed = true;
  cleanup?.();
});
</script>

<template>
  <div
    ref="root"
    class="home-scenes"
    data-mode="reading"
    data-journal-intro="done"
  >
    <div class="atmosphere" aria-hidden="true">
      <div class="light" />
      <div class="grain" />
    </div>
    <canvas id="continuity" aria-hidden="true" />
    <div id="home-fullpage">
      <section
        class="section intro"
        data-anchor="intro"
        aria-labelledby="intro-title"
      >
        <div class="scene-content intro-composition">
          <div class="identity entrance">
            <p>Ting Zhang <span>張碩庭</span></p>
            <p>{{ copy.role }}</p>
          </div>
          <h1 class="hero-type" id="intro-title">
            <span class="word plan">Plan<span class="period">.</span></span
            ><span class="word execute"
              >Execute<span class="period">.</span></span
            >
          </h1>
          <div class="hero-foot entrance">
            <p class="hero-statement">{{ copy.motto }}</p>
            <div class="hero-copy">
              <p>{{ copy.intro }}</p>
              <a href="#writing" class="text-link" data-go="writing"
                >{{ copy.start }} <span aria-hidden="true">↓</span></a
              >
            </div>
          </div>
          <span class="scene-note" aria-hidden="true">{{ copy.note }}</span>
        </div>
      </section>
      <section
        class="section writing"
        data-anchor="writing"
        aria-labelledby="writing-title"
      >
        <div class="article-panorama" aria-hidden="true" />
        <div class="scene-content journal-composition">
          <div class="journal-heading">
            <p class="journal-count">{{ total }} {{ copy.count }}</p>
            <h2 id="writing-title">{{ copy.writingTitle }}</h2>
            <p class="journal-intro">{{ copy.writingIntro }}</p>
            <NuxtLink class="text-link" to="/blog"
              >{{ copy.all }} <span aria-hidden="true">↗</span></NuxtLink
            >
          </div>
          <div class="journal-latest">
            <p class="latest-label">{{ copy.latest }}</p>
            <div class="article-list" :aria-label="copy.latest">
              <NuxtLink
                v-for="(article, index) in articles"
                :key="article.path"
                :to="article.path"
                class="article-item"
                :data-article="index"
                :data-path="article.path"
                @pointerenter="articleFocus(index)"
                @focus="articleFocus(index)"
              >
                <div class="article-meta-line">
                  <time :datetime="article.date">{{
                    article.date.replaceAll("-", ".")
                  }}</time
                  ><span>{{ article.category }}</span>
                </div>
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-description">{{ article.description }}</p>
              </NuxtLink>
              <p v-if="!articles.length" class="article-error" role="status">
                {{ failed ? copy.error : copy.empty }}
              </p>
            </div>
          </div>
        </div>
        <button class="skip-intro" type="button" data-skip>
          {{ copy.skip }} →
        </button>
      </section>
      <section
        class="section practice"
        data-anchor="practice"
        aria-labelledby="practice-title"
      >
        <div class="scene-content practice-composition">
          <div class="practice-heading entrance">
            <h2 id="practice-title">{{ copy.practiceTitle }}</h2>
            <NuxtLink class="text-link" :to="localePath('/resume')"
              >{{ copy.resume }} <span aria-hidden="true">↗</span></NuxtLink
            >
          </div>
          <div
            class="project-names entrance"
            role="group"
            :aria-label="copy.projects"
          >
            <button
              v-for="(item, index) in sceneProjects"
              :key="item.id"
              type="button"
              :data-project="item.id"
              :aria-pressed="selected === index"
              @click="selectProject(index)"
            >
              {{ item.name }}
            </button>
          </div>
          <div class="project-detail entrance" aria-live="polite">
            <p class="project-kind">{{ project.name }}</p>
            <p id="project-description">{{ project.description[language] }}</p>
            <p class="project-tech">{{ project.tech }}</p>
            <a class="text-link" :href="project.url"
              >{{ copy.visit }} <span aria-hidden="true">↗</span></a
            >
          </div>
          <div class="contact entrance">
            <a class="contact-main" href="mailto:tttingzhang999@gmail.com"
              >{{ copy.contact }}<span aria-hidden="true">↗</span></a
            >
            <div>
              <a href="https://github.com/tttingzhang999">GitHub</a
              ><a href="https://www.linkedin.com/in/tingzhang98/">LinkedIn</a
              ><NuxtLink :to="localePath('/projects')">{{
                copy.projects
              }}</NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </div>
    <footer class="scene-footer">
      <span id="scene-position" aria-live="polite">01 / 03</span>
      <nav class="scene-nav" :aria-label="copy.about">
        <a href="#intro" data-go="intro">{{ copy.about }}</a>
        <a href="#writing" data-go="writing">{{ copy.writing }}</a>
        <a href="#practice" data-go="practice">{{ copy.practice }}</a>
      </nav>
      <button id="next-scene" type="button" data-next>
        <span class="next-label">{{ copy.next }}</span
        ><span class="top-label">{{ copy.top }}</span>
        <span aria-hidden="true">↓</span>
      </button>
    </footer>
  </div>
</template>
