const IMGBB_API_KEY = "61238ec8795ae4231bb7337f975450a3";

export async function uploadToImgBB(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`ImgBB upload failed (${res.status})`);
  const data = await res.json();
  if (!data?.data?.url) throw new Error("ImgBB returned no URL");
  return data.data.url as string;
}
