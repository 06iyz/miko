import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../lib/firebase'
import './Login.css'

export default function Login() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setPending(true)
    setError('')

    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch {
      setError('ログインできませんでした。もう一度お試しください。')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="welcome-stage">
    <section className="welcome" aria-labelledby="welcome-title">
      <div className="welcome__photo" aria-hidden="true" />
      <div className="welcome__island" aria-hidden="true" />
      <div className="splash__content">
        <h1 className="splash__logo" id="welcome-title" aria-label="Help5">
          H<span className="welcome__logo-e">e<svg className="welcome__logo-smile" viewBox="0 0 32 12" aria-hidden="true" focusable="false"><path d="M3 3 Q16 14 29 3" /></svg></span>lp5
        </h1>
        <p className="splash__tagline">
          <span>ちょっと困ったを</span>
          <span>ちょっと助ける</span>
          <span>やさしい社会を、いっしょに。</span>
        </p>
      </div>
        <div className="splash__actions" aria-busy={pending}>
          <button
            type="button"
            className="welcome__button welcome__button--primary"
            onClick={handleLogin}
            disabled={pending}
          >
            はじめる
          </button>
          <button
            type="button"
            className="welcome__button welcome__button--secondary"
            onClick={handleLogin}
            disabled={pending}
          >
            ログイン
          </button>
          <p className="welcome__note" role="status">{pending ? 'Googleに接続しています…' : 'Googleアカウントでご利用いただけます'}</p>
          {error && <p className="welcome__error" role="alert">{error}</p>}
        </div>
      <div className="welcome__home-indicator" aria-hidden="true" />
    </section>
    </main>
  )
}
