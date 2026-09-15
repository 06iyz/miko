import type { Conversation, HelpPost, UserProfile } from '../types'

export const mockHelps: HelpPost[] = [
  {
    id: 'help-1',
    title: 'ベビーカーを階段で運んでほしい',
    description:
      '三宮駅の南口にいます。ベビーカーを階段で運ぶのを手伝っていただける方をお願いします。',
    category: '子育て',
    type: 'come',
    distanceM: 300,
    postedMinutesAgo: 2,
    location: '三宮駅 南口',
    author: { id: 'user-sato', name: '佐藤さん' },
  },
  {
    id: 'help-2',
    title: '切符の買い方を教えてほしい',
    description: '券売機の使い方がわからず困っています。教えていただけると助かります。',
    category: '案内',
    type: 'teach',
    distanceM: 450,
    postedMinutesAgo: 5,
    location: '三宮駅 券売機付近',
    author: { id: 'user-tanaka', name: '田中さん' },
  },
  {
    id: 'help-3',
    title: 'この電車で合ってるか知りたい',
    description: '目的地の方面に向かっているか不安です。確認をお願いしたいです。',
    category: '案内',
    type: 'teach',
    distanceM: 600,
    postedMinutesAgo: 8,
    location: '三宮駅 ホーム',
    author: { id: 'user-suzuki', name: '鈴木さん' },
  },
]

export const mockConversations: Conversation[] = [
  {
    helpId: 'help-1',
    partner: { id: 'user-sato', name: '佐藤さん' },
    lastMessage: 'わかりました！もうすぐ着きます！',
    lastMessageTime: '9:46',
    messages: [
      { id: 'm1', sender: 'other', text: 'こんにちは！', time: '9:42' },
      {
        id: 'm2',
        sender: 'other',
        text: '今、駅の南口の階段のところにいます。よろしければお願いできますか？',
        time: '9:42',
      },
      { id: 'm3', sender: 'me', text: 'こんにちは！\n今向かっています。あと3分くらいで着きます！', time: '9:43' },
      { id: 'm4', sender: 'other', text: 'ありがとうございます！\nベビーカーは黒色です。', time: '9:44' },
      { id: 'm5', sender: 'me', text: 'わかりました！もうすぐ着きます！', time: '9:46' },
    ],
  },
]

export const mockUser: UserProfile = {
  name: 'あなた',
  helpedCount: 12,
  helpedByCount: 5,
  rating: 4.9,
}
