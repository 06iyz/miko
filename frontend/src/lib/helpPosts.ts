import { collection, doc, runTransaction, serverTimestamp, writeBatch } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import type { HelpCategory, HelpType } from '../types'
import { db } from './firebase'

type CreateHelpPostInput = {
  category: HelpCategory
  description: string
  type: HelpType
  location: string
  requesterFeature?: string
  approximateCoordinates?: {
    latitude: number
    longitude: number
    accuracyMeters: number
  } | null
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

  const post = doc(collection(db, 'helpPosts'))
  const privateLocation = doc(post, 'private', 'location')
  const batch = writeBatch(db)

  // 一覧で読まれる投稿本体には、詳しい場所や座標を入れない。
  batch.set(post, {
    title: createTitle(description),
    description,
    category: input.category,
    type: input.type,
    locationHint: '詳しい場所は投稿詳細で確認できます',
    requesterFeature: input.requesterFeature?.trim() || null,
    status: 'open',
    acceptedHelperUid: null,
    authorUid: user.uid,
    authorName: user.displayName ?? '名前未設定',
    authorPhotoUrl: user.photoURL ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // 保存先を維持し、ルールでログイン済みユーザーに場所の閲覧を許可する。
  batch.set(privateLocation, {
    location: input.location,
    approximateCoordinates: input.approximateCoordinates ?? null,
    createdAt: serverTimestamp(),
  })
  await batch.commit()

  return post.id
}

/** 開いている投稿を引き受ける。認可は Firestore ルールでも確認する。 */
export async function acceptHelpPost(user: User, postId: string) {
  const postRef = doc(db, 'helpPosts', postId)
  const profileRef = doc(db, 'userProfiles', user.uid)

  await runTransaction(db, async (transaction) => {
    const [post, profile] = await Promise.all([
      transaction.get(postRef),
      transaction.get(profileRef),
    ])

    if (!post.exists() || post.data().status !== 'open' || post.data().acceptedHelperUid !== null) {
      throw new Error('このHelpはすでに担当者が決まっています。')
    }

    const activeHelpId = profile.exists() && typeof profile.data().activeHelpId === 'string'
      ? profile.data().activeHelpId
      : null
    if (activeHelpId) {
      throw new Error('すでに別のHelpに助けに向かっています。')
    }

    transaction.update(postRef, {
      status: 'matched',
      acceptedHelperUid: user.uid,
      acceptedHelperName: user.displayName ?? '名前未設定',
      acceptedAt: serverTimestamp(),
    })

    // このドキュメントをロックとして共有することで、別端末から同時に引き受けても1件に限定する。
    if (profile.exists()) {
      transaction.update(profileRef, {
        activeHelpId: postId,
        updatedAt: serverTimestamp(),
      })
    } else {
      transaction.set(profileRef, {
        helpedCount: 0,
        helpedByCount: 0,
        ratingSum: 0,
        ratingCount: 0,
        completedHelpIds: [],
        closedPostIds: [],
        activeHelpId: postId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  })
}
