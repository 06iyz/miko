import { useNavigate, useParams } from 'react-router-dom'
import { mockHelps } from '../data/mockHelps'
import TopBar from '../components/TopBar'
import HelpTag from '../components/HelpTag'
import { LocationIcon } from '../components/icons'

export default function HelpDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const help = mockHelps.find((h) => h.id === id) ?? mockHelps[0]
  const walkMinutes = Math.max(1, Math.round(help.distanceM / 80))

  return (
    <div className="screen screen--narrow">
      <TopBar title="Helpの詳細" />

      <div className="screen__scroll">
        <div className="detail-thumb" aria-hidden="true">
          🪜
        </div>

        <div className="detail-body">
          <HelpTag type={help.type} />
          <p className="detail-time">{help.postedMinutesAgo}分前</p>
          <h2 className="detail-title">{help.title}</h2>
          <p className="detail-desc">{help.description}</p>

          <div className="detail-location">
            <LocationIcon />
            <div>
              <p>{help.location}</p>
              <p className="detail-location__sub">
                {help.distanceM}m先（徒歩約{walkMinutes}分）
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="screen__footer screen__footer--stacked">
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => navigate(`/help/${help.id}/chat`)}
        >
          助ける
        </button>
        <button
          type="button"
          className="btn btn--outline btn--block"
          onClick={() => navigate(`/help/${help.id}/chat`)}
        >
          チャットする
        </button>
      </div>
    </div>
  )
}
