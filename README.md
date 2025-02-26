# CatMos

CatMos は、ユーザーが投稿（Meow）を作成し、ファイルを添付し、フォルダを管理するためのアプリケーションです。

## クイックセットアップ

### 環境設定

1. `.env.example` ファイルを `.env` にコピーし、必要な環境変数を設定します。

### インストール

依存関係をインストールします。

```sh
pnpm install
```

### データベースの設定

Prisma を使用してデータベースを設定します。

```
pnpm prisma migrate dev
```

### 開発サーバーの起動

開発サーバーを起動します。

```bash
pnpm dev
```

アプリケーションは http://localhost:5173 で利用可能です。

### テストの実行

テストを実行します。

```bash
pnpm test
```

### ビルド

プロダクションビルドを作成します。

```bash
pnpm build
```

### Docker デプロイ

Docker を使用してアプリケーションをビルドおよび実行します。

```bash
docker build -t catmos .
docker run -p 3000:3000 catmos
```

このコンテナ化されたアプリケーションは、Docker をサポートする任意のプラットフォームにデプロイできます。

Built with ❤️ using React Router. 
