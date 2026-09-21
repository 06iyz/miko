import { useLocation, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { SendIcon } from '../components/icons'
import './PostHelp.css'

/** Firestore への保存が成功したあとにだけ表示する投稿完了画面。 */
export default function PostComplete() {
  const navigate = useNavigate()
  const location = useLocation()
  const postId = (location.state as { postId?: string } | null)?.postId

  return (
    <div className="post-page post-complete-page">
      <div className="post-page__mobile-topbar">
        <TopBar title="投稿完了" onClose />
      </div>
      <main className="post-complete">
        <ol className="post-progress" aria-label="投稿の進行状況">
          <li className="is-done"><span>1</span><small>内容の入力</small></li>
          <li className="is-done"><span>2</span><small>確認</small></li>
          <li className="is-current"><span>3</span><small>投稿完了</small></li>
        </ol>
        <div className="post-complete__check" aria-hidden="true">✓</div>
        <p className="post-complete__eyebrow">投稿が完了しました</p>
        <h1>Helpを投稿しました！</h1>
        <p>投稿を受け付けました。地域のみんなに届いています。<br />助けてくれる人から連絡が来るまで、少しお待ちください。</p>
        {postId && <p className="post-complete__id">受付番号：{postId.slice(0, 8).toUpperCase()}</p>}
        <div className="post-complete__notice">
          <strong>安心してお待ちください</strong>
          <span>投稿内容はマイページの「投稿履歴」からいつでも確認できます。位置情報は約100m単位に丸めて保存されています。</span>
        </div>
        <div className="post-complete__actions">
          <button type="button" className="post-cancel" onClick={() => navigate('/home')}>ホームへ戻る</button>
          <button type="button" className="post-submit" onClick={() => navigate('/mypage')}>
            <SendIcon width={19} height={19} /> 投稿履歴を見る
          </button>
        </div>
      </main>
    </div>
  )
}
