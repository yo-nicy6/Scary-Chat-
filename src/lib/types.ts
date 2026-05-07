export interface Post {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  finalLink: string;
  step1AdLink: string;
  step2AdLink: string;
  requiredClicks: number;
  timerSeconds: number;
  createdAt?: number;
}

export type AdToggleKey =
  | "monetagPush"
  | "monetagVignette"
  | "monetagSdk"
  | "header"
  | "inContent"
  | "footer"
  | "socialBar";

export interface AdsConfig {
  monetagPush?: boolean;
  monetagVignette?: boolean;
  monetagSdk?: boolean;
  header?: boolean;
  inContent?: boolean;
  footer?: boolean;
  socialBar?: boolean;
  monetagDirectLink?: string;
}

// Slot keys that AdSlot still uses for built-in HTML snippets.
export type AdSlotKey = "header" | "inContent" | "footer" | "socialBar";

export interface PostAnalytics {
  views?: number;
  step1Clicks?: number;
  step2Clicks?: number;
  step1Completions?: number;
  finalConversions?: number;
  referrers?: { direct?: number; social?: number; other?: number };
}
