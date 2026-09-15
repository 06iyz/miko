import { mockUser } from '../data/mockHelps'
import BottomNav from '../components/BottomNav'
import {
  BellIcon,
  ChevronRightIcon,
  ClockIcon,
  HeartIcon,
  ListIcon,
  QuestionIcon,
  SettingsIcon,
} from '../components/icons'

const menuItems = [
  { label: '自分の投稿', Icon: ListIcon },
  { label: '助けた履歴', Icon: ClockIcon },
  { label: 'お気に入り', Icon: HeartIcon },
  { label: 'お知らせ', Icon: BellIcon },
  { label: '設定', Icon: SettingsIcon },
  { label: 'ヘルプ', Icon: QuestionIcon },
]

export default function MyPage() {
  return (
    <div className="screen screen--narrow">
      <header className="page-header page-header--with-action">
        <h1>マイページ</h1>
        <button type="button" className="icon-btn" aria-label="設定">
          <SettingsIcon />
        </button>
      </header>

      <div className="screen__scroll">
        <div className="profile-card">
          <div className="profile-card__avatar" aria-hidden="true">
            {mockUser.name.slice(0, 1)}
          </div>
          <div className="profile-card__stats">
            <div>
              <p className="profile-card__value">{mockUser.helpedCount}</p>
              <p className="profile-card__label">助けた</p>
            </div>
            <div>
              <p className="profile-card__value">{mockUser.helpedByCount}</p>
              <p className="profile-card__label">助けられた</p>
            </div>
            <div>
              <p className="profile-card__value">{mockUser.rating.toFixed(1)}</p>
              <p className="profile-card__label">評価</p>
            </div>
          </div>
        </div>

        <div className="menu-list">
          {menuItems.map(({ label, Icon }) => (
            <button key={label} type="button" className="menu-list__item">
              <Icon />
              <span>{label}</span>
              <ChevronRightIcon className="menu-list__chevron" />
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
