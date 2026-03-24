# QuestBoard 開発ルール

## ファイル追加・実装のルール

- **ユーティリティファイル禁止**: `utils.js` / `useLocalStorage.js` などの共通モジュールは作らない。処理は各コンポーネント内に直接書く
- **コンポーネント単位で完結**: 1コンポーネント1ファイル、依存を増やさない
- **localStorage**: 各コンポーネントの先頭で直接 `JSON.parse` / `JSON.stringify` する
- **新機能追加時**: `src/components/` に新ファイルを作り、`App.jsx` からimportして追加する

## コミットルール

- 1機能 = 1コミット
- コミット後は即 `git push origin main`
