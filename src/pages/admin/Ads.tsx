import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdsConfig, AdSlotConfig, AdSlotKey } from "@/lib/types";
import { resolveSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, EyeOff, Code2, RefreshCw } from "lucide-react";

type SlotMeta = {
  key: AdSlotKey;
  label: string;
  short: string;
  description: string;
  recommended: string;
};

const SLOTS: SlotMeta[] = [
  {
    key: "global",
    label: "Global Loader",
    short: "Global",
    description:
      "Site-wide loader scripts injected once at the bottom of <body>. Use for AdSense adsbygoogle.js, Monetag/Adsterra loader, analytics pixels, anti-adblock scripts.",
    recommended: "Loader <script src='...'> tags only — no visible markup.",
  },
  {
    key: "header",
    label: "Header Banner",
    short: "Header",
    description: "Shown at the top of every page, just under the navigation.",
    recommended: "728x90, 970x90 leaderboard or responsive banner.",
  },
  {
    key: "footer",
    label: "Footer Banner",
    short: "Footer",
    description: "Shown at the bottom of every page above the copyright.",
    recommended: "728x90 leaderboard or 320x50 mobile banner.",
  },
  {
    key: "inContent",
    label: "In-Content (Step 1 + Step 2)",
    short: "In-content",
    description: "Shown inside the article on both Step 1 and Step 2 pages.",
    recommended: "300x250 / 336x280 rectangle or responsive in-article.",
  },
  {
    key: "step1",
    label: "Step 1 Only",
    short: "Step 1",
    description: "Extra slot rendered exclusively on Step 1 pages.",
    recommended: "Native banner or 300x250.",
  },
  {
    key: "step2",
    label: "Step 2 Only",
    short: "Step 2",
    description: "Extra slot rendered exclusively on Step 2 pages.",
    recommended: "Native banner or 300x250.",
  },
  {
    key: "sidebar",
    label: "Sidebar",
    short: "Sidebar",
    description: "Optional desktop side rail. Render with <AdSlot slot='sidebar' />.",
    recommended: "160x600 or 300x600 skyscraper.",
  },
  {
    key: "popup",
    label: "Popup / Interstitial",
    short: "Popup",
    description: "Popunder or interstitial network code (Adsterra Popunder, PopAds, etc.).",
    recommended: "Loader script — no visible markup.",
  },
  {
    key: "native",
    label: "Native Banner",
    short: "Native",
    description: "Native ad container shown inside Step pages (Adsterra Native Banner, etc.).",
    recommended: "Container <div> + loader script.",
  },
  {
    key: "socialBar",
    label: "Social / Sticky Bar",
    short: "Social Bar",
    description: "Sticky bottom bar (Adsterra Social Bar, Monetag In-Page Push).",
    recommended: "Loader script only — network handles placement.",
  },
];

