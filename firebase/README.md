# Firestore setup

投稿機能は Firebase Authentication と Firestore を使います。

1. Firebase Console でプロジェクト `help5-d7f86` を開く。
2. **Firestore Database** を作成する。
3. **ルール** タブを開き、`firestore.rules` の内容を貼り付けて公開する。

`helpPosts` コレクションは、ログイン済みの本人だけが投稿でき、投稿者本人だけが編集・削除できます。

写真付き投稿を使う場合は、Firebase Console で **Storage** を有効化し、
`storage.rules` の内容を Storage の「ルール」タブへ貼り付けて公開する。
