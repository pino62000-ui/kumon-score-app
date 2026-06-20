# 要件定義書：公文スコア推移アプリ

## 1. 概要

| 項目 | 内容 |
|------|------|
| タイトル | 公文スコア推移 |
| 目的 | 子ども（2名）の公文宿題のモチベーション向上、スコア推移の可視化 |
| 対象ユーザー | 子ども2名・保護者 |
| 作成日 | 2026-06-18 |

---

## 2. 背景・目的

子ども2名が公文式の宿題に取り組んでいるが、継続的なモチベーション維持が課題。  
宿題の記録をスコアとして可視化・ゲーム化することで、自発的な学習意欲を高める。  
※教室での学習は対象外。宿題（自宅学習）のみを記録する。  
※〇付けは教室で行うため、正答率・正答数は記録しない。

---

## 3. 公文式の前提知識（公式情報に基づく）

### 3.1 教材レベル

| レベル | 対象目安 |
|--------|----------|
| 6A〜2A | 就学前〜小学低学年相当 |
| A〜F   | 小学1〜6年相当 |
| G〜I   | 中学1〜3年相当 |
| J以上  | 高校・大学相当 |

### 3.2 宿題の基本ルール

- **標準枚数**：1回あたり 10枚が目安（体調・状況により減ることがある）
- **目標完成時間の目安**：1枚あたり **1分以内**（10枚なら10分）
- **採点**：〇付けは教室で実施するため、宿題時点では記録しない

---

## 4. 機能要件

### 4.1 プロフィール管理

iPad1台で2名分の記録を管理する。記録・スコア・バッジはプロフィールごとに独立する。

| ID | 要件 |
|----|------|
| PR-01 | プロフィールを2名分登録できる（名前・アイコンなど） |
| PR-02 | ホーム画面でプロフィールを切り替えて使用できる |
| PR-03 | 記録・スコア・バッジはプロフィールごとに独立して管理される |

### 4.2 設定（保護者向け）

教材レベルは保護者が教科ごとに事前設定する。記録時に毎回選択する必要はない。

| ID | 要件 |
|----|------|
| ST-01 | 保護者がプロフィール・教科ごとに現在の教材レベルを設定できる |
| ST-02 | 宿題記録時は、設定済みのレベルを自動的に適用する |
| ST-03 | レベル変更時は変更日を記録し、推移グラフで変化点を表示できる |
| ST-04 | 保護者が任意のタイミングで「月リセット」を実行できる（全員の月間ポイントを0にし、キャラ画像を差し替える）。自動リセットはしない |

### 4.3 宿題記録入力

| ID | 要件 |
|----|------|
| FR-01 | 学習日を記録できる |
| FR-02 | 教科（算数・国語・英語）を選択できる（レベルは自動適用） |
| FR-03 | **実施枚数**（1〜10枚）を入力できる |
| FR-04 | **合計完了時間**（分・秒）を入力できる |
| FR-05 | 一言コメント（任意）を入力できる |
| FR-06 | **ストップウォッチ**で時間を計測し、合計時間へ自動入力できる（手入力も可） |

### 4.4 スコア計算（がんばりポイント加点方式）

**枚数と合計時間を入力し、1回ごとに「がんばりポイント」を加点する。減点はしない。**  
速さは「そのレベルでの自己ベスト（1枚あたり秒）」と比較して評価する。

```
1枚あたり時間(秒) = 合計時間(秒) ÷ 実施枚数

① 基礎ポイント   = 実施枚数 × 10            ※やった分だけ必ずもらえる

② スピードボーナス（自己ベスト秒/枚と比較）
     そのレベル初回   → +30  （はじめてボーナス）
     自己ベスト更新   → +50  （こえた！）
     ベスト×1.1以内   → +20  （好調）
     それ以外         → +0

③ フルセットボーナス = 10枚やり切ったら +30、それ以外 0

獲得ポイント   = ① + ② + ③
月間ポイント  += 獲得ポイント               ※任意リセット（保護者）・キャラ育成（FR-10）に使用
```

※ 各定数（10 / 30 / 50 / 20 / 1.1倍）は後から調整可能とする。  
※ 自己ベスト（bestSecondsPerSheet）は「プロフィール×教科×レベル」ごとに保持し、レベルが上がると新たに記録される（進級が不利にならない）。

| ポイント要素 | 内容 | 値 |
|--------------|------|-----|
| 基礎ポイント | 実施枚数 × 10 | 1枚 = 10pt |
| スピードボーナス | 自己ベスト比で +0〜+50 | 最大 50pt |
| フルセットボーナス | 10枚やり切りで加点 | 30pt |

**計算例：**

| ケース | 計算 | 獲得pt |
|--------|------|--------|
| B初回・10枚・70秒/枚 | 100＋初回30＋フル30 | 160 |
| B・10枚・65秒/枚（更新） | 100＋更新50＋フル30 | 180 |
| B・10枚・70秒/枚（好調） | 100＋好調20＋フル30 | 150 |
| B・10枚・80秒/枚（不調） | 100＋0＋フル30 | 130 |
| B・5枚・60秒/枚（更新） | 50＋更新50＋0 | 100 |
| C進級初回・10枚・90秒/枚 | 100＋初回30＋フル30 | 160 |

