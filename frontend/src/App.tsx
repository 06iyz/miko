import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Splash from './pages/Splash'
import Home from './pages/Home'
import MapView from './pages/MapView'
import PostHelp from './pages/PostHelp'
import HelpDetail from './pages/HelpDetail'
import Messages from './pages/Messages'
import Chat from './pages/Chat'
import Resolve from './pages/Resolve'
import MyPage from './pages/MyPage'

function App() {
  return (
    <BrowserRouter>
      <div className="phone-frame">
        <div className="phone-screen">
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/home" element={<Home />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/post/new" element={<PostHelp />} />
            <Route path="/help/:id" element={<HelpDetail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/help/:id/chat" element={<Chat />} />
            <Route path="/help/:id/resolve" element={<Resolve />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
