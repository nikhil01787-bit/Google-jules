"use client";

import { useState, useCallback, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { uploadAsset } from "@/app/actions/assetActions";

export default function AssetUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "video/*": [".mp4", ".webm"],
      "application/pdf": [".pdf"],
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    setError(null);

    startTransition(async () => {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadAsset(formData);
        if (result?.error) {
          setError(`Upload failed for ${file.name}: ${result.error}`);
          // Stop on first error
          return;
        }
      }
      setFiles([]);
      onUploadComplete();
      onClose();
    });
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Upload Assets</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>

          <div
            {...getRootProps()}
            className={`mt-4 border-2 border-dashed rounded-md p-10 text-center cursor-pointer
              ${isDragActive ? "border-indigo-600 bg-indigo-50" : "border-gray-300"}`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag 'n' drop some files here, or click to select files</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Supports: Images, Videos, PDFs (Max 100MB)
            </p>
          </div>

          {error && (
            <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium">Selected files:</h4>
              <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {files.map((file) => (
                  <li key={file.name} className="flex items-center justify-between p-2 text-sm bg-gray-100 rounded-md">
                    <span className="truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(file.name)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {isPending ? "Uploading..." : `Upload ${files.length} File(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
