'use client'
import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { socket } from '../../lib/socket'
import styles from "./page.module.css"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ChatPage() {
  const { data: session, status, update } = useSession()
  const [dbUsers, setDbUsers] = useState([])
  const [unreadRooms, setUnreadRooms] = useState({})
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const [room, setRoom] = useState(null)
  const [activeChatName, setActiveChatName] = useState('')
  const [activeChatId, setActiveChatId] = useState('') 
  const [searchQuery, setSearchQuery] = useState('')
  const [typingStatus, setTypingStatus] = useState('')
  const scrollRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.user?.username) return
      try {
        const response = await fetch(`/api/register`)
        const data = await response.json()
        const filtered = data.filter(u => u.username !== session.user.username)
        const initializedUsers = filtered.map(u => ({
          ...u,
          roomID: `private_${[session.user.username, u.username].sort().join('_')}`,
          lastMessageText: u.lastMessageText || ''
        }))
        setDbUsers(initializedUsers)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      }
    }
    fetchUsers()
  }, [session])

  useEffect(() => {
    socket.on('update-sidebar', (data) => {
      const { room: incomingRoom, updatedAt, sender, lastMessage } = data
      const isNotCurrentRoom = incomingRoom !== room
      const amIReceiver = sender !== session?.user?.username

      if (isNotCurrentRoom && (incomingRoom === 'public' || amIReceiver)) {
        setUnreadRooms(prev => ({ ...prev, [incomingRoom]: true }))
      }

      setDbUsers(prevUsers => {
        const updatedUsers = prevUsers.map(u => {
          if (u.roomID === incomingRoom) {
            return { 
              ...u, 
              lastActivity: new Date(updatedAt).getTime(),
              lastMessageText: lastMessage 
            }
          }
          return u
        })
        return [...updatedUsers].sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0))
      })
    })

    socket.on('message-deleted', (messageId) => {
      setChat((prev) => prev.filter(msg => msg._id !== messageId))
    })

    return () => {
      socket.off('update-sidebar')
      socket.off('message-deleted')
    }
  }, [room, session])

  useEffect(() => {
    if (!room) return

    const setupSocket = async () => {
      socket.connect()
      socket.emit('join-room', room)

      socket.on('load-history', (history) => {
        const formattedHistory = history.map(msg => ({
          ...msg,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
        setChat(formattedHistory)
      })

      socket.on('receive-message', (data) => {
        setChat((prev) => {
          if (data.room !== room) return prev
          const isDuplicate = prev.find(m => m._id === data._id && data._id !== undefined)
          return isDuplicate ? prev : [...prev, data]
        })
      })

      socket.on('display-typing', (data) => {
        if (data.room === room && data.user !== session?.user?.username) {
          setTypingStatus(`is typing...`)
        }
      })

      socket.on('hide-typing', (data) => {
        if (data.room === room) {
          setTypingStatus('')
        }
      })
    }

    setupSocket()
    return () => {
      socket.off('load-history')
      socket.off('receive-message')
      socket.off('display-typing')
      socket.off('hide-typing')
    }
  }, [room, session])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  const clearUnread = (roomID) => {
    setUnreadRooms(prev => {
      if (!prev[roomID]) return prev
      const newState = { ...prev }
      delete newState[roomID]
      return newState
    })
  }

  const startPrivateChat = (targetUser) => {
    if (!session?.user?.username) return
    setChat([])
    setRoom(targetUser.roomID)
    setActiveChatName(targetUser.username)
    setActiveChatId(targetUser._id) 
    clearUnread(targetUser.roomID)
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)
    if (!room || !session) return
    socket.emit('typing', { room, user: session.user.username })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { room })
    }, 2000)
  }

  const sendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!message.trim() || !session || !room) return
    
    await update()

    const data = { text: message, user: session.user.username, room: room }
    socket.emit('send-message', data)
    socket.emit('stop-typing', { room })
    setMessage('')
  }

  const deleteMessage = (msg) => {
    if (msg.user !== session?.user?.username) return
    if (window.confirm("Delete this message?")) {
      socket.emit('delete-message', { messageId: msg._id, room: room })
    }
  }

  const filteredUsers = dbUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

 

  return (
    <div className={`${styles.mainWrapper} ${!room ? styles.noRoomSelected : ''}`}>
      <aside className={styles.sidebar}>
        <div className={styles.logoSection}>
          <h1 className={styles.logoText}>PrimeChat</h1>
        </div>

        <div className={styles.sidebarHeader}>
          <div className={styles.avatarCircle}>
            <Link href={"/myprofile"}>
                 {session?.user?.username?.[0].toUpperCase()}
            </Link>
          </div>
          <div className={styles.headerInfo}>
            <strong>{session?.user?.username}</strong>
          </div>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search chats" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className={styles.roomList}>
          <div 
            className={`${styles.roomItem} ${room === 'public' ? styles.activeRoom : ''}`}
            onClick={() => { 
              setChat([]); 
              setRoom('public'); 
              setActiveChatName('The Prime Hub');
              setActiveChatId(''); 
              clearUnread('public');
            }}
          >
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarCircle} style={{backgroundColor: '#d325d3', color: 'white'}}>P</div>
              {unreadRooms['public'] && <div className={styles.greenDot}></div>}
            </div>
            <div className={styles.roomInfo}>
              <strong>The Prime Hub</strong>
              <small>Public Chat</small>
            </div>
          </div>

          <div className={styles.sectionLabel}>Direct Messages</div>
          
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div 
                key={user._id} 
                className={`${styles.roomItem} ${activeChatName === user.username ? styles.activeRoom : ''}`}
                onClick={() => startPrivateChat(user)}
              >
                <div className={styles.avatarWrapper}>
                  <Link href={`/userprofile/${user._id}`} className={styles.avatarLink}>
                    <div className={styles.avatarCircle}>{user.username[0].toUpperCase()}</div>
                  </Link>
                  {unreadRooms[user.roomID] && <div className={styles.greenDot}></div>}
                </div>
                <div className={styles.roomInfo}>
                  <strong>{user.username}</strong>
                  <small className={styles.lastMessagePreview}>
                    {user.lastMessageText}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResult}>No contacts found</div>
          )}
        </div>
      </aside>

      <main className={styles.chatContainer}>
        {room ? (
          <>
            <header className={styles.chatHeader}>
              <button className={styles.backButton} onClick={() => setRoom(null)}>←</button>
              <div className={styles.avatarCircle} style={{width: '35px', height: '35px', marginRight: '10px'}}>
               
                {room === 'public' ? (
                  'P'
                ) : (
                  <Link href={`/userprofile/${activeChatId}`}>
                    {activeChatName[0]?.toUpperCase()}
                  </Link>
                )}
              </div>
              <div className={styles.headerTitleGroup}>
                <strong>{activeChatName}</strong>
                {typingStatus && <span className={styles.typingIndicator}>{typingStatus}</span>}
              </div>
            </header>

            <div className={styles.messageArea}>
              {chat.map((msg, index) => (
                <div 
                  key={index} 
                  onDoubleClick={() => deleteMessage(msg)}
                  className={`${styles.messageBubble} ${
                    msg.user === session?.user?.username ? styles.sent : styles.received
                  }`}
                  style={{ cursor: msg.user === session?.user?.username ? 'pointer' : 'default' }}
                >
                  {room === 'public' && msg.user !== session?.user?.username && (
                    <span className={styles.userName}>{msg.user}</span>
                  )}
                  <span className={styles.text}>{msg.text}</span>
                  <span className={styles.timestamp}>{msg.time}</span>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form className={styles.inputArea} onSubmit={sendMessage}>
              <textarea
                className={styles.inputField} 
                value={message} 
                onChange={handleInputChange} 
                placeholder="Type a message" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button type="submit" className={styles.sendButton}>➤</button>
            </form>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💎</div>
            <h2>PrimeChat</h2>
            <p>Select a contact to start chatting</p>
          </div>
        )}
      </main>
    </div>
  )
}