import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post, PostAnalytics } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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
        <Skeleton className="h-24 w-full" />
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

  const stat = (label: string, value: string | number) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container space-y-8 py-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stat("Posts", totalPosts)}
        {stat("Total Views", totalViews)}
        {stat("Total Clicks", totalClicks)}
        {stat("Step 1 → 2", `${conv12}%`)}
        {stat("Step 2 → Final", `${conv2f}%`)}
      </div>

      <Card>
        <CardHeader><CardTitle>Top Referrers</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div><div className="text-sm text-muted-foreground">Direct</div><div className="text-2xl font-bold">{refTotals.direct}</div></div>
          <div><div className="text-sm text-muted-foreground">Social</div><div className="text-2xl font-bold">{refTotals.social}</div></div>
          <div><div className="text-sm text-muted-foreground">Other</div><div className="text-2xl font-bold">{refTotals.other}</div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Per-post stats</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Step1 Clicks</TableHead>
                <TableHead>Step2 Clicks</TableHead>
                <TableHead>Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ post, a }) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{a.views || 0}</TableCell>
                  <TableCell>{a.step1Clicks || 0}</TableCell>
                  <TableCell>{a.step2Clicks || 0}</TableCell>
                  <TableCell>{a.finalConversions || 0}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No posts yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
