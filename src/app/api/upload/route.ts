// =====================================================================
// LuminaForge.ai — POST /api/upload
// =====================================================================
// Accepts a multipart/form-data file upload and stores it. In
// production this writes to Supabase Storage and returns the public
// signed URL. In the sandbox preview we write to a local data URL so
// the demo works end-to-end without external storage configured.
// =====================================================================

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Enforce a 10MB ceiling.
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "File too large (max 10MB)" }, { status: 413 });
    }

    // ---- Production path: write to Supabase Storage ----
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
    if (supabaseUrl && serviceRole) {
      try {
        const supabase = createClient(supabaseUrl, serviceRole, {
          auth: { persistSession: false },
        });
        const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const path = `moodboards/${safeName}`;
        const buf = Buffer.from(await file.arrayBuffer());
        const { data, error } = await supabase.storage
          .from("moodboards")
          .upload(path, buf, { contentType: file.type, upsert: false });
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from("moodboards").getPublicUrl(path);
        return Response.json({
          url: publicUrlData.publicUrl,
          path,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        });
      } catch (err) {
        // Fall through to local data URL fallback.
        console.warn("[upload] Supabase upload failed — using data URL fallback:", err);
      }
    }

    // ---- Sandbox fallback: data URL ----
    const buf = Buffer.from(await file.arrayBuffer());
    const b64 = buf.toString("base64");
    const dataUrl = `data:${file.type || "image/png"};base64,${b64}`;
    return Response.json({
      url: dataUrl,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
