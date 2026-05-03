import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdsConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function AdsAdmin() {
  const [ads, setAds] = useState<AdsConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "ads", "global"));
      if (snap.exists()) setAds(snap.data() as AdsConfig);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "ads", "global"), ads, { merge: true });
      toast({ title: "Ads saved" });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const slot = (k: keyof AdsConfig, label: string, desc: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <Textarea
        rows={4}
        value={ads[k] || ""}
        onChange={(e) => setAds({ ...ads, [k]: e.target.value })}
        placeholder="<script>...</script> or any HTML"
      />
    </div>
  );

  if (loading) return <div className="container py-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="container space-y-6 py-8">
      <h1 className="text-3xl font-bold">Ads Manager</h1>
      <Card>
        <CardHeader><CardTitle>Global ad slots</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {slot("headerHtml", "Header", "Shown at the top of every page")}
          {slot("footerHtml", "Footer", "Shown at the bottom of every page")}
          {slot("inContentHtml", "In-content", "Shown inside Step 1 & Step 2 pages")}
          {slot("popupHtml", "Popup / Interstitial", "Stored but render where you place <AdSlot slot='popup'>")}
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
