const http = require('http')
const { WebSocketServer } = require('ws')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000

// ── HTTP server — serves the game HTML ──────────────────────
const httpServer = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const file = path.join(__dirname, 'gun_duel_mp.html')
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return }
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(data)
    })
  } else {
    res.writeHead(404); res.end('Not found')
  }
})

// ── WebSocket relay ──────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer })

let rooms = {}  // roomId -> { host, guest }

function getRoomId(ws) {
  for (let [id, room] of Object.entries(rooms)) {
    if (room.host === ws || room.guest === ws) return id
  }
  return null
}

wss.on('connection', (ws) => {
  console.log('Client connected, total:', wss.clients.size)

  ws.on('message', (raw) => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }

    if (msg.type === 'join') {
      // Find a room waiting for a guest, or create new one
      let roomId = null
      for (let [id, room] of Object.entries(rooms)) {
        if (!room.guest) { roomId = id; break }
      }
      if (!roomId) {
        roomId = Math.random().toString(36).slice(2, 8)
        rooms[roomId] = { host: ws, guest: null }
        ws.role = 'host'
        ws.roomId = roomId
        ws.send(JSON.stringify({ type: 'role', role: 'host', roomId }))
        console.log(`Room ${roomId} created`)
      } else {
        rooms[roomId].guest = ws
        ws.role = 'guest'
        ws.roomId = roomId
        ws.send(JSON.stringify({ type: 'role', role: 'guest', roomId }))
        // Notify host that guest joined
        rooms[roomId].host.send(JSON.stringify({ type: 'guest_joined' }))
        console.log(`Room ${roomId} guest joined`)
      }
      return
    }

    // Relay all other messages to the other player in the room
    const roomId = ws.roomId
    if (!roomId || !rooms[roomId]) return
    const room = rooms[roomId]
    const other = ws.role === 'host' ? room.guest : room.host
    if (other && other.readyState === 1) {
      other.send(raw.toString())
    }
  })

  ws.on('close', () => {
    const roomId = ws.roomId
    if (!roomId || !rooms[roomId]) return
    const room = rooms[roomId]
    const other = ws.role === 'host' ? room.guest : room.host
    if (other && other.readyState === 1) {
      other.send(JSON.stringify({ type: 'opponent_disconnected' }))
    }
    delete rooms[roomId]
    console.log(`Room ${roomId} closed`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Pixel Duel server running on port ${PORT}`)
})
