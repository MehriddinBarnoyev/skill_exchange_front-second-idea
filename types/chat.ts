export interface Friend {
  id: string
  connectionId: string
  name: string
  profession: string
  profile_pic: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
  last_active?: string
  created_at?: string
}

export interface ChatMessage {
  id: string
  content: string
  created_at: string
  isread: boolean
  sender_id: string
  sender_name: string
  sender_profile_pic: string
  receiver_id: string
  receiver_name: string
  receiver_profile_pic: string
}

