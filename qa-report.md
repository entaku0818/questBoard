# QuestBoard QA レポート

作成日: 2026-03-22
対象: React/JSX/localStorage ベースの QuestBoard アプリ

---

## 対象ファイル

| ファイル | 概要 |
|---|---|
| `src/App.jsx` | ルートコンポーネント、クエスト CRUD |
| `src/useLocalStorage.js` | localStorage カスタムフック |
| `src/components/QuestList.jsx` | クエスト一覧・選択・削除 |
| `src/components/QuestDetail.jsx` | クエスト詳細・TODO 管理 |
| `src/components/TodoGroup.jsx` | グループ別 TODO リスト |
| `src/components/TodoItem.jsx` | 個別 TODO アイテム |
| `src/bucket-list.jsx` | バケツリスト機能（新規作成済） |
| `src/pyramid.jsx` | 目標ピラミッド機能（新規作成済） |

---

## 🐛 バグ（動作に影響する問題）

### B-01: QuestDetail — クエスト切り替え時にタイトル/説明のローカル state が古いまま残る（重大）

**場所**: `src/components/QuestDetail.jsx` L.21-22

```jsx
const [titleInput, setTitleInput] = useState(quest.title)         // 初期化のみ
const [descInput, setDescInput] = useState(quest.description || '') // 初期化のみ
```

**再現手順**:
1. クエスト A のタイトル編集モードを開く
2. 保存せずに別のクエスト B をクリックして選択
3. クエスト B の詳細に切り替わるが `titleInput` には A のタイトルが残っている
4. 保存すると B が A のタイトルに上書きされる

**影響**: データ破損の可能性（高）

**修正案**: `useEffect` で `quest.id` の変化を検知し、state をリセットする
```jsx
useEffect(() => {
  setTitleInput(quest.title)
  setDescInput(quest.description || '')
  setIsEditingTitle(false)
  setNewTodoText('')
  setNewTodoDue('')
}, [quest.id])
```

---

### B-02: QuestDetail — タイトル編集を空にして閉じると UI は閉じるがデータは変わらず混乱を招く

**場所**: `src/components/QuestDetail.jsx` L.67-70

```jsx
function saveTitle() {
  const title = titleInput.trim()
  if (title) onUpdate({ ...quest, title, description: descInput })
  setIsEditingTitle(false)  // ← title が空でも閉じる
}
```

**問題**: タイトルを空にして「保存」を押すとフォームは閉じるが、元のタイトルが表示される。ユーザーには保存されたのか失敗したのか不明。

**修正案**: 空タイトルのときは `input` をエラー表示するか、保存ボタンを無効化する。

---

### B-03: useLocalStorage — 関数型アップデートで storedValue クロージャが古くなりうる

**場所**: `src/useLocalStorage.js` L.13-20

```js
const setValue = (value) => {
  const valueToStore = value instanceof Function ? value(storedValue) : value
  setStoredValue(valueToStore)
  window.localStorage.setItem(key, JSON.stringify(valueToStore))
}
```

**問題**: `storedValue` はクロージャでキャプチャされた値。React Strict Mode（StrictMode でラップ済み）では state 更新が 2 回呼ばれるケースがあり、`valueToStore` が古い `storedValue` を参照する可能性がある。

**修正案**:
```js
const setValue = (value) => {
  setStoredValue((prev) => {
    const valueToStore = value instanceof Function ? value(prev) : value
    window.localStorage.setItem(key, JSON.stringify(valueToStore))
    return valueToStore
  })
}
```

ただし、`setStoredValue` 内の副作用（localStorage 書き込み）は Strict Mode で 2 回実行される点に注意。

---

### B-04: QuestDetail — `isEditingTitle` がクエスト切り替え時にリセットされない

**場所**: `src/components/QuestDetail.jsx` L.20

**問題**: クエスト A の編集モード中に B を選択すると、B の表示も編集モードのままになる。

**修正案**: B-01 の `useEffect` に `setIsEditingTitle(false)` を追加（上記に含まれる）。

---

### B-05: TodoItem — todo のテキストが作成後に編集できない

**場所**: `src/components/TodoItem.jsx`

**問題**: todo テキスト表示は `<span>` のみで、編集 UI が存在しない。タイポしても修正不可。

**修正案**: todo テキストをクリックしてインライン編集できる仕組みを追加。

---

## ⚠️ エッジケース

### E-01: 入力文字数制限なし → UI 破綻の可能性

