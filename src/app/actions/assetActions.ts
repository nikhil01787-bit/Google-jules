"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/pdf",
];

export async function uploadAsset(formData: FormData) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "You must be logged in to upload assets." };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided." };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File size exceeds the 100MB limit." };
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { error: `File type not supported: ${file.type}` };
  }

  const filePath = `${session.user.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("assets")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { error: "Failed to upload file to storage." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("assets").getPublicUrl(filePath);

  // Note: Thumbnail generation for images is handled client-side by rendering
  // the public URL. For more advanced thumbnailing (e.g., smaller sizes),
  // a serverless function could be triggered on file upload to create and
  // store different image resolutions.
  const assetData = {
    asset_name: file.name,
    asset_type: file.type.startsWith("image") ? "image" :
                file.type.startsWith("video") ? "video" : "document",
    file_url: publicUrl,
    file_type: file.type,
    file_size: file.size,
    original_filename: file.name,
    owner_id: session.user.id,
  };

  const { error: dbError } = await supabase.from("assets").insert(assetData);

  if (dbError) {
    console.error("Database error:", dbError);
    // If the database insert fails, we should try to clean up the uploaded file.
    await supabase.storage.from("assets").remove([filePath]);
    return { error: "Failed to save asset metadata." };
  }

  // Revalidate the assets page to show the new upload
  revalidatePath("/assets");

  return { success: true };
}

export async function deleteAsset(assetId: string) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "You must be logged in to delete assets." };
  }

  // First, get the asset's file path from the database
  const { data: asset, error: fetchError } = await supabase
    .from("assets")
    .select("file_url")
    .eq("id", assetId)
    .eq("owner_id", session.user.id)
    .single();

  if (fetchError || !asset) {
    return { error: "Asset not found or you do not have permission to delete it." };
  }

  // Delete the database record
  const { error: dbError } = await supabase
    .from("assets")
    .delete()
    .eq("id", assetId);

  if (dbError) {
    console.error("Database delete error:", dbError);
    return { error: "Failed to delete asset metadata." };
  }

  // If the asset has a file, delete it from storage
  if (asset.file_url) {
    // Extract the file path from the public URL
    const filePath = asset.file_url.substring(asset.file_url.indexOf(session.user.id));
    const { error: storageError } = await supabase.storage
      .from("assets")
      .remove([filePath]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      // Even if storage fails, we've deleted the DB record,
      // so we'll revalidate to reflect the change in the UI.
    }
  }

  revalidatePath("/assets");
  return { success: true };
}
