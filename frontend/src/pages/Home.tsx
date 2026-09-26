import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import HelpCard from '../components/HelpCard'
import BottomNav from '../components/BottomNav'
import { ChevronRightIcon, LocationIcon, UserIcon } from '../components/icons'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import type { HelpCategory, HelpPost } from '../types'
import nearuLogo from '../assets/nearu-logo.png'
import './Home.css'

type LivePost = HelpPost & { createdAtMs: number }

export default function Home() {
  const [posts, setPosts] = useState<LivePost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const { user } = useAuth()

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const helpsQuery = query(collection(db, 'helpPosts'), where('status', '==', 'open'))
    return onSnapshot(helpsQuery, (snapshot) => {
      setPosts(snapshot.docs.filter((post) => post.data().authorUid !== user?.uid).map((post): LivePost => {
        const data = post.data()
        return {
          id: post.id,
          title: typeof data.title === 'string' ? data.title : '投稿内容',
          description: typeof data.description === 'string' ? data.description : '',
          category: (data.category || 'その他') as HelpCategory,
          type: data.type === 'teach' ? 'teach' : 'come',
          imageUrl: typeof data.imageUrl === 'string' && /^https:\/\//.test(data.imageUrl)
            ? data.imageUrl
            : Array.isArray(data.imageUrls) && typeof data.imageUrls[0] === 'string' ? data.imageUrls[0] : undefined,
          distanceM: 0,
          postedMinutesAgo: 0,
          createdAtMs: data.createdAt?.toMillis?.() ?? Date.now(),
          location: '詳しい場所は投稿詳細で確認できます',
          author: { id: data.authorUid ?? '', name: data.authorName ?? '投稿者' },
        }
      }).sort((a, b) => b.createdAtMs - a.createdAtMs))
      setNow(Date.now())
      setLoading(false)
    }, () => { setError('投稿を読み込めませんでした。接続を確認して再読み込みしてください。'); setLoading(false) })
  }, [user?.uid])

  const helps = posts.map((post) => ({ ...post, postedMinutesAgo: Math.max(0, Math.floor((now - post.createdAtMs) / 60000)) }))

  return (
    <div className="screen home-screen">
      <div className="home-content">
        <header className="home-header">
          <h1 className="home-brand">
            <img
              src={nearuLogo}
              alt="Nearu"
            />
          </h1>
          <Link className="home-profile" to="/mypage" aria-label="マイページを開く"><UserIcon /></Link>
        </header>
        <section className="home-intro"><p>あなたの「ちょっと」が、誰かの助けに。</p><h2>近くの、助けあい。</h2></section>
        <div className="home-tabs"><span className="is-active">近くのヘルプ</span></div>
        <main className="home-feed">
          <Link className="home-near" to="/map">
            <span className="home-near__icon"><LocationIcon /></span>
            <span><strong>{loading ? 'ヘルプを探しています' : `今、${new Set(helps.map((post) => post.author.id)).size}人がヘルプ中`}</strong><small>地図を開いて、助けあいを見つけよう</small></span>
            <ChevronRightIcon />
          </Link>
          <div className="home-feed__heading"><h2>助けを待っている人</h2><span>{helps.length}件</span></div>
          <p className="home-note">距離は現在未取得のため、募集中の投稿を新しい順に表示しています。</p>
          {error && <p className="home-status" role="alert">{error}</p>}
          {loading ? <div className="home-status" role="status">投稿を読み込んでいます…</div> : helps.length ? <div className="home-cards">{helps.map((help) => <HelpCard key={help.id} help={help} />)}</div> : !error && <div className="home-empty"><span className="home-empty__mark"><UserIcon width={30} height={30} /></span><h3>今は募集中のヘルプがありません</h3><p>困ったことがあれば、小さなことでも。あなたの声を、近くの誰かに届けましょう。</p><Link to="/post/new">ヘルプを投稿する <ChevronRightIcon width={16} /></Link></div>}
          <p className="home-footnote">できるときに、できることを。</p>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
