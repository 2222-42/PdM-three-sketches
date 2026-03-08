# Product Specification (spec.md)

## 1. 概要 (Overview)
PdM 3 Sketches / Meeting to Prototypesは、オンラインミーティングでの抽象的な議論やゴールから、具体的な3パターンのUIスケッチ（Reactコンポーネント）をAIで即座に生成しプレビューするツールです。PdMの「要求定義から具体的なUIまでのギャップ」を埋めます。

## 2. ユーザーフロー (User Flow)
1. **音声からの自動文字起こし**: ミーティングの会話内容をAIや外部APIを用いてリアルタイム（またはバッチ）で自動的に文字起こし（Transcript）して取得します。人間による手動テキスト入力は行いません。
2. **要件構造化**: [Generate Structure]ボタン押下で、LLMが文字起こしされたTranscriptを解析し、JSON形式で課題・要件・制約・ワークフローを進捗に整理します。
3. **UIスケッチ生成**: [Generate Sketches]ボタン押下で、構造化された要件JSONをもとに、アプローチの異なる3つの独立したReactコンポーネントコード（Tailwind付き）を生成します。
4. **プレビューと確認**: 右側のパネルに3パターンのプレビュー（Simple / Data-heavy / Mobile）が即座に表示され、PdMが視覚的にUIの方向性を確認できます。

## 3. 機能仕様詳細 (Functional Specs)
### 3.1 入力セクション (Input Area)
- **Transcript Input (Auto)**:
  - 手動貼り付けではなく、ブラウザ標準のWeb Speech APIによる音声からのリアルタイム自動文字起こしテキストを表示・保持するエリア。

### 3.2 構造化モジュール (JSON Generator)
- **トリガー**: ボタンプッシュ
- **処理**: 音声から生成されたTranscriptテキストをLLM (OpenRouter経由)に入力。
- **出力形式**:
  ```json
  {
    "problems": ["..."],
    "requirements": ["..."],
    "constraints": ["..."],
    "workflow": "...",
    "progress": "..."
  }
  ```
- **エラーハンドリング**:
  - JSONパース失敗時、リトライまたは正規表現でのフォールバック抽出処理を行う。（NEEDS CLARIFICATIONの定義に基づく）

### 3.3 UI生成モジュール (Sketches Generator)
- **入力**: 構造化された要件JSON
- **生成バリエーション**:
  1. Sketch A (Simplest): 最低限の機能に絞ったクリーンなUI
  2. Sketch B (Data-heavy): グラフやテーブルを多用したデータ可視化特化UI
  3. Sketch C (Mobile): モバイルファーストのレスポンシブUI
- **制約事項**:
  - TailwindCSSのCDNスクリプトを内包
  - 単一ファイル内で完結したFunctional Component
  - 外部依存モジュールなし（アイコンなどもSVGインライン化を推奨）
  - ハードコードされたモックデータを保持

### 3.4 プレビューセクション (Preview Pane)
- 3つの生成結果を独立したiframe (srcdoc属性) でセキュアにレンダリングする。
- ローディング中はSpinnerを表示。
- エラーハンドリング: コード実行時、または生成失敗時にエラーメッセージを表示。

## 4. 非機能要件 (Non-Functional Specs)
- **レスポンスタイム**: LLM呼び出しからプレビュー完了まで10秒未満。並列APIコール（Blaxel）でレイテンシを抑える。
- **対応ブラウザ**: Chrome 最新版
- **セキュリティ**: iframeによるsandbox化（`allow-scripts` のみ付与など）。

## 5. ACCEPTANCE_CRITERIA (受入基準)
*本セクションはRule `spec-first-enforcement`に基づく*
- [ ] AI/API経由で取得したTranscriptが空録音や無音などで取得できず、空のまま構造化ボタンを押した場合、エラーまたは警告が表示されること。
- [ ] LLMの応答が不正なJSONだった場合でも、画面クラッシュせずエラー表示・ハンドリングができること。
- [ ] 結果として3つのiframeにそれぞれのSketchA, B, Cが正しくレンダリングされること（各々にTailwindが適用されていること）。
- [ ] iframe内で発生したJavaScriptエラーが、親要素のクラッシュを引き起こさずコンソール/UI上で捉えられること。
- [ ] 生成される3つのSketchは単なるベアボーンなHTMLではなく、シャドウ・グラデーション・角丸・モダンなタイポグラフィ・インラインSVGアイコンなどを活用し、Claude Artifactsで生成されるような「リッチなアプリ感（Premium/Modern App-like UI）」を持つこと。
