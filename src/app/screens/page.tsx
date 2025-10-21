import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AddScreenManager from "@/components/screens/AddScreenManager";

// Define the type for a device to ensure type safety.
type Device = {
  id: string;
  device_name: string;
  status: string;
  pairing_code: string;
  platform: string | null;
  last_seen_at: string | null;
};

export default async function ScreensPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const { data: devices, error } = await supabase
    .from("devices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching devices:", error);
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Screens</h1>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:underline">
            Dashboard
          </Link>
          <AddScreenManager />
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        <div className="overflow-x-auto bg-white border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Pairing Code</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Platform</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {devices && devices.length > 0 ? (
                devices.map((device: Device) => (
                  <tr key={device.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{device.device_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        device.status === 'online' ? 'bg-green-100 text-green-800' :
                        device.status === 'offline' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {device.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{device.pairing_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{device.platform || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : "Never"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-center text-gray-500">
                    No screens found. Click "Add Screen" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
