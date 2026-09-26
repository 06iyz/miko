import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { chatPartnerName, readChatHelp, type ChatHelp } from '../lib/chat'
import './Messages.css'

export default function Messages() {
  const { user } = useAuth()
  if (!user) return <p className="empty-state">ログインしてください。</p>
  return <ConversationList key={user.uid} uid={user.uid} />
}

function ConversationList({ uid }: { uid: string }) {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<ChatHelp[]>([])
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'helpPosts'), where('acceptedHelperUid', '==', uid)),
      (snapshot) => {
        const helps = snapshot.docs
          .map((post) => readChatHelp(post.id, post.data()))
          .filter((help) => help.status === 'matched' && help.helperUid === uid)
          .sort((a, b) => b.matchedAt - a.matchedAt || a.id.localeCompare(b.id))
        setConversations(helps)
        setLoaded(true)
        setFailed(false)
      },
      () => {
        setConversations([])
        setLoaded(true)
        setFailed(true)
      },
    )
    return unsubscribe
  }, [uid])

  return (
    <div className="screen screen--narrow">
      <header className="page-header messages-header"><h1>メッセージ</h1><p>現在、あなたが助けに向かっているHelpの会話です</p></header>
      <div className="screen__scroll messages-screen__scroll">
        {failed && <p className="empty-state" role="alert">会話の一覧を読み込めませんでした。時間をおいて開き直してください。</p>}
        {!loaded ? <p className="empty-state">読み込み中...</p>
          : !failed && conversations.length === 0 && <p className="empty-state">現在、助けに向かっているHelpはありません。</p>}
        <div className="conversation-list messages-list">
          {conversations.map((help) => {
            const partner = chatPartnerName(help, uid)
            return (
              <button key={help.id} type="button" className="conversation-item" onClick={() => navigate(`/help/${help.id}/chat`)}>
                <div className="conversation-item__body">
                  <div className="conversation-item__topline">
                    <span className="conversation-item__kind">助けに行く投稿</span>
                    <span className="conversation-item__status">助けに向かっています</span>
                  </div>
                  <p className="conversation-item__title">{help.title}</p>
                  <p className="conversation-item__partner">相手：{partner}</p>
                </div>
                <span className="conversation-item__arrow" aria-hidden="true">›</span>
              </button>
            )
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
