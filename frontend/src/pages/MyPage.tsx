import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { Link } from 'react-router-dom'
import { mockConversations } from '../data/mockHelps'
import { collection, doc, onSnapshot, query, Timestamp, where } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { auth, db } from '../lib/firebase'
import { closePostAndRecordHelpedBy, emptyUserStats, readUserStats, type UserStats } from '../lib/userProfile'
import BottomNav from '../components/BottomNav'
import {
  ChatIcon,
  ChevronRightIcon,
  ClockIcon,
  ListIcon,
} from '../components/icons'

import './MyPage.css'

type HistoryPost = {
  id: string
  title: string
  category: string
  type: 'come' | 'teach'
  location: string
  status: 'open' | 'matched' | 'closed'
  createdAt: Timestamp | null
}

function formatPostedAt(createdAt: Timestamp | null) {
  if (!createdAt) return 'たった今'
  return new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(createdAt.toDate())
}

export default function MyPage() {
  const { user, loading } = useAuth()
  const [failedPhotoURL, setFailedPhotoURL] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryPost[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [stats, setStats] = useState<UserStats>(emptyUserStats)
  const [closingPostId, setClosingPostId] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    setLogoutError('')
    try {
      await signOut(auth)
    } catch {
      setLogoutError('ログアウトできませんでした。もう一度お試しください。')
    } finally {
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    if (!user) return

    const historyQuery = query(
      collection(db, 'helpPosts'),
      where('authorUid', '==', user.uid),
    )

    return onSnapshot(historyQuery, (snapshot) => {
      const nextHistory: HistoryPost[] = snapshot.docs.map((document): HistoryPost => {
        const data = document.data()
        return {
          id: document.id,
          title: typeof data.title === 'string' ? data.title : '投稿内容',
          category: typeof data.category === 'string' ? data.category : 'その他',
          type: data.type === 'teach' ? 'teach' : 'come',
          location: typeof data.location === 'string' ? data.location : typeof data.locationHint === 'string' ? data.locationHint : '場所未設定',
          status: data.status === 'closed' ? 'closed' : data.status === 'matched' ? 'matched' : 'open',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
        }
      })
      nextHistory.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
      setHistory(nextHistory)
      setIsHistoryLoading(false)
      setHistoryError('')
    }, () => {
      setHistoryError('投稿履歴を読み込めませんでした。時間をおいてもう一度お試しください。')
      setIsHistoryLoading(false)
    })
  }, [user])

  useEffect(() => {
    if (!user) {
      setStats(emptyUserStats)
      return
    }

    return onSnapshot(doc(db, 'userProfiles', user.uid), (snapshot) => {
      setStats(readUserStats(snapshot.data()))
    }, () => {
      setStats(emptyUserStats)
    })
  }, [user])

  const closePost = async (postId: string) => {
    if (!user || closingPostId) return

    setClosingPostId(postId)
    setHistoryError('')
    try {
      await closePostAndRecordHelpedBy(user.uid, postId)
    } catch {
      setHistoryError('投稿を解決済みにできませんでした。時間をおいてもう一度お試しください。')
    } finally {
      setClosingPostId(null)
    }
  }

  if (loading) return <p>読み込み中...</p>
  if (!user) return <p>ログインしてください</p>

  const displayName = user.displayName || '名前未設定'
  const ratingLabel = stats.ratingCount > 0 ? (stats.ratingSum / stats.ratingCount).toFixed(1) : '—'

  return (
    <div className="screen screen--narrow my-page">
      <header className="page-header">
        <h1>マイページ</h1>
      </header>

      <div className="screen__scroll my-page__content">
        <div className="profile-card profile-card--account">
          <div className="profile-card__identity">
            <div className="profile-card__avatar">
              {user.photoURL && user.photoURL !== failedPhotoURL ? (
                <img
                  className="profile-card__photo"
                  src={user.photoURL}
                  alt={`${displayName}のプロフィール画像`}
                  referrerPolicy="no-referrer"
                  onError={() => setFailedPhotoURL(user.photoURL)}
                />
              ) : (
                <span aria-hidden="true">{Array.from(displayName)[0]}</span>
              )}
            </div>
            <div className="profile-card__account-details">
              <p className="profile-card__name">{displayName}</p>
              <p className="profile-card__email">{user.email || 'メールアドレス未設定'}</p>
            </div>
          </div>
          <div className="profile-card__stats">
            <div>
              <span className="my-page__stat-emoji" aria-hidden="true">🤝</span>
              <p className="profile-card__value">{stats.helpedCount}</p>
              <p className="profile-card__label">助けた</p>
            </div>
            <div>
              <span className="my-page__stat-emoji my-page__stat-emoji--warm" aria-hidden="true">❤️</span>
              <p className="profile-card__value">{stats.helpedByCount}</p>
              <p className="profile-card__label">助けてもらった</p>
            </div>
            <div>
              <span className="my-page__stat-emoji my-page__stat-emoji--warm" aria-hidden="true">⭐</span>
              <p className="profile-card__value">{ratingLabel}</p>
              <p className="profile-card__label">評価</p>
            </div>
          </div>
        </div>

        <section className="my-page__section" aria-labelledby="activity-title">
          <h2 id="activity-title">最近の活動</h2>
          <div className="my-page__cards">
            {mockConversations.length ? mockConversations.slice(0, 2).map((conversation) => (
              <Link className="my-page__card my-page__card--link" key={conversation.helpId} to={`/help/${conversation.helpId}/chat`}>
                <span className="my-page__icon" aria-hidden="true"><ChatIcon /></span>
                <div className="my-page__card-body">
                  <p className="my-page__card-title">{conversation.partner.name}とのやりとり</p>
                  <p className="my-page__description">{conversation.lastMessage}</p>
                  <p className="my-page__meta">チャット · {conversation.lastMessageTime}</p>
                </div>
                <ChevronRightIcon className="my-page__chevron" aria-hidden="true" />
              </Link>
            )) : (
              <div className="my-page__card">
                <span className="my-page__icon" aria-hidden="true"><ClockIcon /></span>
                <p className="my-page__description">まだ活動はありません</p>
              </div>
            )}
          </div>
        </section>
        <section className="my-page__section" aria-labelledby="posts-title">
          <h2 id="posts-title">自分の投稿</h2>
          {historyError && <p className="post-history__state post-history__state--error" role="alert">{historyError}</p>}
          <div className="my-page__cards">
            {isHistoryLoading ? <p className="my-page__description">投稿履歴を読み込み中です...</p> : history.length ? history.map((post) => (
              <article key={post.id}>
                <Link className="my-page__card my-page__card--link" to={`/help/${post.id}`}>
                  <span className="my-page__icon" aria-hidden="true"><ListIcon /></span>
                  <div className="my-page__card-body">
                    <p className="my-page__card-title">{post.title}</p>
                    <p className="my-page__meta">{post.category} · {post.type === 'come' ? '来てほしい' : '教えてほしい'}</p>
                    <p className="my-page__meta">{post.location} · {formatPostedAt(post.createdAt)}</p>
                    <p className="my-page__meta">{post.status === 'closed' ? '解決済み' : post.status === 'matched' ? '担当者が決まりました' : '募集中'}</p>
                  </div>
                  <ChevronRightIcon className="my-page__chevron" aria-hidden="true" />
                </Link>
                {post.status !== 'closed' && (
                  <button type="button" className="post-history__close" onClick={() => void closePost(post.id)} disabled={closingPostId !== null}>
                    {closingPostId === post.id ? '変更中...' : '解決済みにする'}
                  </button>
                )}
              </article>
            )) : !historyError && (
              <div className="my-page__card my-page__empty">
                <span className="my-page__icon" aria-hidden="true"><ListIcon /></span>
                <p className="my-page__card-title">まだ投稿はありません</p>
                <p className="my-page__description">ちょっと困ったときは、Helpを届けてみましょう。</p>
                <Link className="btn btn--outline btn--sm my-page__post-link" to="/post/new">Helpを投稿する</Link>
              </div>
            )}
          </div>
        </section>
        <section className="my-page__section" aria-labelledby="account-title">
          <h2 id="account-title">アカウント</h2>
          <button type="button" className="btn btn--outline btn--block" onClick={() => void handleLogout()} disabled={isLoggingOut}>
            {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
          </button>
          {logoutError && <p role="alert">{logoutError}</p>}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
