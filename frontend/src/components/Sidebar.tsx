import { NavLink } from 'react-router-dom'
import { ChatIcon, HomeIcon, MapIcon, PlusCircleIcon, UserIcon } from './icons'

const items = [
  { to: '/home', label: 'ホーム', Icon: HomeIcon },
  { to: '/map', label: '地図', Icon: MapIcon },
  { to: '/post/new', label: '投稿', Icon: PlusCircleIcon },
  { to: '/messages', label: 'メッセージ', Icon: ChatIcon },
  { to: '/mypage', label: 'マイページ', Icon: UserIcon },
]

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <p className="sidebar__logo">Nearu</p>
      <div className="sidebar__items">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }: { isActive: boolean }) =>
              `sidebar__item${isActive ? ' is-active' : ''}`
            }
          >
            <Icon width={20} height={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
