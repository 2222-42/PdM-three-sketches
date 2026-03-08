# Technical Design (design.md)

## 1. アーキテクチャ概要 (Architecture Overview)
本システムはNext.js (App Router)上に構築されるクライアント・サーバーアーキテクチャのWebアプリケーションです。LLM呼び出しなどはバックエンド/サーバーアクションを通じて外部API（Groq/Gemini/Shisa AI等）にリクエストをプロキシして解決します。

## 2. システム構成要素 (System Components)

### 2.1 フロントエンド (Frontend - Next.js)
- **UIフレームワーク**: React 18 / Next.js 14+ (App Router)
- **スタイリング**: TailwindCSS
- **主要なコンポーネント**:
  - `TranscriptionArea`: Web Speech API経由で取得した音声文字起こし結果（Transcript）を表示するコンポーネント。
  - `JSONPreview`: 生成された構造化済要件（JSON）を視覚的に表示・確認するエリア。
  - `SketchesGrid`: 3つのプレビューを展開するレイアウトコンポーネント。
  - `SandboxedIframe`: Sketchコードを安全にマウントしてレンダリングするコンポーネント(`srcdoc`利用)。

### 2.2 バックエンド・外部API (Backend & Ext-API)
- **Next.js API Routes / Server Actions**: クライアントからのリクエスト（Transcript）を受け取り、LLMにプロンプトを構築して投げる。
- **LLMプロバイダ**: Groq (Llama 3) / Gemini (Flash) / Shisa AI 等
- **主要エンドポイント**: `app/api/generate-structure`, `app/api/generate-sketches`

## 3. データフローとステート管理 (Data Flow & State)
- **状態管理**: 基本はReact標準の `useState` と `useTransition` / `useAsync`（React Query等も検討可、ただしMVPはシンプルに）。
- **Global / Page State**: 
  - `transcript` (string)
  - `structuredData` (JSON Object)
  - `sketches` ({ A: string, B: string, C: string })
  - `isGeneratingStructure` (boolean)
  - `isGeneratingSketches` (boolean)

## 4. API定義 (API Specs)

### 4.1 `POST /api/generate-structure`
- **Request**:
  ```json
  {
    "transcript": "先日のMTGの話ですが..."
  }
  ```
- **Response** (Success):
  ```json
  {
    "problems": [...],
    "requirements": [...],
    "constraints": [...],
    "workflow": "...",
    "progress": "..."
  }
  ```

### 4.2 `POST /api/generate-sketches`
- **Request**:
  ```json
  {
    "structuredData": { ... }
  }
  ```
- **Response** (Success):
  ```json
  {
    "sketchA": "<script src=\"https://cdn.tailwindcss.com\"></script>\n<div className=\"...\">...",
    "sketchB": "...",
    "sketchC": "..."
  }
  ```
- **並列処理**:
  生成速度要件（10秒以内）を満たすため、サーバサイドまたはクライアントからの呼び出し時に、A/B/C 3パターンの生成プロンプトを別々に構築し、`Promise.all`等を用いて完全並列でリクエスト・解決する。

## 5. エラーリカバリ設計 (Error Recovery Strategy)
- **JSON Parse Error**: LLMがJSONプレーンテキストではなくMarkdown(コードブロック)を含めて回答した場合、それをサーバサイドの正規表現等で `\{.*\}` 部分だけ抽出し、フォールバックとして `JSON.parse` する。破綻した場合はエラーを返す。
- **UI Rendering Error**: APIから返ってきたReactコードスニペットの構文エラーや実行時エラーについて、`SandboxedIframe` コンポーネントおよびエラーバウンダリを利用し、他のSketchのプレビューやアプリ全体をクラッシュさせないように隔離保護する。
