import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, onSnapshot, query, setDoc, where, arrayUnion, arrayRemove } from 'firebase/firestore'
import HelpCard from '../components/HelpCard'
import BottomNav from '../components/BottomNav'
import { ChevronRightIcon, LocationIcon, UserIcon } from '../components/icons'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import type { HelpCategory, HelpPost } from '../types'
import './Home.css'

const tabs = ['近くのヘルプ', 'みんなの投稿', 'フォローする'] as const
type LivePost = HelpPost & { createdAtMs: number }

export default function Home() {
  const [posts, setPosts] = useState<LivePost[]>([])
  const [tab, setTab] = useState<typeof tabs[number]>('近くのヘルプ')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [following, setFollowing] = useState<string[]>([])
  const [followBusy, setFollowBusy] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const { user } = useAuth()

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!user) return
    return onSnapshot(doc(db, 'userProfiles', user.uid), (snapshot) => {
      const ids: unknown = snapshot.data()?.followedAuthorIds
      setFollowing(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [])
    }, () => setError('フォロー情報を読み込めませんでした。再読み込みしてください。'))
  }, [user])

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
          imageUrl: typeof data.imageUrl === 'string' && /^https:\/\//.test(data.imageUrl) ? data.imageUrl : undefined,
          distanceM: 0,
          postedMinutesAgo: 0,
          createdAtMs: data.createdAt?.toMillis?.() ?? Date.now(),
          location: '詳しい場所は、助ける人にのみ共有されます',
          author: { id: data.authorUid ?? '', name: data.authorName ?? '投稿者' },
        }
      }).sort((a, b) => b.createdAtMs - a.createdAtMs))
      setNow(Date.now())
      setLoading(false)
    }, () => { setError('投稿を読み込めませんでした。接続を確認して再読み込みしてください。'); setLoading(false) })
  }, [user?.uid])

  async function toggleFollow(id: string) {
    if (!user || followBusy) return
    setFollowBusy(true)
    try {
      await setDoc(doc(db, 'userProfiles', user.uid), { followedAuthorIds: following.includes(id) ? arrayRemove(id) : arrayUnion(id) }, { merge: true })
    } catch { setError('フォローを保存できませんでした。もう一度お試しください。') }
    finally { setFollowBusy(false) }
  }

  const helps = posts.map((post) => ({ ...post, postedMinutesAgo: Math.max(0, Math.floor((now - post.createdAtMs) / 60000)) }))
  const authors = [...new Map(helps.map((post) => [post.author.id, post.author])).values()]
  const visible = tab === 'フォローする' ? helps.filter((post) => following.includes(post.author.id)) : helps

  return (
    <div className="screen home-screen">
      <div className="home-content">
        <header className="home-header">
          <h1 className="home-brand">Nearu</h1>
          <Link className="home-profile" to="/mypage" aria-label="マイページを開く"><UserIcon /></Link>
        </header>
        <section className="home-intro"><p>あなたの「ちょっと」が、誰かの助けに。</p><h2>近くの、助けあい。</h2></section>
        <div className="home-tabs" aria-label="投稿の表示切り替え">
          {tabs.map((item) => <button key={item} type="button" aria-pressed={tab === item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>)}
        </div>
        <main className="home-feed">
          <Link className="home-near" to="/map">
            <span className="home-near__icon"><LocationIcon /></span>
            <span><strong>{loading ? 'ヘルプを探しています' : `今、${new Set(helps.map((post) => post.author.id)).size}人がヘルプ中`}</strong><small>地図を開いて、助けあいを見つけよう</small></span>
            <ChevronRightIcon />
          </Link>
          <div className="home-feed__heading"><h2>{tab === 'フォローする' ? 'フォロー中の投稿' : tab === 'みんなの投稿' ? 'みんなのヘルプ' : '助けを待っている人'}</h2><span>{visible.length}件</span></div>
          {tab === '近くのヘルプ' && <p className="home-note">距離は現在未取得のため、募集中の投稿を新しい順に表示しています。</p>}
          {error && <p className="home-status" role="alert">{error}</p>}
          {tab === 'フォローする' && authors.length > 0 && <div className="home-follow-list">{authors.map((author) => <div key={author.id}><span>{author.name}</span><button type="button" disabled={followBusy} aria-pressed={following.includes(author.id)} onClick={() => void toggleFollow(author.id)}>{following.includes(author.id) ? 'フォロー中' : 'フォローする'}</button></div>)}</div>}
          {loading ? <div className="home-status" role="status">投稿を読み込んでいます…</div> : visible.length ? <div className="home-cards">{visible.map((help) => <HelpCard key={help.id} help={help} />)}</div> : !error && <div className="home-empty"><span className="home-empty__mark"><UserIcon width={30} height={30} /></span><h3>{tab === 'フォローする' ? '気になる人をフォローしよう' : '今は募集中のヘルプがありません'}</h3><p>{tab === 'フォローする' ? 'フォローした人の新しい投稿を、ここで確認できます。' : '困ったことがあれば、小さなことでも。あなたの声を、近くの誰かに届けましょう。'}</p><Link to="/post/new">ヘルプを投稿する <ChevronRightIcon width={16} /></Link></div>}
          <p className="home-footnote">できるときに、できることを。</p>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
