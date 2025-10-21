"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { initiatePairing } from "@/app/actions/deviceActions";

// Define the type for the device object returned by the server action.
type Device = {
  id: string;
  pairing_code: string;
  // Add other device properties as needed
};

function PairingCodeModal({
  pairingCode,
  onClose,
}: {
  pairingCode: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-6 text-center bg-white rounded-lg shadow-xl">
          <h3 className="text-lg font-medium">Pair Your Screen</h3>
          <p className="mt-2 text-sm text-gray-500">
            Enter the following code on your device to pair it with your account.
          </p>
          <div className="my-6">
            <p className="text-4xl font-bold tracking-widest text-indigo-600">
              {pairingCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddScreenManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddScreen = async () => {
    setError(null);
    startTransition(async () => {
      const result = await initiatePairing();
      if (result?.error) {
        setError(result.error);
        // Optionally, show an alert or toast message
        alert(`Error: ${result.error}`);
      } else if (result?.device) {
        setPairingCode((result.device as Device).pairing_code);
        setIsModalOpen(true);
        // The server action revalidates the path, so a router refresh
        // will show the new "pairing" device in the list.
        router.refresh();
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPairingCode(null);
  };

  return (
    <>
      {isModalOpen && pairingCode && (
        <PairingCodeModal pairingCode={pairingCode} onClose={closeModal} />
      )}
      <button
        onClick={handleAddScreen}
        disabled={isPending}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
      >
        {isPending ? "Generating Code..." : "Add Screen"}
      </button>
    </>
  );
}