### 4.5 ゲーム化・バッジ

| ID | 要件 |
|----|------|
| FR-07 | 1回ごとの獲得ポイントを自動計算して表示する |
| FR-08 | 今週の達成状況（週4日目標）と連続達成週数を表示する |
| FR-09 | 達成内容に応じたバッジ・称号を付与する |
| FR-10 | 2人の月間ポイントの**合算**で共有キャラが育つ（リセットは保護者が任意に実行＝ST-04／画像も差し替え） |
| FR-10b | 共有キャラには2人それぞれの貢献（各自の今月ポイント）を表示し、「ふたりで育てている」ことが分かるようにする |
| FR-10c | 記録時に達成演出（カウントアップ／ベスト更新／Lvアップ／バッジ）を表示する。効果音はON/OFF切替できる |

**バッジ一覧（案）：**

| バッジ名 | 条件 |
|----------|------|
| パーフェクト | 10枚やり切り ＋ 自己ベスト更新を同時達成 |
| スピードスター | そのレベルの自己ベストを更新 |
| フルセット | 10枚やり切り |
| 今週達成 | 今週、週4日の目標を達成 |
| 4週れんぞく | 4週連続で週の目標を達成 |
| レベルアップ | 新しい教材レベルに初めて記録 |

### 4.6 スコア推移の可視化

| ID | 要件 |
|----|------|
| FR-11 | **獲得ポイント**の推移（棒）と**累計（全期間）獲得ポイント**の推移（面）を表示する |
| FR-12 | **1枚あたりの時間（秒）**の推移グラフを表示する（自己ベスト更新点を強調） |
| FR-13 | **実施枚数**の推移グラフ（棒グラフ）を表示する |
| FR-14 | 獲得ポイントの内訳（基礎／スピード／フルセット）を積み上げで見られるグラフを表示する |
| FR-15 | 教科別・レベル別に絞り込み表示できる（教科をまたいだ集計はしない。※人の合算＝共有キャラは別途行う） |
| FR-16 | 週次・月次サマリー（平均獲得ポイント・最高獲得ポイント・平均枚数）を表示する |

### 4.7 バックアップ（データ保護）

localStorage はブラウザのキャッシュ削除等で消える可能性があるため、手動バックアップ手段を設ける。

| ID | 要件 |
|----|------|
| FR-17 | 全データをJSONファイルに書き出せる（エクスポート） |
| FR-18 | バックアップJSONを読み込んで復元できる（インポート／確認の上で上書き） |
| FR-19 | バックアップ機能は設定画面（保護者）に配置する |

---

## 5. 非機能要件

| ID | 要件 |
|----|------|
| NFR-01 | iPadで操作しやすいUI |
| NFR-02 | データはiPad端末内に保存する（localStorage） |
| NFR-03 | 子どもが視覚的に楽しめるデザイン（カラフル・イラスト） |
| NFR-04 | 入力は1〜2分以内で完了できるシンプルな操作性 |
| NFR-05 | 会社のプラットフォーム・環境（Azure等）は使用しない |
| NFR-06 | 無料で利用できる個人向けサービスのみ使用する |
| NFR-07 | データ消失に備え、JSONバックアップ（書き出し／読み込み）を提供する |

---

## 6. 画面構成（案）

1. **プロフィール選択画面**：起動時に使用するプロフィールを選ぶ
2. **ホーム画面**：今日の獲得ポイント・週の達成・直近バッジ・共有キャラ
3. **記録入力画面**：日付・教科・枚数・合計時間の入力（ストップウォッチ内蔵／レベルは自動適用）
4. **グラフ画面**：獲得ポイント／累計ポイント／1枚あたり時間／枚数 の推移（切替可能）
5. **バッジ一覧画面**：獲得済み・未獲得バッジの一覧
6. **サマリー画面**：週次・月次の統計
7. **設定画面（保護者）**：プロフィール管理・教材レベル設定・記録の修正/削除・データのバックアップ・月リセット

---

## 7. プラットフォーム・技術構成

### 選定方針

- 家庭内のみで使用する個人アプリ（iPad1台）
- 会社のプラットフォーム（Azure等）は使用しない
- 無料・個人利用可能なサービスのみ採用する

### 推奨構成

| 役割 | 決定内容 | 理由 |
|------|----------|------|
| フロントエンド | PWA（HTML/CSS/JavaScript） | iPadのSafariでネイティブに動作・インストール不要 |
| ホスティング | GitHub Pages または Netlify | 無料・個人利用可 |
| データ保存 | ブラウザ localStorage | iPad1台のみ・サーバー不要・完全無料 |

### 各サービスの無料枠メモ

- **GitHub Pages**：静的サイト無料公開（パブリックリポジトリ）
- **Netlify**：月100GB転送・無料枠あり

### グラフ描画

- **Chart.js** を使用。CDN参照ではなく**ローカル同梱**し、Service Worker でキャッシュしてオフラインでも動作させる。

### キャラクター画像（月次差し替え）

- 月間ポイントで育つキャラは固定ファイル名 `img/char_1〜5.png`。**保護者が「月リセット」する際にこの5枚を上書き**してテーマを刷新する（コード変更不要）。
- 上書き後も確実に反映させるため、参照URLに `monthKey` を付ける（例 `char_3.png?m=2026-07`）。リセットで monthKey が変わると新しい画像を取得する。
- 画像はライセンスフリー素材または自作とする。