| 入力箇所 | 現在の制限 | 推奨 |
|---|---|---|
| クエストタイトル input | なし | maxLength="100" |
| クエスト説明 textarea | なし | maxLength="500" |
| TODO テキスト input | なし | maxLength="200" |
| タイトル編集 input | なし | maxLength="100" |

---

### E-02: ID 衝突の可能性

**場所**: `App.jsx` L.16, `QuestDetail.jsx` L.29

`id: Date.now().toString()` を使用。同一ミリ秒内に複数追加した場合（テストや自動入力）に ID が重複し、`map` のキー警告やデータ上書きが起きる。

**修正案**: `crypto.randomUUID()` を使用。

---

### E-03: localStorage の容量超過に対する処理なし

**場所**: `src/useLocalStorage.js` L.17

`localStorage.setItem` は容量超過（5MB 超）時に例外を投げる。`catch` で `console.error` のみのため、ユーザーへの通知なしに保存が失敗する。

---

### E-04: `JSON.parse` の形式不正データに対する部分的な保護

**場所**: `src/useLocalStorage.js` L.6-8

`try/catch` はあるが、`JSON.parse` 成功後のデータが期待する型（配列）でない場合（例: 手動で `localStorage.setItem('quests', '42')` した場合）に `.map` などで実行時エラーになる。

---

### E-05: クエスト削除で進行中作業が消える — 確認ダイアログなし

**場所**: `src/components/QuestList.jsx` L.28-31

クエストの削除ボタンが確認なし。TODO が多数あっても一発削除される。

---

### E-06: todo の期日に過去日付を設定可能（入力バリデーションなし）

**場所**: `src/components/QuestDetail.jsx` L.131, `src/components/TodoItem.jsx` L.32

`<input type="date">` に `min` 属性がなく、過去日付を設定できる。

---

### E-07: bucket-list.jsx — 完了済みアイテムのフィルター状態でステータストグルすると表示が消える

**場所**: `src/bucket-list.jsx` `toggleStatus` 関数

フィルター「完了」で表示中に「完了 → 未着手」にトグルすると、そのアイテムがフィルターから外れて消える。意図的な動作だが、初見ユーザーには驚きがある（フィードバック不足）。

---

## 🎨 UX 課題

### U-01: TodoItem — 期日 input とグループ select が常時表示されている（UI が密集）

**場所**: `src/components/TodoItem.jsx` L.29-45

全 TODO に日付入力と select が常に表示され、情報密度が高すぎる。

**改善案**: ホバー時またはメニューボタンから展開する形式に変更。

---

### U-02: TodoGroup — 空グループも常時表示

**場所**: `src/components/TodoGroup.jsx`

今日・今週・いつか の 3 グループが TODO ゼロでも全て表示される。

**改善案**: TODO があるグループのみ表示（またはアコーディオン化）。

---

### U-03: クエスト削除にアクセシビリティ配慮なし

**場所**: `src/components/QuestList.jsx` L.25-30

削除ボタンにフォーカスリングがなく、`aria-label` も未設定。「×」の文字だけでは意図がわかりにくい。

---

### U-04: サイドバー・メインの比率がレスポンシブ未対応

**場所**: `src/App.jsx` className="app-body"

CSS で `sidebar` と `main-content` の幅指定がないと想定。モバイル表示では横並びが崩れる可能性。

---

### U-05: 空のクエスト選択時の「empty-state」メッセージが受動的

**場所**: `src/App.jsx` L.67

「👈 クエストを選択するか…」だけで、アクションを誘導するボタンがない。

---

### U-06: TODO 追加後に入力フォームにフォーカスが戻らない

**場所**: `src/components/QuestDetail.jsx` `addTodo` 関数

TODO を追加するたびに手動でテキスト入力欄をクリックし直す必要がある。連続追加が不便。

---

### U-07: pyramid.jsx — 別ティアの追加中にアクティブ tier を切り替えると入力内容が消える

**場所**: `src/pyramid.jsx` `handleAddClick` 関数

`setInputText('')` でリセットされるため、書きかけテキストが消える。

---

## 📋 TODO 機能実装後テストチェックリスト

### 基本 CRUD
- [ ] TODO を入力して Enter で追加できる
- [ ] TODO を入力して「追加」ボタンで追加できる
- [ ] 空文字・空白のみの入力では TODO が追加されない
- [ ] 追加した TODO がリストに表示される
- [ ] TODO テキスト横のチェックボックスをクリックで完了/未完了が切り替わる
- [ ] TODO を削除できる
- [ ] 削除後に TODO がリストから消える

