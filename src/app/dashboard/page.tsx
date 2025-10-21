// src/app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const handleSignOut = async () => {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/auth/signin");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">Welcome to the Dashboard</h1>
      <p className="mt-4 text-lg">You are signed in as {session.user.email}</p>
      <form action={handleSignOut}>
        <button
          type="submit"
          className="px-4 py-2 mt-8 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