const PRESETS: Record<string, { label: string; code: string; suitableFor: AdSlotKey[] }> = {
  adsense_loader: {
    label: "AdSense — loader (Global)",
    code: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>`,
    suitableFor: ["global"],
  },
  adsense_unit: {
    label: "AdSense — display unit",
    code: `<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    suitableFor: ["header", "footer", "inContent", "step1", "step2", "sidebar", "native"],
  },
  adsterra_banner: {
    label: "Adsterra — Banner (iframe)",
    code: `<script type="text/javascript">
  atOptions = { 'key' : 'YOUR_KEY', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };
</script>
<script type="text/javascript" src="//www.topcreativeformat.com/YOUR_KEY/invoke.js"></script>`,
    suitableFor: ["header", "footer", "inContent", "step1", "step2"],
  },
  adsterra_native: {
    label: "Adsterra — Native Banner",
    code: `<script async="async" data-cfasync="false" src="//pl00000000.profitablecpmrate.com/YOUR_KEY/invoke.js"></script>
<div id="container-YOUR_KEY"></div>`,
    suitableFor: ["native", "inContent", "step1", "step2"],
  },
  adsterra_social: {
    label: "Adsterra — Social Bar",
    code: `<script type='text/javascript' src='//pl00000000.profitablecpmrate.com/YOUR_KEY/invoke.js'></script>`,
    suitableFor: ["socialBar", "global"],
  },
  adsterra_popunder: {
    label: "Adsterra — Popunder",
    code: `<script type="text/javascript" src="//pl00000000.profitablecpmrate.com/YOUR_KEY/invoke.js"></script>`,
    suitableFor: ["popup", "global"],
  },
  monetag_inpage: {
    label: "Monetag — In-Page Push",
    code: `<script src="https://upgulpinon.com/1?z=YOUR_ZONE" data-cfasync="false" async></script>`,
    suitableFor: ["socialBar", "global"],
  },
  monetag_popunder: {
    label: "Monetag — Popunder",
    code: `<script src="//thubanoa.com/1?z=YOUR_ZONE" data-cfasync="false" async></script>`,
    suitableFor: ["popup", "global"],
  },
  popads: {
    label: "PopAds — Popunder",
    code: `<script type="text/javascript">
  var _pop = _pop || []; _pop.push(['siteId', 0000000]); _pop.push(['minBid', 0]);
  _pop.push(['popundersPerIP', 0]); _pop.push(['delayBetween', 0]); _pop.push(['default', false]);
  _pop.push(['defaultPerDay', 0]); _pop.push(['topmostLayer', 'auto']);
</script>
<script type="text/javascript" src="//c1.popads.net/pop.js"></script>`,
    suitableFor: ["popup", "global"],
  },
  propeller_onclick: {
    label: "PropellerAds — OnClick",
    code: `<script src='//propu.sh/pfe/current/tag.min.js?z=0000000' data-cfasync='false' async></script>`,
    suitableFor: ["popup", "global"],
  },
  custom: {
    label: "Custom HTML",
    code: `<div>\n  <!-- paste your code here -->\n</div>`,
    suitableFor: SLOTS.map((s) => s.key),
  },
};

const emptySlot = (): AdSlotConfig => ({ html: "", enabled: false });

function statusBadge(s: AdSlotConfig) {
  if (s.enabled && s.html.trim()) return <Badge className="bg-emerald-600 hover:bg-emerald-600">Live</Badge>;
  if (s.html.trim()) return <Badge variant="secondary">Off</Badge>;
  return <Badge variant="outline">Empty</Badge>;
}

function validate(html: string): string | null {
  if (!html.trim()) return null;
  const lc = html.toLowerCase();
  if (lc.includes("<script") && !/<script[^>]*(src=|>[\s\S]*?<\/script>)/i.test(html)) {
    return "Script tag has no src and no body — it won't do anything.";
  }
  return null;
}

