import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../lib/firebase'

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
    <main className="splash">
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
            onClick={handleLogin}
            disabled={pending}
          >
            {pending ? 'ログイン中...' : 'Googleでログイン'}
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </div>
    </main>
  )
}
