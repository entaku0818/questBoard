# QuestBoard 開発ルール

## リポジトリ構成（モノレポ）

- `web/` … Web版（Next.js 16 + TypeScript）。本番: https://myquestboard.entaku.app
- `ios/` … iOSネイティブ版（SwiftUI）。設計: `docs/NATIVE-APP-PLAN.md`
- `docs/` … 設計書・マーケ資料(`marketing/`)・スクショ(`screenshots/`)
- `firebase.json` / `firestore.rules` / `.firebaserc` … Web/iOS共通のFirebaseバックエンド設定（ルート据え置き）

> Vercel の Root Directory は `web` を指す。

## Web版（web/）の実装ルール

- **ユーティリティファイル禁止**: `utils.js` / `useLocalStorage.js` などの共通モジュールは作らない。処理は各コンポーネント内に直接書く
- **コンポーネント単位で完結**: 1コンポーネント1ファイル、依存を増やさない
- **localStorage**: 各コンポーネントの先頭で直接 `JSON.parse` / `JSON.stringify` する
- **新機能追加時**: `web/src/components/` に新ファイルを作り、`web/src/App.tsx` からimportして追加する

## コミットルール

- 1機能 = 1コミット
- コミット後は即 `git push origin main`