export default function AdsAdmin() {
  const [ads, setAds] = useState<Record<AdSlotKey, AdSlotConfig>>(() =>
    Object.fromEntries(SLOTS.map((s) => [s.key, emptySlot()])) as Record<AdSlotKey, AdSlotConfig>,
  );
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<AdSlotKey | "all" | null>(null);
  const [active, setActive] = useState<AdSlotKey>("global");
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "ads", "global"));
      const data = (snap.data() as AdsConfig | undefined) || {};
      const next = {} as Record<AdSlotKey, AdSlotConfig>;
      for (const s of SLOTS) next[s.key] = resolveSlot(data, s.key);
      setAds(next);
      setLoading(false);
    })();
  }, []);

  const updateSlot = (k: AdSlotKey, patch: Partial<AdSlotConfig>) =>
    setAds((prev) => ({ ...prev, [k]: { ...prev[k], ...patch } }));

  const persist = async (payload: Partial<Record<AdSlotKey, AdSlotConfig>>, label: string) => {
    const stamp = Date.now();
    const withTs = Object.fromEntries(
      Object.entries(payload).map(([k, v]) => [k, { ...v!, updatedAt: stamp }]),
    );
    await setDoc(doc(db, "ads", "global"), withTs, { merge: true });
    toast({ title: `${label} saved`, description: "Changes are live for all visitors." });
  };

  const saveOne = async (k: AdSlotKey) => {
    setSavingKey(k);
    try {
      await persist({ [k]: ads[k] }, SLOTS.find((s) => s.key === k)!.label);
      updateSlot(k, { updatedAt: Date.now() });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  const saveAll = async () => {
    setSavingKey("all");
    try {
      await persist(ads, "All ad slots");
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  const current = ads[active];
  const meta = SLOTS.find((s) => s.key === active)!;
  const warn = useMemo(() => validate(current?.html || ""), [current?.html]);
  const presetOptions = Object.entries(PRESETS).filter(([, p]) =>
    p.suitableFor.includes(active),
  );

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading ad configuration…
      </div>
    );
  }

  return (
    <div className="container space-y-6 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ads Manager</h1>
          <p className="text-sm text-muted-foreground">
            Saved code goes live instantly across the site. Scripts execute exactly as on a normal page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? "Hide preview" : "Show preview"}
          </Button>
          <Button onClick={saveAll} disabled={savingKey !== null}>
            {savingKey === "all" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save all
          </Button>
        </div>
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {SLOTS.map((s) => {
          const cfg = ads[s.key];
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`rounded-lg border p-3 text-left transition hover:bg-accent ${
                active === s.key ? "border-primary bg-accent" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{s.short}</span>
                {statusBadge(cfg)}
              </div>
              <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                {cfg.html.trim() ? `${cfg.html.length} chars` : "no code"}
              </p>
            </button>
          );
        })}
      </div>

      <Tabs value={active} onValueChange={(v) => setActive(v as AdSlotKey)}>
        <TabsList className="hidden">
          {SLOTS.map((s) => (
            <TabsTrigger key={s.key} value={s.key}>
              {s.short}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={active} forceMount>
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" /> {meta.label}
                  </CardTitle>
                  <CardDescription>{meta.description}</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(current)}
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`enabled-${active}`}
                      checked={current.enabled}
                      onCheckedChange={(v) => updateSlot(active, { enabled: v })}
                    />
                    <Label htmlFor={`enabled-${active}`} className="text-sm">
                      Enabled
                    </Label>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Recommended:</span> {meta.recommended}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Label className="text-sm">Insert preset:</Label>
                <Select
                  onValueChange={(v) => {
                    const p = PRESETS[v];
                    if (p) updateSlot(active, { html: p.code, enabled: true });
                  }}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Choose an ad network template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {presetOptions.map(([id, p]) => (
                      <SelectItem key={id} value={id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSlot(active, { html: "" })}
                  disabled={!current.html}
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> Clear
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`code-${active}`}>Ad code (HTML / JS)</Label>
                <Textarea
                  id={`code-${active}`}
                  rows={14}
                  className="font-mono text-xs leading-relaxed"
                  value={current.html}
                  onChange={(e) => updateSlot(active, { html: e.target.value })}
                  placeholder="<script>...</script> or any HTML"
                  spellCheck={false}
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{current.html.length} characters</span>
                  {current.updatedAt ? (
                    <span>Last updated {new Date(current.updatedAt).toLocaleString()}</span>
                  ) : (
                    <span>Not saved yet</span>
                  )}
                </div>
                {warn && (
                  <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-600 dark:text-amber-400">
                    ⚠ {warn}
                  </p>
                )}
              </div>

              {showPreview && (
                <div className="space-y-2">
                  <Label className="text-sm">Live preview (sandboxed)</Label>
                  <iframe
                    title="Ad preview"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    className="h-[260px] w-full rounded-md border border-border bg-white"
                    srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:12px;font-family:system-ui;background:#fff;color:#111}</style></head><body>${current.html || "<em style='color:#888'>No code to preview</em>"}</body></html>`}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Some ad networks block iframes or require a real domain — final behavior may differ from preview.
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => saveOne(active)} disabled={savingKey !== null}>
                  {savingKey === active ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save this slot
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
