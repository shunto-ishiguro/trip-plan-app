# Mobile App

Trip Plan Appのモバイルアプリ（Expo / React Native）

## 技術スタック

- Expo 54
- React Native
- TypeScript

## 開発

```bash
cd apps/mobile
pnpm start           # Expo 起動
pnpm start --tunnel  # トンネルモード（WSL2 実機テスト用）
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
biome.json   # Biome 設定
src/
  api/         # API クライアント
  components/  # UI コンポーネント
  contexts/    # AuthContext, TripContext
  hooks/       # カスタムフック
  screens/     # 画面
  navigation/  # ナビゲーション
  theme/       # テーマ
  types/       # 型定義
```
