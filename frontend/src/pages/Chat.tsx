import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackIcon, ImageIcon, SendIcon } from '../components/icons'
import type { ChatMessage } from '../types'

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')

  const handleSend = () => {
    if (!draft.trim()) return
    setMessages((previous) => [
      ...previous,
      {
        id: `local-${previous.length}`,
        sender: 'me',
        text: draft.trim(),
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setDraft('')
  }

  return (
    <div className="screen screen--narrow">
      <header className="chat-header">
        <button type="button" className="top-bar__icon-btn" onClick={() => navigate(-1)} aria-label="戻る">
          <BackIcon />
        </button>
        <div className="chat-header__info">
          <p className="chat-header__name">メッセージ</p>
          <p className="chat-header__subtitle">まだメッセージはありません</p>
        </div>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => navigate(id ? `/help/${id}/resolve` : '/home')}>
          解決済み
        </button>
      </header>

      <div className="chat-thread">
        {messages.length === 0 && <p className="empty-state">まだメッセージはありません。</p>}
        {messages.map((message) => (
          <div key={message.id} className={`chat-bubble-row chat-bubble-row--${message.sender}`}>
            <div className="chat-bubble">
              {message.text.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            <span className="chat-bubble-row__time">{message.time}</span>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <button type="button" className="icon-btn" aria-label="画像を選ぶ" disabled>
          <ImageIcon />
        </button>
        <input
          placeholder="メッセージを入力…"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
        />
        <button type="button" className="icon-btn icon-btn--accent" aria-label="送信" onClick={handleSend}>
          <SendIcon />
        </button>
      </div>
    </div>
  )
}