### グループ管理
- [ ] TODO 追加時にグループ（今日/今週/いつか）を選択できる
- [ ] 追加した TODO が選択したグループに表示される
- [ ] TODO のグループを後から変更できる
- [ ] グループ変更後、元グループから消えて新グループに移動する

### 期日管理
- [ ] TODO 追加時に期日を設定できる
- [ ] 期日なしで追加できる
- [ ] 今日の日付には「今日が期日」バッジが表示される
- [ ] 翌日の日付には「明日が期日」バッジが表示される
- [ ] 過去の日付には「N 日超過」バッジ（赤）が表示される
- [ ] 将来の日付には「N 日後」バッジが表示される
- [ ] 既存 TODO の期日を変更できる
- [ ] 既存 TODO の期日を削除できる（空にできる）

### 進捗計算
- [ ] TODO が 0 件のクエストのプログレスバーは 0% を表示
- [ ] 全 TODO 完了でプログレスバーが 100% になる
- [ ] 一部完了で端数を正しく計算する（例: 1/3 → 33%）
- [ ] サイドバーのプログレスバーもリアルタイムに更新される

### localStorage 永続化
- [ ] TODO を追加後、ページをリロードしても保持される
- [ ] TODO の完了状態がリロード後も保持される
- [ ] グループ変更がリロード後も保持される
- [ ] 期日変更がリロード後も保持される
- [ ] TODO 削除後にリロードしても削除済みのまま

### エッジケース
- [ ] 非常に長いテキスト（100 文字以上）を入力したとき UI が崩れない
- [ ] 特殊文字（`<script>`, `'`, `"`, 絵文字）を含む TODO が正しく表示される（XSS なし）
- [ ] クエストを 100 件追加しても UI がクラッシュしない
- [ ] クエスト 1 件に TODO を 100 件追加しても動作する
- [ ] 異なるクエストの TODO が混ざらない（独立性）
- [ ] localStorage が満杯の場合にエラーが画面に表示される（または graceful degradation）

### クエスト切り替え
- [ ] クエスト A で TODO を追加後に B に切り替え、再び A に戻ると A の TODO が表示される
- [ ] クエスト B の TODO は A には表示されない
- [ ] クエスト A のタイトル編集中に B を選択すると、B の正しいタイトルが表示される（B-01 修正確認）
- [ ] クエスト A を削除すると A の TODO も消える

### アクセシビリティ
- [ ] キーボードのみで TODO を追加できる（Tab→入力→Enter）
- [ ] キーボードのみで TODO を完了/未完了に切り替えられる
- [ ] スクリーンリーダーでチェックボックスのラベルが読み上げられる

---

---

## 【第2回コードレビュー追記】 2026-03-22

> 対象: `src/` 以下の全 JSX ファイルを精読。QuestDetail.jsx がタブ UI に更新済みであることを確認。

---

### B-06: QuestDetail — 全 todo 操作で `quest` prop を直接 spread → 連続操作でデータ消失（最重大）

**場所**: `src/components/QuestDetail.jsx` `addTodo`, `toggleTodo`, `deleteTodo`, `updateTodoDue`, `updateTodoGroup`, `saveTitle` の全 6 関数

**問題の構造**:

```jsx
// ❌ 全関数がこのパターン
function toggleTodo(todoId) {
  onUpdate({ ...quest, todos: quest.todos.map(...) })  // quest は古い prop
}
```

`onUpdate` → `setQuests((prev) => prev.map(...))` と functional updater を使っているが、**`updatedQuest` 自体がレンダリング前の古い `quest` prop から生成**されている。

**具体的なデータ消失シナリオ**:
1. クエストに TODO [A, B] がある
2. ユーザーが素早く A をチェック → `onUpdate({ todos: [A_done, B] })` がキュー
3. React が再描画する前に B を削除 → `onUpdate({ todos: [A, ] })` が **古い `quest`** を使ってキュー
4. `setQuests` が 2 回呼ばれるが、後の呼び出しで `todos: [A(未完了)]` に上書き
5. **結果: A のチェックが消える**

同じ理由で **`saveTitle` 中にユーザーが TODO を追加した場合、その TODO は全て消失する**（タイトルを保存した瞬間に古い `quest.todos` で上書き）。

**影響**: データ消失（最重大）

**修正案**: `onUpdate` のインターフェースを関数型アップデートに変更する。

