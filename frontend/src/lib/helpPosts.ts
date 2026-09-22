import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import type { User } from 'firebase/auth'
import type { HelpCategory, HelpType } from '../types'
import { db, storage } from './firebase'

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
  photoFile?: File | null
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
  let photoUrl: string | null = null

  if (input.photoFile) {
    const photoRef = ref(storage, `helpPostPhotos/${user.uid}/${post.id}`)
    await uploadBytes(photoRef, input.photoFile, { contentType: input.photoFile.type })
    photoUrl = await getDownloadURL(photoRef)
  }

  await setDoc(post, {
    title: createTitle(description),
    description,
    category: input.category,
    type: input.type,
    location: input.location,
    requesterFeature: input.requesterFeature?.trim() || null,
    // 現在地を使った場合も、正確な座標ではなく約100m単位に丸めた値だけを保存する。
    approximateCoordinates: input.approximateCoordinates ?? null,
    photoUrl,
    status: 'open',
    authorUid: user.uid,
    authorName: user.displayName ?? '名前未設定',
    authorPhotoUrl: user.photoURL ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return post.id
}
