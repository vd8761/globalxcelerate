type SupabaseClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (path: string, expiresIn: number) => Promise<{ data: { signedUrl: string } | null; error: unknown }>;
      createSignedUploadUrl: (path: string) => Promise<{ data: { signedUrl: string } | null; error: unknown }>;
      remove: (paths: string[]) => Promise<{ error: unknown }>;
    };
  };
};

export async function generateUploadUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function generateDownloadUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function deleteStorageFile(
  supabase: SupabaseClient,
  bucket: string,
  path: string
): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}

export function getDocumentStoragePath(
  studentId: string,
  applicationId: string,
  documentId: string,
  extension: string
): string {
  return `applications/${studentId}/${applicationId}/${documentId}.${extension}`;
}