```jsx
// App.jsx 側
function updateQuest(questId, updater) {
  setQuests((prev) => prev.map((q) => q.id === questId ? updater(q) : q))
}

// QuestDetail 側
function toggleTodo(todoId) {
  onUpdate(quest.id, (q) => ({
    ...q,
    todos: q.todos.map((t) => t.id === todoId ? { ...t, done: !t.done } : t),
  }))
}
```

---

### B-07: QuestDetail — `quest.todos` の null チェックが L.36-38 に存在しない（クラッシュ）

**場所**: `src/components/QuestDetail.jsx` L.36-38

```jsx
const tabTodos = quest.todos.filter((t) => t.group === activeTab)  // ← null/undefined で TypeError
const tabDone = tabTodos.filter((t) => t.done).length
const tabProgress = tabTodos.length === 0 ? 0 : Math.round((tabDone / tabTodos.length) * 100)
```

`calcProgress(quest.todos)` には `if (!todos || todos.length === 0)` ガードがあるが、**直後の `quest.todos.filter` にはガードがない**。localStorage データが破損し `todos` フィールドが欠落している場合に TypeError でアプリ全体がクラッシュする。

**修正案**: `quest.todos ?? []` でフォールバックするか、App 側で todos の型を検証する。

---

### B-08: QuestDetail — `activeTab` がクエスト切り替え時にリセットされない

**場所**: `src/components/QuestDetail.jsx` L.28

```jsx
const [activeTab, setActiveTab] = useState('today')  // クエスト切り替えでリセットされない
```

クエスト A で「いつか」タブを開いた後、クエスト B に切り替えると B の「いつか」タブが表示される。B に「いつか」の TODO がなければ空表示になり、「今日」や「今週」に TODO があっても気づかない。

**修正案**: B-01 の `useEffect` に `setActiveTab('today')` を追加。

---

### B-09: useLocalStorage — stale closure が `updateQuest` 連続呼び出し時に localStorage 不整合を引き起こす

**場所**: `src/useLocalStorage.js` L.15 (B-03 の具体的な発現シナリオ)

```js
const setValue = (value) => {
  const valueToStore = value instanceof Function ? value(storedValue) : value  // storedValue は古い
  setStoredValue(valueToStore)
  window.localStorage.setItem(key, JSON.stringify(valueToStore))
}
```

B-06 シナリオで `onUpdate` が短時間に 2 回呼ばれる場合：
- 1回目: `setValue((prev) => prev.map(...))` → `storedValue` = [q1, q2] → localStorage に書き込み
- 2回目: `setValue((prev) => prev.map(...))` → `storedValue` **まだ** = [q1, q2]（再描画前）→ 1回目の変更が反映されていないデータで localStorage を上書き

**結果**: React state と localStorage が不整合、ページリロード後にデータが巻き戻る。

---

## TodoTabs.jsx（デザイン提案コンポーネント）の追加所見

`src/components/TodoTabs.jsx` は既存の `TodoGroup` + `TodoItem` の置き換え候補として設計されているが、現在は `QuestDetail.jsx` から参照されておらず未使用。

### 評価
- アクセシビリティ対応が改善（`aria-label`, `role="tab"`, `aria-selected`）
- タブ内に入力フォームを持ち UX 向上
- `TodoItem` の常時表示問題（U-01）を解消
- ただし `TodoItemV2` で確認ダイアログなし削除の問題は引き継がれている

### 追加バグ
- **T-01**: `activeTab` の初期値は `'today'` で固定。クエスト切り替え時にリセットされない（B-01 の亜種）

---

## ShareCard.jsx（SNS シェアコンポーネント）の追加所見

`src/components/ShareCard.jsx` は `QuestDetail.jsx` から未参照の提案コンポーネント。

### 追加バグ / 問題
- **S-01**: `mode` prop を受け取るが内部で `isComplete = pct === 100` で判定しており `mode` は未使用（dead prop）
- **S-02**: `copyText()` と `downloadCard()` が `alert()` を使用 → U-01 と同じ問題（モバイル不適切）
- **S-03**: tweet URL 内の `quest?.title` が `undefined` のとき `"undefined"` という文字がポスト内容に含まれる
- **S-04**: `html2canvas` は `devDependencies` に未追加。動的 `import()` は失敗する（コメントアウトで明示しているが）

---

## 第2回レビュー追加エッジケース

### E-08: `TodoGroup.jsx` / `TodoItem.jsx` が現在の実装から参照されていない（デッドコード）