---

## 8. 外部設計：画面設計

iPad横向き（ランドスケープ）を基本とする。左サイドバーにナビゲーションを固定配置する。

### 画面一覧と遷移

```
起動
 └─ ① プロフィール選択
       └─ ② ホーム ───────────────────── ⑦ 設定（保護者）
              ├─ ③ 記録入力
              ├─ ④ グラフ
              ├─ ⑤ バッジ一覧
              └─ ⑥ サマリー
```

### 共通レイアウト（②〜⑦）

```
┌────────┬──────────────────────────────────────────────┐
│  🏠    │                                              │
│ホーム  │                                              │
│  📊    │  コンテンツエリア                            │
│グラフ  │                                              │
│  🏅    │                                              │
│バッジ  │                                              │
│  📋    │                                              │
│まとめ  │                                              │
│  ⚙️    │                                              │
│せってい│                                              │
└────────┴──────────────────────────────────────────────┘
```

---

### ① プロフィール選択画面

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    公文スコア推移                        │
│                                                          │
│                    だれがやる？                          │
│                                                          │
│        ┌───────────────────┐  ┌───────────────────┐     │
│        │        🐰         │  │        🐻         │     │
│        │        はな       │  │        そら       │     │
│        └───────────────────┘  └───────────────────┘     │
│                                                          │
│      みんなで育てる：とり Lv3  [🐤]  家族 4200pt         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### ② ホーム画面

```
┌────────┬────────────────────────┬───────────────────────┐
│  🏠    │  🐰 はな                │  さいきんのバッジ      │
│ホーム  │  きょうの獲得 180pt     │                       │
│  📊    │  あなたの今月 2400pt    │  🏅 パーフェクト      │
│グラフ  │                        │  🏅 フルセット        │
│  🏅    │  家族のキャラ：とり Lv3 │  🏅 スピードスター    │
│バッジ  │  ┌────────┐ ふたりで育成│                       │
│  📋    │  │[🐤画像]│🐰2400+🐻1800│  ┌─────────────────┐  │
│まとめ  │  └────────┘ ＝家族4200pt│  │  ＋ きろくする  │  │
│  ⚙️    │  次まで600pt ／ ﾘｾｯﾄ12日 │  └─────────────────┘  │
│せってい│  🔥 今週 3/4日 ⭐2週     │                       │
└────────┴────────────────────────┴───────────────────────┘
```

---

### ③ 記録入力画面

左側に入力フォーム、右側に獲得ポイントをリアルタイム表示する。

```
┌────────┬───────────────────────────┬──────────────────────┐
│  🏠    │  きろくする               │  ポイントプレビュー  │
│ホーム  ├───────────────────────────┤                      │
│  📊    │  日付: 2026 / 06 / 18     │    180 ポイント      │
│グラフ  │                           │                      │
│  🏅    │  きょうか                 │  基礎       100pt    │
│バッジ  │  [算数] [国語] [英語]     │  スピード    50pt 🎉 │
│  📋    │  レベル: B（自動）        │  フルセット  30pt    │
│まとめ  │                           │                      │
│  ⚙️    │  まい数                   │  ⏱ 51秒/枚 ベスト更新!│
│せってい│  [1][2][3][4][5]          │                      │
│        │  [6][7][8][9][10]         │  ┌────────────────┐  │
│        │                           │  │   きろくする   │  │
│        │  じかん                   │  └────────────────┘  │
│        │  [ 8 ]分  [ 30 ]秒（自動）│                      │
│        │  ▶ スタート ／ ■ ストップ │                      │
│        │  ひとこと [           ]   │                      │
└────────┴───────────────────────────┴──────────────────────┘
```

---

### ④ グラフ画面

左にフィルター、右にグラフを表示する。レベル変更日は縦線で表示する。縦軸はタブ（獲得pt／累計pt 等）により自動調整する。

```
┌────────┬────────────┬──────────────────────────────────────┐
│  🏠    │            │  200│               ●                │
│ホーム  │ [ 算数 ▼ ] │  160│       ●           ●           │
│  📊    │ [ 1ヶ月▼ ] │  120│  ●        │           ●       │
│グラフ  │ [獲得pt ]  │   80│           │                    │
│  🏅    │ [累計pt ]  │     └───────────┼────────────────    │
│バッジ  │ [ 時間  ]  │    6/10  6/13  6/15  6/16  6/18     │
│  📋    │ [まい数 ]  │                ↑                     │
│まとめ  │            │           レベル変更                 │
│  ⚙️    │            │           A → B                     │
│せってい│            │                                      │
└────────┴────────────┴──────────────────────────────────────┘
```

---

### ⑤ バッジ一覧画面

