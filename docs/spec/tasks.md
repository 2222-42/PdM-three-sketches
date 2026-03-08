# Development Phases & Tasks (tasks.md)

本ドキュメントでは、MVPを最速でデプロイし、段階的に完成度を高めるためのタスクを定義します。

## Phase 1: ファーストリリース (Fastest Deployable Version)
**目標**: 最速で動くモックアップをVercelにデプロイし、全体的なUIの枠組みとデータフロー（ハードコード）を確認できるようにする。AI（LLM）APIはモックまたはシンプルな単一コールとする。

- [x] **プロジェクトセットアップ**
  - [x] Next.js (App Router) + TailwindCSS の初期化とVercelへの初期デプロイ
  - [ ] GitHubリポジトリの作成とVercel連携（CI/CDの自動デプロイ設定）
- [x] **基本UIコンポーネントの実装**
  - [x] `TranscriptArea`: AI/APIからの文字起こし情報を受け取るためのUI基盤（旧GoalInputからの移行）
  - [x] `SketchesGrid`: 3つのプレビュー枠（iframeまたはdiv）を配置
- [x] **モックAPI（バックエンド）の実装**
  - [x] `/api/generate-structure`: 固定のJSONを返すモックエンドポイント
  - [x] `/api/generate-sketches`: 固定のReact/Tailwindコンポーネント文字列（SketchA/B/C）を返すモックエンドポイント
- [x] **フロントエンドの結合**
  - [x] 入力からモックAPIを呼び出し、結果を画面に反映するロジック（ローディングステート含む）
  - [x] `SandboxedIframe` を用いたコードの安全なレンダリングテスト
- [x] **ファーストリリースデプロイ確認**
  - [x] Vercelの公開URLで正常に全フロー（モック）が動くことを確認する。

## Phase 2: 次のステップ (Next Step - AI Integration)
**目標**: 実際のLLM（OpenRouter経由）を組み込み、入力されたテキストから動的に構造化データおよびUIコードを生成する機能を完成させる。

- [x] **OpenRouterの連携とモデル選定**
  - [x] 環境変数（API Key等）の設定
  - [x] Next.js Server Actions または API RouteでのLLMクライアント初期化
- [x] **`/api/generate-structure` の動的化**
  - [x] System Promptの構築（出力フォーマットをJSONに強制・EARS記法指示）
  - [x] 自動文字起こしされたTranscriptをプロンプトに組み込んでAPI呼び出し
  - [x] JSONパースとエラーリカバリ（正規表現フォールバック等）の実装
- [x] **`/api/generate-sketches` の動的化**
  - [x] 3つの異なるSystem Prompt（Simple, Data-heavy, Mobile）の構築
  - [x] 構造化JSONをもとに、3つのLLMコールを並列実行（`Promise.all`等）する実装
  - [x] 出力されたReact文字列のサニタイズ（余分なマークダウンの除去など）処理
- [ ] **E2Eマニュアルテスト（AI生成の確認）**
  - [ ] 実際の入力を与え、意図した通りの多様なUIが出力されるかテストする

## Phase 3: 最終ステップ (Final Step - Polish & Extras)
**目標**: ハッカソンの完成度を高めるためのUX向上機能や、差別化となる＋αの機能を実装する。

- [x] **Issue #1 - Frontの調整**
  - [x] タイトルを「Meeting to Prototypes」から「3 Sketches」へ変更
  - [x] APIのJSONレスポンスに動的な3つのUI `ideas` の抽出処理を追加
  - [x] UIスケッチ生成時、ハードコードされた3系統（Simple/Data-heavy/Mobile）ではなく、`ideas` を用いた動的プロンプティングへ変更
  - [x] 3つのスケッチ表示時、上部にそれぞれのアプローチを表すタイトルと説明書きを追加
  - [x] スケッチ生成完了後、左側の Transcript/AI Understanding パネルを自動で隠す（"Peek Component" 化）
- [ ] **リファクタリング・エラー処理の強化**
  - [ ] 生成失敗時のUIフィードバック改善（トースト通知やスケッチ個別再生成など）
  - [ ] プレビューでのJavaScriptエラー検知と親画面へのフィードバック
- [ ] **音声入力からの自動文字起こしの実装 (Priority)**
  - [x] ブラウザ標準のWeb Speech APIを用いたリアルタイムSTT（文字起こし）機能の実装とUIへの反映
- [ ] **UI/UXポリッシュ**
  - [ ] 全体的なデザイン、アニメーションの追加（生成中のスケルトンスクリーンや遷移エフェクト）
- [ ] **最終デモ動画の撮影**
  - [ ] 1.5分以内のピッチ用デモ動画の録画・編集


