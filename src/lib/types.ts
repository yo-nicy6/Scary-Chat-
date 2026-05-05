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

export interface AdSlotConfig {
  html: string;
  enabled: boolean;
  updatedAt?: number;
}

export type AdSlotKey =
  | "global"
  | "header"
  | "footer"
  | "inContent"
  | "step1"
  | "step2"
  | "sidebar"
  | "popup"
  | "native"
  | "socialBar";

export type AdsConfig = Partial<Record<AdSlotKey, AdSlotConfig>> & {
  // legacy fields kept for back-compat reads
  headerHtml?: string;
  footerHtml?: string;
  inContentHtml?: string;
  popupHtml?: string;
};

export interface PostAnalytics {
  views?: number;
  step1Clicks?: number;
  step2Clicks?: number;
  step1Completions?: number;
  finalConversions?: number;
  referrers?: { direct?: number; social?: number; other?: number };
}