```
┌────────┬──────────────────────────────────────────────────┐
│  🏠    │  バッジ                                          │
│ホーム  ├──────────────────────────────────────────────────┤
│  📊    │  獲得ずみ（3）                                   │
│グラフ  │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  🏅    │  │   🏅    │ │   🏅    │ │   🏅    │            │
│バッジ  │  │パーフェ │ │フルセット│ │今週達成 │            │
│  📋    │  │クト     │ │         │ │         │            │
│まとめ  │  └─────────┘ └─────────┘ └─────────┘            │
│  ⚙️    │                                                  │
│せってい│  まだもらってない（3）                           │
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│        │  │   🔒    │ │   🔒    │ │   🔒    │            │
│        │  │スピード │ │4週連続  │ │レベルアッ│            │
│        │  │スター   │ │         │ │プ       │            │
│        │  └─────────┘ └─────────┘ └─────────┘            │
└────────┴──────────────────────────────────────────────────┘
```

---

### ⑥ サマリー画面

```
┌────────┬─────────────────────────┬────────────────────────┐
│  🏠    │ まとめ  [ 今週 ][ 今月] │  教科別 平均ポイント   │
│ホーム  ├─────────────────────────┤                        │
│  📊    │  学習日数    5日 / 7日  │  算数 ████████░░ 152pt │
│グラフ  │  平均ポイント   142pt   │  国語 ██████░░░░ 128pt │
│  🏅    │  最高ポイント   180pt   │  英語 █████████░ 165pt │
│バッジ  │  平均まい数  9.2 まい   │                        │
│  📋    │                         │                        │
│まとめ  │                         │                        │
│  ⚙️    │                         │                        │
│せってい│                         │                        │
└────────┴─────────────────────────┴────────────────────────┘
```

---

### ⑦ 設定画面（保護者向け）

ホームの ⚙️ アイコンからアクセスする。

```
┌────────┬─────────────────────────┬────────────────────────┐
│  🏠    │  せってい（保護者）      │  教材レベル設定        │
│ホーム  ├─────────────────────────┤                        │
│  📊    │  プロフィール管理       │  ─── 🐰 はな ───       │
│グラフ  │  ┌──────────┐┌────────┐ │  算数  [ B  ▼ ]        │
│  🏅    │  │ 🐰  はな ││🐻  そら│ │  国語  [ A  ▼ ]        │
│バッジ  │  │[へんしゅう││[へんしゅ│ │  英語  [ 2A ▼ ]        │
│  📋    │  └──────────┘└────────┘ │                        │
│まとめ  │  記録の修正・削除       │  ─── 🐻 そら ───       │
│  ⚙️    │  [ 記録一覧をひらく ]   │  算数  [ 4A ▼ ]        │
│せってい│  バックアップ           │  国語  [ 5A ▼ ]        │
│        │  [書き出し][読み込み]   │  英語  [未設定 ▼]      │
│        │  効果音  [ ON / OFF ]   │                        │
│        │  月リセット [ 実行 ]    │                        │
└────────┴─────────────────────────┴────────────────────────┘
```

---

## 9. 外部設計：データ設計

データはブラウザの localStorage に JSON 形式で1つのキー（`kumon-app`）で保存する。

### 全体構造

```json
{
  "scoreVersion": 1,
  "monthKey": "2026-06",
  "settings": { "sound": true },
  "profiles": [ ...プロフィール（2件） ]
}
```

※ `scoreVersion`：スコア計算式のバージョン。式を変更したら値を上げ、過去レコードは保存値を尊重する（再計算しない）。  
※ `monthKey`：現在の「期（≒1ヶ月）」の識別子。**保護者が任意のタイミングでリセット**すると次の値へ進む（自動ではない）。キャラ画像のキャッシュ無効化にも使う。  
※ `settings.sound`：達成演出の効果音 ON/OFF（設定画面で切替）。  
※ 共有キャラの「家族の今月ポイント」は保存せず、**全プロフィールの `monthlyPoints` 合計を算出**して使う。

### プロフィール

```json
{
  "id": "profile_1",
  "name": "はな",
  "icon": "🐰",
  "monthlyPoints": 2400
}
```

| フィールド | 型 | 内容 |
|------------|-----|------|
| id | string | プロフィールの一意ID |
| name | string | 表示名 |
| icon | string | アイコン（絵文字） |
| monthlyPoints | number | 今期の累計獲得ポイント（保護者の「月リセット」で0になる）。共有キャラ段階の算出に使用 |

---

### 教材レベル設定（プロフィールごと・教科ごと）

```json
{
  "levels": {
    "算数": {
      "current": "B",
      "history": [
        { "level": "A", "changedAt": "2026-05-01" },
        { "level": "B", "changedAt": "2026-06-15" }
      ],
      "best": { "A": 58, "B": 65 }
    },
    "国語": { "current": "A",  "history": [...], "best": { "A": 70 } },
    "英語": { "current": "2A", "history": [...], "best": {} }
  }
}
```

| フィールド | 型 | 内容 |
|------------|-----|------|
| current | string | 現在のレベル（例: "B", "2A"） |
| history[].level | string | 変更前のレベル |
| history[].changedAt | string | 変更日（YYYY-MM-DD） |
| best | object | レベルごとの自己ベスト（1枚あたり秒）。スピードボーナス判定に使用 |

---

### レベルの扱い（整合性ルール）

`record.level` と `levels[].history` は役割が異なるため一本化せず、次のルールで運用する。

