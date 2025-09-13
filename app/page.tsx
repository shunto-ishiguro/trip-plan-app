//app/page.tsx

"use client";

import { createClient } from "@/lib/supabase/client";  // ← クライアント側をimport
import { useState } from "react";

export default function Page() {

  const [loading, setLoading] = useState(false);
  const supabase = createClient(); // ← ここで使う

  const handleLogin = async (provider: "google" | "github") => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, // クライアントでやると PKCE 保存される
      },
    });

    if (error) {
      console.error("ログイン失敗:", error.message);
      setLoading(false);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-6">ログインしてください</h1>
      <button onClick={() => handleLogin('google')} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Googleでログイン
      </button>
      <button onClick={() => handleLogin('github')} className="bg-gray-800 text-white px-4 py-2 rounded">
        GitHubでログイン
      </button>
      {loading && <p className="mt-4 text-gray-500">リダイレクト中…</p>}
    </div>
  );
}
