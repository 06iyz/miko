import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()

  return (
    <div className="splash">
      <div className="splash__art" aria-hidden="true">
        🌆
      </div>
      <div className="splash__content">
        <h1 className="splash__logo">Help5</h1>
        <p className="splash__tagline">
          ちょっと困ったを
          <br />
          ちょっと助ける
          <br />
          やさしい社会、いっしょに。
        </p>
        <div className="splash__actions">
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => navigate('/home')}
          >
            はじめる
          </button>
          <button
            type="button"
            className="btn btn--outline btn--block"
            onClick={() => navigate('/home')}
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  )
}
