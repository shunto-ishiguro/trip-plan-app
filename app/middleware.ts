// Supabase公式ドキュメント推奨のシンプルなコード
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    // リクエストのCookieをいじるのではなく、レスポンスに設定するだけ
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    // リクエストのCookieをいじるのではなく、レスポンスに設定するだけ
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // セッションを取得（この時点ではリフレッシュトークンが使われる可能性がある）
    const { data: { session } } = await supabase.auth.getSession()

    // 🔽 ここから下のロジックはあなたのアプリに合わせて修正してください

    // 未ログインで保護されたページにアクセスした場合、ログインページにリダイレクト
    if (!session && request.nextUrl.pathname.startsWith('/appContent')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // ログイン済みでログインページにアクセスした場合、ダッシュボードにリダイレクト
    if (session && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/appContent', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /* ... */
    ],
}