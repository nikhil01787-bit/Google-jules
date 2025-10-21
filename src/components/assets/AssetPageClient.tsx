"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AssetUploadModal from "@/components/assets/AssetUploadModal";
import { deleteAsset } from "@/app/actions/assetActions";

type Asset = {
  id: string;
  asset_name: string;
  asset_type: string;
  file_url: string | null;
  created_at: string;
};

export default function AssetPageClient({ initialAssets }: { initialAssets: Asset[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUploadComplete = () => {
    router.refresh();
  };

  const handleDelete = async (assetId: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      startTransition(async () => {
        const result = await deleteAsset(assetId);
        if (result?.error) {
          alert(`Deletion failed: ${result.error}`);
        } else {
          // The page will be revalidated by the server action,
          // so we just need to refresh the router state.
          router.refresh();
        }
      });
    }
  };

  return (
    <>
      <AssetUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold">Asset Library</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:underline">
              Dashboard
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Upload Assets
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          {initialAssets.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {initialAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="relative overflow-hidden bg-white border rounded-lg shadow-sm group"
                >
                  <button
                    onClick={() => handleDelete(asset.id)}
                    disabled={isPending}
                    className="absolute top-2 right-2 z-10 p-1 text-white bg-red-600 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-700 disabled:bg-gray-400"
                    aria-label="Delete asset"
                  >
                    &times;
                  </button>
                  <div className="flex items-center justify-center w-full h-40 bg-gray-200">
                    {asset.asset_type === "image" && asset.file_url ? (
                      <img
                        src={asset.file_url}
                        alt={asset.asset_name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-500 capitalize">{asset.asset_type}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold truncate" title={asset.asset_name}>
                      {asset.asset_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">No assets found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading your first asset.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
