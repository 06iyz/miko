import type { User } from 'firebase/auth'
import {
  doc,
  increment,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export type UserStats = {
  helpedCount: number
  helpedByCount: number
  ratingSum: number
  ratingCount: number
}

export const emptyUserStats: UserStats = {
  helpedCount: 0,
  helpedByCount: 0,
  ratingSum: 0,
  ratingCount: 0,
}

function numberOrZero(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export function readUserStats(data: Record<string, unknown> | undefined): UserStats {
  return {
    helpedCount: numberOrZero(data?.helpedCount),
    helpedByCount: numberOrZero(data?.helpedByCount),
    ratingSum: numberOrZero(data?.ratingSum),
    ratingCount: numberOrZero(data?.ratingCount),
  }
}

function initialProfile() {
  return {
    ...emptyUserStats,
    completedHelpIds: [],
    closedPostIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

/** 初回ログイン時に、本人だけが読める利用回数の記録を作る。 */
export async function ensureUserProfile(user: User) {
  const profileRef = doc(db, 'userProfiles', user.uid)

  await runTransaction(db, async (transaction) => {
    const profile = await transaction.get(profileRef)
    if (!profile.exists()) {
      transaction.set(profileRef, initialProfile())
    }
  })
}

/** 「助ける」を完了した人の回数を、同じ Help では一度だけ増やす。 */
export async function recordHelped(userId: string, helpId: string) {
  const profileRef = doc(db, 'userProfiles', userId)

  await runTransaction(db, async (transaction) => {
    const profile = await transaction.get(profileRef)
    if (!profile.exists()) {
      transaction.set(profileRef, {
        ...initialProfile(),
        helpedCount: 1,
        completedHelpIds: [helpId],
      })
      return
    }

    const completedHelpIds = stringArray(profile.data().completedHelpIds)
    if (completedHelpIds.includes(helpId)) return

    transaction.update(profileRef, {
      helpedCount: increment(1),
      completedHelpIds: [...completedHelpIds, helpId],
      updatedAt: serverTimestamp(),
    })
  })
}

/** 自分の投稿を解決済みにし、「助けられた」を同じ投稿で一度だけ増やす。 */
export async function closePostAndRecordHelpedBy(userId: string, postId: string) {
  const postRef = doc(db, 'helpPosts', postId)
  const profileRef = doc(db, 'userProfiles', userId)

  await runTransaction(db, async (transaction) => {
    const post = await transaction.get(postRef)
    if (!post.exists() || post.data().authorUid !== userId) {
      throw new Error('この投稿を解決済みにできません。')
    }
    if (post.data().status === 'closed') return

    const profile = await transaction.get(profileRef)
    const closedPostIds = profile.exists() ? stringArray(profile.data().closedPostIds) : []

    transaction.update(postRef, { status: 'closed', updatedAt: serverTimestamp() })

    if (!profile.exists()) {
      transaction.set(profileRef, {
        ...initialProfile(),
        helpedByCount: 1,
        closedPostIds: [postId],
      })
      return
    }
    if (closedPostIds.includes(postId)) return

    transaction.update(profileRef, {
      helpedByCount: increment(1),
      closedPostIds: [...closedPostIds, postId],
      updatedAt: serverTimestamp(),
    })
  })
}