- `record.level` は記録作成時に `levels[教科].current` をコピーして固定する（スナップショット）。以後のレベル設定変更では書き換えない。
- `levels[教科].history` はレベル変更の履歴で、現在のレベル管理とグラフのレベル変更ライン表示に使う。
- 自己ベスト `levels[教科].best[レベル]` のキーは `record.level` と一致する。
- 過去レコードのレベルを訂正したい場合は「記録の修正・削除」（削除→入れ直し）で対応する。通常のレベル設定変更は以後の記録にのみ反映される。

---

### 宿題記録（プロフィールごと）

```json
{
  "records": [
    {
      "id": "rec_1718681400000",
      "createdAt": "2026-06-18T17:30:00+09:00",
      "date": "2026-06-18",
      "subject": "算数",
      "level": "B",
      "sheets": 10,
      "totalSeconds": 510,
      "secondsPerSheet": 51,
      "basePoints": 100,
      "speedBonus": 50,
      "fullSetBonus": 30,
      "earnedPoints": 180,
      "isBest": true,
      "scoreVersion": 1,
      "comment": "がんばった！"
    }
  ]
}
```

| フィールド | 型 | 内容 |
|------------|-----|------|
| id | string | 記録の一意ID（`rec_<作成時刻ミリ秒>`。同日同教科の複数記録でも衝突しない） |
| createdAt | string | 記録作成日時（ISO8601）。並べ替え・編集削除の特定に使用 |
| date | string | 学習日（YYYY-MM-DD） |
| subject | string | 教科（"算数" / "国語" / "英語"） |
| level | string | 記録時点のレベル（作成時に current をコピーして固定。以後変更しない） |
| sheets | number | 実施枚数（1〜10） |
| totalSeconds | number | 合計時間（秒換算） |
| secondsPerSheet | number | 1枚あたりの時間（秒）※計算済み |
| basePoints | number | 基礎ポイント（枚数 × 10） |
| speedBonus | number | スピードボーナス（0 / 20 / 30 / 50） |
| fullSetBonus | number | フルセットボーナス（0 / 30） |
| earnedPoints | number | この回の獲得ポイント（基礎＋各ボーナス） |
| isBest | boolean | この回で自己ベストを更新したか |
| scoreVersion | number | この記録を計算したスコア式のバージョン |
| comment | string | ひとこと（空文字可） |

---

### バッジ（プロフィールごと）

```json
{
  "badges": [
    { "id": "perfect",    "earnedAt": "2026-06-18" },
    { "id": "full_set",   "earnedAt": "2026-06-17" },
    { "id": "speed_star", "earnedAt": "2026-06-15" }
  ]
}
```

| バッジID | 対応バッジ名 |
|----------|--------------|
| perfect | パーフェクト |
| speed_star | スピードスター |
| full_set | フルセット |
| weekly_goal | 今週達成（週4日） |
| streak_4w | 4週れんぞく |
| level_up | レベルアップ |

---

### 完全なデータ構造（まとめ）

```json
{
  "scoreVersion": 1,
  "monthKey": "2026-06",
  "profiles": [
    {
      "id": "profile_1",
      "name": "はな",
      "icon": "🐰",
      "monthlyPoints": 2400,
      "levels": {
        "算数": {
          "current": "B",
          "history": [
            { "level": "A", "changedAt": "2026-05-01" },
            { "level": "B", "changedAt": "2026-06-15" }
          ],
          "best": { "A": 58, "B": 65 }
        },
        "国語": { "current": "A",  "history": [...], "best": { "A": 70 } },
        "英語": { "current": "2A", "history": [...], "best": {} }
      },
      "records": [
        {
          "id": "rec_1718681400000",
          "createdAt": "2026-06-18T17:30:00+09:00",
          "date": "2026-06-18",
          "subject": "算数",
          "level": "B",
          "sheets": 10,
          "totalSeconds": 510,
          "secondsPerSheet": 51,
          "basePoints": 100,
          "speedBonus": 50,
          "fullSetBonus": 30,
          "earnedPoints": 180,
          "isBest": true,
          "scoreVersion": 1,
          "comment": "がんばった！"
        }
      ],
      "badges": [
        { "id": "perfect",  "earnedAt": "2026-06-18" },
        { "id": "full_set", "earnedAt": "2026-06-17" }
      ]
    }
  ]
}
```

---

## 10. 内部設計

### ファイル構成

```
/
├── index.html          # エントリーポイント（全画面をここに含む）
├── manifest.json       # PWA設定
├── sw.js               # Service Worker（オフライン対応）
├── css/
│   └── style.css       # スタイル定義
├── js/
│   ├── app.js          # 画面遷移・イベント管理
│   ├── storage.js      # localStorageの読み書き（バックアップ含む）
│   ├── score.js        # スコア計算ロジック
│   ├── badge.js        # バッジ判定ロジック
│   ├── char.js         # キャラ育成（月間ポイント→段階）
│   └── chart.js        # グラフ描画
├── lib/
│   └── chart.min.js    # Chart.js 本体（ローカル同梱／オフライン対応）
└── img/
    └── char_1〜5.png    # 月次キャラ画像（固定名・毎月上書き）
```

---

### モジュール設計

#### storage.js　―　データ永続化

