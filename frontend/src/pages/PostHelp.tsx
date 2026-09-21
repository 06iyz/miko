import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import type { HelpCategory, HelpType } from '../types'
import { LocationIcon, SearchIcon, SendIcon } from '../components/icons'
import { useAuth } from '../contexts/AuthContext'
import { createHelpPost } from '../lib/helpPosts'
import './PostHelp.css'

const categories: Array<{ value: HelpCategory; icon: string }> = [
  { value: '移動', icon: '🚗' },
  { value: '案内', icon: 'ⓘ' },
  { value: '子育て', icon: '♧' },
  { value: '荷物', icon: '□' },
  { value: '言葉', icon: '◯' },
  { value: 'その他', icon: '•••' },
]

const examples = [
  'ベビーカーを駅の階段で運ぶのを手伝ってほしいです。',
  '近くのバス停までの行き方を教えてください。',
  '重い荷物を一緒に持ってくれる方を探しています。',
]

const MAX_LENGTH = 200
const location = '神戸市中央区三宮町１丁目'

export default function PostHelp() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<HelpCategory>('移動')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<HelpType>('come')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const canSubmit = description.trim().length > 0
  const displayName = user?.displayName || 'ゲスト'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || !user || isSubmitting) return

    setIsSubmitting(true)
    setError('')

    try {
      await createHelpPost(user, { category, description, type, location })
      navigate('/home')
    } catch (submitError) {
      console.error('Failed to create help post', submitError)
      setError('投稿できませんでした。時間をおいてもう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="post-page">
      <div className="post-page__mobile-topbar">
        <TopBar title="Helpを投稿する" onClose />
      </div>

      <header className="post-page__desktop-header">
        <label className="post-search">
          <SearchIcon width={19} height={19} />
          <input placeholder="キーワードで探す（例：買い物・子育て・神戸市 など）" />
        </label>
        <div className="post-account">
          <span className="post-account__bell" aria-label="通知">♧</span>
          <span className="post-account__avatar">{Array.from(displayName)[0]}</span>
          <span>{displayName}さん</span>
          <span aria-hidden="true">⌄</span>
        </div>
      </header>

      <form className="post-page__body" onSubmit={handleSubmit}>
        <main className="post-page__main">
          <section className="post-page__intro">
            <div className="post-page__intro-icon" aria-hidden="true">✎</div>
            <div>
              <h1>Helpを投稿する</h1>
              <p>困っていることを投稿して、地域のみんなに助けを求めましょう</p>
            </div>
            <ol className="post-progress" aria-label="投稿の進行状況">
              <li className="is-current"><span>1</span><small>内容の入力</small></li>
              <li><span>2</span><small>確認</small></li>
              <li><span>3</span><small>投稿完了</small></li>
            </ol>
          </section>

          <section className="post-step">
            <div className="post-step__heading">
              <span className="post-step__number">1</span>
              <div>
                <h2>どんなことで困っていますか？</h2>
                <p>あてはまるカテゴリーを選んで、詳しい内容を教えてください。</p>
              </div>
            </div>

            <div className="post-categories" role="group" aria-label="カテゴリー">
              {categories.map(({ value, icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`post-category${value === category ? ' is-active' : ''}`}
                  onClick={() => setCategory(value)}
                >
                  <span aria-hidden="true">{icon}</span>
                  {value}
                </button>
              ))}
            </div>

            <textarea
              className="post-description"
              placeholder={'例）ベビーカーを階段で運ぶのを手伝ってほしいです。\n駅の南口にいます。'}
              maxLength={MAX_LENGTH}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <p className="post-description__count">{description.length} / {MAX_LENGTH}</p>
          </section>

          <section className="post-step">
            <div className="post-step__heading">
              <span className="post-step__number">2</span>
              <div>
                <h2>どんな助けを求めていますか？</h2>
                <p>あなたの状況にあてはまる方を選んでください。</p>
              </div>
            </div>

            <div className="post-help-types" role="group" aria-label="助けの種類">
              <button
                type="button"
                className={`post-help-type${type === 'come' ? ' is-active' : ''}`}
                onClick={() => setType('come')}
              >
                <span className="post-help-type__icon" aria-hidden="true">♟</span>
                <span><strong>来てほしい</strong><small>現地でのサポートをお願いします</small></span>
                <span className="post-radio" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`post-help-type${type === 'teach' ? ' is-active' : ''}`}
                onClick={() => setType('teach')}
              >
                <span className="post-help-type__icon" aria-hidden="true">▢</span>
                <span><strong>教えてほしい</strong><small>チャットでの回答をお願いします</small></span>
                <span className="post-radio" aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className="post-step post-location-step">
            <div className="post-step__heading">
              <span className="post-step__number">3</span>
              <div>
                <h2>現在地</h2>
                <p>投稿時の現在地が自動で設定されます。</p>
              </div>
            </div>
            <div className="post-location-field">
              <LocationIcon width={22} height={22} />
              <span>{location}</span>
              <button type="button" className="post-location-refresh">◎ 現在地を更新</button>
            </div>
          </section>
        </main>

        <aside className="post-page__aside">
          <section className="post-aside-card post-aside-card--welcome">
            <span className="post-aside-card__illustration" aria-hidden="true">🤝</span>
            <h2>ちょっとした<br />困りごとも大丈夫！</h2>
            <p>地域のみんなが、あなたの投稿を見て助けてくれるかもしれません。</p>
          </section>

          <section className="post-aside-card">
            <h2>💡 投稿のヒント</h2>
            <ul className="post-tips">
              <li>できるだけ具体的に書きましょう<br /><small>（場所・状況・希望など）</small></li>
              <li>相手への感謝の気持ちを添えると<br />より助けてもらいやすくなります</li>
              <li>個人情報（電話番号・住所の詳細など）は書かないようにしましょう</li>
            </ul>
          </section>

          <section className="post-aside-card">
            <h2>▣ よくある投稿例</h2>
            <div className="post-examples">
              {examples.map((example) => (
                <button key={example} type="button" onClick={() => setDescription(example)}>
                  <span>{example}</span><span aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <footer className="post-page__footer">
          {error && <p className="post-page__error" role="alert">{error}</p>}
          <button type="button" className="post-cancel" onClick={() => navigate(-1)}>キャンセル</button>
          <button type="submit" className="post-submit" disabled={!canSubmit || !user || isSubmitting}>
            <SendIcon width={20} height={20} />
            {isSubmitting ? '投稿中...' : 'Helpを投稿する'}
          </button>
        </footer>
      </form>
    </div>
  )
}
