# Product Specification (spec.md)

## 1. 概要 (Overview)
PdM 3 Sketches / Meeting to Prototypesは、オンラインミーティングでの抽象的な議論やゴールから、具体的な3パターンのUIスケッチ（Reactコンポーネント）をAIで即座に生成しプレビューするツールです。PdMの「要求定義から具体的なUIまでのギャップ」を埋めます。

## 2. ユーザーフロー (User Flow)
1. **音声からの自動文字起こし**: ミーティングの会話内容をAIや外部APIを用いてリアルタイム（またはバッチ）で自動的に文字起こし（Transcript）して取得します。人間による手動テキスト入力は行いません。
2. **企業文脈エンリッチ（CrustData）**: [Generate Structure]ボタン押下時、TranscriptからドメインやLinkedIn URLを自動抽出し、CrustData Company Enrich APIを呼び出して企業情報（headcount, funding_stage, industry, growth_rate）を取得します。取得した情報はLLMプロンプトへ注入されます。会社が特定できない場合は汎用プロンプトで処理を続行します。
3. **要件構造化**: 企業文脈が注入されたプロンプトでLLMがTranscriptを解析し、JSON形式で課題・要件・制約・ワークフローを整理し、企業規模・業界を考慮した「3つのアプローチ（ideas）」を提案します。
4. **UIスケッチ生成**: [Generate Sketches]ボタン押下で、構造化された要件JSONをもとに、アプローチの異なる3つの独立したReactコンポーネントコード（Tailwind付き）を生成します。
5. **プレビューと確認**: 右側のパネルに3パターンのプレビューが即座に表示され、左側のコンポーネント（AI Understandingなど）は「Peek Component」として隠れ、スケッチに集中できるUIになります。

## 3. 機能仕様詳細 (Functional Specs)
### 3.1 入力セクション (Input Area)
- **Transcript Input (Auto)**:
  - 手動貼り付けではなく、ブラウザ標準のWeb Speech APIによる音声からのリアルタイム自動文字起こしテキストを表示・保持するエリア。

### 3.2 構造化モジュール (JSON Generator)
- **トリガー**: ボタンプッシュ
- **処理**: 音声から生成されたTranscriptテキストをLLM (Shisa AI経由)に入力。
- **出力形式**:
  ```json
  {
    "problems": ["..."],
    "requirements": ["..."],
    "constraints": ["..."],
    "workflow": "...",
    "progress": "...",
    "ideas": [
      {
        "title": "Minimalist Approach",
        "description": "Focusing on core user flow without distractions."
      }
    ]
  }
  ```
- **エラーハンドリング**:
  - JSONパース失敗時、リトライまたは正規表現でのフォールバック抽出処理を行う。（NEEDS CLARIFICATIONの定義に基づく）

### 3.3 UI生成モジュール (Sketches Generator)
- **入力**: 構造化された要件JSON（`ideas`配列を含む）
- **生成バリエーション**:
  `ideas` の配列にある3つのアプローチ（タイトルおよび説明）に基づき、3パターンのUIを動的プロンプティングで生成します。
- **制約事項**:
  - TailwindCSSのCDNスクリプトを内包
  - 単一ファイル内で完結したFunctional Component
  - 外部依存モジュールなし（アイコンなどもSVGインライン化を推奨）
  - ハードコードされたモックデータを保持

### 3.4 プレビューセクション (Preview Pane)
- 3つの生成結果を独立したiframe (srcdoc属性) でセキュアにレンダリングする。
- ローディング中はSpinnerを表示。
- エラーハンドリング: コード実行時、または生成失敗時にエラーメッセージを表示。

### 3.5 CrustData Enrichment Module
- **トリガー**: `/api/generate-structure` リクエスト受信時に自動実行（ユーザー操作不要）
- **Entity抽出**: `extractDomains(transcript)` でドメイン文字列を正規表現抽出（最初のドメインを使用）
- **API呼び出し** (`GET /api/enrich-company?domain=xxx`):
  - 内部的にCrustData `POST /dataset/company/enrich` を呼ぶ
  - レスポンス: `{ enriched: true, name, headcount, funding_stage, industry, growth_rate }` または `{ enriched: false }`
- **プロンプト注入**: `enriched: true` の場合のみ、LLMシステムプロンプトに企業情報を追記
- **エラーハンドリング**: ネットワーク障害・タイムアウト・404の全ケースで `{ enriched: false }` を返し、処理を継続する

## 4. 非機能要件 (Non-Functional Specs)
- **レスポンスタイム**: LLM呼び出しからプレビュー完了まで10秒未満。並列APIコール（Blaxel）でレイテンシを抑える。
- **対応ブラウザ**: Chrome 最新版
- **セキュリティ**: iframeによるsandbox化（`allow-scripts` のみ付与など）。

## 5. ACCEPTANCE_CRITERIA (受入基準)
*本セクションはRule `spec-first-enforcement`に基づく*
- [ ] タイトルヘッダが「3 Sketches」になっていること。
- [ ] 3つのSketchesの各iframeの上部に、それぞれのアプローチの観点（一文 or 2~3単語のタイトル）が明記されていること。
- [ ] スケッチが生成された後、左部分の入力・コンテキストパネル（Voice Transcript / AI Understanding）が「Peek Component」として隠れ、スケッチに集中できること。
- [ ] AI/API経由で取得したTranscriptが空録音や無音などで取得できず、空のまま構造化ボタンを押した場合、エラーまたは警告が表示されること。
- [ ] LLMの応答が不正なJSONだった場合でも、画面クラッシュせずエラー表示・ハンドリングができること。
- [ ] 結果として3つのiframeにそれぞれのSketchA, B, Cが正しくレンダリングされること（各々にTailwindが適用されていること）。
- [ ] iframe内で発生したJavaScriptエラーが、親要素のクラッシュを引き起こさずコンソール/UI上で捉えられること。
- [ ] 生成される3つのSketchは単なるベアボーンなHTMLではなく、シャドウ・グラデーション・角丸・モダンなタイポグラフィ・インラインSVGアイコンなどを活用し、Claude Artifactsで生成されるような「リッチなアプリ感（Premium/Modern App-like UI）」を持つこと。
- [ ] **[CrustData]** TranscriptにドメインURLを含む場合、`/api/enrich-company` が呼ばれ、サーバーログに企業情報が記録されること。
- [ ] **[CrustData]** CrustData APIキーが未設定、またはドメインが見つからない場合でも、Structure生成が正常に完了すること（クラッシュなし）。
- [ ] **[CrustData]** Enrichされた企業情報がStructure生成プロンプトに注入され、返されるideaSが一般的な場合と異なる文脈を持つこと（デモで目視確認）。
