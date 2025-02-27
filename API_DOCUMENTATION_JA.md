# K-Pop ファンメンバーシップシステム API ドキュメント

このドキュメントでは、K-Pop ファンメンバーシップシステムの API エンドポイントとその使用方法について説明します。

## ベース URL

すべての API リクエストは以下のベース URL に対して行われます：

```
http://localhost:8000
```

## 認証

ほとんどのエンドポイントでは、認証が必要です。認証には JWT トークンを使用します。

### 認証ヘッダー

認証が必要なリクエストでは、以下の形式で Authorization ヘッダーを含める必要があります：

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## エンドポイント

### 認証関連

#### ユーザー登録

```
POST /api/auth/register
```

新しいユーザーを登録します。

**リクエスト本文**:

```json
{
    "username": "string",
    "email": "user@example.com",
    "password": "string"
}
```

**レスポンス**:

```json
{
    "userId": "string",
    "username": "string",
    "email": "user@example.com",
    "access_token": "string",
    "token_type": "bearer"
}
```

#### ログイン

```
POST /api/auth/login
```

ユーザーをログインさせ、アクセストークンを取得します。

**リクエスト本文**:

```json
{
    "email": "user@example.com",
    "password": "string"
}
```

**レスポンス**:

```json
{
    "access_token": "string",
    "token_type": "bearer",
    "user": {
        "userId": "string",
        "username": "string",
        "email": "user@example.com",
        "createdAt": "datetime",
        "updatedAt": "datetime",
        "preferences": []
    }
}
```

#### 追加情報の登録

```
POST /api/auth/register/info
```

ユーザー登録後、追加情報を更新します。認証が必要です。

**リクエスト本文**:

```json
{
    "area": "string",
    "content_interests": ["アルバム", "グッズ", "ファンミーティング"],
    "preferred_artists": ["blackpink", "bts", "twice"]
}
```

**レスポンス**:

```json
{
    "userId": "string",
    "username": "string",
    "email": "user@example.com",
    "preferences": [
        {
            "artistId": "string",
            "interests": ["string"]
        }
    ],
    "createdAt": "datetime",
    "updatedAt": "datetime"
}
```

#### 現在のユーザー情報取得

```
GET /api/auth/me
```

現在ログインしているユーザーの情報を取得します。認証が必要です。

**レスポンス**:

```json
{
    "userId": "string",
    "username": "string",
    "email": "user@example.com",
    "preferences": [],
    "createdAt": "datetime",
    "updatedAt": "datetime"
}
```

### ユーザープロフィール

#### プロフィール情報取得

```
GET /api/users/profile
```

ログインユーザーのプロフィール情報（基本情報、地域、関心事）を取得します。認証が必要です。

**レスポンス**:

```json
{
    "user": {
        "userId": "string",
        "username": "string",
        "email": "user@example.com",
        "preferences": [
            {
                "artistId": "string",
                "interests": ["string"]
            }
        ],
        "createdAt": "datetime",
        "updatedAt": "datetime"
    },
    "area": "string",
    "content_interests": ["string"]
}
```

### アーティスト関連

#### アーティスト一覧取得

```
GET /api/artists
```

全アーティストのリストを取得します。

**レスポンス**:

```json
[
    {
        "artistId": "string",
        "name": "string",
        "description": "string",
        "imageUrl": "string",
        "fanCount": 0
    }
]
```

#### アーティスト詳細取得

```
GET /api/artists/{artist_id}
```

特定のアーティストの詳細情報を取得します。

**レスポンス**:

```json
{
    "artistId": "string",
    "name": "string",
    "description": "string",
    "imageUrl": "string",
    "fanCount": 0,
    "events": []
}
```

### ファン関連

#### ファン設定の更新

```
POST /api/fan-preferences
```

ユーザーのアーティスト関連の設定を更新します。認証が必要です。

**リクエスト本文**:

```json
{
    "artistId": "string",
    "interests": ["live", "album", "goods"]
}
```

**レスポンス**:

```json
{
    "userId": "string",
    "artistId": "string",
    "interests": ["string"],
    "createdAt": "datetime"
}
```

## エラーレスポンス

API がエラーを返す場合、以下の形式になります：

```json
{
    "detail": "エラーメッセージ"
}
```

一般的な HTTP ステータスコード：

-   200: リクエスト成功
-   400: 不正なリクエスト
-   401: 認証エラー
-   404: リソースが見つからない
-   500: サーバー内部エラー

## モック API モード

開発時には `NEXT_PUBLIC_USE_MOCK_API=true` 環境変数を設定することで、バックエンドデータベースに接続せずにモックデータを使用できます。これにより、Cosmos DB が利用できない環境でもアプリケーションのテストが可能になります。

## トラブルシューティング

API リクエストが失敗する場合：

1. 認証が必要なエンドポイントでは、有効なトークンが提供されているか確認してください
2. リクエストのフォーマットが正しいか確認してください
3. バックエンドサーバーが実行中か確認してください
4. CORS 設定が正しいか確認してください

詳細なトラブルシューティングについては、`TROUBLESHOOTING.md`ファイルを参照してください。
