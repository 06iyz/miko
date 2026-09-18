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
    <main>
      <h1>Help5</h1>
      <p>ログインして始めましょう</p>

      <button onClick={handleLogin} disabled={pending}>
        {pending ? 'ログイン中...' : 'Googleでログイン'}
      </button>

      {error && <p role="alert">{error}</p>}
    </main>
  )
}