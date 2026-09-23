import { useEffect, useState } from 'react'
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'
import { auth, authPersistenceReady } from '../lib/firebase'

function isMobileBrowser() {
  return window.matchMedia?.('(pointer: coarse)').matches
    || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function loginErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : ''

  if (code === 'auth/popup-closed-by-user') return 'ログイン画面を閉じたため、ログインしていません。'
  if (code === 'auth/popup-blocked') return 'ログイン画面を開けませんでした。ブラウザのポップアップ設定を確認してください。'
  if (code === 'auth/unauthorized-domain') return 'このURLではログインできません。アプリのURL設定を確認してください。'
  if (code === 'auth/operation-not-allowed') return 'Googleログインの設定がまだ有効になっていません。'
  return 'ログインできませんでした。通信状況を確認して、もう一度お試しください。'
}

export default function Login() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void authPersistenceReady.then(() => getRedirectResult(auth)).catch((loginError) => {
      setError(loginErrorMessage(loginError))
    })
  }, [])

  async function handleLogin() {
    setPending(true)
    setError('')

    try {
      await authPersistenceReady
      const provider = new GoogleAuthProvider()

      if (isMobileBrowser()) {
        // スマホではポップアップが別タブ・白紙画面になりやすいため、画面遷移方式を使う。
        await signInWithRedirect(auth, provider)
        return
      }

      await signInWithPopup(auth, provider)
    } catch (loginError) {
      setError(loginErrorMessage(loginError))
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
