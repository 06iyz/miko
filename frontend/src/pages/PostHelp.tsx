import { useEffect, useRef, useState } from 'react'
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
const LOCATION_PLACEHOLDER = '例）大阪市北区梅田１丁目・駅前の自動販売機の近く'

export default function PostHelp() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<HelpCategory>('移動')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<HelpType>('come')
  const [location, setLocation] = useState('')
  const [requesterFeature, setRequesterFeature] = useState('')
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isPhotoLocationDialogOpen, setIsPhotoLocationDialogOpen] = useState(false)
  const [isGettingPhotoLocation, setIsGettingPhotoLocation] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [approximateCoordinates, setApproximateCoordinates] = useState<{
    latitude: number
    longitude: number
    accuracyMeters: number
  } | null>(null)
  const [outsidePhotoPreview, setOutsidePhotoPreview] = useState<string | null>(null)
  const [insidePhotoPreview, setInsidePhotoPreview] = useState<string | null>(null)
  const [isPhotoLayoutSwapped, setIsPhotoLayoutSwapped] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment')
  const [isInnerPhotoAutomatic, setIsInnerPhotoAutomatic] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [step, setStep] = useState<'photo' | 'input' | 'confirm'>('photo')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const locationInputRef = useRef<HTMLInputElement>(null)
  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const photoUrlsRef = useRef<string[]>([])
  const cameraTimerRef = useRef<number | null>(null)

  const canSubmit = description.trim().length > 0 && location.trim().length > 0
  const hasRequiredPhotos = Boolean(outsidePhotoPreview && insidePhotoPreview)
  const isPrimaryDisabled = !user || isSubmitting || (step === 'photo' ? !hasRequiredPhotos : !canSubmit)
  const displayName = user?.displayName || 'ゲスト'

  useEffect(() => () => {
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const clearCameraTimer = () => {
    if (cameraTimerRef.current !== null) {
      window.clearTimeout(cameraTimerRef.current)
      cameraTimerRef.current = null
    }
  }

  const stopCamera = () => {
    clearCameraTimer()
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
    cameraStreamRef.current = null
    setIsCameraOpen(false)
    setIsInnerPhotoAutomatic(false)
  }

  useEffect(() => () => {
    clearCameraTimer()
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  useEffect(() => {
    const video = cameraVideoRef.current
    if (isCameraOpen && video && cameraStreamRef.current) {
      video.srcObject = cameraStreamRef.current
      void video.play().catch(() => setCameraError('カメラ映像を開始できませんでした。もう一度お試しください。'))
    }
  }, [isCameraOpen, cameraFacing])

  const openCamera = async (facing: 'environment' | 'user') => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('このブラウザではカメラを利用できません。スマホのブラウザでお試しください。')
      return
    }

    setCameraError('')
    try {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing } },
      })
      cameraStreamRef.current = stream
      setCameraFacing(facing)
      setIsCameraOpen(true)
    } catch {
      setCameraError('カメラを利用できません。ブラウザのカメラ許可を確認してください。')
    }
  }

  const capturePhoto = (capturedFacing = cameraFacing) => {
    const video = cameraVideoRef.current
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('カメラの準備ができていません。少し待ってから撮影してください。')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('写真を作成できませんでした。もう一度お試しください。')
        return
      }
      const photo = new File([blob], `help-now-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const preview = URL.createObjectURL(photo)
      photoUrlsRef.current.push(preview)
      const wasOutsideCamera = capturedFacing === 'environment'
      if (wasOutsideCamera) {
        setOutsidePhotoPreview(preview)
      } else {
        setInsidePhotoPreview(preview)
      }
      setCameraError('')
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
      cameraStreamRef.current = null
      setIsCameraOpen(false)
      if (wasOutsideCamera) {
        setIsInnerPhotoAutomatic(true)
        cameraTimerRef.current = window.setTimeout(() => {
          cameraTimerRef.current = null
          void openCamera('user')
        }, 1500)
      } else {
        setIsInnerPhotoAutomatic(false)
      }
    }, 'image/jpeg', 0.88)
  }

  const captureInnerPhotoWhenReady = () => {
    if (cameraFacing !== 'user' || !isInnerPhotoAutomatic) return

    clearCameraTimer()
    cameraTimerRef.current = window.setTimeout(() => {
      cameraTimerRef.current = null
      capturePhoto('user')
    }, 350)
  }

  const resetPhotos = () => {
    stopCamera()
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    photoUrlsRef.current = []
    setOutsidePhotoPreview(null)
    setInsidePhotoPreview(null)
    setIsPhotoLayoutSwapped(false)
    setCameraFacing('environment')
    setCameraError('')
  }

  const advanceFromPhoto = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!hasRequiredPhotos) return
    setError('')
    setStep('input')
  }

  const showConfirmation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setStep('confirm')
  }

  const publishPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || !user || isSubmitting) return

    setIsSubmitting(true)
    setError('')

    try {
      const postId = await createHelpPost(user, { category, description, type, location, requesterFeature, approximateCoordinates })
      navigate('/post/complete', { replace: true, state: { postId } })
    } catch (submitError) {
      console.error('Failed to create help post', submitError)
      setError('投稿できませんでした。時間をおいてもう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeLocationDialog = () => {
    setIsLocationDialogOpen(false)
    window.setTimeout(() => locationInputRef.current?.focus(), 0)
  }

  const saveApproximateLocation = (position: GeolocationPosition) => {
    const latitude = Number(position.coords.latitude.toFixed(3))
    const longitude = Number(position.coords.longitude.toFixed(3))
    const accuracyMeters = Math.round(position.coords.accuracy)

    setApproximateCoordinates({ latitude, longitude, accuracyMeters })
    setLocation('現在地付近（約100mの範囲）')
  }

  const startPhotoCapture = () => {
    setCameraError('')
    if (approximateCoordinates) {
      void openCamera('environment')
      return
    }
    setIsPhotoLocationDialogOpen(true)
  }

  const requestLocationForPhoto = () => {
    if (!navigator.geolocation) {
      setCameraError('このブラウザでは現在地を確認できません。撮影を始めるには、現在地を使えるスマホのブラウザで開いてください。')
      setIsPhotoLocationDialogOpen(false)
      return
    }

    setIsGettingPhotoLocation(true)
    setCameraError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveApproximateLocation(position)
        setIsGettingPhotoLocation(false)
        setIsPhotoLocationDialogOpen(false)
        void openCamera('environment')
      },
      (positionError) => {
        const message = positionError.code === positionError.PERMISSION_DENIED
          ? '現在地の利用が許可されなかったため、撮影を始められません。許可してからもう一度お試しください。'
          : '現在地を確認できませんでした。電波の良い場所で、もう一度お試しください。'
        setCameraError(message)
        setIsGettingPhotoLocation(false)
        setIsPhotoLocationDialogOpen(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('このブラウザでは現在地を取得できません。住所や目印を手入力してください。')
      return
    }

    setIsGettingLocation(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 小数第3位までに丸めると、緯度・経度ともおよそ100m単位になる。
        saveApproximateLocation(position)
        setIsGettingLocation(false)
        setIsLocationDialogOpen(false)
        window.setTimeout(() => locationInputRef.current?.focus(), 0)
      },
      (positionError) => {
        const message = positionError.code === positionError.PERMISSION_DENIED
          ? '位置情報の利用が許可されませんでした。住所や目印を手入力してください。'
          : '現在地を取得できませんでした。電波状況を確認して、もう一度お試しください。'
        setLocationError(message)
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
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

      <form className="post-page__body" onSubmit={step === 'photo' ? advanceFromPhoto : step === 'input' ? showConfirmation : publishPost}>
        <main className="post-page__main">
          <section className="post-page__intro">
            <div className="post-page__intro-icon" aria-hidden="true">✎</div>
            <div>
              <h1>Helpを投稿する</h1>
              <p>困っていることを投稿して、地域のみんなに助けを求めましょう</p>
            </div>
            <ol className="post-progress" aria-label="投稿の進行状況">
              <li className={step === 'photo' ? 'is-current' : 'is-done'}><span>1</span><small>写真を撮る</small></li>
              <li className={step === 'input' ? 'is-current' : step === 'confirm' ? 'is-done' : ''}><span>2</span><small>内容の入力</small></li>
              <li className={step === 'confirm' ? 'is-current' : ''}><span>3</span><small>確認・投稿</small></li>
            </ol>
          </section>

          {step === 'photo' ? (
            <section className="post-photo-step">
              <div className="post-step__heading">
                <span className="post-step__number">1</span>
                <div>
                  <h2>いまの状況を撮影してください</h2>
                  <p>助けに来る人が状況をイメージしやすくなります。</p>
                </div>
              </div>
              <div className={`post-photo-capture${hasRequiredPhotos ? ' has-photo' : ''}`}>
                {isCameraOpen ? <video ref={cameraVideoRef} className="post-photo-capture__video" autoPlay muted playsInline onCanPlay={captureInnerPhotoWhenReady} aria-label="撮影する画面" /> : hasRequiredPhotos ? <div className={`post-photo-capture__pair${isPhotoLayoutSwapped ? ' is-swapped' : ''}`}><figure className="post-photo-capture__outside"><img src={outsidePhotoPreview ?? ''} alt="まわりの様子を撮影した写真" /><figcaption>まわりの様子</figcaption></figure><button type="button" className="post-photo-capture__inside" onClick={() => setIsPhotoLayoutSwapped((value) => !value)} aria-label="写真の大きさを入れ替える"><img src={insidePhotoPreview ?? ''} alt="自分を撮影した写真" /><span>あなたの写真</span></button></div> : <div className="post-photo-capture__placeholder"><span aria-hidden="true">▣</span><strong>{isInnerPhotoAutomatic ? '自分の写真を撮ります…' : '現在の状況を写真で伝えましょう'}</strong><small>{isInnerPhotoAutomatic ? '画面が切り替わると、自動で撮影します' : 'スマホに保存済みの写真は選べません'}</small></div>}
                {isCameraOpen && cameraFacing === 'environment' ? <button type="button" className="post-photo-capture__camera" onClick={() => capturePhoto('environment')}>● まわりを撮る</button> : isCameraOpen ? <span className="post-photo-capture__automatic" role="status">自分の写真を撮っています…</span> : !isInnerPhotoAutomatic && <button type="button" className="post-photo-capture__camera" onClick={() => { if (hasRequiredPhotos) resetPhotos(); startPhotoCapture() }}>{hasRequiredPhotos ? '最初から撮り直す' : '撮影をはじめる'}</button>}
              </div>
              <div className="post-photo-actions">
                {isCameraOpen || isInnerPhotoAutomatic ? <button type="button" onClick={stopCamera}>撮影を中止する</button> : <span>まわりを撮ったあと、自分の写真を自動で撮ります</span>}
                {(outsidePhotoPreview || insidePhotoPreview) && <button type="button" onClick={resetPhotos}>写真を削除</button>}
              </div>
              {cameraError && <p className="post-photo-error" role="alert">{cameraError}</p>}
              <p className="post-photo-note">最初にまわりの様子を撮り、1.5秒後に自分の写真を撮ります。スマホに保存済みの写真は選べません。顔・家番号・車のナンバー・他の人が写らないようにしてください。写真は、この画面で内容を確認するためだけに使われ、投稿後には残りません。</p>
            </section>
          ) : step === 'input' ? <>
          <section className="post-step">
            <div className="post-step__heading">
              <span className="post-step__number">1</span>
              <div>
                <h2>どんなことで困っていますか？</h2>
                <p>当てはまる種類を選んで、詳しい内容を教えてください。</p>
              </div>
            </div>

            <div className="post-categories" role="group" aria-label="困りごとの種類">
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
            <label className="post-feature-field">
              <span>あなたの特徴 <em>任意</em></span>
              <input
                maxLength={120}
                value={requesterFeature}
                onChange={(event) => setRequesterFeature(event.target.value)}
                placeholder="例）黒いベビーカー、青いリュックを持っています"
              />
              <small>待ち合わせの目印になる情報だけを書いてください。個人情報は書かないでください。</small>
            </label>
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
                <p>現在地から選ぶか、住所・目印を入力してください。</p>
              </div>
            </div>
            <div className="post-location-field">
              <LocationIcon width={22} height={22} />
              <input
                ref={locationInputRef}
                value={location}
                onChange={(event) => {
                  const nextLocation = event.target.value
                  setLocation(nextLocation)
                  if (!nextLocation.startsWith('現在地付近')) setApproximateCoordinates(null)
                }}
                placeholder={LOCATION_PLACEHOLDER}
                aria-label="場所と目印"
              />
              <button type="button" className="post-location-refresh" onClick={() => setIsLocationDialogOpen(true)}>◎ 現在地から選ぶ</button>
            </div>
            <p className="post-location-note">現在地から選ぶか、住所・施設名・目印を入力してください。現在地を選んだ後も、目印を追記できます。</p>
            {locationError && <p className="post-location-error" role="alert">{locationError}</p>}
          </section>
          </> : (
            <section className="post-confirmation">
              <div className="post-confirmation__heading">
                <span className="post-step__number">2</span>
                <div>
                  <h2>投稿内容を確認してください</h2>
                  <p>内容に間違いがなければ、投稿するボタンを押してください。</p>
                </div>
              </div>
              <dl className="post-confirmation__details">
                {hasRequiredPhotos && <div className="post-confirmation__photo"><dt>撮影した写真</dt><dd><div className={`post-confirmation__photo-pair${isPhotoLayoutSwapped ? ' is-swapped' : ''}`}><figure className="post-confirmation__outside"><img src={outsidePhotoPreview ?? ''} alt="まわりの様子を撮影した写真" /><figcaption>まわりの様子</figcaption></figure><button type="button" className="post-confirmation__inside" onClick={() => setIsPhotoLayoutSwapped((value) => !value)} aria-label="写真の大きさを入れ替える"><img src={insidePhotoPreview ?? ''} alt="自分を撮影した写真" /><span>あなたの写真</span></button></div></dd></div>}
                <div><dt>困りごとの種類</dt><dd>{category}</dd></div>
                <div><dt>お願いしたいこと</dt><dd>{type === 'come' ? '来てほしい（現地でのサポート）' : '教えてほしい（チャットでの回答）'}</dd></div>
                <div><dt>困っていること</dt><dd className="post-confirmation__description">{description}</dd></div>
                <div><dt>場所・目印</dt><dd>{location}</dd></div>
                {requesterFeature.trim() && <div><dt>あなたの特徴</dt><dd>{requesterFeature}</dd></div>}
              </dl>
              {approximateCoordinates && (
                <p className="post-confirmation__privacy">現在地は約100m単位に丸めて保存されます。正確な位置情報は公開しません。</p>
              )}
            </section>
          )}
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
          <button type="button" className="post-cancel" onClick={() => step === 'confirm' ? setStep('input') : step === 'input' ? setStep('photo') : navigate(-1)}>
            {step === 'confirm' ? '内容を修正する' : step === 'input' ? '写真を撮り直す' : 'キャンセル'}
          </button>
          <button type="submit" className="post-submit" disabled={isPrimaryDisabled}>
            <SendIcon width={20} height={20} />
            {step === 'photo' ? '内容入力へ進む' : step === 'input' ? '内容を確認する' : isSubmitting ? '投稿中...' : 'Helpを投稿する'}
          </button>
        </footer>
      </form>

      {isPhotoLocationDialogOpen && (
        <div className="post-location-dialog-backdrop" role="presentation" onMouseDown={() => !isGettingPhotoLocation && setIsPhotoLocationDialogOpen(false)}>
          <section className="post-location-dialog" role="dialog" aria-modal="true" aria-labelledby="photo-location-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="post-location-dialog__icon" aria-hidden="true"><LocationIcon width={28} height={28} /></div>
            <h2 id="photo-location-dialog-title">撮影前に現在地を確認します</h2>
            <p>助けに来る人が近くまで向かいやすくなるように、撮影前に現在地の利用を確認します。</p>
            <ul>
              <li>公開される場所は約100mの範囲です</li>
              <li>正確な場所がすぐに公開されることはありません</li>
              <li>許可すると、続けてカメラが開きます</li>
            </ul>
            <div className="post-location-dialog__actions">
              <button type="button" className="post-location-dialog__cancel" onClick={() => setIsPhotoLocationDialogOpen(false)} disabled={isGettingPhotoLocation}>やめる</button>
              <button type="button" onClick={requestLocationForPhoto} disabled={isGettingPhotoLocation}>
                {isGettingPhotoLocation ? '現在地を確認中...' : '許可して撮影を始める'}
              </button>
            </div>
          </section>
        </div>
      )}

      {isLocationDialogOpen && (
        <div className="post-location-dialog-backdrop" role="presentation" onMouseDown={() => setIsLocationDialogOpen(false)}>
          <section className="post-location-dialog" role="dialog" aria-modal="true" aria-labelledby="location-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="post-location-dialog__icon" aria-hidden="true"><LocationIcon width={28} height={28} /></div>
            <h2 id="location-dialog-title">現在地から選びますか？</h2>
            <p>次にブラウザとスマートフォンから位置情報の利用確認が表示されます。許可しても、正確な位置情報をそのまま公開することはありません。</p>
            <ul>
              <li>保存する位置は約100m単位に丸めます</li>
              <li>取得後に「駅前の自動販売機の近く」などの目印を追記できます</li>
              <li>部屋番号・電話番号などの個人情報は書かないでください</li>
            </ul>
            <div className="post-location-dialog__actions">
              <button type="button" className="post-location-dialog__cancel" onClick={closeLocationDialog}>手入力する</button>
              <button type="button" onClick={getCurrentLocation} disabled={isGettingLocation}>
                {isGettingLocation ? '現在地を取得中...' : '現在地を取得する'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
