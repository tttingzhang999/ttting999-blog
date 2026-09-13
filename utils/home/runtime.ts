import fullpage from "fullpage.js";
import { gsap } from "gsap";
import { createFilament } from "./filament";
import { articleTimeline } from "./timeline";
import type { HomeArticle } from "./articles";

export function mountHomeScenes(
  root: HTMLElement,
  articles: readonly HomeArticle[],
  licenseKey: string,
) {
  const abort = new AbortController();
  const signal = abort.signal;
  const sections = [...root.querySelectorAll<HTMLElement>(".section")];
  const anchors = ["intro", "writing", "practice"];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = matchMedia("(min-width: 1001px) and (min-height: 820px)");
  const context = gsap.context(() => {}, root);
  const filament = createFilament(root);
  let api: fullpage | undefined, intro: gsap.core.Timeline | undefined;
  let observer: IntersectionObserver | undefined;
  let pendingWriting = false;
  let announcedReady = false;
  const ready = () => {
    if (announcedReady) return;
    announcedReady = true;
    window.dispatchEvent(new Event("home-runtime-ready"));
  };
  const destroyPage = () => {
    if (!api) return;
    // fullPage clears the hash on destroy, even after Nuxt has navigated.
    const url = location.href;
    const state = history.state;
    api.destroy("all");
    if (location.href !== url) history.replaceState(state, "", url);
  };
  let current = Math.max(0, anchors.indexOf(location.hash.slice(1)));
  let mode = "",
    disposed = false,
    moveFocus = false;
  const stopIntro = (returnToArticles = true) => {
    const active = root.dataset.journalIntro === "playing";
    intro?.kill();
    intro = undefined;
    gsap.set(root.querySelector(".article-panorama"), { autoAlpha: 0 });
    gsap.set(
      root.querySelectorAll(
        ".article-item,.latest-label,.journal-composition,.journal-heading",
      ),
      { clearProps: "opacity,visibility,transform" },
    );
    root.dataset.journalIntro = "done";
    root.dataset.backdrop = "ambient";
    if (active && returnToArticles) filament.finishScan();
  };
  const sync = (index: number) => {
    current = index;
    root.dataset.scene = String(index);
    filament.scene(index);
    root.querySelectorAll<HTMLElement>("[data-go]").forEach((link) => {
      if (link.dataset.go === anchors[index])
        link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    sections.forEach((section, i) => {
      section.inert = mode === "scenes" && i !== index;
    });
    root.querySelector("#scene-position")!.textContent = `0${index + 1} / 03`;
  };
  const enter = (index: number) => {
    sync(index);
    const playWriting =
      pendingWriting && index === 1 && mode === "scenes" && !reduced.matches;
    pendingWriting = false;
    if (playWriting) {
      root.dataset.journalIntro = "playing";
      intro = articleTimeline(root, articles, () => stopIntro(), filament);
    } else {
      // Arrival is already visible. Never replay a hidden start frame over it.
      stopIntro(false);
    }
    ready();
    if (moveFocus) {
      const heading = sections[index]!.querySelector<HTMLElement>("h1,h2")!;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      moveFocus = false;
    }
  };
  const go = (anchor: string, focus = false) => {
    const index = anchors.indexOf(anchor);
    if (index < 0 || index === current) return;
    moveFocus = focus;
    if (api) api.moveTo(anchor);
    else {
      sections[index]!.scrollIntoView({
        behavior: reduced.matches ? "instant" : "smooth",
      });
      history.replaceState(history.state, "", `#${anchor}`);
      enter(index);
    }
  };
  const setup = () => {
    if (disposed) return;
    const nextMode = desktop.matches && !reduced.matches ? "scenes" : "reading";
    if (mode === nextMode) return;
    pendingWriting = false;
    stopIntro();
    observer?.disconnect();
    destroyPage();
    api = undefined;
    mode = nextMode;
    root.dataset.mode = mode;
    sections.forEach((section) => {
      section.inert = false;
    });
    if (mode === "scenes") {
      history.replaceState(history.state, "", `#${anchors[current]}`);
      let loaded = false;
      api = new fullpage("#home-fullpage", {
        licenseKey,
        anchors,
        animateAnchor: false,
        scrollingSpeed: 950,
        easingcss3: "cubic-bezier(.76,0,.24,1)",
        verticalCentered: false,
        scrollOverflow: false,
        keyboardScrolling: false,
        observer: false,
        credits: {
          enabled: false,
          label: "Made with fullPage.js",
          position: "right",
        },
        onLeave(origin, destination) {
          moveFocus = moveFocus || origin.item.contains(document.activeElement);
          pendingWriting =
            loaded &&
            destination.index === 1 &&
            origin.index === 0 &&
            articles.length > 0;
          if (destination.index === 1) {
            stopIntro(false);
            if (pendingWriting)
              gsap.set(root.querySelector(".journal-composition"), {
                opacity: 0,
              });
          } else if (root.dataset.journalIntro === "playing") {
            // Freeze the outgoing composition; restore only after it leaves view.
            intro?.kill();
            intro = undefined;
            root.dataset.journalIntro = "leaving";
          }
          root.dataset.backdrop = pendingWriting ? "scan" : "ambient";
          filament.scene(
            destination.index,
            destination.index === 1 && origin.index === 0 ? articles.length : 0,
          );

          destination.item.inert = false;
        },
        afterLoad(_origin, destination) {
          context.add(() => enter(destination.index));
          loaded = true;
        },
      });
    } else {
      sync(current);
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible) sync(sections.indexOf(visible.target as HTMLElement));
        },
        { rootMargin: "-20% 0px -35% 0px", threshold: 0 },
      );
      sections.forEach((section) => observer!.observe(section));
      sections[current]?.scrollIntoView({ behavior: "instant" });
      ready();
    }
  };
  root.addEventListener(
    "click",
    (event) => {
      const target = (event.target as Element).closest<HTMLElement>(
        "[data-go],[data-next],[data-skip]",
      );
      if (!target) return;
      if (target.hasAttribute("data-skip")) {
        stopIntro();
        return;
      }
      event.preventDefault();
      go(target.dataset.go ?? anchors[(current + 1) % 3]!, event.detail === 0);
    },
    { signal },
  );
  root.addEventListener("scene-navigate", (event) => {
    const {anchor, focus} = (event as CustomEvent<{anchor:string;focus?:boolean}>).detail;
    go(anchor, focus);
  }, {signal});
  const list = root.querySelector<HTMLElement>(".article-list")!;
  list.addEventListener(
    "click",
    (event) => {
      if (root.dataset.journalIntro === "playing") {
        event.preventDefault();
        event.stopPropagation();
        stopIntro();
      }
    },
    { signal, capture: true },
  );
  list.addEventListener(
    "focusin",
    () => {
      if (root.dataset.journalIntro === "playing") stopIntro();
    },
    { signal },
  );
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        mode !== "scenes" ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      if (
        (event.target as Element).closest(
          "input,textarea,select,button,[contenteditable=true]",
        )
      )
        return;
      const delta = ["ArrowDown", "PageDown", " "].includes(event.key)
        ? 1
        : ["ArrowUp", "PageUp"].includes(event.key)
          ? -1
          : 0;
      const index =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? 2
            : Math.max(0, Math.min(2, current + delta));
      if (delta || ["Home", "End"].includes(event.key)) {
        event.preventDefault();
        go(anchors[index]!, true);
      }
    },
    { signal },
  );
  window.addEventListener(
    "resize",
    () => {
      pendingWriting = false;
      stopIntro();
      context.add(setup);
    },
    { signal },
  );
  reduced.addEventListener(
    "change",
    () => {
      stopIntro();
      context.add(setup);
    },
    { signal },
  );
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        pendingWriting = false;
        stopIntro();
      }
    },
    { signal },
  );
  context.add(setup);
  return () => {
    disposed = true;
    abort.abort();
    observer?.disconnect();
    stopIntro();

    filament.destroy();
    destroyPage();
    context.revert();
  };
}
