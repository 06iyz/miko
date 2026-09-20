import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import type { HelpCategory, HelpType } from '../types'
import { db } from './firebase'

type CreateHelpPostInput = {
  category: HelpCategory
  description: string
  type: HelpType
  location: string
}

function createTitle(description: string) {
  const firstLine = description.trim().split(/\r?\n/)[0] ?? ''
  return firstLine.length > 40 ? `${firstLine.slice(0, 40)}…` : firstLine
}

/** ログイン済みの本人として Help 投稿を Firestore に保存する。 */
export async function createHelpPost(user: User, input: CreateHelpPostInput) {
  const description = input.description.trim()

  if (!description) {
    throw new Error('投稿内容を入力してください。')
  }

  const post = await addDoc(collection(db, 'helpPosts'), {
    title: createTitle(description),
    description,
    category: input.category,
    type: input.type,
    location: input.location,
    status: 'open',
    authorUid: user.uid,
    authorName: user.displayName ?? '名前未設定',
    authorPhotoUrl: user.photoURL ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return post.id
}
