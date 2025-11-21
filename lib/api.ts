import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON!);

async function authFetch(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("No supabase session token");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Request failed ${res.status}: ${txt}`);
  }
  return res.json();
}

export async function uploadText(text: string, fileType = "txt", filename?: string) {
  const form = new FormData();
  form.append("text", text);
  form.append("file_type", fileType);
  if (filename) form.append("filename", filename);
  return authFetch("/documents/upload", { method: "POST", body: form });
}

export async function queryVector(query: string, topK = 5, filters = null) {
  return authFetch("/vector/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, topK, filters }),
  });
}
