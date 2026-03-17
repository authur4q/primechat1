const { createServer } = require('http')
const next = require('next')
const { parse } = require("url")
const { Server } = require('socket.io')
const Message = require('./models/message')
const { connectDb } = require('./lib/mongoDb')
const PORT = process.env.PORT || 3000

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  try {
    await connectDb()
  } catch (err) {
    console.error(err)
  }

  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: { 
      origin: process.env.NODE_ENV === "production" 
        ? process.env.NEXT_PUBLIC_SITE_URL 
        : "http://localhost:3000", 
      methods: ["GET", "POST"] 
    }
  })

  io.on('connection', (socket) => {
    socket.on('join-room', async (roomName) => {
      socket.rooms.forEach(r => { if (r !== socket.id) socket.leave(r) })
      socket.join(roomName)

      try {
        const history = await Message.find({ room: roomName }).sort({ createdAt: -1 }).limit(50)
        socket.emit('load-history', history.reverse())
      } catch (err) {
        console.error(err)
      }
    })

    socket.on('send-message', async (data) => {
      try {
        const newMessage = await Message.create({
          text: data.text,
          user: data.user, 
          room: data.room,
          socketId: socket.id
        })

        const messagePayload = {
<<<<<<< HEAD
          _id: newMessage._id,
=======
>>>>>>> 1e56c28ea77123b910ce0c39f7e6cc5b4d329dc8
          text: newMessage.text,
          user: newMessage.user,
          room: newMessage.room,
          id: socket.id,
          time: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: newMessage.createdAt
        }

        io.to(data.room).emit('receive-message', messagePayload)
        
        io.emit('update-sidebar', {
          room: data.room,
<<<<<<< HEAD
          sender: data.user, 
=======
>>>>>>> 1e56c28ea77123b910ce0c39f7e6cc5b4d329dc8
          lastMessage: data.text,
          updatedAt: newMessage.createdAt
        })

<<<<<<< HEAD
      } catch (err) {
        console.error(err)
      }
    })

    socket.on('typing', (data) => {
      socket.to(data.room).emit('display-typing', data)
    })

    socket.on('stop-typing', (data) => {
      socket.to(data.room).emit('hide-typing', data)
    })

    socket.on('delete-message', async (data) => {
      try {
        await Message.findByIdAndDelete(data.messageId)
        io.to(data.room).emit('message-deleted', data.messageId)
=======
>>>>>>> 1e56c28ea77123b910ce0c39f7e6cc5b4d329dc8
      } catch (err) {
        console.error(err)
      }
    })

    socket.on('disconnect', () => {})
  })

  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
})
