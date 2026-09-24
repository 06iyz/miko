import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mockConversations, mockHelps, mockUser } from '../data/mockHelps'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'
import {
  ChatIcon,
  ChevronRightIcon,
  ClockIcon,
  ListIcon,
} from '../components/icons'

import './MyPage.css'

export default function MyPage() {
  const { user, loading } = useAuth()
  const [failedPhotoURL, setFailedPhotoURL] = useState<string | null>(null)

  if (loading) return <p>読み込み中...</p>
  if (!user) return <p>ログインしてください</p>

  const displayName = user.displayName || '名前未設定'
  const myPosts = mockHelps.filter((help) => help.author.id === user.uid)

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
              <p className="profile-card__value">{mockUser.helpedCount}</p>
              <p className="profile-card__label">助けた</p>
            </div>
            <div>
              <span className="my-page__stat-emoji my-page__stat-emoji--warm" aria-hidden="true">❤️</span>
              <p className="profile-card__value">{mockUser.helpedByCount}</p>
              <p className="profile-card__label">助けてもらった</p>
            </div>
            <div>
              <span className="my-page__stat-emoji my-page__stat-emoji--warm" aria-hidden="true">⭐</span>
              <p className="profile-card__value">{mockUser.rating.toFixed(1)}</p>
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
          <div className="my-page__cards">
            {myPosts.length ? myPosts.map((post) => (
              <Link className="my-page__card my-page__card--link" key={post.id} to={`/help/${post.id}`}>
                <span className="my-page__icon" aria-hidden="true"><ListIcon /></span>
                <div className="my-page__card-body">
                  <p className="my-page__card-title">{post.title}</p>
                  <p className="my-page__meta">{post.location} · {post.postedMinutesAgo}分前</p>
                </div>
                <ChevronRightIcon className="my-page__chevron" aria-hidden="true" />
              </Link>
            )) : (
              <div className="my-page__card my-page__empty">
                <span className="my-page__icon" aria-hidden="true"><ListIcon /></span>
                <p className="my-page__card-title">まだ投稿はありません</p>
                <p className="my-page__description">ちょっと困ったときは、Helpを届けてみましょう。</p>
                <Link className="btn btn--outline btn--sm my-page__post-link" to="/post/new">Helpを投稿する</Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
