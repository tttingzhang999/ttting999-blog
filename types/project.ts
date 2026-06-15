export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  github?: string;
  demo?: string;
  image?: string;
  images?: string[];
  appStore?: string;
  googlePlay?: string;
  highlights: string[];
  period?: string;
  teamSize?: string;
  role?: string;
  // Presentation fields for the "Selected Work" reel (Projects page)
  subtitle?: string;
  kind?: string;
  shortName?: string;
  stats?: ProjectStat[];
  screenshot?: string;
  flagship?: boolean;
  // Fields from Nuxt Content (when using markdown-based projects)
  path?: string;
  body?: any;
}

export interface ProjectStat {
  /** value, e.g. "15K+", "<10s", "−30%" */
  n: string;
  /** label, e.g. "instruments" */
  l: string;
}

export interface ProjectTag {
  name: string;
  slug: string;
  count: number;
}