| 関数 | 引数 | 戻り値 | 内容 |
|------|------|--------|------|
| `getData()` | なし | object | localStorage から全データ取得 |
| `saveData(data)` | data: object | なし | localStorage へ全データ保存 |
| `getProfile(id)` | id: string | object | 指定プロフィール取得 |
| `addRecord(profileId, record)` | profileId, record | なし | 宿題記録を追加し、そのプロフィールの monthlyPoints に earnedPoints を加算（自動リセットはしない） |
| `updateLevel(profileId, subject, level)` | profileId, subject, level | なし | レベルを更新し履歴に追記 |
| `getBest(profileId, subject, level)` | profileId, subject, level | number\|null | そのレベルの自己ベスト秒/枚を取得（未記録なら null） |
| `updateBest(profileId, subject, level, seconds)` | profileId, subject, level, seconds | なし | 自己ベスト（levels[subject].best[level]）を更新 |
| `deleteRecord(profileId, recordId)` | profileId, recordId | なし | 記録を削除し、同月なら monthlyPoints から earnedPoints を差し引き・自己ベストを再計算 |
| `recalcBest(profileId, subject, level)` | profileId, subject, level | なし | 残りの記録から自己ベストを再計算（削除・修正後に呼ぶ） |
| `exportData()` | なし | Blob | 全データをJSON文字列にして書き出す（ファイル保存用） |
| `importData(json)` | json: string | なし | バックアップJSONを検証し、確認の上 localStorage を上書き復元 |
| `resetMonth(newMonthKey)` | newMonthKey: string | なし | 全プロフィールの monthlyPoints を0にし、ルートの monthKey を更新（保護者が任意に実行。画像差し替えと併せて行う） |

#### score.js　―　スコア計算

| 関数 | 引数 | 戻り値 | 内容 |
|------|------|--------|------|
| `calcScore(sheets, totalSeconds, currentBest)` | sheets, totalSeconds: number / currentBest: number\|null | object | 獲得ポイント一式を計算して返す |

```js
const SCORE_VERSION = 1;   // スコア計算式のバージョン（式を変えたら +1）

// スコア計算ロジック（がんばりポイント加点方式）
// currentBest: そのレベルでの自己ベスト秒/枚（未記録なら null）
function calcScore(sheets, totalSeconds, currentBest) {
  const secondsPerSheet = totalSeconds / sheets;

  // ① 基礎ポイント：やった分だけ必ずもらえる
  const basePoints = sheets * 10;

  // ② スピードボーナス：そのレベルの自己ベストと比較
  let speedBonus = 0;
  let isBest = false;
  if (currentBest == null) {
    speedBonus = 30;                              // そのレベル初回（はじめてボーナス）
    isBest = true;                                // ベストとして記録する
  } else if (secondsPerSheet < currentBest) {
    speedBonus = 50;                              // 自己ベスト更新
    isBest = true;
  } else if (secondsPerSheet <= currentBest * 1.1) {
    speedBonus = 20;                              // ベスト×1.1以内（好調）
  }

  // ③ フルセットボーナス：10枚やり切り
  const fullSetBonus = sheets === 10 ? 30 : 0;

  return {
    secondsPerSheet: Math.round(secondsPerSheet),
    basePoints,
    speedBonus,
    fullSetBonus,
    earnedPoints: basePoints + speedBonus + fullSetBonus,
    isBest,   // levels.best の更新判定に使用（初回も true）
    scoreVersion: SCORE_VERSION
  };
}
```

※ バッジ「スピードスター」は `speedBonus === 50`（真の更新）で判定し、初回ボーナス（+30）とは区別する。

#### char.js　―　キャラ育成（2人の合算・共有キャラ）

キャラは**家族で1体**。**全プロフィールの今月ポイント合計**を段階表に当てはめて育てる（協力型）。家族合計は記録から算出し、新規データは増やさない。

| 関数 | 引数 | 戻り値 | 内容 |
|------|------|--------|------|
| `familyMonthlyPoints(data)` | data | number | 全プロフィールの今期ポイント合計（リセットで全員0になる） |
| `getCharLevel(familyPoints)` | familyPoints: number | object | 共有キャラの段階（level / title / image）を返す |
| `charImageUrl(stage, monthKey)` | stage, monthKey | string | 月キー付き画像URL（毎月の上書きを確実に反映） |

```js
// 家族合計の月間ポイントからキャラの段階を返す（しきい値表）
// ※ 2人の合算なので、しきい値は単独の約2倍に設定
const CHAR_STAGES = [
  { level: 1, min: 0,    title: 'たまご',   image: 'char_1.png' },
  { level: 2, min: 800,  title: 'ひよこ',   image: 'char_2.png' },
  { level: 3, min: 2400, title: 'とり',     image: 'char_3.png' },
  { level: 4, min: 4800, title: 'はばたき', image: 'char_4.png' },
  { level: 5, min: 8000, title: 'エース',   image: 'char_5.png' },
];

// 全プロフィールの今期ポイントを合計（協力＝2人の貢献の和）
// リセットで全員0になるため、単純合計でよい
function familyMonthlyPoints(data) {
  return data.profiles.reduce((sum, p) => sum + p.monthlyPoints, 0);
}

function getCharLevel(familyPoints) {
  // 条件を満たす最上位の段階を返す
  return [...CHAR_STAGES].reverse().find(s => familyPoints >= s.min);
}

// 画像URLは月キーでキャッシュ無効化（毎月の PNG 上書きを確実に反映）
function charImageUrl(stage, monthKey) {
  return `img/${stage.image}?m=${monthKey}`;
}
```

