/**
 * lib/supabase-storage.ts
 *
 * Thin wrapper around the Supabase Storage REST API.
 * Uses the service-role key so uploads work server-side without RLS restrictions.
 *
 * Bucket: "supporting_docs"
 * Path convention: supporting_docs/<appointmentId>/<uuid>-<originalName>
 */

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET           = process.env.SUPABASE_SUPPORTING_DOCS_BUCKET!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !BUCKET) {
  throw new Error(
    "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SUPPORTING_DOCS_BUCKET"
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

const EXT_TO_MIME: Record<string, string> = {
  pdf:  "application/pdf",
  png:  "image/png",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  doc:  "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function storageBase() {
  return `${SUPABASE_URL}/storage/v1`;
}

function authHeaders(extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    apikey: SERVICE_ROLE_KEY,
    ...extra,
  };
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface UploadResult {
  path: string;       // storage path, e.g. "supporting_docs/<appointmentId>/<file>"
  publicUrl: string;  // publicly accessible URL
  fileName: string;
  fileType: string;
  fileSize: number;
}

// ── Upload ─────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to the supporting_docs bucket.
 *
 * @param file        - Web API File object (from FormData)
 * @param appointmentId - used as the folder prefix inside the bucket
 */
export async function uploadSupportingDoc(
  file: File,
  appointmentId: string
): Promise<UploadResult> {
  const ext      = file.name.split(".").pop() ?? "bin";
  const uniqueId = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${appointmentId}/${uniqueId}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const body        = Buffer.from(arrayBuffer);

  const uploadUrl = `${storageBase()}/object/${BUCKET}/${storagePath}`;

  const res = await fetch(uploadUrl, {
    method:  "POST",
    headers: authHeaders({
      "Content-Type":  file.type || `application/${ext}`,
      "x-upsert":      "false",
    }),
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase storage upload failed (${res.status}): ${err}`);
  }

  const publicUrl = getPublicUrl(storagePath);

  const resolvedMime = file.type || EXT_TO_MIME[ext.toLowerCase()] || `application/${ext}`;

  return {
    path:      storagePath,
    publicUrl,
    fileName:  file.name,
    fileType:  resolvedMime,
    fileSize:  file.size,
  };
}

// ── Public URL ─────────────────────────────────────────────────────────────

export function getPublicUrl(storagePath: string): string {
  return `${storageBase()}/object/public/${BUCKET}/${storagePath}`;
}

// ── Delete ─────────────────────────────────────────────────────────────────

/**
 * Delete one or more files from the bucket (used for cleanup on error).
 */
export async function deleteSupportingDocs(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  const deleteUrl = `${storageBase()}/object/${BUCKET}`;

  await fetch(deleteUrl, {
    method:  "DELETE",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body:    JSON.stringify({ prefixes: paths }),
  });
}