**確認結果**:
- `QuestDetail.jsx` は現在タブ UI でインライン描画しており、`TodoGroup` / `TodoItem` を **import していない**
- `App.jsx` も直接 import していない
- `TodoTabs.jsx` も独自の `TodoItemV2` を持ち、`TodoItem` を使っていない

これらのファイルは実質デッドコード。将来の混乱を避けるために削除するか、`TodoGroup` を積極的に使う設計に戻すかを明確にする。

---

### E-09: タブバッジが「全 TODO 数」を表示 → 完了済みでもバッジが消えない

**場所**: `src/components/QuestDetail.jsx` L.134

```jsx
const count = quest.todos.filter((t) => t.group === g.key).length  // 全件（完了含む）
```

全件が完了済みでもバッジの数字が残り、未完了タスクがあるかのように見える。`TodoTabs.jsx` の実装（残件のみ表示）の方が正確。

---

### E-10: XSS / エンコーディング（問題なし、確認済み）

- `{todo.text}` はすべて JSX 式として扱われ、React が HTML エスケープを行うため **XSS リスクなし**
- `localStorage.setItem` は UTF-16 で格納するため絵文字（🎯 など）も正しく保存・復元される
- `JSON.stringify` / `JSON.parse` は絵文字を含む文字列を正確に処理する

---

## 第2回レビュー追加 UX 課題

### U-08: タイトル編集モードにキャンセル手段がない

**場所**: `src/components/QuestDetail.jsx` L.93-109

「保存」ボタンのみで、**「キャンセル」ボタンも Escape キーハンドラもない**。タイトルをうっかり変更した場合、元に戻す手段がなく保存するしかない。

**修正案**: `onKeyDown` で Escape を `setIsEditingTitle(false)` + state リセットに紐づける。

---

### U-09: `QuestList` の `<li>` がキーボード操作不可

**場所**: `src/components/QuestList.jsx` L.18-22

```jsx
<li onClick={() => onSelect(quest.id)}>
```

`tabIndex` も `role="button"` も設定されていないため、Tab キーでフォーカスできずキーボードでクエスト選択不可。

---

## 重複コード指摘（更新）

`calcProgress` 関数が以下の **4 ファイル**に同一（または類似）実装が存在：
- `QuestList.jsx`
- `QuestDetail.jsx`（今回の更新で追加）
- `ShareCard.jsx`
- `TodoTabs.jsx`（`calcTabProgress` として変形）

`formatDue` 関数が以下の **3 ファイル**に重複（前回の 2 ファイルから増加）：
- `TodoItem.jsx`
- `TodoTabs.jsx`
- `QuestDetail.jsx`（今回の更新で追加）

→ `src/utils.js` に切り出して全コンポーネントから import する。

---

## 優先対応順（第2回レビュー更新版）

| 優先度 | ID | 内容 | 種別 |
|---|---|---|---|
| 🔴 Critical | B-06 | todo 操作で stale prop spread → 連続操作でデータ消失 | バグ |
| 🔴 Critical | B-01 | クエスト切り替え時のタイトル state が古く上書き | バグ |
| 🔴 Critical | B-04 | 編集モードがクエスト切り替えでリセットされない | バグ |
| 🔴 Critical | B-07 | `quest.todos` null チェック欠如でクラッシュ | バグ |
| 🟠 High | B-08 | activeTab がクエスト切り替えでリセットされない | バグ |
| 🟠 High | B-09 | useLocalStorage stale closure + B-06 の複合でリロード後データ巻き戻り | バグ |
| 🟠 High | B-02 | 空タイトル保存時のフィードバックなし | バグ |
| 🟠 High | B-05 | TODO テキスト編集不可 | バグ |
| 🟡 Medium | E-05 | クエスト削除に確認ダイアログなし | エッジ |
| 🟡 Medium | E-01 | 入力文字数制限なし | エッジ |
| 🟡 Medium | E-09 | タブバッジが完了済みも含めた全件数を表示 | エッジ |
| 🟡 Medium | U-08 | タイトル編集にキャンセル手段がない | UX |
| 🟡 Medium | U-01 | TodoItem の日付・グループ select が常時表示 | UX |
| 🟢 Low | E-08 | TodoGroup/TodoItem がデッドコード | エッジ |
| 🟢 Low | E-02 | Date.now() ID 衝突リスク | エッジ |
| 🟢 Low | U-09 | QuestList の `<li>` キーボード操作不可 | UX |
| 🟢 Low | U-03 | 削除ボタンの aria-label 欠如 | UX |
| 🟢 Low | B-03 | useLocalStorage Strict Mode 注意 | バグ |
