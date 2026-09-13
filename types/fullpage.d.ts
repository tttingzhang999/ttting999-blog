// fullpage.js 4 ships JavaScript only. This declaration covers the API used here.
declare module "fullpage.js" {
  interface Section {
    index: number;
    item: HTMLElement;
    anchor: string;
  }
  interface Options {
    licenseKey: string;
    anchors: string[];
    animateAnchor?: boolean;
    scrollingSpeed: number;
    easingcss3: string;
    verticalCentered: boolean;
    scrollOverflow: boolean;
    keyboardScrolling: boolean;
    observer: boolean;
    credits: { enabled: boolean; label: string; position: string };
    onLeave(origin: Section, destination: Section, direction: string): void;
    afterLoad(
      origin: Section | null,
      destination: Section,
      direction: string,
    ): void;
  }
  export default class Fullpage {
    constructor(selector: string, options: Options);
    moveTo(anchor: string): void;
    destroy(mode: "all"): void;
  }
}
