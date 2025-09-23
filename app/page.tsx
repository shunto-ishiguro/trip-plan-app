"use client";

import { useState } from "react";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const supabase = createClientSupabaseClient;

  const handleLogin = async (provider: "google" | "github") => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/appContent`, // コールバック先
      },
    });

    if (error) {
      console.error("ログイン失敗:", error.message);
      setLoading(false);
      return;
    }

    if (data.url) {
      window.location.href = data.url; // OAuth リダイレクト
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-6">ログインしてください</h1>
      <button
        onClick={() => handleLogin("google")}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Googleでログイン
      </button>
      {loading && <p className="mt-4 text-gray-500">リダイレクト中…</p>}
    </div>
  );
}
