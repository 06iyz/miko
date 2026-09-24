import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { canReadChat, chatPartnerName, readChatHelp, type ChatHelp } from '../lib/chat'

export default function Messages() {
  const { user } = useAuth()
  if (!user) return <p className="empty-state">ログインしてください。</p>
  return <ConversationList key={user.uid} uid={user.uid} />
}

function ConversationList({ uid }: { uid: string }) {
  const navigate = useNavigate()
  const [authored, setAuthored] = useState<ChatHelp[]>([])
  const [accepted, setAccepted] = useState<ChatHelp[]>([])
  const [loaded, setLoaded] = useState({ author: false, helper: false })
  const [errors, setErrors] = useState({ author: false, helper: false })

  useEffect(() => {
    // 単一フィールドのクエリを2つ使い、投稿者・担当者双方の会話を取得する。
    const unsubscribe = ([['author', 'authorUid'], ['helper', 'acceptedHelperUid']] as const).map(([role, field]) => (
      onSnapshot(query(collection(db, 'helpPosts'), where(field, '==', uid)), (snapshot) => {
        const helps = snapshot.docs.map((post) => readChatHelp(post.id, post.data())).filter((help) => canReadChat(help, uid))
        if (role === 'author') setAuthored(helps)
        else setAccepted(helps)
        setLoaded((previous) => ({ ...previous, [role]: true }))
        setErrors((previous) => ({ ...previous, [role]: false }))
      }, () => {
        if (role === 'author') setAuthored([])
        else setAccepted([])
        setLoaded((previous) => ({ ...previous, [role]: true }))
        setErrors((previous) => ({ ...previous, [role]: true }))
      })
    ))
    return () => unsubscribe.forEach((stop) => stop())
  }, [uid])

  const loading = !loaded.author || !loaded.helper
  const failed = errors.author || errors.helper
  const conversations = [...new Map([...authored, ...accepted].map((help) => [help.id, help])).values()]
    .sort((a, b) => b.matchedAt - a.matchedAt || a.id.localeCompare(b.id))

  return (
    <div className="screen screen--narrow">
      <header className="page-header"><h1>メッセージ</h1></header>
      <div className="screen__scroll">
        {failed && <p className="empty-state" role="alert">会話の一覧を読み込めませんでした。時間をおいて開き直してください。</p>}
        {loading ? <p className="empty-state">読み込み中...</p>
          : !failed && conversations.length === 0 && <p className="empty-state">まだ会話はありません。「助けに行く」で担当者が決まると、ここに表示されます。</p>}
        <div className="conversation-list">
          {conversations.map((help) => {
            const partner = chatPartnerName(help, uid)
            return (
              <button key={help.id} type="button" className="conversation-item" onClick={() => navigate(`/help/${help.id}/chat`)}>
                <div className="conversation-item__avatar" aria-hidden="true">{Array.from(partner)[0]}</div>
                <div className="conversation-item__body">
                  <p className="conversation-item__name">{partner}</p>
                  <p className="conversation-item__preview">{help.title}</p>
                </div>
                <span className="conversation-item__time">{help.status === 'closed' ? '解決済み' : 'チャット'}</span>
              </button>
            )
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
