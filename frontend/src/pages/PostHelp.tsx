import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import type { HelpCategory, HelpType } from '../types'
import { LocationIcon } from '../components/icons'

const categories: HelpCategory[] = ['移動', '案内', '子育て', '荷物', '言葉', 'その他']
const MAX_LENGTH = 200

export default function PostHelp() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<HelpCategory>('移動')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<HelpType>('come')

  const canSubmit = description.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    navigate('/home')
  }

  return (
    <div className="screen screen--narrow">
      <TopBar title="Helpを投稿する" onClose />

      <div className="screen__scroll post-form">
        <p className="post-form__label">どんなことで困っていますか？</p>
        <div className="chip-group">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${c === category ? ' is-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <textarea
          className="post-form__textarea"
          placeholder="例）ベビーカーを階段で運ぶのを&#10;手伝ってほしいです。駅の南口にいます。"
          maxLength={MAX_LENGTH}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="post-form__count">
          {description.length}/{MAX_LENGTH}
        </p>

        <p className="post-form__label">助けてほしい内容</p>
        <div className="type-select">
          <button
            type="button"
            className={`type-select__option type-select__option--come${type === 'come' ? ' is-active' : ''}`}
            onClick={() => setType('come')}
          >
            来てほしい
            <span>（現地でのサポート）</span>
          </button>
          <button
            type="button"
            className={`type-select__option type-select__option--teach${type === 'teach' ? ' is-active' : ''}`}
            onClick={() => setType('teach')}
          >
            教えてほしい
            <span>（チャットでの回答）</span>
          </button>
        </div>

        <button type="button" className="location-row">
          <LocationIcon />
          <span>現在地</span>
          <span className="location-row__value">神戸市中央区三宮町1丁目</span>
        </button>
      </div>

      <div className="screen__footer">
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          投稿する
        </button>
      </div>
    </div>
  )
}
