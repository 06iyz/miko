import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { mockHelps } from '../data/mockHelps'
import TopBar from '../components/TopBar'
import HelpTag from '../components/HelpTag'
import { LocationIcon } from '../components/icons'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { acceptHelpPost } from '../lib/helpPosts'
import type { HelpCategory, HelpType } from '../types'

type LiveHelp = {
  id: string
  title: string
  description: string
  category: HelpCategory
  type: HelpType
  authorUid: string
  acceptedHelperUid: string | null
  status: 'open' | 'matched' | 'closed'
}

type PrivateLocation = {
  location: string
  approximateCoordinates: { latitude: number; longitude: number } | null
}

function getDirectionsUrl(location: PrivateLocation) {
  if (location.approximateCoordinates) {
    const { latitude, longitude } = location.approximateCoordinates
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.location)}`
}

export default function HelpDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const mockHelp = mockHelps.find((help) => help.id === id) ?? mockHelps[0]
  const [liveHelp, setLiveHelp] = useState<LiveHelp | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [privateLocation, setPrivateLocation] = useState<PrivateLocation | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    return onSnapshot(doc(db, 'helpPosts', id), (snapshot) => {
      if (!snapshot.exists()) {
        setLiveHelp(null)
        setIsLoading(false)
        return
      }

      const data = snapshot.data()
      setLiveHelp({
        id: snapshot.id,
        title: typeof data.title === 'string' ? data.title : '投稿内容',
        description: typeof data.description === 'string' ? data.description : '',
        category: data.category as HelpCategory,
        type: data.type === 'teach' ? 'teach' : 'come',
        authorUid: typeof data.authorUid === 'string' ? data.authorUid : '',
        acceptedHelperUid: typeof data.acceptedHelperUid === 'string' ? data.acceptedHelperUid : null,
        status: data.status === 'matched' ? 'matched' : data.status === 'closed' ? 'closed' : 'open',
      })
      setIsLoading(false)
    }, () => {
      setLiveHelp(null)
      setIsLoading(false)
    })
  }, [id])

  const isAuthor = Boolean(liveHelp && user?.uid === liveHelp.authorUid)
  const isAcceptedHelper = Boolean(liveHelp && user?.uid === liveHelp.acceptedHelperUid)

  useEffect(() => {
    setPrivateLocation(null)
    if (!liveHelp || !user || (!isAuthor && !isAcceptedHelper)) return

    return onSnapshot(doc(db, 'helpPosts', liveHelp.id, 'private', 'location'), (snapshot) => {
      if (!snapshot.exists()) return
      const data = snapshot.data()
      const coordinates = data.approximateCoordinates
      setPrivateLocation({
        location: typeof data.location === 'string' ? data.location : '場所未設定',
        approximateCoordinates: coordinates && typeof coordinates.latitude === 'number' && typeof coordinates.longitude === 'number'
          ? { latitude: coordinates.latitude, longitude: coordinates.longitude }
          : null,
      })
    }, () => setPrivateLocation(null))
  }, [isAcceptedHelper, isAuthor, liveHelp, user])

  const accept = async () => {
    if (!liveHelp || !user || isAuthor || isAccepting) return
    setIsAccepting(true)
    setActionError('')
    try {
      await acceptHelpPost(liveHelp.id, user.uid)
    } catch {
      setActionError('ほかの人が先に助けに向かうことになったか、手続きを完了できませんでした。画面を更新して確認してください。')
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return <div className="screen screen--narrow"><TopBar title="Helpの詳細" /><p className="detail-loading">読み込み中...</p></div>
  }

  if (!liveHelp) {
    const walkMinutes = Math.max(1, Math.round(mockHelp.distanceM / 80))
    return (
      <div className="screen screen--narrow">
        <TopBar title="Helpの詳細" />
        <div className="screen__scroll">
          <div className="detail-thumb" aria-hidden="true">📍</div>
          <div className="detail-body">
            <HelpTag type={mockHelp.type} />
            <p className="detail-time">{mockHelp.postedMinutesAgo}分前</p>
            <h2 className="detail-title">{mockHelp.title}</h2>
            <p className="detail-desc">{mockHelp.description}</p>
            <div className="detail-location"><LocationIcon /><div><p>{mockHelp.location}</p><p className="detail-location__sub">{mockHelp.distanceM}m先（徒歩約{walkMinutes}分）</p></div></div>
          </div>
        </div>
        <div className="screen__footer screen__footer--stacked">
          <button type="button" className="btn btn--primary btn--block" onClick={() => navigate(`/help/${mockHelp.id}/chat`)}>助ける</button>
          <button type="button" className="btn btn--outline btn--block" onClick={() => navigate(`/help/${mockHelp.id}/chat`)}>チャットする</button>
        </div>
      </div>
    )
  }

  const hasAnotherHelper = liveHelp.status === 'matched' && !isAuthor && !isAcceptedHelper

  return (
    <div className="screen screen--narrow">
      <TopBar title="Helpの詳細" />
      <div className="screen__scroll">
        <div className="detail-thumb" aria-hidden="true">📍</div>
        <div className="detail-body">
          <HelpTag type={liveHelp.type} />
          <p className="detail-time">{liveHelp.status === 'open' ? '助けを待っています' : liveHelp.status === 'matched' ? '助けに向かう人が決まりました' : '解決済み'}</p>
          <h2 className="detail-title">{liveHelp.title}</h2>
          <p className="detail-desc">{liveHelp.description}</p>
          <div className="detail-location">
            <LocationIcon />
            <div>
              {privateLocation ? <><p>{privateLocation.location}</p><p className="detail-location__sub">あなたは助けに向かう担当です。地図で近くまで案内できます。</p></> : <><p>詳しい場所は非公開です</p><p className="detail-location__sub">「助けに行く」を選んだ人と投稿者だけに表示されます。</p></>}
            </div>
          </div>
          {privateLocation && <button type="button" className="btn btn--outline btn--block detail-route-button" onClick={() => window.open(getDirectionsUrl(privateLocation), '_blank', 'noopener,noreferrer')}>地図でルートを見る</button>}
          {actionError && <p className="detail-action-error" role="alert">{actionError}</p>}
        </div>
      </div>
      <div className="screen__footer screen__footer--stacked">
        {isAuthor ? <p className="detail-owner-note">あなたの投稿です。詳しい場所は、助けに向かう人が決まるまで表示されません。</p>
          : isAcceptedHelper ? <button type="button" className="btn btn--primary btn--block" onClick={() => privateLocation && window.open(getDirectionsUrl(privateLocation), '_blank', 'noopener,noreferrer')} disabled={!privateLocation}>ルートを開く</button>
            : hasAnotherHelper ? <button type="button" className="btn btn--outline btn--block" disabled>ほかの人が助けに向かっています</button>
              : liveHelp.status === 'closed' ? <button type="button" className="btn btn--outline btn--block" disabled>このHelpは解決済みです</button>
                : <button type="button" className="btn btn--primary btn--block" onClick={() => void accept()} disabled={isAccepting}>{isAccepting ? '手続き中...' : '助けに行く'}</button>}
      </div>
    </div>
  )
}
