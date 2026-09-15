import { useState } from 'react'
import { mockHelps } from '../data/mockHelps'
import HelpCard from '../components/HelpCard'
import BottomNav from '../components/BottomNav'
import { BellIcon, UserIcon } from '../components/icons'

const tabs = ['近くのHelp', 'みんなの投稿', 'フォロー'] as const

export default function Home() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0])

  return (
    <div className="screen">
      <header className="home-header">
        <h1 className="home-header__logo">Help5</h1>
        <button type="button" className="icon-btn" aria-label="通知">
          <BellIcon />
        </button>
      </header>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tabs__item${tab === activeTab ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="screen__scroll">
        <div className="near-banner">
          <span className="near-banner__icon">
            <UserIcon />
          </span>
          <p>
            今、近くで<strong>3人</strong>がHelp中
          </p>
        </div>

        <div className="help-list">
          {mockHelps.map((help) => (
            <HelpCard key={help.id} help={help} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
