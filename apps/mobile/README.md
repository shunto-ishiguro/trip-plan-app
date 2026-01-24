# Mobile App

Trip Plan Appのモバイルアプリ（Expo / React Native）

## 技術スタック

- Expo 54
- React Native 0.83
- React 19
- TypeScript

## 開発

```bash
# ルートディレクトリから
pnpm dev:mobile

# または直接
cd apps/mobile
pnpm start
```

Expo Go アプリでQRコードをスキャンして確認

## プラットフォーム別起動

```bash
pnpm android    # Android エミュレータ
pnpm ios        # iOS シミュレータ (macOSのみ)
pnpm web        # Webブラウザ
```

## ディレクトリ構成

```
App.tsx      # メインコンポーネント
index.ts     # エントリーポイント
assets/      # 画像・フォントなど
app.json     # Expo設定
```
