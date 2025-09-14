"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function handleCallback() {
            try {
                // ブラウザの localStorage に保存されているセッションを取得
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    router.replace("/appContent"); // 成功
                } else {
                    router.replace("/"); // 失敗
                }
            } catch (err) {
                console.error(err);
                router.replace("/"); // エラー時もログインページへ
            }
        }

        handleCallback();
    }, [router, supabase]);

    return <p className="text-center mt-20">ログイン処理中…</p>;
}