※ ホームには各プロフィールの `monthlyPoints` を**貢献分**として並べ、「ふたりで育てている」ことを示す（FR-10b）。

#### badge.js　―　バッジ判定

| 関数 | 引数 | 戻り値 | 内容 |
|------|------|--------|------|
| `checkBadges(profile, newRecord)` | profile: object, newRecord: object | string[] | 新たに獲得したバッジIDの配列を返す |
| `countDaysThisWeek(records)` | records: array | number | 今週（月〜日）の記録日数を返す |
| `calcWeekStreak(records)` | records: array | number | 連続して週目標を達成した週数を返す |

```js
const WEEK_GOAL = 4;   // 週の目標日数（週4日以上で「達成」）

// バッジ判定ロジック
function checkBadges(profile, newRecord) {
  const earned = [];

  // スピードスター：自己ベスト更新（初回ボーナス +30 は対象外）
  if (newRecord.speedBonus === 50) earned.push('speed_star');

  // フルセット：10枚やり切り
  if (newRecord.fullSetBonus === 30) earned.push('full_set');

  // パーフェクト：10枚 ＋ 自己ベスト更新を同時達成
  if (newRecord.fullSetBonus === 30 && newRecord.speedBonus === 50) {
    earned.push('perfect');
  }

  // 今週の達成（週4日）と連続達成週数
  if (countDaysThisWeek(profile.records) >= WEEK_GOAL) earned.push('weekly_goal');
  if (calcWeekStreak(profile.records) >= 4)            earned.push('streak_4w');

  // 同教科で初めてのレベルなら level_up
  // ※ checkBadges は addRecord の後に呼ばれ newRecord も records に含まれるため、
  //   「その教科×レベルの記録が1件だけ（＝今回が初）」で判定する
  const sameLevelCount = profile.records.filter(r =>
    r.subject === newRecord.subject && r.level === newRecord.level
  ).length;
  if (sameLevelCount <= 1) earned.push('level_up');

  // すでに獲得済みのバッジは除外
  return earned.filter(id => !profile.badges.some(b => b.id === id));
}

// 今週（月〜日）に記録した日数
function countDaysThisWeek(records) {
  const { start, end } = thisWeekRange();        // 月曜〜日曜の範囲
  return new Set(
    records.filter(r => r.date >= start && r.date <= end).map(r => r.date)
  ).size;
}

// その週（start〜end）に WEEK_GOAL 日以上記録したか
function isWeekAchieved(records, start, end) {
  return new Set(
    records.filter(r => r.date >= start && r.date <= end).map(r => r.date)
  ).size >= WEEK_GOAL;
}

// 連続達成週数（進行中の今週が未達なら先週から数える）
function calcWeekStreak(records) {
  let { start, end } = thisWeekRange();
  if (!isWeekAchieved(records, start, end)) {
    ({ start, end } = prevWeekRange(start));      // 今週は進行中→先週から
  }
  let streak = 0;
  while (isWeekAchieved(records, start, end)) {
    streak++;
    ({ start, end } = prevWeekRange(start));
  }
  return streak;
}
```

#### app.js　―　画面遷移・イベント管理

| 関数 | 内容 |
|------|------|
| `showScreen(screenId)` | 指定画面を表示し他を非表示にする |
| `onProfileSelect(profileId)` | プロフィール選択時の処理 |
| `onRecordSubmit()` | 記録入力フォーム送信時の処理 |
| `onNavClick(target)` | ナビゲーションのタブ切り替え |

```js
// 記録保存の処理フロー
function onRecordSubmit() {
  const input = getFormValues();              // フォーム値取得
  const best  = getBest(                      // そのレベルの自己ベスト取得
    currentProfileId, input.subject, input.level
  );
  const result = calcScore(                   // ポイント計算
    input.sheets, input.totalSeconds, best
  );
  const record = buildRecord(input, result);  // 記録オブジェクト生成
  addRecord(currentProfileId, record);        // 保存・monthlyPoints 加算（リセットはしない）
  if (result.isBest) {                        // 自己ベスト更新なら
    updateBest(currentProfileId, input.subject,
               input.level, result.secondsPerSheet);
  }
  const newBadges = checkBadges(              // バッジ判定
    getProfile(currentProfileId), record
  );
  saveBadges(currentProfileId, newBadges);    // バッジ保存
  showResult(result, newBadges);              // 結果画面に遷移
}
```

※ `buildRecord()` は記録に `id = "rec_" + Date.now()`、`createdAt`（ISO8601）、`scoreVersion`（= result.scoreVersion）を付与する。  
※ 時間はストップウォッチ計測値または手入力のどちらでも `totalSeconds` に格納する。  
※ `showResult()` は達成演出（獲得ポイントのカウントアップ／ベスト更新・フルセットのキラッ／共有キャラのLvアップ切替＋ファンファーレ／バッジのポップ）を表示する。効果音は `settings.sound` が ON のときのみ再生する。

#### chart.js　―　グラフ描画

