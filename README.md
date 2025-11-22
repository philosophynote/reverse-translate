# Reverse Translate

## プロジェクト概要

Next.js + Mastra を利用し、マルチステップ翻訳や異世界風テキスト生成を行うチャットアプリです。現在は以下 2 種類のワークフローを提供しています。

- `translate-workflow`: 日本語→アラビア文字→ヒエログリフ（絵文字）→英語回答→ハングル→日本語という狂気の多段翻訳を実行します。
- `chuuni-workflow`: 普通の日本語文を、宇宙規模の陰謀が渦巻く厨二病テキストへと増幅します。

## 開発サーバーの起動

```bash
npm install
npm run dev
```

`http://localhost:3000` を開くと UI を確認できます。`.env` に各種 API キーを設定してください。

## API エンドポイント

| メソッド | パス | 入力 | 出力 |
| --- | --- | --- | --- |
| POST | `/api/workflow/execute` | `{ "message": "..." }` | `{ "finalJapaneseAnswer": "..." }` |
| POST | `/api/workflow/chuuni` | `{ "message": "..." }` | `{ "chuuniText": "..." }` |

どちらのエンドポイントも JSON を返し、`success` フラグとエラー詳細を含みます。

## スクリプト

- `npm run dev`: Next.js 開発サーバー起動
- `npm run build`: 本番ビルド
- `npm run start`: 本番サーバー起動
- `npm run lint`: ESLint + TypeScript チェック

## Mastra ワークフローの開発

`npm run mastra:dev` を使うと、ワークフローとエージェントをホットリロードで検証できます。`src/mastra/agents` にエージェント、`src/mastra/workflows` にワークフローを追加してください。
