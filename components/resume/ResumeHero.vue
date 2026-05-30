<template>
  <section
    ref="el"
    class="resume-hero"
    :class="{ 'is-in': revealed, 'in-view': revealed }"
  >
    <span class="gutter-label inline-flex items-center">
      <span class="h2-rule" />{{ $t("resume.heads.heroKicker") }}
    </span>

    <div class="rh-grid">
      <!-- Avatar with subtle 3D mouse-tilt -->
      <div class="rh-avatar-wrap" @mousemove="onTilt" @mouseleave="resetTilt">
        <div ref="avatarEl" class="rh-avatar">
          <NuxtImg
            src="/personal_image.jpg"
            :alt="personalInfo.name"
            class="w-full h-full object-cover"
            style="object-position: center 100%"
            loading="eager"
            width="160"
            height="160"
          />
        </div>
      </div>

      <!-- Identity -->
      <div class="rh-info">
        <h1 class="rh-name">
          {{ $t("resume.hero.name")
          }}<span class="rh-cjk font-fraunces italic font-normal text-accent">{{
            $t("resume.hero.cjk")
          }}</span>
        </h1>
        <p class="rh-role">
          {{ role }}<span v-if="company" class="at"> @ {{ company }}</span>
        </p>
        <p class="rh-loc gutter-label" :style="{ textTransform: 'none' }">
          <svg
            class="w-[15px] h-[15px]"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {{ personalInfo.location }}
        </p>

        <div class="rh-actions">
          <a class="rh-pdf" href="/resume.pdf" target="_blank" rel="noopener">
            {{ $t("resume.hero.downloadPdf") }}
          </a>
          <a
            v-if="socialLinks?.linkedin"
            class="rh-soc"
            :href="socialLinks.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <svg
              class="w-[18px] h-[18px]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
              />
            </svg>
          </a>
          <a
            v-if="socialLinks?.github"
            class="rh-soc"
            :href="socialLinks.github"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <svg
              class="w-[18px] h-[18px]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.72-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.6-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.19.69.8.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    location?: string;
    bio: string;
    avatar?: string;
  };
  socialLinks?: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
}

const props = defineProps<Props>();

const { el, revealed } = useReveal({ threshold: 0.2 });

const role = computed(() => props.personalInfo.title.split(" @ ")[0]);
const company = computed(() => props.personalInfo.title.split(" @ ")[1] ?? "");

const avatarEl = ref<HTMLElement | null>(null);

function onTilt(ev: MouseEvent) {
  const node = avatarEl.value;
  if (!node) return;
  const r = node.getBoundingClientRect();
  const dx = (ev.clientX - r.left) / r.width - 0.5;
  const dy = (ev.clientY - r.top) / r.height - 0.5;
  node.style.transform = `perspective(600px) rotateY(${dx * 16}deg) rotateX(${-dy * 16}deg)`;
}

function resetTilt() {
  if (avatarEl.value) avatarEl.value.style.transform = "";
}
</script>

<style scoped>
.resume-hero {
  display: flex;
  flex-direction: column;
  gap: 26px;
  padding: clamp(8px, 2vw, 18px) 0 38px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--color-hairline);
}
.rh-grid {
  display: flex;
  align-items: center;
  gap: clamp(24px, 4vw, 46px);
}

.rh-avatar-wrap {
  flex: 0 0 auto;
  perspective: 700px;
}
.rh-avatar {
  width: clamp(108px, 13vw, 148px);
  height: clamp(108px, 13vw, 148px);
  border-radius: 50%;
  overflow: hidden;
  outline: 2px solid var(--color-accent);
  outline-offset: 5px;
  will-change: transform;
  transition:
    transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
    outline-offset 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.resume-hero:hover .rh-avatar {
  outline-offset: 9px;
}

.rh-name {
  font-family: "Inter", "Noto Sans TC", system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(34px, 5vw, 60px);
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--color-foreground);
}
.rh-cjk {
  font-size: 0.56em;
  margin-left: 0.2em;
  letter-spacing: -0.01em;
}
.rh-role {
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 600;
  color: var(--color-accent);
  margin: 16px 0 10px;
}
.rh-role .at {
  color: var(--color-foreground-muted);
  font-weight: 500;
}
.rh-loc {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.06em;
}
.rh-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
}
.rh-pdf {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  padding: 11px 20px;
  border-radius: 8px;
  background: var(--color-accent);
  color: #fff;
  transition:
    background 0.2s,
    transform 0.15s;
}
.rh-pdf:hover {
  background: var(--color-accent-hover);
}
.rh-pdf:active {
  transform: scale(0.97);
}
.rh-soc {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  color: var(--color-foreground-muted);
  transition:
    color 0.2s,
    border-color 0.2s,
    transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.rh-soc:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

@media (max-width: 900px) {
  .rh-grid {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  .rh-actions {
    justify-content: center;
  }
}
</style>
