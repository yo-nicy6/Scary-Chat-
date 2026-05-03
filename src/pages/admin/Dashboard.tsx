import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post, PostAnalytics } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowUpRight,
  Eye,
  FileVideo,
  Globe,
  MousePointerClick,
  Share2,
  Target,
  TrendingUp,
} from "lucide-react";

interface Row {
  post: Post;
  a: PostAnalytics;
}

export default function Dashboard() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      const [postsSnap, anaSnap] = await Promise.all([
        getDocs(collection(db, "posts")),
        getDocs(collection(db, "analytics")),
      ]);
      const anaMap = new Map<string, PostAnalytics>();
      anaSnap.forEach((d) => anaMap.set(d.id, d.data() as PostAnalytics));
      const data: Row[] = postsSnap.docs.map((d) => ({
        post: { id: d.id, ...(d.data() as Omit<Post, "id">) },
        a: anaMap.get(d.id) || {},
      }));
      setRows(data);
    })();
  }, []);

  if (!rows) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalPosts = rows.length;
  const totalClicks = rows.reduce((s, r) => s + (r.a.step1Clicks || 0) + (r.a.step2Clicks || 0), 0);
  const totalViews = rows.reduce((s, r) => s + (r.a.views || 0), 0);
  const totalStep1Done = rows.reduce((s, r) => s + (r.a.step1Completions || 0), 0);
  const totalFinal = rows.reduce((s, r) => s + (r.a.finalConversions || 0), 0);
  const conv12 = totalViews ? ((totalStep1Done / totalViews) * 100).toFixed(1) : "0";
  const conv2f = totalStep1Done ? ((totalFinal / totalStep1Done) * 100).toFixed(1) : "0";

  const refTotals = rows.reduce(
    (acc, r) => {
      acc.direct += r.a.referrers?.direct || 0;
      acc.social += r.a.referrers?.social || 0;
      acc.other += r.a.referrers?.other || 0;
      return acc;
    },
    { direct: 0, social: 0, other: 0 }
  );

  const refTotal = refTotals.direct + refTotals.social + refTotals.other || 1;

  const StatCard = ({
    label,
    value,
    icon: Icon,
    accent,
  }: {
    label: string;
    value: string | number;
    icon: typeof Eye;
    accent: string;
  }) => (
    <Card className="relative overflow-hidden border-border/60 transition hover:shadow-elevated">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent} bg-opacity-15`}>
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );

  const RefBar = ({
    label,
    value,
    icon: Icon,
    color,
  }: {
    label: string;
    value: number;
    icon: typeof Eye;
    color: string;
  }) => {
    const pct = ((value / refTotal) * 100).toFixed(1);
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
          <div className="font-semibold">
            {value} <span className="text-xs text-muted-foreground">({pct}%)</span>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="container space-y-8 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">Overview</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Real-time performance across all your posts and traffic sources.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Posts" value={totalPosts} icon={FileVideo} accent="bg-primary" />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} accent="bg-blue-500" />
        <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} icon={MousePointerClick} accent="bg-purple-500" />
        <StatCard label="Step 1 → 2" value={`${conv12}%`} icon={TrendingUp} accent="bg-emerald-500" />
        <StatCard label="Step 2 → Final" value={`${conv2f}%`} icon={Target} accent="bg-orange-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <RefBar label="Direct" value={refTotals.direct} icon={ArrowUpRight} color="bg-primary" />
            <RefBar label="Social" value={refTotals.social} icon={Share2} color="bg-purple-500" />
            <RefBar label="Other" value={refTotals.other} icon={Globe} color="bg-emerald-500" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Per-post performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Step 1</TableHead>
                    <TableHead className="text-right">Step 2</TableHead>
                    <TableHead className="text-right">Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ post, a }) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-[220px] truncate font-medium">{post.title}</TableCell>
                      <TableCell className="text-right tabular-nums">{a.views || 0}</TableCell>
                      <TableCell className="text-right tabular-nums">{a.step1Clicks || 0}</TableCell>
                      <TableCell className="text-right tabular-nums">{a.step2Clicks || 0}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-primary">
                        {a.finalConversions || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No posts yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
