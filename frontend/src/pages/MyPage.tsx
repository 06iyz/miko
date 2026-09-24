import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { collection, doc, onSnapshot, query, Timestamp, where } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { auth, db } from '../lib/firebase'
import { closePostAndRecordHelpedBy, emptyUserStats, readUserStats, type UserStats } from '../lib/userProfile'
import BottomNav from '../components/BottomNav'
import {
  BellIcon,
  ChevronRightIcon,
  ClockIcon,
  HeartIcon,
  ListIcon,
  QuestionIcon,
  SettingsIcon,
} from '../components/icons'

const menuItems = [
  { label: '助けた履歴', Icon: ClockIcon },
  { label: 'お気に入り', Icon: HeartIcon },
  { label: 'お知らせ', Icon: BellIcon },
  { label: '設定', Icon: SettingsIcon },
  { label: 'ヘルプ', Icon: QuestionIcon },
]

type HistoryPost = {
  id: string
  title: string
  category: string
  type: 'come' | 'teach'
  location: string
  status: 'open' | 'closed'
  createdAt: Timestamp | null
}

function formatPostedAt(createdAt: Timestamp | null) {
  if (!createdAt) return 'たった今'
  return new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(createdAt.toDate())
}

export default function MyPage() {
  const { user, loading } = useAuth()
  const [failedPhotoURL, setFailedPhotoURL] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'history' | 'account'>('history')
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
          status: data.status === 'closed' ? 'closed' : 'open',
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
    <div className="screen screen--narrow">
      <header className="page-header page-header--with-action">
        <h1>マイページ</h1>
        <button type="button" className="icon-btn" aria-label="設定">
          <SettingsIcon />
        </button>
      </header>

      <div className="screen__scroll">
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
              <p className="profile-card__value">{stats.helpedCount}</p>
              <p className="profile-card__label">助けた</p>
            </div>
            <div>
              <p className="profile-card__value">{stats.helpedByCount}</p>
              <p className="profile-card__label">助けられた</p>
            </div>
            <div>
              <p className="profile-card__value">{ratingLabel}</p>
              <p className="profile-card__label">評価</p>
            </div>
          </div>
        </div>

        <div className="mypage-tabs" role="tablist" aria-label="マイページの表示内容">
          <button type="button" role="tab" aria-selected={activeTab === 'history'} className={activeTab === 'history' ? 'is-active' : ''} onClick={() => setActiveTab('history')}>投稿履歴</button>
          <button type="button" role="tab" aria-selected={activeTab === 'account'} className={activeTab === 'account' ? 'is-active' : ''} onClick={() => setActiveTab('account')}>アカウント</button>
        </div>

        {activeTab === 'history' ? (
          <section className="post-history" aria-label="投稿履歴">
            <div className="post-history__heading">
              <div><h2>あなたの投稿</h2><p>投稿後もここから内容を確認できます。</p></div>
              <span>{history.length}件</span>
            </div>
            {isHistoryLoading ? <p className="post-history__state">投稿履歴を読み込み中です...</p> : historyError ? <p className="post-history__state post-history__state--error">{historyError}</p> : history.length === 0 ? (
              <div className="post-history__empty"><ListIcon /><p>まだ投稿はありません</p><span>困ったときは、ここからいつでも投稿できます。</span></div>
            ) : (
              <div className="post-history__list">
                {history.map((post) => (
                  <article key={post.id} className="post-history__item">
                    <div className="post-history__item-top"><span className="post-history__category">{post.category}</span><span className={`post-history__status post-history__status--${post.status}`}>{post.status === 'open' ? '募集中' : '解決済み'}</span></div>
                    <h3>{post.title}</h3>
                    <p className="post-history__meta">{post.type === 'come' ? '来てほしい' : '教えてほしい'} ・ {post.location}</p>
                    <time>{formatPostedAt(post.createdAt)}</time>
                    {post.status === 'open' && <button type="button" className="post-history__close" onClick={() => void closePost(post.id)} disabled={closingPostId === post.id}>{closingPostId === post.id ? '変更中...' : '解決済みにする'}</button>}
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="menu-list">
            {menuItems.map(({ label, Icon }) => (
              <button key={label} type="button" className="menu-list__item">
                <Icon />
                <span>{label}</span>
                <ChevronRightIcon className="menu-list__chevron" />
              </button>
            ))}
            <button
              type="button"
              className="btn btn--outline btn--block"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
            {logoutError && <p role="alert">{logoutError}</p>}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
