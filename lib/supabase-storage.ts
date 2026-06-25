/**
 * lib/supabase-storage.ts
 *
 * Thin wrapper around the Supabase Storage REST API.
 * Uses the service-role key so uploads work server-side without RLS restrictions.
 *
 * Buckets:
 *   - DOCS_BUCKET        (SUPABASE_SUPPORTING_DOCS_BUCKET)  — appointment supporting docs
 *   - CONSULTANT_RESUME  (SUPABASE_CONSULTANT_RESUME_BUCKET) — consultant identity/verification docs
 *
 * Path conventions:
 *   supporting_docs:     <appointmentId>/<uuid>-<originalName>
 *   consultant_resume:   <userId>/<uuid>-<originalName>
 */

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DOCS_BUCKET           = process.env.SUPABASE_SUPPORTING_DOCS_BUCKET!;
const CONSULTANT_RESUME    = process.env.SUPABASE_CONSULTANT_RESUME_BUCKET!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DOCS_BUCKET) {
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

  const uploadUrl = `${storageBase()}/object/${DOCS_BUCKET}/${storagePath}`;

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
  return `${storageBase()}/object/public/${DOCS_BUCKET}/${storagePath}`;
}

// ── Delete ─────────────────────────────────────────────────────────────────

/**
 * Delete one or more files from the bucket (used for cleanup on error).
 */
export async function deleteSupportingDocs(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  const deleteUrl = `${storageBase()}/object/${DOCS_BUCKET}`;

  await fetch(deleteUrl, {
    method:  "DELETE",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body:    JSON.stringify({ prefixes: paths }),
  });
}

// ── Consultant Resume / Verification Docs ──────────────────────────────────

/**
 * Upload a single file to the consultant_resume bucket.
 *
 * @param file   - Web API File object (from FormData)
 * @param userId - used as the folder prefix inside the bucket
 */
export async function uploadConsultantDoc(
  file: File,
  userId: string
): Promise<UploadResult> {
  if (!CONSULTANT_RESUME) {
    throw new Error(
      "Missing env var: SUPABASE_CONSULTANT_RESUME_BUCKET"
    );
  }

  const ext         = file.name.split(".").pop() ?? "bin";
  const uniqueId    = crypto.randomUUID();
  const safeName    = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${userId}/${uniqueId}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const body        = Buffer.from(arrayBuffer);

  const uploadUrl = `${storageBase()}/object/${CONSULTANT_RESUME}/${storagePath}`;

  const res = await fetch(uploadUrl, {
    method:  "POST",
    headers: authHeaders({
      "Content-Type": file.type || EXT_TO_MIME[ext.toLowerCase()] || `application/${ext}`,
      "x-upsert":     "false",
    }),
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Consultant doc upload failed (${res.status}): ${err}`);
  }

  const publicUrl = getConsultantDocPublicUrl(storagePath);
  const resolvedMime = file.type || EXT_TO_MIME[ext.toLowerCase()] || `application/${ext}`;

  return {
    path:     storagePath,
    publicUrl,
    fileName: file.name,
    fileType: resolvedMime,
    fileSize: file.size,
  };
}

/**
 * Upload multiple consultant verification docs in parallel.
 * Returns an array of UploadResult in the same order as the input files.
 */
export async function uploadConsultantDocs(
  files: File[],
  userId: string
): Promise<UploadResult[]> {
  return Promise.all(files.map((f) => uploadConsultantDoc(f, userId)));
}

/** Public URL for a file inside the consultant_resume bucket. */
export function getConsultantDocPublicUrl(storagePath: string): string {
  return `${storageBase()}/object/public/${CONSULTANT_RESUME}/${storagePath}`;
}

/**
 * Delete one or more consultant docs from the bucket.
 * Useful for rollback if the DB write fails after upload.
 */
export async function deleteConsultantDocs(paths: string[]): Promise<void> {
  if (paths.length === 0 || !CONSULTANT_RESUME) return;

  const deleteUrl = `${storageBase()}/object/${CONSULTANT_RESUME}`;

  await fetch(deleteUrl, {
    method:  "DELETE",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body:    JSON.stringify({ prefixes: paths }),
  });
}
