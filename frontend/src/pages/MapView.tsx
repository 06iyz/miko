import BottomNav from '../components/BottomNav'
import { FilterIcon, LocationIcon, SearchIcon } from '../components/icons'

export default function MapView() {
  return (
    <div className="screen">
      <div className="map-search">
        <div className="map-search__box">
          <SearchIcon width={18} height={18} />
          <input placeholder="現在地付近のHelpを探す" readOnly />
        </div>
        <button type="button" className="icon-btn" aria-label="絞り込み" disabled>
          <FilterIcon />
        </button>
      </div>

      <div className="map-canvas map-canvas--empty">
        <div className="map-canvas__you" aria-hidden="true">
          <LocationIcon />
        </div>
        <p>地図に表示するHelpはまだありません</p>
      </div>

      <div className="map-preview">
        <p className="map-preview__title">投稿があると地図に表示されます</p>
        <p className="map-preview__meta">テスト投稿を作成すると、実際のデータだけを確認できます。</p>
      </div>

      <BottomNav />
    </div>
  )
}
