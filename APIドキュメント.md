# KobeAI API ドキュメント

## 目次

1. [認証関連 API](#認証関連-api)
    - [ログイン API](#ログイン-api)
    - [会員登録 API](#会員登録-api)
    - [ログアウト API](#ログアウト-api)
    - [トークン認証 API](#トークン認証-api)
2. [ユーザープロフィール関連 API](#ユーザープロフィール関連-api)
    - [プロフィール取得 API](#プロフィール取得-api)
    - [プロフィール更新 API](#プロフィール更新-api)
    - [好みのアーティスト設定 API](#好みのアーティスト設定-api)
3. [イベント関連 API](#イベント関連-api)
    - [予定イベント取得 API](#予定イベント取得-api)
    - [複数イベント費用計算 API](#複数イベント費用計算-api)
    - [費用データ保存 API](#費用データ保存-api)
    - [ユーザーイベント費用取得 API](#ユーザーイベント費用取得-api)
4. [貯金関連 API](#貯金関連-api)
    - [貯金履歴取得 API](#貯金履歴取得-api)
    - [貯金追加 API](#貯金追加-api)
5. [アーティスト関連 API](#アーティスト関連-api)
    - [アーティスト一覧取得 API](#アーティスト一覧取得-api)
    - [アーティスト詳細取得 API](#アーティスト詳細取得-api)

---

## 認証関連 API

### ログイン API

```typescript
login(username: string, password: string): Promise<{ token: string; user: User }>
```

**概要**: ユーザー名とパスワードでログインして認証トークンを取得します。

**パラメータ**:

-   `username`: ユーザー名
-   `password`: パスワード

**レスポンス**:

```typescript
{
  token: string;       // JWT認証トークン
  user: {
    userId: string;    // ユーザーID
    username: string;  // ユーザー名
    email: string;     // メールアドレス
    area: string;      // 活動地域
    content_interests: string[]; // 興味のあるコンテンツ
    preferences: any[]; // アーティスト好み設定
  }
}
```

**エラーハンドリング**:

-   ユーザー名/パスワードが無効: 「ユーザー名またはパスワードが無効です」
-   サーバーエラー: 「ログイン中にエラーが発生しました」

---

### 会員登録 API

```typescript
register(params: {
  username: string;
  email: string;
  password: string;
  area: string;
}): Promise<{ success: boolean; message: string }>
```

**概要**: 新しいユーザーアカウントを作成します。

**パラメータ**:

-   `username`: ユーザー名
-   `email`: メールアドレス
-   `password`: パスワード
-   `area`: 活動地域

**レスポンス**:

```typescript
{
    success: boolean; // 登録成功フラグ
    message: string; // 「登録が完了しました。ログインしてください。」
}
```

**エラーハンドリング**:

-   ユーザー名/メールが既に使用中: 「このユーザー名/メールアドレスは既に使用されています」
-   入力データが無効: 「入力データが無効です」
-   サーバーエラー: 「会員登録中にエラーが発生しました」

---

### ログアウト API

```typescript
logout(): Promise<void>
```

**概要**: 現在のセッションからログアウトします。

**レスポンス**: なし

---

### トークン認証 API

```typescript
verifyToken(token: string): Promise<User>
```

**概要**: JWT トークンの有効性を確認し、ユーザー情報を返します。

**パラメータ**:

-   `token`: JWT 認証トークン

**レスポンス**:

```typescript
{
  userId: string;       // ユーザーID
  username: string;     // ユーザー名
  email: string;        // メールアドレス
  area: string;         // 活動地域
  content_interests: string[]; // 興味のあるコンテンツ
  preferences: any[];   // アーティスト好み設定
}
```

**エラーハンドリング**:

-   トークンが無効/期限切れ: 「認証トークンが無効または期限切れです」
-   サーバーエラー: 「認証確認中にエラーが発生しました」

---

## ユーザープロフィール関連 API

### プロフィール取得 API

```typescript
getUserProfile(): Promise<User>
```

**概要**: 現在ログインしているユーザーのプロフィール情報を取得します。

**レスポンス**:

```typescript
{
  userId: string;       // ユーザーID
  username: string;     // ユーザー名
  email: string;        // メールアドレス
  area: string;         // 活動地域
  content_interests: string[]; // 興味のあるコンテンツ
  preferences: any[];   // アーティスト好み設定
  total_estimated_expenses: number; // 総予想費用
  current_savings: number; // 現在の貯金額
  monthly_savings_suggestion: number; // 月間貯金推奨額
}
```

**エラーハンドリング**:

-   認証トークンがない場合: 「認証トークンがありません」
-   サーバーエラー: 「プロフィール情報の取得に失敗しました」

---

### プロフィール更新 API

```typescript
updateUserProfile(profileData: Partial<User>): Promise<User>
```

**概要**: ユーザープロフィール情報を更新します。

**パラメータ**:

-   `profileData`: 更新するプロフィール情報

**レスポンス**:

```typescript
{
    success: boolean; // 更新成功フラグ
    message: string; // 「プロフィールが正常に更新されました」
    user: User; // 更新されたユーザー情報
}
```

**エラーハンドリング**:

-   認証トークンがない場合: 「認証トークンがありません」
-   入力データが無効: 「入力データが無効です」
-   サーバーエラー: 「プロフィール更新中にエラーが発生しました」

---

### 好みのアーティスト設定 API

```typescript
setArtistPreferences(preferences: Array<{
  artistId: string;
  interests: string[];
}>): Promise<{ success: boolean }>
```

**概要**: ユーザーの好みのアーティストとイベントタイプを設定します。

**パラメータ**:

-   `preferences`: アーティストとイベントタイプの設定

**レスポンス**:

```typescript
{
    success: boolean; // 設定成功フラグ
    message: string; // 「アーティスト設定が保存されました」
}
```

**エラーハンドリング**:

-   認証トークンがない場合: 「認証トークンがありません」
-   入力データが無効: 「入力データが無効です」
-   サーバーエラー: 「好み設定の保存中にエラーが発生しました」

---

## イベント関連 API

### 予定イベント取得 API

```typescript
getUpcomingEvents(): Promise<any>
```

**概要**: ユーザーの好みに基づいて予測される今後のイベント情報を取得します。

**レスポンス**:

```typescript
{
  user_area: string;
  predictions: [
    {
      artist: string;
      predicted_events: [
        {
          date: string;      // 形式: "YYYY-MM"
          event_type: string; // "live", "album", "meeting", "goods"のいずれか
          location: string;
        }
      ]
    }
  ]
}
```

**エラーハンドリング**:

-   認証トークンがない場合: 「認証トークンがありません。再度ログインしてください。」
-   認証期限切れの場合: 「認証の有効期限が切れました。再度ログインしてください。」
-   その他のエラー: 「イベント情報の取得に失敗しました。」

---

### 複数イベント費用計算 API

```typescript
getMultipleEventsCost(params: {
  artist: string;
  events: any[];
}): Promise<any>
```

**概要**: 指定したアーティストの複数イベントの費用を計算します。

**パラメータ**:

-   `artist`: アーティスト名
-   `events`: イベント情報の配列
    -   `event_type`: イベントタイプ
    -   `location`: 場所
    -   `date`: 日付

**レスポンス**:

```typescript
{
  user_id: string;
  artist: string;
  calculation_date: string;
  upcoming_events: [
    {
      event_id: string;
      event_type: string;
      location: string;
      date: string;
      estimated_cost: {
        transportation: number;
        ticket: number;
        hotel: number;
        other: number;
      };
      total_estimated: number;
      confidence: string; // "高", "中", "低"のいずれか
    }
  ];
  upcoming_goods: [
    {
      goods_id: string;
      name: string;
      release_date: string;
      estimated_price: number;
    }
  ];
  total_estimated: number;
  recommendation: string;
  monthly_savings_suggestion: number;
}
```

**エラーハンドリング**:

-   認証トークンがない場合: 「認証トークンがありません」
-   その他のエラー: 「費用計算に失敗しました」

---

### 費用データ保存 API

```typescript
saveCostData(costData: any): Promise<any>
```

**概要**: 計算された費用データをデータベースに保存します。

**パラメータ**:

-   `costData`: 費用計算 API から返された費用データ

**レスポンス**:

```typescript
{
    message: string; // "費用データが正常に保存されました"
    id: string; // 保存されたデータのID
}
```

**エラーハンドリング**:

-   認証トークンがない場合: 「認証トークンがありません」
-   その他のエラー: 「費用データの保存に失敗しました」

---

### ユーザーイベント費用取得 API

```typescript
getUserEventCosts(): Promise<UserCostsResponse>
```

**概要**: ユーザーの保存された費用データを取得します。

**レスポンス**:

```typescript
{
  costs: [
    {
      id: string;
      user_id: string;
      artist: string;
      calculation_date: string;
      upcoming_events: UpcomingEvent[];
      upcoming_goods: UpcomingGood[];
      total_estimated: number;
      recommendation: string;
      saved_at: string;
    }
  ];
  total_estimated: number;
  total_savings: number;
  count: number;
}
```

**エラーハンドリング**:

-   認証トークンがない場合: 「認証トークンがありません」
-   その他のエラー: 「費用データの取得に失敗しました」

---

## 貯金関連 API

### 貯金履歴取得 API

```typescript
getSavingsHistory(): Promise<{
  history: SavingsHistory[];
  total: number;
}>
```

**概要**: ユーザーの貯金履歴を取得します。

**レスポンス**:

```typescript
{
  history: [
    {
      id: string;
      amount: number;
      memo?: string;
      saved_at: string;
    }
  ];
  total: number;
  current_savings: number;
  count: number;
}
```

**エラーハンドリング**:

-   認証トークンがない場合: 「認証トークンがありません」
-   その他のエラー: 「貯金履歴の取得に失敗しました」

---

### 貯金追加 API

```typescript
addSavings(
  amount: number,
  memo?: string
): Promise<{ success: boolean; message: string }>
```

**概要**: 新しい貯金額を追加します。

**パラメータ**:

-   `amount`: 貯金額（円）
-   `memo`: メモ（オプション）

**レスポンス**:

```typescript
{
    message: string; // "貯金が正常に追加されました"
    current_savings: number; // 現在の貯金総額
    added_amount: number; // 追加された金額
}
```

**エラーハンドリング**:

-   認証トークンがない場合: 「認証トークンがありません」
-   金額が無効な場合: 「金額は 1 円以上で入力してください」
-   その他のエラー: 「貯金の追加に失敗しました」

---

## アーティスト関連 API

### アーティスト一覧取得 API

```typescript
getArtists(): Promise<Artist[]>
```

**概要**: システムに登録されているすべてのアーティスト情報を取得します。

**レスポンス**:

```typescript
[
  {
    id: string;          // アーティストID
    name: string;        // アーティスト名
    image: string;       // プロフィール画像URL
    description?: string; // アーティスト説明
    genres?: string[];    // 音楽ジャンル
  }
]
```

**エラーハンドリング**:

-   サーバーエラー: 「アーティスト情報の取得に失敗しました」

---

### アーティスト詳細取得 API

```typescript
getArtistDetail(artistId: string): Promise<ArtistDetail>
```

**概要**: 特定のアーティストの詳細情報を取得します。

**パラメータ**:

-   `artistId`: アーティスト ID

**レスポンス**:

```typescript
{
  id: string;              // アーティストID
  name: string;            // アーティスト名
  image: string;           // プロフィール画像URL
  description: string;     // アーティスト詳細説明
  genres: string[];        // 音楽ジャンル
  members?: {              // グループの場合、メンバー情報
    name: string;
    position: string;
    image?: string;
  }[];
  agency: string;          // 所属事務所
  debut_date: string;      // デビュー日
  fan_club_name?: string;  // ファンクラブ名
}
```

**エラーハンドリング**:

-   アーティストが見つからない: 「指定されたアーティストが見つかりません」
-   サーバーエラー: 「アーティスト詳細の取得に失敗しました」

---

## バックエンドエンドポイント一覧

フロントエンド API が接続するバックエンドのエンドポイントは以下の通りです：

### 認証関連

1. **POST /api/auth/login**: ログイン
2. **POST /api/auth/register**: 会員登録
3. **POST /api/auth/verify-token**: トークン検証

### ユーザー関連

4. **GET /api/users/profile**: ユーザープロフィール取得
5. **PUT /api/users/profile**: プロフィール更新
6. **POST /api/fan-preferences/set**: アーティスト好み設定

### イベント関連

7. **GET /api/events/upcoming**: 予定イベント情報を取得
8. **POST /api/events/multiple-costs**: 複数イベントの費用計算
9. **POST /api/events/save-cost**: 費用データをデータベースに保存
10. **GET /api/events/user-costs**: ユーザーの費用データを取得

### 貯金関連

11. **GET /api/savings/history**: ユーザーの貯金履歴を取得
12. **POST /api/savings/add**: 新しい貯金を追加

### アーティスト関連

13. **GET /api/artists**: アーティスト一覧取得
14. **GET /api/artists/{id}**: アーティスト詳細取得

すべての API リクエストには認証トークンが必要です（公開エンドポイントを除く）。トークンはリクエストヘッダーの `Authorization: Bearer {token}` で送信されます。
