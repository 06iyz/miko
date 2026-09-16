import { useNavigate } from 'react-router-dom'
import { mockConversations } from '../data/mockHelps'
import BottomNav from '../components/BottomNav'

export default function Messages() {
  const navigate = useNavigate()

  return (
    <div className="screen screen--narrow">
      <header className="page-header">
        <h1>メッセージ</h1>
      </header>

      <div className="screen__scroll">
        {mockConversations.length === 0 && (
          <p className="empty-state">まだメッセージはありません。</p>
        )}
        <div className="conversation-list">
          {mockConversations.map((c) => (
            <button
              key={c.helpId}
              type="button"
              className="conversation-item"
              onClick={() => navigate(`/help/${c.helpId}/chat`)}
            >
              <div className="conversation-item__avatar" aria-hidden="true">
                {c.partner.name.slice(0, 1)}
              </div>
              <div className="conversation-item__body">
                <p className="conversation-item__name">{c.partner.name}</p>
                <p className="conversation-item__preview">{c.lastMessage}</p>
              </div>
              <span className="conversation-item__time">{c.lastMessageTime}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
