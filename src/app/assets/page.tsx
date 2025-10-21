import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AssetPageClient from "@/components/assets/AssetPageClient";

// Define the type for an asset to avoid ambiguity.
type Asset = {
  id: string;
  asset_name: string;
  asset_type: string;
  file_url: string | null;
  created_at: string;
};

export default async function AssetsPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const { data: assets, error } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assets:", error);
    // In a real app, you'd want to show a user-friendly error message
    // and potentially use an error boundary.
  }

  return <AssetPageClient initialAssets={assets as Asset[] || []} />;
}
