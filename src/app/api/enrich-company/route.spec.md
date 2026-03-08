# Spec: /api/enrich-company

## ACCEPTANCE_CRITERIA

- [ ] **正常系**: `?domain=retool.com` のようにドメインを指定してGETするとCrustData Company Enrich APIを呼び出し、`{ enriched: true, name, headcount, funding_stage, industry, growth_rate }` を返す。
- [ ] **フォールバック（404/会社不明）**: CrustDataがcompanyを返さなかった（空配列または404）場合、`{ enriched: false }` を返す。アプリはクラッシュしない。
- [ ] **フォールバック（ネットワークエラー/タイムアウト）**: CrustData APIへの接続が失敗した場合も `{ enriched: false }` を返す。アプリはクラッシュしない。
- [ ] **APIキー未設定**: `CRUSTDATA_API_KEY` が設定されていない場合、`{ enriched: false }` を返す（500エラーではない）。
- [ ] **ドメイン未指定**: クエリパラメータ `domain` がない場合、400エラーを返す。
- [ ] **レスポンス形式**: `enriched: true` のとき、少なくとも `name`, `headcount` のいずれかが含まれること（CrustDataが返すフィールドに依存）。

## テスト方法（手動）

1. `.env.local` に `CRUSTDATA_API_KEY=<your_key>` を設定
2. `curl "http://localhost:3000/api/enrich-company?domain=retool.com"` を実行
3. `{ enriched: true, ... }` が返ることを確認
4. 存在しないドメイン: `curl "http://localhost:3000/api/enrich-company?domain=nonexistent-xyz-abc.com"` → `{ enriched: false }`
5. `CRUSTDATA_API_KEY` をコメントアウトした状態 → `{ enriched: false }` (クラッシュなし)
