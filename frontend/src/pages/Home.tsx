import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import HelpCard from '../components/HelpCard'
import BottomNav from '../components/BottomNav'
import { BellIcon, UserIcon } from '../components/icons'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import type { HelpCategory, HelpPost } from '../types'

const tabs = ['近くのHelp', 'みんなの投稿', 'フォロー'] as const

export default function Home() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0])
  const [liveHelps, setLiveHelps] = useState<HelpPost[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const helpsQuery = query(collection(db, 'helpPosts'), where('status', '==', 'open'))
    return onSnapshot(helpsQuery, (snapshot) => {
      const posts = snapshot.docs
        .filter((post) => post.data().authorUid !== user?.uid)
        .map((post) => {
          const data = post.data()
          const createdAt = data.createdAt?.toDate?.()
          const minutes = createdAt instanceof Date ? Math.max(0, Math.round((Date.now() - createdAt.getTime()) / 60000)) : 0
          return {
            id: post.id,
            title: typeof data.title === 'string' ? data.title : '投稿内容',
            description: typeof data.description === 'string' ? data.description : '',
            category: data.category as HelpCategory,
            type: (data.type === 'teach' ? 'teach' : 'come') as HelpPost['type'],
            distanceM: 0,
            postedMinutesAgo: minutes,
            location: '詳しい場所は、助ける人にのみ共有されます',
            author: { id: typeof data.authorUid === 'string' ? data.authorUid : '', name: typeof data.authorName === 'string' ? data.authorName : '投稿者' },
          }
        })
      setLiveHelps(posts)
    }, () => setLiveHelps([]))
  }, [user?.uid])

  // 見本データを混ぜず、Firestore の実投稿だけを表示する。
  const helps = liveHelps

  return (
    <div className="screen">
      <header className="home-header">
        <h1 className="home-header__logo">Help5</h1>
        <button type="button" className="icon-btn" aria-label="通知">
          <BellIcon />
        </button>
      </header>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tabs__item${tab === activeTab ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="screen__scroll">
        <div className="near-banner">
          <span className="near-banner__icon">
            <UserIcon />
          </span>
          <p>
            今、近くで<strong>{helps.length}人</strong>がHelp中
          </p>
        </div>

        {helps.length === 0 ? (
          <p className="empty-state">まだ近くのHelpはありません。投稿されると、ここに表示されます。</p>
        ) : (
          <div className="help-list">
            {helps.map((help) => (
              <HelpCard key={help.id} help={help} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
