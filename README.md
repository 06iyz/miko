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

| 分類              | 技術                      |
| --------------- | ----------------------- |
| Language        | TypeScript              |
| Frontend        | Next.js / React         |
| Map             | Leaflet / React Leaflet |
| Map Data        | OpenStreetMap           |
| Database        | Supabase / PostgreSQL   |
| Location        | Geolocation API         |
| Routing         | Routing API             |
| Deployment      | Vercel                  |
| Design          | Figma                   |
| Version Control | GitHub                  |

## 👥 メンバー・担当

| Member | Role      |
| ------ | --------- |
| ○○     | マップ・位置情報  |
| ○○     | UI・デザイン   |
| ○○     | DB・API    |
| ○○     | ルート・外部API |

## 📂 ディレクトリ構成

```text
src/
├── app/
│   ├── page.tsx
│   ├── map/
│   └── api/
│
├── components/
│   ├── Map.tsx
│   ├── SosForm.tsx
│   └── ModeSelector.tsx
│
├── lib/
│   └── supabase.ts
│
└── types/
```

※開発に合わせて変更します。

## 🚀 環境構築

### 1. Repositoryをclone

```bash
git clone <repository-url>
```

### 2. ディレクトリへ移動

```bash
cd <project-name>
```

### 3. パッケージをインストール

```bash
npm install
```

### 4. 環境変数を設定

プロジェクト直下に `.env.local` を作成します。

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

※APIキーなどの値はREADMEやGitHubに記載しません。チーム内で別途共有してください。

### 5. 開発サーバー起動

```bash
npm run dev
```

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