Chart.js ライブラリを使用する（`lib/chart.min.js` としてローカル同梱し、オフラインでも描画できる）。

| 関数 | 内容 |
|------|------|
| `drawPointsChart(records)` | 1回ごとの獲得ポイントの棒グラフを描画 |
| `drawTimeChart(records)` | 1枚あたり時間の折れ線グラフを描画（自己ベスト更新点を強調） |
| `drawSheetsChart(records)` | 実施枚数の棒グラフを描画 |
| `drawBreakdownChart(records)` | 獲得ポイントの内訳（基礎／スピード／フルセット）を積み上げ描画 |
| `drawTotalPointsChart(records)` | 全期間の累計獲得ポイント（記録から算出）の推移を面グラフで描画 |

レベル変更日はグラフの縦線アノテーションとして表示する。

---

### 処理フロー図

```
【記録入力フロー】

ユーザー入力（枚数・時間：手入力 or ストップウォッチ）
  │
  ▼
storage.js: getBest()  … そのレベルの自己ベストを取得
  │
  ▼
score.js: calcScore(sheets, totalSeconds, currentBest)
  │ basePoints, speedBonus, fullSetBonus, earnedPoints, isBest
  ▼
storage.js: addRecord()      … 記録を保存・monthlyPoints 加算（リセットはしない）
  │           updateBest()    … isBest なら自己ベストを更新
  ▼
badge.js: checkBadges()
  │ 新バッジがあれば storage.js: saveBadges()
  ▼
app.js: showResult()
  └ 結果（獲得ポイント・更新・バッジ）を画面に表示
```

---

## 11. 実装・デバッグ・テスト計画

### 11.1 前提・環境

- 開発：VS Code ＋ ローカルHTTPサーバ（Live Server 等）。**PWA／Service Worker は `file://` では動かない**ため、開発時もHTTPで配信する。
- 本番：GitHub Pages / Netlify（HTTPS）。
- 方針：ロジック（score／badge／char）は**純粋関数**に保ち、UIと分離してテスト容易にする。

### 11.2 実装ステップ（依存順）

| Ph | 内容 | 主なファイル | 完了の目安 |
|----|------|-------------|-----------|
| 0 | 雛形・Git・ローカルサーバ起動 | index.html 枠 | ブラウザで空画面が出る |
| 1 | データ層（取得／保存／初期化／シード） | storage.js | localStorageに初期JSONが入る |
| 2 | ロジック層（**単体テスト対象**） | score.js / badge.js / char.js | テストが全通過 |
| 3 | 画面骨格＋遷移（サイドバー・7画面枠） | index.html / css / app.js | 画面切替が動く |
| 4 | プロフィール選択＋ホーム（共有キャラ・貢献・週達成） | app.js / char.js | 2人切替・キャラ表示 |
| 5 | 記録入力（フォーム／ストップウォッチ／プレビュー／保存／達成演出） | app.js / score.js | 記録→ポイント反映 |
| 6 | グラフ（Chart.jsローカル同梱） | chart.js / lib | 4種グラフ描画 |
| 7 | バッジ一覧・サマリー | app.js | 一覧・集計表示 |
| 8 | 設定（レベル／記録修正削除／バックアップ／効果音／月リセット） | app.js / storage.js | 各操作が動作 |
| 9 | PWA化（manifest／sw＝オフライン／ホーム追加） | manifest.json / sw.js | 機内モードで起動 |
| 10 | 実機調整（iPad横向き）・画像差し替え運用確認 | 全体 | iPadで一通り動く |

### 11.3 テスト計画

**(A) 単体テスト（純粋関数）** ― `test.html` をブラウザで開き `console.assert` で検証（軽量・フレームワーク不要）

| 対象 | 観点（境界値） |
|------|----------------|
| `calcScore` | 初回(best=null)＝+30／更新(<best)＝+50／ベスト×1.1以内＝+20／それ以外＝0、5枚・10枚、端数 |
| `getCharLevel` | しきい値境界 0／800／2400／4800／8000 のちょうど・前後 |
| `familyMonthlyPoints` | 2人合算・片方0 |
| `countDaysThisWeek`／`calcWeekStreak` | 週またぎ・進行中の今週・連続／途切れ |
| `checkBadges` | 各バッジ条件・獲得済み除外・パーフェクト同時成立 |

**(B) 結合・受け入れテスト（手動チェックリスト）**

- 記録→獲得ポイント→共有キャラLv→バッジ→グラフ→サマリーが連動するか
- 月リセット：全員0・monthKey更新・画像差し替え反映（`?m=`でキャッシュ回避）
- バックアップ：書き出し→（消して）読み込みで完全復元
- 各要件（FR／PR／ST／NFR）の充足確認

### 11.4 デバッグ観点（つまずきやすい箇所）

- **Service Worker のキャッシュ**：開発中は「Update on reload」、本番はキャッシュ名にバージョンを付与（古い資産が残る罠）。
- **画像差し替え**：`char_x.png?m=YYYY-MM` で確実に更新されるか実機確認。
- **localStorage**：破損・空のときの初期化（try/catch）。容量・JSON整合。
- **iPad Safari**：横向き、タップ領域、ストップウォッチのバックグラウンド挙動。
- ロジックは DevTools コンソールで関数を直接叩いて確認する。
