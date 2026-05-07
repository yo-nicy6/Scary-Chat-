import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdsConfig, AdToggleKey } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, Megaphone, MonitorSmartphone, PanelTop, PanelBottom, Layers, Bell, Link as LinkIcon, Save } from "lucide-react";

type AdItem = {
  key: AdToggleKey;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ITEMS: AdItem[] = [
  {
    key: "monetagPush",
    title: "Monetag In-Page Push",
    description: "Site-wide push notifications loader. Runs across all public pages.",
    icon: Bell,
  },
  {
    key: "monetagVignette",
    title: "Monetag Vignette",
    description: "Full-screen interstitial shown between page transitions.",
    icon: Layers,
  },
  {
    key: "monetagSdk",
    title: "Monetag SDK / Direct Link",
    description: "Direct-link SDK used by Step 1 / Step 2 buttons.",
    icon: Megaphone,
  },
  {
    key: "header",
    title: "Header Banner",
    description: "Strip ad shown under the top navigation on every page.",
    icon: PanelTop,
  },
  {
    key: "inContent",
    title: "In-Content Ad",
    description: "Native rectangle inside Step 1 and Step 2 articles.",
    icon: MonitorSmartphone,
  },
  {
    key: "footer",
    title: "Footer Banner",
    description: "Banner pinned above the site footer.",
    icon: PanelBottom,
  },
  {
    key: "socialBar",
    title: "Sticky Social Bar",
    description: "Floating bar fixed to the bottom of the screen.",
    icon: LinkIcon,
  },
];

const DEFAULT_CFG: AdsConfig = {
  monetagPush: true,
  monetagVignette: true,
  monetagSdk: true,
  header: false,
  inContent: false,
  footer: false,
  socialBar: false,
  monetagDirectLink: "",
};

export default function AdsAdmin() {
  const [cfg, setCfg] = useState<AdsConfig>(DEFAULT_CFG);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "ads", "global"), (snap) => {
      const data = (snap.data() as AdsConfig | undefined) || {};
      const merged = { ...DEFAULT_CFG, ...data };
      setCfg(merged);
      setLinkDraft(merged.monetagDirectLink || "");
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const persist = async (next: AdsConfig, key: string) => {
    setSavingKey(key);
    try {
      await setDoc(doc(db, "ads", "global"), next, { merge: true });
      toast({ title: "Saved", description: "Live for all visitors." });
    } catch (err) {
      toast({ title: "Save failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  const toggle = (key: AdToggleKey, value: boolean) => {
    const next = { ...cfg, [key]: value };
    setCfg(next);
    persist({ [key]: value } as AdsConfig, key);
  };

  const enabledCount = ITEMS.filter((i) => cfg[i.key]).length;

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Ads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Toggle the essential ad units shipped with Scary Chat. Changes apply instantly across the public site — admin pages stay ad-free.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {enabledCount} / {ITEMS.length} active
        </Badge>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ITEMS.map((item) => {
            const on = !!cfg[item.key];
            const Icon = item.icon;
            return (
              <Card
                key={item.key}
                className={`transition-all ${on ? "border-primary/50 shadow-glow" : ""}`}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-xl p-2 ${
                        on ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="mt-1 text-xs leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={on}
                    disabled={savingKey === item.key}
                    onCheckedChange={(v) => toggle(item.key, v)}
                  />
                </CardHeader>
                <CardContent className="pt-0">
                  {on ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600">Live</Badge>
                  ) : (
                    <Badge variant="outline">Off</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Monetag Direct Link (fallback)</CardTitle>
          <CardDescription className="text-xs">
            Optional. If a post leaves Step 1 / Step 2 ad link empty, this URL is used instead.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="direct" className="sr-only">Direct link</Label>
            <Input
              id="direct"
              placeholder="https://…"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
            />
          </div>
          <Button
            onClick={() => persist({ monetagDirectLink: linkDraft }, "monetagDirectLink")}
            disabled={savingKey === "monetagDirectLink"}
          >
            {savingKey === "monetagDirectLink" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
