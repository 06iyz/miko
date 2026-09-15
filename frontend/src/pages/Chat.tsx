import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockConversations, mockHelps } from '../data/mockHelps'
import { BackIcon, ImageIcon, SendIcon } from '../components/icons'
import type { ChatMessage } from '../types'

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const help = mockHelps.find((h) => h.id === id) ?? mockHelps[0]
  const conversation = mockConversations.find((c) => c.helpId === id) ?? mockConversations[0]

  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages)
  const [draft, setDraft] = useState('')

  const handleSend = () => {
    if (!draft.trim()) return
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${prev.length}`,
        sender: 'me',
        text: draft,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setDraft('')
  }

  return (
    <div className="screen">
      <header className="chat-header">
        <button type="button" className="top-bar__icon-btn" onClick={() => navigate(-1)} aria-label="戻る">
          <BackIcon />
        </button>
        <div className="chat-header__info">
          <p className="chat-header__name">{conversation.partner.name}</p>
          <p className="chat-header__subtitle">{help.title}</p>
        </div>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => navigate(`/help/${help.id}/resolve`)}>
          解決する
        </button>
      </header>

      <div className="chat-thread">
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble-row chat-bubble-row--${m.sender}`}>
            <div className="chat-bubble">
              {m.text.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            <span className="chat-bubble-row__time">{m.time}</span>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <button type="button" className="icon-btn" aria-label="画像を送る">
          <ImageIcon />
        </button>
        <input
          placeholder="メッセージを入力..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button type="button" className="icon-btn icon-btn--accent" aria-label="送信" onClick={handleSend}>
          <SendIcon />
        </button>
      </div>
    </div>
  )
}
