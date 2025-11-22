# Repository Guidelines

## プロジェクトの目的
- このリポジトリは日本語で入力された文章を別の人格で別の言語に翻訳するプロセスを繰り返し、最終的に意味不明かつ支離滅裂な回答を生成するエンターテイメント目的のチャットアプリケーションです。
- 言語では英語/ドイツ語/中国語/ハングル文字に加え、ヒエログリフ/ギャル文字/甲骨文字などもサポートしています。
- 人格はイーロン・マスク/ドナルド・トランプ/ヒトラー/織田信長など多彩に用意しています。

## プロジェクト構成とモジュール整理
- `app/`: Next.js App Router のエントリ (`layout.tsx`, `page.tsx`)、API ハンドラーは `app/api/`。
- `components/`: チャット UI 一式（`chat-page`、`chat-container`、`conversation-sidebar`、`message-bubble`、`chat-input`）。共通コンポーネントは `components/ui/` に配置。
- `src/mastra/`: エージェント、ワークフロー、`index.ts` の配線（`translateWorkflow` とサンプル `testWorkflow`）。
- `types/` はチャット系型、`lib/utils.ts` はヘルパー、`public/` は静的アセット。

## ビルド・テスト・開発コマンド
- `npm run dev`: 開発サーバーを `http://localhost:3000` で起動。
- `npm run build`: 本番ビルド。リリース前の型・ルート崩れチェックに必須。
- `npm start`: ビルド済みアプリをローカル／本番で起動。
- `npm run lint`: Next/TypeScript の ESLint を実行（`.next` と `.mastra` は除外）。
- `npm run mastra:dev`: エージェントやワークフローをホットリロードで検証。

## コーディングスタイルと命名規約
- TypeScript + React 関数コンポーネント。`const` とアロー関数を優先し、既存コード同様にセミコロンは省略。
- インポートはダブルクオート。コンポーネントファイルはケバブケース（例: `chat-page.tsx`）、型は単数形（`types/chat.ts`）。
- スタイルは Tailwind。`components/ui` のプリミティブを再利用し、クラスはレイアウト系→状態系の順で読みやすく。
- エージェント／ワークフローの ID は説明的に。共有ヘルパーはコンポーネントではなく `lib/utils.ts` へ。

## テスト指針
- 専用のユニットテストランナーは未導入。`npm run lint` を基準にし、重要フローは手動確認。
- `npm run mastra:dev` でワークフローを叩くか、`translateWorkflow` にサンプル入力を渡して `zod` スキーマと出力を確認。
- UI は `npm run dev` で多言語プロンプト、ローディング、メッセージ順序を目視チェック。

## コミットと Pull Request ガイド
- 履歴は短い日本語サマリが多め（例: `翻訳調整`, `通信成功?`）。スコープを絞った短文か簡潔な英語の命令形で。課題は `#<id>` で紐付け。
- PR には概要、テスト結果、UI 変更のスクリーンショット/GIF、新しい環境変数や移行手順を含める。
- レビュー前に lint/build を通す。Mastra の認証や設定変更が必要なら明記。

## AI エージェントと設定
- Bedrock (Claude) と xAI がバックエンド。`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`XAI_API_KEY` などはローカルで設定し、Git には含めない。
- 観測はインメモリ `LibSQLStore` を使用。トレースやスコアを永続化したい場合はストレージ URL を更新。

## その他
- 回答は全て日本語で作成してください
- .envの内容は絶対に参照しないでください
