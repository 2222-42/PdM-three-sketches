# requirements.md
# PdM 3 Sketches Tool - Hackathon MVP
# PdM向けCursor風ツール：オンラインミーティングの会話/Goalから即3つのUIプロトタイプ（React + Tailwind）を生成

## 1. プロジェクト概要
- プロダクト名（仮）：PdM 3 Sketches / Meeting to Prototypes
- 目的：PdMがミーティングで話した要件やGoalをImportすると、優秀なPdM視点で3つの異なるUIスケッチ（Reactコンポーネント）を自動生成し、ライブプレビュー表示する。
  → PdMの「抽象議論 → 具体ビジュアル」のギャップを埋め、方向性ミスマッチを防ぐCursor的な体験を提供。
- ターゲット：PdM、プロダクトチームのオンラインミーティング参加者
- Hackathon制約：3時間以内にMVP完成・Vercelデプロイ可能。提供ツールフル活用。

## 2. コア機能要件（MVP必須）
### 2.1 音声入力からの文字起こし (AI/API Transcription)
- テキスト手動入力ではなく、ブラウザ標準のWeb Speech APIを用いた音声からの自動文字起こしを主とする。
- 会話履歴保持：直近の音声からリアルタイムあるいは一定間隔でテキスト化し保持する。

### 2.2 CrustData Enrichment（企業文脈強化）

- **目的**: Transcriptに含まれる会社ドメイン（例: `retool.com`）やLinkedIn URLを自動検出し、CrustData Company Enrich APIで企業情報を取得。取得した情報をStructure生成プロンプトに注入することで、PdMツールが「誰向けの、どんな規模の会社か」を考慮した文脈依存UIスケッチを生成する。
- **Entity抽出（正規表現ベース）**:
  - ドメイン名パターン（例: `example.com`, `www.example.co.jp`）
  - LinkedIn Company URL（例: `linkedin.com/company/xxx`）
- **CrustData API呼び出し**:
  - エンドポイント: `POST https://api.crustdata.com/dataset/company/enrich`
  - リクエスト: `{ company_domains: [domain] }`
  - ヘッダー: `Authorization: Bearer CRUSTDATA_API_KEY`, `x-api-version: 2025-11-01`
  - 取得する情報: headcount, funding_stage, industry, growth_rate, company name
- **プロンプト注入**: 取得した企業情報を `generate-structure` のLLMプロンプトに追加し、UIアイデア生成の文脈として活用する。
  - 注入例: `Company context: headcount=150, funding=Series B, industry=SaaS, growth=high → 小規模SaaSなのでシンプルUIを優先せよ。`
- **フォールバック**: 会社が見つからない、またはAPIキーが未設定の場合は、一般PdM視点（文脈なし）で処理を継続し、クラッシュしない。
- **API認証キー**: 環境変数 `CRUSTDATA_API_KEY` を使用（Hackathon参加者には$2000クレジット付きキーが提供済み）。

### 2.3 Structure生成（JSON化）
- ボタン押下でLLMコール
- 入力：Transcript（自動文字起こしテキスト）
- 出力：厳格なJSON形式（以下スキーマ厳守）
  ```json
  {
    "problems": ["ユーザー課題1", "ユーザー課題2", ...],
    "requirements": ["要件1", "要件2", ...],
    "constraints": ["制約1", "制約2", ...],
    "workflow": "ユーザー操作の流れをステップバイステップで記述",
    "progress": "現在の議論進捗（例: 要件定義中 / UI設計中）"
  }
  ```
- LLM指示：JSONのみ出力、追加テキスト禁止。EARS風（Easy Approach to Requirements Syntax）で明確・テスト可能に。

### 2.4 3 Sketches生成

- ボタン押下でLLMコール（並列推奨：Blaxel活用）
- 入力：上記structured JSON
- 出力：3つの独立したReact + Tailwindコードスニペット（文字列）
  - Sketch A: Simplest solution（最小機能、クリーンUI）
  - Sketch B: Data-visualization focused（グラフ/テーブル重視）
  - Sketch C: Mobile/field-first（レスポンシブ・モバイル最適）

各Sketch要件：
- Tailwind CSS CDN使用（<script src="https://cdn.tailwindcss.com"></script>）
- 単一のFunctional Component（export default function SketchA() { ... }）
- ダミーデータ使用（ハードコードOK）
- インタラクティブ最小限（ボタンクリックでalertなど可）
- コードは完全自立（外部importなし。アイコンが必要な場合はインラインSVGを使用すること）
- **UIデザイン品質**: 影（shadow）、角丸（rounded）、モダンで調和のとれた配色（Indigo/Violet/Slateなど）、十分な余白（padding/margin）、適切なタイポグラフィ構造を活用し、Claude Artifactsで生成されるような**高度にリッチでアプリライクな見た目（Premium/Modern App-like UI）**にすること。

### 2.5 プレビュー表示

- 右側パネルに3つのiframe/srcdocでライブレンダリング
- 各Sketchにラベル（A: Simple / B: Data-heavy / C: Mobile）
- Loading spinner + エラーハンドリング（コード実行失敗時表示）
- オプション：クリックで拡大/コード表示

### 3. 非機能要件

- パフォーマンス：生成〜プレビューまで10秒以内目標
- 対応言語：UI/プロンプトは日本語優先（Shisa AI活用）
- ブラウザ：Chrome最新で動作
- デプロイ：Vercel（Next.js推奨）
- セキュリティ：ユーザー入力はエスケープ、sandboxed iframe使用

### 4. 技術スタック（Hackathon提供ツール優先）

- Frontend: Next.js (App Router)
- LLM: Shisa AI (Llama 3 ベースモデル等を想定)
- LLM実行: Blaxel sandbox + Morph/Superset並列コーディング
- STT/声操作: Web Speech API (ブラウザ標準)
- **データ強化（コア）: CrustData** — TranscriptからEntity抽出 → Company Enrich API → プロンプト注入
- レンダリング: iframe + srcdoc + Tailwind CDN

### 5. 成功基準（MVPデモで満たすもの）

- 音声入力（自動文字起こし）によるTranscript取得 → Structure JSON表示
- Generate 3 Sketches押下 → 3つのUIが即プレビュー表示
- **CrustData連携**: Transcriptにドメインを含めると、企業文脈がプロンプトに注入され、生成されるideas/Sketchesが変化すること
- デモ動画1.5分：実際のPdM会話例（在庫管理アプリ or SaaS製品）で3つの異なるUIが出てくる様子
- ツールアピール：Web Speech APIで手軽に音声入力、CrustDataでリアルB2B文脈を注入、Blaxelで安全生成など

### 6. 次に明確化が必要な点（NEEDS CLARIFICATION）

- NEEDS CLARIFICATION: LLMがJSONを厳格に出力しない場合のフォールバック（例: 正規表現パース）