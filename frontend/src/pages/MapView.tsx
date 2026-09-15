import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockHelps } from '../data/mockHelps'
import BottomNav from '../components/BottomNav'
import HelpTag from '../components/HelpTag'
import { FilterIcon, LocationIcon, SearchIcon } from '../components/icons'

const pinPositions = [
  { top: '28%', left: '58%' },
  { top: '46%', left: '30%' },
  { top: '62%', left: '68%' },
]

export default function MapView() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(mockHelps[0].id)
  const selected = mockHelps.find((h) => h.id === selectedId) ?? mockHelps[0]

  return (
    <div className="screen">
      <div className="map-search">
        <div className="map-search__box">
          <SearchIcon width={18} height={18} />
          <input placeholder="現在地周辺のHelpを探す" readOnly />
        </div>
        <button type="button" className="icon-btn" aria-label="絞り込み">
          <FilterIcon />
        </button>
      </div>

      <div className="map-canvas">
        <div className="map-canvas__you">
          <LocationIcon />
        </div>
        {mockHelps.map((help, i) => (
          <button
            key={help.id}
            type="button"
            className={`map-pin${help.id === selectedId ? ' is-selected' : ''}`}
            style={pinPositions[i]}
            onClick={() => setSelectedId(help.id)}
            aria-label={help.title}
          >
            📍
          </button>
        ))}
      </div>

      <div className="map-preview">
        <p className="map-preview__title">{selected.title}</p>
        <p className="map-preview__meta">
          {selected.distanceM}m先・{selected.postedMinutesAgo}分前
        </p>
        <HelpTag type={selected.type} />
        <div className="map-preview__actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => navigate(`/help/${selected.id}`)}
          >
            詳細を見る
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate(`/help/${selected.id}`)}
          >
            助ける
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
