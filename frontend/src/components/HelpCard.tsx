import { useNavigate } from 'react-router-dom'
import type { HelpPost } from '../types'
import HelpTag from './HelpTag'

const categoryEmoji: Record<HelpPost['category'], string> = {
  移動: '🚶',
  案内: '🧭',
  子育て: '🍼',
  荷物: '🧳',
  言葉: '💬',
  その他: '❓',
}

export default function HelpCard({ help }: { help: HelpPost }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className="help-card"
      onClick={() => navigate(`/help/${help.id}`)}
    >
      <div className="help-card__thumb" aria-hidden="true">
        {categoryEmoji[help.category]}
      </div>
      <div className="help-card__body">
        <p className="help-card__title">{help.title}</p>
        <p className="help-card__meta">
          {help.distanceM}m先・{help.postedMinutesAgo}分前
        </p>
      </div>
      <HelpTag type={help.type} />
    </button>
  )
}
