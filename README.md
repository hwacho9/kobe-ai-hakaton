# コベ AI ハッカソン プロジェクト

ファンイベント予測アプリケーション - ファンの好みを分析して最適なイベントを提案するサービスです。

## システム構成

-   **フロントエンド**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
-   **バックエンド**: FastAPI, Python, Azure Cosmos DB

## はじめに

### 前提条件

-   Docker と Docker Compose がインストールされていること
-   Git がインストールされていること

### プロジェクトのクローン

```bash
git clone <repository-url>
cd kobe-ai-hakaton
```

### 環境変数の設定

ルートディレクトリに `.env` ファイルを作成し、以下の環境変数を設定します：

```
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_API_VERSION=2023-05-15
AZURE_COSMOS_DB_ENDPOINT=your_cosmos_db_endpoint
AZURE_COSMOS_DB_KEY=your_cosmos_db_key
AZURE_COSMOS_DB_DATABASE=fan_events
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 開発環境の実行

開発環境では、ソースコードの変更がリアルタイムで反映されます：

```bash
docker-compose up -d
```

### 本番環境の実行

本番環境では、最適化されたビルドが使用されます：

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### コンテナの停止

```bash
docker-compose down
```

### コンテナの再ビルド

コードを変更した後、コンテナを再ビルドするには：

```bash
docker-compose up -d --build
```

## 開発コマンド

### ログの確認

バックエンドのログ：

```bash
docker logs fan-event-prediction-api
```

フロントエンドのログ：

```bash
docker logs fan-event-prediction-ui
```

### コンテナへのアクセス

バックエンドコンテナにアクセス：

```bash
docker exec -it fan-event-prediction-api /bin/bash
```

フロントエンドコンテナにアクセス：

```bash
docker exec -it fan-event-prediction-ui /bin/sh
```

### 単一サービスの再起動

バックエンドのみ再起動：

```bash
docker-compose restart backend
```

フロントエンドのみ再起動：

```bash
docker-compose restart frontend
```

## ディレクトリ構造

```
kobe-ai-hakaton/
├── backend/
│   ├── app/
│   │   ├── db/             # データベース関連コード
│   │   ├── models/         # データモデル
│   │   ├── routers/        # APIルーター
│   │   ├── services/       # ビジネスロジック
│   │   └── utils/          # ユーティリティ関数
│   ├── Dockerfile          # バックエンド Docker 設定
│   └── requirements.txt    # Python 依存関係
├── frontend/
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── styles/         # スタイルシート
│   │   └── utils/          # ユーティリティ関数
│   ├── Dockerfile          # フロントエンド本番用 Docker 設定
│   ├── Dockerfile.dev      # フロントエンド開発用 Docker 設定
│   └── package.json        # Node.js 依存関係
├── docker-compose.yml      # 開発用 Docker Compose 設定
└── docker-compose.prod.yml # 本番用 Docker Compose 設定
```

## API エンドポイント

### 認証

-   `POST /api/auth/register` - ユーザー登録
-   `POST /api/auth/login` - ログイン

### ファンの好み

-   `GET /api/fan-preferences/` - ファンの好み一覧取得
-   `POST /api/fan-preferences/` - ファンの好み追加
-   `PUT /api/fan-preferences/{preference_id}` - ファンの好み更新
-   `DELETE /api/fan-preferences/{preference_id}` - ファンの好み削除

### イベント

-   `GET /api/events/` - イベント一覧取得
-   `GET /api/events/predict` - ユーザーに適したイベント予測

## トラブルシューティング

### Cosmos DB 接続の問題

Cosmos DB 接続に問題がある場合、バックエンドは自動的にモック DB に切り替わります。実際の Cosmos DB を使用するには、環境変数に正しいエンドポイントとキーを設定する必要があります。

### TypeScript エラー

開発中に TypeScript エラーが発生した場合、次のコマンドを実行して型定義を更新します：

```bash
docker exec -it fan-event-prediction-ui npm install -D @types/react @types/react-dom @types/node
```

### ビルドエラー

ビルドエラーが発生した場合、コンテナログを確認して問題を特定します：

```bash
docker logs fan-event-prediction-ui
```

コンテナを完全に再ビルドする必要がある場合：

```bash
docker-compose down
docker-compose up -d --build
```
