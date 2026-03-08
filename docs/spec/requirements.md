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
- コードは完全自立（外部importなし）

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
- LLM: Groq (Llama 3.1 70B) / Gemini 1.5 Flash / Shisa AI（Claude代替）
- LLM実行: Blaxel sandbox + Morph/Superset並列コーディング
- STT/声操作: Web Speech API (ブラウザ標準)
- データ強化（オプション）: CrustData（書き起こし内に会社名等があれば文脈追加）
- レンダリング: iframe + srcdoc + Tailwind CDN

### 5. 成功基準（MVPデモで満たすもの）

- 音声入力（自動文字起こし）によるTranscript取得 → Structure JSON表示
- Generate 3 Sketches押下 → 3つのUIが即プレビュー表示
- デモ動画1.5分：実際のPdM会話例（在庫管理アプリ）で3つの異なるUIが出てくる様子
- ツールアピール：Web Speech APIで手軽に音声入力、Blaxelで安全生成、Morphで爆速開発など

### 6. 次に明確化が必要な点（NEEDS CLARIFICATION）

- NEEDS CLARIFICATION: LLMがJSONを厳格に出力しない場合のフォールバック（例: 正規表現パース）