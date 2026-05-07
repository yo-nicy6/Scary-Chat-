import type { AdSlotKey } from "./types";

/**
 * Built-in ad snippets shipped with the site. Admin only toggles them on/off.
 * Replace the placeholder zones with your real network IDs.
 */
export const BUILT_IN_ADS: Record<AdSlotKey, string> = {
  header: `<div style="display:flex;justify-content:center;width:100%">
  <script async data-cfasync="false" src="//al5sm.com/tag.min.js" data-zone="10967697"></script>
</div>`,
  inContent: `<div style="display:flex;justify-content:center;width:100%;min-height:90px">
  <script async data-cfasync="false" src="//al5sm.com/tag.min.js" data-zone="10967697"></script>
</div>`,
  footer: `<div style="display:flex;justify-content:center;width:100%">
  <script async data-cfasync="false" src="//al5sm.com/tag.min.js" data-zone="10967697"></script>
</div>`,
  socialBar: `<script async data-cfasync="false" src="//al5sm.com/tag.min.js" data-zone="10967697"></script>`,
};
