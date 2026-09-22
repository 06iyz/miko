import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockConversations, mockHelps } from '../data/mockHelps'
import { StarIcon } from '../components/icons'
import { useAuth } from '../contexts/AuthContext'
import { recordHelped } from '../lib/userProfile'

export default function Resolve() {
  const { id } = useParams()
  const navigate = useNavigate()
  const help = mockHelps.find((h) => h.id === id) ?? mockHelps[0]
  const conversation = mockConversations.find((c) => c.helpId === id) ?? mockConversations[0]
  const { user } = useAuth()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSending, setIsSending] = useState(false)

  const sendResolution = async () => {
    if (isSending) return
    setIsSending(true)
    try {
      if (user) await recordHelped(user.uid, help.id)
      navigate('/home')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="screen screen--narrow resolve-screen">
      <div className="screen__scroll resolve-body">
        <div className="resolve-confetti" aria-hidden="true">
          🎉
        </div>
        <h1>Helpが解決しました！</h1>
        <p className="resolve-sub">
          助け合い、ありがとうございました。
          <br />
          よろしければ評価をお願いします。
        </p>

        <div className="resolve-avatar" aria-hidden="true">
          {conversation.partner.name.slice(0, 1)}
        </div>
        <p className="resolve-name">{conversation.partner.name}</p>
        <p className="resolve-help-title">{help.title}</p>

        <div className="resolve-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n}つ星`}
              onClick={() => setRating(n)}
              className="resolve-stars__btn"
            >
              <StarIcon filled={n <= rating} />
            </button>
          ))}
        </div>

        <textarea
          className="resolve-comment"
          placeholder="コメントを入力（任意）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="screen__footer screen__footer--stacked">
        <button type="button" className="btn btn--primary btn--block" onClick={() => void sendResolution()} disabled={isSending}>
          {isSending ? '送信中...' : '送信する'}
        </button>
        <button type="button" className="btn btn--text" onClick={() => navigate('/home')}>
          あとで
        </button>
      </div>
    </div>
  )
}
