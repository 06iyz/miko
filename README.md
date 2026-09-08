# Inclusive Map

## 📌 概要

ユーザーそれぞれの状況に合わせて「移動しやすい道」を提案し、移動中に困ったときには近くのユーザーに助けを求められるマップアプリです。

車椅子、ベビーカー、雨の日、大きな荷物を持っている場合など、ユーザーの状況に応じた移動をサポートします。

また、段差やエレベーターの故障など、地図だけでは分からない情報をユーザー同士で共有できます。

## 🎯 解決したい課題

一般的なマップアプリでは「最短ルート」が案内されることが多い一方、そのルートがすべての人にとって移動しやすいとは限りません。

例えば、

* 車椅子では階段を通れない
* ベビーカーでは段差の多い道を避けたい
* 雨の日はできるだけ屋根のある場所を通りたい
* 大きな荷物があると階段を避けたい

といった状況があります。

そこで、ユーザーの状況に合わせたルート案内と、ユーザー同士の助け合いを組み合わせることで、誰もが移動しやすい環境を目指します。

## ✨ 主な機能

### 🗺️ マップ

* 現在地の表示
* 目的地の設定
* ルート表示

### ♿ 移動モード

* 車椅子
* ベビーカー
* 雨の日
* 大きな荷物

### 📍 情報共有

* 段差
* 工事
* エレベーターの故障
* 雨で滑りやすい場所
* その他のバリア情報

### 🆘 お助け機能

現在地から周囲のユーザーに助けを求めることができます。

## 🛠 使用技術

| 分類              | 技術                       |
| ----------------- | -------------------------- |
| 言語              | TypeScript                 |
| Frontend          | React / Vite               |
| Backend           | Node.js / Express          |
| Map               | Leaflet / React Leaflet    |
| Map Data          | OpenStreetMap              |
| Database          | Firebase / Firestore       |
| Authentication    | Firebase Authentication    |
| Storage           | Firebase Storage           |
| Location          | Geolocation API            |
| Routing           | Routing API                |
| Weather           | Weather API                |
| AI                | AI API                     |
| Deployment        | Vercel                     |
| Design            | Figma                      |
| Version Control   | GitHub                     |

## 👥 メンバー・担当

| Member | Role      |
| ------ | --------- |
| ○○     | マップ・位置情報  |
| ○○     | UI・デザイン   |
| ○○     | DB・API    |
| ○○     | ルート・外部API |

## 📂 ディレクトリ構成

```text
.
├── frontend/          # React + Vite
├── backend/           # Express + TypeScript
│   ├── .env.example   # 環境変数の雛形
│   └── src/server.ts  # API エントリーポイント
├── package.json       # チーム共通のコマンド
├── package-lock.json  # 固定された依存関係
└── .nvmrc             # Node.js バージョン
```

## 🚀 環境構築

### 必要な環境

- Node.js `24.13.0`（`.nvmrc` を参照）
- npm `11.6.2` 以上、12 未満

Node.js のバージョンが異なると依存パッケージの挙動が変わることがあるため、チーム全員で上記の範囲を使ってください。nvm を利用している場合は、リポジトリ直下で `nvm use` を実行できます。

### 1. Repositoryをclone

```bash
git clone <repository-url>
cd Hackathon-app
```

### 2. パッケージをインストール

```bash
npm ci
```

`npm ci` はリポジトリに含まれる `package-lock.json` の通りに依存関係を入れるため、開発メンバー間で同一の依存関係を再現できます。パッケージを追加・更新する担当者以外は `npm install` ではなく `npm ci` を使ってください。

### 3. 環境変数を設定（必要な場合のみ）

バックエンドでポート番号を変えたいときだけ、雛形をコピーして設定します。

```bash
cp backend/.env.example backend/.env
```

Windows PowerShell の場合は次のコマンドです。

```powershell
Copy-Item backend/.env.example backend/.env
```

デフォルトは `PORT=3000` です。すでに 3000 番ポートが使われている場合は、`backend/.env` を作成して `PORT=3001` などに変更してください。その場合は `frontend/vite.config.ts` のプロキシ先も同じポートへ変更します。

### 4. 開発サーバー起動

```bash
npm run dev
```

このコマンドでフロントエンドとバックエンドを同時に起動できます。

- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:3000
- ヘルスチェック: http://localhost:3000/api/health

フロントエンドから `/api/...` にアクセスすると、Vite の開発プロキシ経由で Express に転送されます。

個別に起動したい場合は、別々のターミナルで `npm run dev:backend` と `npm run dev:frontend` を実行してください。

### 確認コマンド

```bash
# TypeScript を含むビルド確認
npm run build

# フロントエンドのビルドとバックエンドの型チェック
npm run typecheck

# ビルド済みバックエンドを起動
npm run start
```

### 依存関係を変更するとき

1. 対象パッケージを更新する。
2. リポジトリ直下で `npm install` を実行し、ルートの `package-lock.json` を更新する。
3. `npm run build` を成功させる。
4. `package.json` と `package-lock.json` を必ず一緒にコミットする。

これにより、他のメンバーは改めて `npm ci` を実行するだけで同じ環境にできます。

## 🌿 Git / GitHub 運用

### 作業開始

mainを最新状態にします。

```bash
git switch main
git pull
```

作業用branchを作成します。

```bash
git switch -c feature/機能名
```

例：

```bash
git switch -c feature/map
git switch -c feature/sos
```

### 作業終了

```bash
git add .
git commit -m "Add map view"
git push origin feature/map
```

GitHubからPull Requestを作成し、確認後mainへmergeします。

### ⚠️ ルール

* `main`へ直接pushしない
* 作業前に`main`を最新にする
* 1つのbranchで複数の大きな機能を作らない
* APIキーをGitHubへpushしない
* 大きな変更をするときはDiscordで共有する

## 📝 Branch命名

```text
feature/map
feature/sos
feature/route

fix/map-location

docs/readme
```

## 💡 コンセプト

> 道を人に合わせる。
> そして、道だけでは解決できない困りごとは、人と人をつないで解決する。
