'use client'
import { io } from 'socket.io-client'

// Replace 3001 with your server's actual port
const SOCKET_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const socket = io(SOCKET_URL, {
  autoConnect: false // We will connect manually in a useEffect
})