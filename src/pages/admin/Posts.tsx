import { useEffect, useRef, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { Loader2, Upload } from "lucide-react";
import { db } from "@/lib/firebase";
import { uploadToImgBB } from "@/lib/imgbb";
import type { Post } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const empty: Omit<Post, "id"> = {
  title: "",
  thumbnail: "",
  description: "",
  finalLink: "",
  step1AdLink: "",
  step2AdLink: "",
  requiredClicks: 2,
  timerSeconds: 8,
};

export default function PostsAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      setForm((f) => ({ ...f, thumbnail: url }));
      toast({ title: "Thumbnail uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
    setPosts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, "id">) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Post) => {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm({ ...empty, ...rest });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title) return toast({ title: "Title required", variant: "destructive" });
    try {
      if (editing) {
        await updateDoc(doc(db, "posts", editing.id), { ...form });
        toast({ title: "Post updated" });
      } else {
        await addDoc(collection(db, "posts"), { ...form, createdAt: Date.now(), serverCreatedAt: serverTimestamp() });
        toast({ title: "Post created" });
      }
      setOpen(false);
      load();
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "posts", id));
    toast({ title: "Deleted" });
    load();
  };

  const fld = (k: keyof typeof form, label: string, type: string = "text", textarea = false) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {textarea ? (
        <Textarea value={form[k] as string} onChange={(e) => setForm({ ...form, [k]: e.target.value })} rows={4} />
      ) : (
        <Input
          type={type}
          value={form[k] as string | number}
          onChange={(e) => setForm({ ...form, [k]: type === "number" ? Number(e.target.value) : e.target.value })}
        />
      )}
    </div>
  );

  return (
    <div className="container space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>+ New post</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit post" : "New post"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              {fld("title", "Title")}
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbUpload}
                />
                <div className="flex items-center gap-3">
                  {form.thumbnail && (
                    <img src={form.thumbnail} alt="thumb" className="h-16 w-28 rounded-md object-cover border" />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> {form.thumbnail ? "Replace image" : "Upload image"}</>
                    )}
                  </Button>
                </div>
              </div>
              {fld("description", "Description", "text", true)}
              {fld("finalLink", "Final video link")}
              {fld("step1AdLink", "Step 1 ad link")}
              {fld("step2AdLink", "Step 2 ad link")}
              <div className="grid grid-cols-2 gap-4">
                {fld("requiredClicks", "Required clicks", "number")}
                {fld("timerSeconds", "Timer (seconds)", "number")}
              </div>
              <Button onClick={save} disabled={uploading}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex gap-4">
                  {p.thumbnail && <img src={p.thumbnail} alt="" className="h-16 w-28 rounded-md object-cover" />}
                  <div>
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{p.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(p.id)}>Delete</Button>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Clicks needed: {p.requiredClicks} · Timer: {p.timerSeconds}s
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
